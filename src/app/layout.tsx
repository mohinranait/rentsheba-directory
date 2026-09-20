import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import config from "@/lib/config";
import "./globals.css";
import { cn } from "@/lib/utils";

const BASE = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "directory. — Bangladesh's trusted local business directory",
    template: "%s | directory.",
  },
  description:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools and more with hours, reviews, and contact details.",
  keywords: [
    "Bangladesh business directory",
    "local businesses Dhaka",
    "restaurants in Dhaka",
    "find businesses Bangladesh",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "directory. — Bangladesh's trusted local business directory",
    description: "Explore trusted businesses in Dhaka and across Bangladesh.",
    type: "website",
    locale: "en_BD",
    siteName: "directory.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
