import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const title = "Seif — Photography & Videography";
const description =
  "Seif Moaz is a Cairo-based Creative Director, Visual Storyteller & Editor working across fashion, F&B, and event coverage.";

export const metadata: Metadata = {
  metadataBase: new URL("https://seifmoaz.com"),
  title,
  description,
  openGraph: { title, description, siteName: "Seif Moaz", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500;1,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
