import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import config from "@/lib/config";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCachedSiteSettings } from "@/lib/settings";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteName = settings.siteName || "Rentsheba";
  const defaultTitle =
    settings.metaTitle ||
    `${siteName} — ${settings.siteTagline || "Bangladesh's Trusted Local Business & Service Directory"}`;
  const description =
    settings.metaDescription ||
    settings.siteDescription ||
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.";

  const keywords = settings.metaKeywords
    ? settings.metaKeywords.split(",").map((k) => k.trim())
    : [
        "Bangladesh business directory",
        "local businesses Dhaka",
        "restaurants in Dhaka",
        "find businesses Bangladesh",
        siteName,
        "verified local businesses",
      ];

  const icons = settings.favicon
    ? {
        icon: settings.favicon,
        shortcut: settings.favicon,
        apple: settings.favicon,
      }
    : undefined;

  const ogImages = settings.ogImage ? [{ url: settings.ogImage }] : undefined;

  return {
    metadataBase: new URL(BASE),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName} Directory`,
    },
    description,
    keywords,
    icons,
    verification: settings.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: defaultTitle,
      description,
      type: "website",
      locale: "en_BD",
      siteName: `${siteName} Directory`,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: ogImages,
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCachedSiteSettings();

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
        {settings.favicon && <link rel="icon" href={settings.favicon} />}

        {/* Google Analytics Tag if configured */}
        {settings.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}

        {/* Custom Header Code */}
        {settings.headerScripts && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.headerScripts }}
            style={{ display: "none" }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Custom Footer Code */}
        {settings.footerScripts && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.footerScripts }}
            style={{ display: "none" }}
          />
        )}
      </body>
    </html>
  );
}
