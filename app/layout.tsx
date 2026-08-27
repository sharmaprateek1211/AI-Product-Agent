import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ForgeAI — Website to Product Agent",
  description: "Turn a website idea into a product blueprint with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}