import type { Metadata } from "next";
// All font imports have been removed.
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomtext",
  description: "Translate YouTube videos with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* With no font className, the body will use the browser's default font. */}
      <body>{children}</body>
    </html>
  );
}
