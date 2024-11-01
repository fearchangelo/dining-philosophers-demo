import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const comicSans = {
  variable: "--font-comic-sans",
  style: {
    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
  },
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dining Philosophers Problem",
  description: "A demonstration of the dining philosophers problem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
