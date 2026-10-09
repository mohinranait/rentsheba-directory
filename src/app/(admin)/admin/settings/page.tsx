"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Globe,
  Mail,
  Search,
  Cloud,
  MapPin,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  PhoneCall,
  Share2,
  Sliders,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SettingsImageUploader } from "./components/settings-image-uploader";

type SettingsTab = "general" | "contact" | "seo" | "email" | "media" | "map";

interface SettingsState {
  // General
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  headerLogo: string;
  footerLogo: string;
  favicon: string;
  copyrightText: string;
  currencySymbol: string;
  currencyCode: string;

  // Contact
  contactEmail: string;
  contactPhone: string;
  helpline: string;
  address: string;
  workingHours: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  headerScripts: string;
  footerScripts: string;

  // Email / SMTP
  smtpHost: string;
  smtpPort: number | string;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
  mailFromName: string;
  mailFromEmail: string;
  smtpPassConfigured?: boolean;

  // Cloudinary
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryFolder: string;
  cloudinaryApiSecretConfigured?: boolean;

  // Map & Directory
  googleMapsApiKey: string;
  mapProvider: string;
  defaultLatitude: number | string;
  defaultLongitude: number | string;
  defaultZoom: number | string;
  maintenanceMode: boolean;
  requireListingApproval: boolean;
}

const initialSettings: SettingsState = {
  siteName: "Rentsheba",
  siteTagline: "Bangladesh's Trusted Local Business & Service Directory",
  siteDescription:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.",
  headerLogo: "",
  footerLogo: "",
  favicon: "",
  copyrightText: "© {year} Rentsheba Directory. All rights reserved.",
  currencySymbol: "৳",
  currencyCode: "BDT",

  contactEmail: "support@rentsheba.com",
  contactPhone: "+880 1700-000000",
  helpline: "16263",
  address: "Level 4, Gulshan-2, Dhaka-1212, Bangladesh",
  workingHours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
  facebookUrl: "https://facebook.com/rentsheba",
  twitterUrl: "https://twitter.com/rentsheba",
  instagramUrl: "https://instagram.com/rentsheba",
  linkedinUrl: "https://linkedin.com/company/rentsheba",
  youtubeUrl: "https://youtube.com/@rentsheba",
  whatsappNumber: "+8801700000000",

  metaTitle: "Rentsheba — Bangladesh's Trusted Local Business Directory",
  metaDescription:
    "Explore trusted businesses in Dhaka and across Bangladesh. Find restaurants, salons, clinics, schools, and professional services with verified reviews and contact details.",
  metaKeywords:
    "Bangladesh business directory, local businesses Dhaka, restaurants, clinics, schools, Rentsheba",
  ogImage: "",
  googleSiteVerification: "",
  googleAnalyticsId: "",
  headerScripts: "",
  footerScripts: "",

  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpSecure: false,
  mailFromName: "Rentsheba Directory",
  mailFromEmail: "noreply@rentsheba.com",

  cloudinaryCloudName: "",
  cloudinaryApiKey: "",
  cloudinaryApiSecret: "",
  cloudinaryFolder: "rentsheba",

  googleMapsApiKey: "",
  mapProvider: "leaflet",
  defaultLatitude: 23.8103,
  defaultLongitude: 90.4125,
  defaultZoom: 13,
  maintenanceMode: false,
  requireListingApproval: false,
};

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as SettingsTab) || "general";

  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password visibility toggles
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showCloudinarySecret, setShowCloudinarySecret] = useState(false);

  // Test Email state
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [, startTransition] = useTransition();

  const showNotification = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleTabChange = (tab: SettingsTab) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "general") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const newQuery = params.toString();
      router.push(`/admin/settings${newQuery ? `?${newQuery}` : ""}`);
    });
  };

  // Fetch settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        if (json.success && json.data) {
          setSettings((prev) => ({
            ...prev,
            ...json.data,
            // Ensure nulls don't produce uncontrolled input errors
            siteName: json.data.siteName || "",
            siteTagline: json.data.siteTagline || "",
            siteDescription: json.data.siteDescription || "",
            headerLogo: json.data.headerLogo || "",
            footerLogo: json.data.footerLogo || "",
            favicon: json.data.favicon || "",
            copyrightText: json.data.copyrightText || "",
            currencySymbol: json.data.currencySymbol || "৳",
            currencyCode: json.data.currencyCode || "BDT",
            contactEmail: json.data.contactEmail || "",
            contactPhone: json.data.contactPhone || "",
            helpline: json.data.helpline || "",
            address: json.data.address || "",
            workingHours: json.data.workingHours || "",
            facebookUrl: json.data.facebookUrl || "",
            twitterUrl: json.data.twitterUrl || "",
            instagramUrl: json.data.instagramUrl || "",
            linkedinUrl: json.data.linkedinUrl || "",
            youtubeUrl: json.data.youtubeUrl || "",
            whatsappNumber: json.data.whatsappNumber || "",
            metaTitle: json.data.metaTitle || "",
            metaDescription: json.data.metaDescription || "",
            metaKeywords: json.data.metaKeywords || "",
            ogImage: json.data.ogImage || "",
            googleSiteVerification: json.data.googleSiteVerification || "",
            googleAnalyticsId: json.data.googleAnalyticsId || "",
            headerScripts: json.data.headerScripts || "",
            footerScripts: json.data.footerScripts || "",
            smtpHost: json.data.smtpHost || "",
            smtpPort: json.data.smtpPort || 587,
            smtpUser: json.data.smtpUser || "",
            smtpPass: json.data.smtpPass || "",
            smtpSecure: Boolean(json.data.smtpSecure),
            mailFromName: json.data.mailFromName || "",
            mailFromEmail: json.data.mailFromEmail || "",
            cloudinaryCloudName: json.data.cloudinaryCloudName || "",
            cloudinaryApiKey: json.data.cloudinaryApiKey || "",
            cloudinaryApiSecret: json.data.cloudinaryApiSecret || "",
            cloudinaryFolder: json.data.cloudinaryFolder || "rentsheba",
            googleMapsApiKey: json.data.googleMapsApiKey || "",
            mapProvider: json.data.mapProvider || "leaflet",
            defaultLatitude: json.data.defaultLatitude ?? 23.8103,
            defaultLongitude: json.data.defaultLongitude ?? 90.4125,
            defaultZoom: json.data.defaultZoom ?? 13,
            maintenanceMode: Boolean(json.data.maintenanceMode),
            requireListingApproval: Boolean(json.data.requireListingApproval),
          }));
        }
      } catch (err) {
        showNotification("error", "Could not fetch settings. Using defaults.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save settings");
      }

      showNotification("success", "Settings updated successfully!");
    } catch (err: any) {
      showNotification("error", err.message || "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      setTestEmailResult(null);

      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          smtpSecure: settings.smtpSecure,
          mailFromName: settings.mailFromName,
          mailFromEmail: settings.mailFromEmail,
        }),
      });

      const json = await res.json();
      setTestEmailResult({
        success: Boolean(json.success),
        message: json.message || (json.success ? "Email sent!" : "Failed to send"),
      });

      if (json.success) {
        showNotification("success", "Test email sent successfully!");
      } else {
        showNotification("error", json.message || "Failed to send test email");
      }
    } catch (err: any) {
      const msg = err.message || "SMTP connection error";
      setTestEmailResult({ success: false, message: msg });
      showNotification("error", msg);
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#133f35]" />
        <p className="text-sm font-medium text-muted-foreground">Loading site settings...</p>
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: any; countNotice?: string }[] = [
    { id: "general", label: "General & Branding", icon: Globe },
    { id: "contact", label: "Contact & Social", icon: PhoneCall },
    { id: "seo", label: "SEO & Analytics", icon: Search },
    { id: "email", label: "Email / SMTP", icon: Mail },
    { id: "media", label: "Media & Cloudinary", icon: Cloud },
    { id: "map", label: "Map & System", icon: Sliders },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-[#133f35] text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Website Settings
            </h1>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
              Live & Synced
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure global website identity, logos, SEO, contact channels, SMTP server, and media storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-2 bg-[#133f35] font-semibold text-white hover:bg-[#1c5548]"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#133f35] text-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================
            TAB 1: GENERAL & BRANDING
        ======================================================== */}
        {activeTab === "general" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Brand Identity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Website Identity & Brand</CardTitle>
                <CardDescription>
                  General details that appear in the browser tab, header, footer, and page titles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleChange("siteName", e.target.value)}
                      placeholder="e.g. Rentsheba"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteTagline">Site Tagline</Label>
                    <Input
                      id="siteTagline"
                      value={settings.siteTagline}
                      onChange={(e) => handleChange("siteTagline", e.target.value)}
                      placeholder="e.g. Bangladesh's Trusted Local Business Directory"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => handleChange("siteDescription", e.target.value)}
                    placeholder="Brief description of the directory for visitors and search engines..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={(e) => handleChange("currencySymbol", e.target.value)}
                      placeholder="৳"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencyCode">Currency Code</Label>
                    <Input
                      id="currencyCode"
                      value={settings.currencyCode}
                      onChange={(e) => handleChange("currencyCode", e.target.value)}
                      placeholder="BDT"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <Input
                    id="copyrightText"
                    value={settings.copyrightText}
                    onChange={(e) => handleChange("copyrightText", e.target.value)}
                    placeholder="© {year} Rentsheba Directory. All rights reserved."
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Use <code className="rounded bg-muted px-1">{"{year}"}</code> to automatically display the current year.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Header Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Header Logo</CardTitle>
                <CardDescription>
                  Main brand logo displayed on the top navigation bar across all pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsImageUploader
                  id="header-logo-upload"
                  label="Website Header Logo"
                  description="Recommended format: SVG or transparent PNG (e.g. 200×50px)"
                  value={settings.headerLogo}
                  onChange={(url) => handleChange("headerLogo", url)}
                  variant="headerLogo"
                  altText={`${settings.siteName} Header Logo`}
                  siteName={settings.siteName}
                  onNotification={showNotification}
                />
              </CardContent>
            </Card>

            {/* Footer Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Footer Logo</CardTitle>
                <CardDescription>
                  Secondary logo displayed in the website footer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsImageUploader
                  id="footer-logo-upload"
                  label="Website Footer Logo"
                  description="Recommended format: SVG, PNG, or WebP (e.g. 180×45px)"
                  value={settings.footerLogo}
                  onChange={(url) => handleChange("footerLogo", url)}
                  variant="footerLogo"
                  altText={`${settings.siteName} Footer Logo`}
                  siteName={settings.siteName}
                  onNotification={showNotification}
                />
              </CardContent>
            </Card>

            {/* Browser Tab Favicon */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Browser Tab Favicon</CardTitle>
                <CardDescription>
                  Small icon shown in browser tabs, bookmarks, and shortcuts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsImageUploader
                  id="favicon-upload"
                  label="Website Favicon"
                  description="Recommended dimensions: 32×32 or 48×48px (ICO, PNG, or SVG)"
                  value={settings.favicon}
                  onChange={(url) => handleChange("favicon", url)}
                  variant="favicon"
                  altText={`${settings.siteName} Favicon`}
                  siteName={settings.siteName}
                  onNotification={showNotification}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 2: CONTACT & SOCIAL
        ======================================================== */}
        {activeTab === "contact" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>
                  Displayed on the Contact Us page, footer, and inquiry email templates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Public Support Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    placeholder="support@rentsheba.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Primary Phone</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone}
                      onChange={(e) => handleChange("contactPhone", e.target.value)}
                      placeholder="+880 1700-000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="helpline">Helpline / Hotline</Label>
                    <Input
                      id="helpline"
                      value={settings.helpline}
                      onChange={(e) => handleChange("helpline", e.target.value)}
                      placeholder="16263"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Head Office Address</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Level 4, Gulshan-2, Dhaka-1212, Bangladesh"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingHours">Operating / Support Hours</Label>
                  <Input
                    id="workingHours"
                    value={settings.workingHours}
                    onChange={(e) => handleChange("workingHours", e.target.value)}
                    placeholder="Sunday - Thursday: 9:00 AM - 6:00 PM"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Media & Messaging</CardTitle>
                <CardDescription>
                  Official channel links rendered across footer and directory listings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                  <Input
                    id="facebookUrl"
                    value={settings.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="twitterUrl">Twitter / X URL</Label>
                  <Input
                    id="twitterUrl"
                    value={settings.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://x.com/yourhandle"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={settings.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile / Company URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={settings.linkedinUrl}
                    onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="youtubeUrl">YouTube Channel</Label>
                    <Input
                      id="youtubeUrl"
                      value={settings.youtubeUrl}
                      onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                      placeholder="https://youtube.com/@channel"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappNumber">WhatsApp Support Number</Label>
                    <Input
                      id="whatsappNumber"
                      value={settings.whatsappNumber}
                      onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                      placeholder="+8801700000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 3: SEO & ANALYTICS
        ======================================================== */}
        {activeTab === "seo" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Meta Tags */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Default Meta Tags & Search Visibility</CardTitle>
                <CardDescription>
                  Default metadata applied when individual pages or listings don&apos;t provide their own.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Default SEO Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    placeholder="Rentsheba — Bangladesh's Trusted Local Business & Service Directory"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Default Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    rows={2}
                    value={settings.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="Explore trusted businesses in Dhaka and across Bangladesh..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Default Meta Keywords (comma separated)</Label>
                  <Input
                    id="metaKeywords"
                    value={settings.metaKeywords}
                    onChange={(e) => handleChange("metaKeywords", e.target.value)}
                    placeholder="Bangladesh directory, Dhaka businesses, services, verified listing"
                  />
                </div>

                {/* OpenGraph Image */}
                <div className="pt-2">
                  <SettingsImageUploader
                    id="og-image-upload"
                    label="Social Share Image (OpenGraph / Twitter Card)"
                    description="Preview image displayed when links to your directory are shared on social media and messaging apps (Recommended: 1200×630px JPG or PNG)."
                    value={settings.ogImage}
                    onChange={(url) => handleChange("ogImage", url)}
                    variant="banner"
                    altText={`${settings.siteName} Social Banner`}
                    siteName={settings.siteName}
                    onNotification={showNotification}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tracking & Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification & Analytics IDs</CardTitle>
                <CardDescription>
                  Google Search Console & Google Analytics tracking identifiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleSiteVerification">Google Site Verification Token</Label>
                  <Input
                    id="googleSiteVerification"
                    value={settings.googleSiteVerification}
                    onChange={(e) => handleChange("googleSiteVerification", e.target.value)}
                    placeholder="e.g. google-site-verification=abc123xyz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics Measurement ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                    placeholder="e.g. G-ABC1234567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom Scripts & Embeds</CardTitle>
                <CardDescription>
                  Inject tracking pixels (Meta Pixel, Hotjar) or custom header/footer code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headerScripts">Header Scripts (inside &lt;head&gt;)</Label>
                  <Textarea
                    id="headerScripts"
                    rows={3}
                    className="font-mono text-xs"
                    value={settings.headerScripts}
                    onChange={(e) => handleChange("headerScripts", e.target.value)}
                    placeholder="<script>...</script>"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerScripts">Footer Scripts (before &lt;/body&gt;)</Label>
                  <Textarea
                    id="footerScripts"
                    rows={3}
                    className="font-mono text-xs"
                    value={settings.footerScripts}
                    onChange={(e) => handleChange("footerScripts", e.target.value)}
                    placeholder="<script>...</script>"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 4: EMAIL / SMTP CONFIGURATION
        ======================================================== */}
        {activeTab === "email" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* SMTP Server Credentials */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">SMTP Server Configuration</CardTitle>
                  {settings.smtpHost && settings.smtpUser ? (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                      Using Env Default
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Outgoing mail server used for sending verification OTPs, listing notices, and inquiries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange("smtpHost", "smtp.gmail.com");
                          handleChange("smtpPort", 465);
                          handleChange("smtpSecure", true);
                        }}
                        className="text-xs text-emerald-700 hover:underline"
                      >
                        Fill Gmail preset (smtp.gmail.com)
                      </button>
                    </div>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => handleChange("smtpHost", e.target.value)}
                      placeholder="e.g. smtp.gmail.com or mail.rentsheba.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use server host like <strong>smtp.gmail.com</strong> (do not enter your email address here).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => handleChange("smtpPort", e.target.value)}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username / Email</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => handleChange("smtpUser", e.target.value)}
                    placeholder="e.g. info@rentsheba.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPass">
                    SMTP Password / App Password
                    {settings.smtpPassConfigured && (
                      <span className="ml-2 text-xs font-normal text-emerald-700">
                        (Active password saved)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="smtpPass"
                      type={showSmtpPass ? "text" : "password"}
                      value={settings.smtpPass}
                      onChange={(e) => handleChange("smtpPass", e.target.value)}
                      placeholder={settings.smtpPassConfigured ? "•••••••• (Leave blank to keep current)" : "Enter password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showSmtpPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For Gmail, use a 16-character Google App Password (not your personal account password).
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">SSL / TLS Secure Connection</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable for Port 465 (SSL). Keep off for Port 587 (STARTTLS).
                    </p>
                  </div>
                  <Switch
                    checked={settings.smtpSecure}
                    onCheckedChange={(checked) => handleChange("smtpSecure", checked)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mailFromName">Sender Display Name</Label>
                    <Input
                      id="mailFromName"
                      value={settings.mailFromName}
                      onChange={(e) => handleChange("mailFromName", e.target.value)}
                      placeholder="Rentsheba Directory"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mailFromEmail">Sender From Email</Label>
                    <Input
                      id="mailFromEmail"
                      type="email"
                      value={settings.mailFromEmail}
                      onChange={(e) => handleChange("mailFromEmail", e.target.value)}
                      placeholder="noreply@rentsheba.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Email Action Card */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="text-lg">Test SMTP Server Connection</CardTitle>
                  <CardDescription>
                    Send a test email to verify that your mail server credentials and port are configured correctly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmailTo">Recipient Test Email</Label>
                    <Input
                      id="testEmailTo"
                      type="email"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail || !testEmailTo}
                    className="w-full gap-2 bg-[#133f35] text-white hover:bg-[#1b5246]"
                  >
                    {testingEmail ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Connecting & Sending...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>

                  {testEmailResult && (
                    <div
                      className={`mt-4 rounded-lg border p-3.5 text-xs ${
                        testEmailResult.success
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {testEmailResult.success ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">
                            {testEmailResult.success ? "Connection Verified!" : "Email Sending Failed"}
                          </p>
                          <p className="mt-1 leading-relaxed">{testEmailResult.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-6 pt-0">
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">💡 Recommended Port & Secure combinations:</p>
                  <ul className="mt-1.5 list-disc pl-4 space-y-1">
                    <li>Port 587 + Secure Off: Standard STARTTLS (recommended for Gmail & SendGrid).</li>
                    <li>Port 465 + Secure On: Direct SSL encryption.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 5: MEDIA & CLOUDINARY
        ======================================================== */}
        {activeTab === "media" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Cloudinary Cloud Storage</CardTitle>
                  {settings.cloudinaryCloudName ? (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                      Custom Storage Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground/30">
                      Using System Default (.env)
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Cloudinary credentials used for storing listing gallery photos, categories, avatars, and logos.
                  If left blank, the application will automatically fall back to the project .env configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                    <Input
                      id="cloudinaryCloudName"
                      value={settings.cloudinaryCloudName}
                      onChange={(e) => handleChange("cloudinaryCloudName", e.target.value)}
                      placeholder="e.g. djxyznm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiKey">API Key</Label>
                    <Input
                      id="cloudinaryApiKey"
                      value={settings.cloudinaryApiKey}
                      onChange={(e) => handleChange("cloudinaryApiKey", e.target.value)}
                      placeholder="e.g. 123456789012345"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiSecret">
                      API Secret
                      {settings.cloudinaryApiSecretConfigured && (
                        <span className="ml-2 text-xs font-normal text-emerald-700">
                          (Saved in DB)
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="cloudinaryApiSecret"
                        type={showCloudinarySecret ? "text" : "password"}
                        value={settings.cloudinaryApiSecret}
                        onChange={(e) => handleChange("cloudinaryApiSecret", e.target.value)}
                        placeholder={
                          settings.cloudinaryApiSecretConfigured
                            ? "•••••••• (Leave blank to keep current)"
                            : "Enter API Secret"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowCloudinarySecret(!showCloudinarySecret)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showCloudinarySecret ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryFolder">Storage Root Folder</Label>
                    <Input
                      id="cloudinaryFolder"
                      value={settings.cloudinaryFolder}
                      onChange={(e) => handleChange("cloudinaryFolder", e.target.value)}
                      placeholder="rentsheba"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 6: MAP & SYSTEM DIRECTORY
        ======================================================== */}
        {activeTab === "map" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Map Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map & Location Configuration</CardTitle>
                <CardDescription>
                  Configure map provider, Google Maps API key, and default map center coordinates for Bangladesh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapProvider">Default Map Provider</Label>
                  <select
                    id="mapProvider"
                    value={settings.mapProvider}
                    onChange={(e) => handleChange("mapProvider", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="leaflet">OpenStreetMap / Leaflet (100% Free, No API Key Required)</option>
                    <option value="google">Google Maps (Requires API Key)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsApiKey">Google Maps JavaScript API Key</Label>
                  <Input
                    id="googleMapsApiKey"
                    value={settings.googleMapsApiKey}
                    onChange={(e) => handleChange("googleMapsApiKey", e.target.value)}
                    placeholder="AIzaSy..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Required only if Google Maps is chosen or when utilizing Google Geocoding services.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="defaultLatitude">Default Latitude</Label>
                    <Input
                      id="defaultLatitude"
                      type="number"
                      step="any"
                      value={settings.defaultLatitude}
                      onChange={(e) => handleChange("defaultLatitude", e.target.value)}
                      placeholder="23.8103"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultLongitude">Default Longitude</Label>
                    <Input
                      id="defaultLongitude"
                      type="number"
                      step="any"
                      value={settings.defaultLongitude}
                      onChange={(e) => handleChange("defaultLongitude", e.target.value)}
                      placeholder="90.4125"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultZoom">Default Zoom</Label>
                    <Input
                      id="defaultZoom"
                      type="number"
                      value={settings.defaultZoom}
                      onChange={(e) => handleChange("defaultZoom", e.target.value)}
                      placeholder="13"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System & Directory Workflow</CardTitle>
                <CardDescription>
                  Workflow controls and maintenance flags.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3.5">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Require Admin Approval for Listings</Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, new listings submitted by sellers will be held in &quot;Pending Review&quot; until approved.
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireListingApproval}
                    onCheckedChange={(checked) =>
                      handleChange("requireListingApproval", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3.5">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-amber-900">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      When active, visitors will see a maintenance notice banner. Admins can still access the platform.
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-[#133f35] px-6 font-semibold text-white hover:bg-[#1c5548]"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#133f35]" />
          <p className="text-sm font-medium text-muted-foreground">Loading settings console...</p>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
