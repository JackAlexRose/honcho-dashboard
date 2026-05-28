import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const departure = localFont({
  src: "../../public/fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  weight: "400",
});

export const metadata: Metadata = {
  title: "HONCHO :: Memory Dashboard",
  description: "Local Honcho memory observability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${departure.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
