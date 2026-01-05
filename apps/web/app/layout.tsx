import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { LenisProvider } from "@/components/lenis-provider";
// import { EmberCursor } from "@/components/ember-cursor";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Once | Reclaim the Narrative",
  description: "The fuel is ready. Bring the spark.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${GeistSans.variable} font-sans antialiased`}
      >
        <LenisProvider>
          {/* <EmberCursor /> */}
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}