import { Resend } from "resend";
import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ORIGINS = new Set([
  "https://seifmoaz.com",
  "https://www.seifmoaz.com",
  "http://localhost:3000",
]);

// Vercel preview deployments get a random *.vercel.app subdomain per
// build, so they can't be listed individually — trusting the whole
// subdomain is still scoped to deployments of this Vercel account.
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

// Lack of CORS headers only stops a foreign page's JS from *reading* the
// response — it doesn't stop the request from executing server-side. This
// Origin/Referer check is what actually blocks another site from silently
// firing real emails through this form (a CSRF-style abuse vector).
function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) return isAllowedOrigin(origin);

  // Same-origin requests without JS (rare, but some browsers omit Origin on
  // simple navigations) still carry a Referer we can check.
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return isAllowedOrigin(new URL(referer).origin);
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;

function isValidField(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = clientIp(request);
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 });
  }

  const { firstName, lastName, email, message } = await request.json();

  if (
    !isValidField(firstName, MAX_NAME_LENGTH) ||
    !isValidField(lastName, MAX_NAME_LENGTH) ||
    !isValidField(email, MAX_NAME_LENGTH) ||
    !isValidField(message, MAX_MESSAGE_LENGTH)
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    // The Resend SDK doesn't throw for a rejected send — a bad `from`
    // domain, an unverified sender, etc. all come back as `{ error }` on
    // the resolved result rather than as an exception, so that has to be
    // checked explicitly or a failed send silently looks identical to a
    // successful one.
    const { data, error } = await resend.emails.send({
      from: "Seif Moaz Website <noreply@seifmoaz.com>",
      to: "contact@seifmoaz.com",
      replyTo: email,
      subject: `New message from ${firstName} ${lastName}`,
      text: `From: ${firstName} ${lastName} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("Resend rejected the send:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
    }

    console.log("Contact form email sent:", data?.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
