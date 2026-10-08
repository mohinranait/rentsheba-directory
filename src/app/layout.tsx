import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import config from "@/lib/config";
import "./globals.css";
import { cn } from "@/lib/utils";

const BASE = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Rentsheba — Bangladesh's Trusted Local Business & Service Directory",
    template: "%s | Rentsheba Directory",
  },
  description:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.",
  keywords: [
    "Bangladesh business directory",
    "local businesses Dhaka",
    "restaurants in Dhaka",
    "find businesses Bangladesh",
    "Rentsheba",
    "verified local businesses",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rentsheba — Bangladesh's Trusted Local Business Directory",
    description: "Explore trusted businesses in Dhaka and across Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "Rentsheba Directory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentsheba — Bangladesh's Trusted Local Business Directory",
    description: "Explore trusted businesses in Dhaka and across Bangladesh.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <head>
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
