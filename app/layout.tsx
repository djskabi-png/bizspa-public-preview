import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizSpa | תצוגת האתר החדש",
  description: "תצוגה מוקדמת של אתר BizSpa החדש.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
