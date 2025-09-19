import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "東大シラバスQ&A",
  description: "東大のシラバスに基づくQ&A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      {/* suppress hydration mismatches caused by browser extensions (e.g., Grammarly) */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
