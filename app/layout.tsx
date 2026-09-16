import type { Metadata } from "next";
import { Archivo, Caveat, Cormorant_Garamond } from "next/font/google";
import { FluteProvider } from "@/lib/flute";
import { Splash } from "@/components/sketchbook/Splash";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ganapati",
  description:
    "An exhibition of studies of Ganesha: posture, material, trunk, companion and offering, catalogued and hung.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${archivo.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full">
        <FluteProvider>
          <Splash />
          {children}
        </FluteProvider>
      </body>
    </html>
  );
}
