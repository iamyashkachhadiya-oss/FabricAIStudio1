import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FabricAI Studio — Textile Design & Production",
  description: "Professional dobby design, peg plan, and fabric specification tool for the Surat textile ecosystem. By Solerix Technologies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
