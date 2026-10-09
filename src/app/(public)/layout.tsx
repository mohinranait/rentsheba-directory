import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { getCachedSiteSettings } from "@/lib/settings";

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
  const settings = await getCachedSiteSettings();

  const tagline =
    settings.siteTagline ||
    "Bangladesh's trusted local business directory · List your business for free";

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17251f]">
      {settings.maintenanceMode && (
        <div className="bg-amber-600 px-4 py-2 text-center text-xs font-semibold text-white z-20 relative shadow-xs">
          ⚠️ Maintenance Mode Active: Some features are undergoing scheduled updates.
        </div>
      )}
      <div className="bg-[#133f35] px-4 py-2 text-center text-xs z-10! relative font-medium text-white/85">
        {tagline}
      </div>
      <Header
        settings={{
          siteName: settings.siteName,
          headerLogo: settings.headerLogo,
        }}
      />
      <div className="min-h-screen">{children}</div>
      <Footer settings={settings} />
    </main>
  );
};

export default PublicLayout;