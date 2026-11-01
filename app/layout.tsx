import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, IBM_Plex_Mono, Rethink_Sans } from "next/font/google";
import "./globals.css";

const rethink = Rethink_Sans({ variable: "--font-rethink", subsets: ["latin"] });

// Headlines: heavy and tight, with opsz so it sharpens as it grows.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "wdth"],
});

const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Components, by bas3line",
  description: "Drawn-in-code React components: isometric servers, racks, terminals and maps.",
};

export const viewport: Viewport = {
  themeColor: "#e9e9e9",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${rethink.variable} ${bricolage.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-dvh bg-bg text-ink">{children}</body>
    </html>
  );
}
