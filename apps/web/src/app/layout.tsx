import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syllabus QA",
  description: "Q&A for your syllabus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppress hydration mismatches caused by browser extensions (e.g., Grammarly) */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
