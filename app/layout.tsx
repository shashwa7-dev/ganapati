import type { Metadata, Viewport } from "next";
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

// The canonical origin used to resolve absolute URLs for OG/Twitter tags.
// Defaults to the production domain; override with NEXT_PUBLIC_SITE_URL, and
// falls back to localhost in development.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ganapatibappamoraya.shashwa7.in"
    : "http://localhost:3000");

const TITLE = "Ganapati — One hundred and eight forms of Ganesha";
const DESCRIPTION =
  "An exhibition of studies of Ganesha: posture, material, trunk, companion and offering, catalogued and hung in the artist's own sketchbook.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Ganapati",
  },
  description: DESCRIPTION,
  applicationName: "Ganapati",
  authors: [{ name: "shashwa7", url: "https://shashwa7.in" }],
  creator: "shashwa7",
  publisher: "shashwa7",
  category: "art",
  keywords: [
    "Ganapati",
    "Ganesha",
    "Ganesh",
    "Ganesh Chaturthi",
    "Ganpati Bappa Morya",
    "Ganeshotsav",
    "108 forms of Ganesha",
    "Hindu art",
    "illustration",
    "sketchbook",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ganapati",
    title: TITLE,
    description:
      "One hundred and eight forms of Ganesha, drawn one at a time and hung in the artist's own sketchbook.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "One hundred and eight forms of Ganesha, drawn one at a time and hung in the artist's own sketchbook.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f4ead8",
  colorScheme: "light",
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
