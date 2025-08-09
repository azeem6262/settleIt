import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { Analytics } from "@vercel/analytics/next";

const roboto = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
        <Providers>{children}</Providers> 
        <Analytics />
      </body>
    </html>
  );
}
