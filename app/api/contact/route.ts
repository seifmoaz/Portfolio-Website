import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { firstName, lastName, email, message } = await request.json();

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
