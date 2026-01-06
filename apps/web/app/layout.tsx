import type { Metadata } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Crimson_Pro,
  Lora,
  EB_Garamond,
  Inter,
  DM_Sans,
  Outfit,
  Sora,
  Spectral,
  Literata,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Nunito,
  Source_Sans_3,
  Space_Grotesk,
  Caveat,
  Indie_Flower,
  Press_Start_2P,
  VT323,
  Permanent_Marker,
  Patrick_Hand,
  Orbitron,
  Silkscreen
} from "next/font/google";
import { LenisProvider } from "@/components/lenis-provider";
// import { EmberCursor } from "@/components/ember-cursor";
import "./globals.css";
import { FontProvider } from "@/components/font-provider";
import { NavHeader } from "@/components/nav-header";
import { Toaster } from "sonner";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["400", "500", "600"], display: "swap" });
const crimson = Crimson_Pro({ subsets: ["latin"], variable: "--font-crimson", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], variable: "--font-spectral", weight: ["400", "500", "600"], display: "swap" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const ibmMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-mono", weight: ["400", "500"], display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const indieFlower = Indie_Flower({ subsets: ["latin"], variable: "--font-indie-flower", weight: "400", display: "swap" });
const pressStart = Press_Start_2P({ subsets: ["latin"], variable: "--font-press-start", weight: "400", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], variable: "--font-vt323", weight: "400", display: "swap" });
const permanentMarker = Permanent_Marker({ subsets: ["latin"], variable: "--font-permanent-marker", weight: "400", display: "swap" });
const patrickHand = Patrick_Hand({ subsets: ["latin"], variable: "--font-patrick-hand", weight: "400", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", display: "swap" });
const silkscreen = Silkscreen({ subsets: ["latin"], variable: "--font-silkscreen", weight: "400", display: "swap" });


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
        className={`${playfair.variable} ${cormorant.variable} ${crimson.variable} ${lora.variable} ${garamond.variable} ${inter.variable} ${dmSans.variable} ${outfit.variable} ${sora.variable} ${spectral.variable} ${literata.variable} ${jetbrains.variable} ${ibmMono.variable} ${nunito.variable} ${sourceSans.variable} ${spaceGrotesk.variable} ${caveat.variable} ${indieFlower.variable} ${pressStart.variable} ${vt323.variable} ${permanentMarker.variable} ${patrickHand.variable} ${orbitron.variable} ${silkscreen.variable} font-sans antialiased`}
      >
        <LenisProvider>
          {/* <EmberCursor /> */}
          <FontProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  color: 'var(--foreground)',
                },
              }}
            />
            {children}
          </FontProvider>
        </LenisProvider>
      </body>
    </html>
  );
}