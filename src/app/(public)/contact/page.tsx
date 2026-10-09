import {
  ArrowRight,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import GridBackdrop from "@/components/GridBackdrop";
import config from "@/lib/config";
import { getCachedSiteSettings } from "@/lib/settings";
import ContactForm from "./components/contact-form";

const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteName = settings.siteName || "Rentsheba";

  return {
    title: `Contact Us — ${siteName} Directory`,
    description: `Get in touch with the ${siteName} team. Inquire about listing your business, verification assistance, partnerships, advertising, or account support.`,
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
    openGraph: {
      title: `Contact Us — ${siteName} Directory`,
      description: `Have questions about listing your business or services? Contact our support and directory onboarding team.`,
      url: `${baseUrl}/contact`,
      siteName: `${siteName} Directory`,
      type: "website",
    },
  };
}

const faqs = [
  {
    q: "How long does it take for a newly submitted listing to get approved?",
    a: "New business listings submitted with complete documentation and valid contact details are typically reviewed and approved within 12 to 24 hours.",
  },
  {
    q: "Can I list my business for free?",
    a: "Yes! Our Starter plan allows you to publish and manage your business profile at no cost, making you discoverable to visitors across Bangladesh.",
  },
  {
    q: "How do I claim or update an existing business?",
    a: "If your business is already listed, click 'Claim this listing' on the business details page or send us a message here with proof of ownership.",
  },
  {
    q: "What payment methods do you support for subscriptions?",
    a: "We support bKash (automated tokenized checkout) as well as major local cards and mobile banking providers with instant activation.",
  },
];

export default async function ContactPage() {
  const settings = await getCachedSiteSettings();
  const siteName = settings.siteName || "Rentsheba";
  const address = settings.address || "Level 4, Gulshan-2, Dhaka-1212, Bangladesh";
  const email = settings.contactEmail || "support@rentsheba.com";
  const phone = settings.helpline || settings.contactPhone || "+880 1700-000000";
  const hours = settings.workingHours || "Sunday – Thursday: 9:00 AM – 6:00 PM";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GridBackdrop />

      {/* Hero Header */}
      <section className="relative bg-white/50 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bdd4c6]/70 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#36705e] backdrop-blur-md">
              <MessageCircle className="size-3.5" /> Direct Support & Inquiries
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#153e34] sm:text-5xl lg:text-6xl">
              We&apos;re here to <span className="text-[#4b8b71]">help</span> you grow.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#527067] sm:text-lg">
              Have questions about onboarding your business, claiming a
              listing, or partnering with {siteName}&apos;s curated directory?
              Drop us a message below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="relative bg-white/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Direct Info & Quick Highlights */}
            <div className="space-y-6 lg:col-span-5">
              {/* Contact Channels Card */}
              <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_16px_40px_rgba(21,63,53,0.08)] backdrop-blur-xl sm:p-8">
                <h3 className="text-lg font-bold text-[#1a4539]">
                  Contact Information
                </h3>
                <p className="mt-1 text-xs text-[#627f74]">
                  Reach our team directly through any of these communication channels.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf6f1] text-[#346c59]">
                      <MapPin className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6b8b7e]">
                        Head Office
                      </p>
                      <p className="text-sm font-semibold text-[#1c4337]">
                        {address}
                      </p>
                      <p className="text-xs text-[#769387]">
                        Operating nationwide across all 8 divisions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf6f1] text-[#346c59]">
                      <Mail className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6b8b7e]">
                        Email Support
                      </p>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm font-semibold text-[#1c4337] hover:underline"
                      >
                        {email}
                      </a>
                      <p className="text-xs text-[#769387]">
                        Typically responds within 2-4 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf6f1] text-[#346c59]">
                      <Phone className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6b8b7e]">
                        Direct Helpline
                      </p>
                      <a
                        href={`tel:${phone}`}
                        className="text-sm font-semibold text-[#1c4337] hover:underline"
                      >
                        {phone}
                      </a>
                      <p className="text-xs text-[#769387]">
                        {hours}
                      </p>
                    </div>
                  </div>

                  {settings.whatsappNumber && (
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f7ed] text-[#128c7e]">
                        <MessageCircle className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6b8b7e]">
                          WhatsApp Support
                        </p>
                        <a
                          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#128c7e] hover:underline"
                        >
                          Chat on WhatsApp ({settings.whatsappNumber})
                        </a>
                        <p className="text-xs text-[#769387]">
                          Instant support for listing claims
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf6f1] text-[#346c59]">
                      <Clock className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6b8b7e]">
                        Verification Desk
                      </p>
                      <p className="text-sm font-semibold text-[#1c4337]">
                        Fast-track review active
                      </p>
                      <p className="text-xs text-[#769387]">
                        Average verification turnaround: under 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Onboarding Prompt */}
              <div className="rounded-3xl border border-[#cfe2d7] bg-[#edf6f1]/80 p-6 backdrop-blur-xl sm:p-7">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2d6251]">
                  <Sparkles className="size-4" /> Ready to showcase your business?
                </div>
                <h4 className="mt-2 text-base font-bold text-[#143d33]">
                  Publish your listing in just 3 simple steps
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#506e63]">
                  Create an account, enter your business details with high-resolution photos, and start gaining customers immediately.
                </p>
                <div className="mt-4">
                  <Link
                    href="/listing/add"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#133f35] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1c5548]"
                  >
                    Add Your Listing Now <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-white/50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#bdd4c6]/70 bg-white/60 px-3 py-1 text-xs font-semibold text-[#36705e]">
              <HelpCircle className="size-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#153e34] sm:text-4xl">
              Common questions answered
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#5d7d71]">
              Everything you need to know about getting listed, verification, and managing your business presence.
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#dfe9e3] rounded-3xl border border-[#d6e5dd] bg-white/70 p-6 shadow-sm backdrop-blur-md sm:p-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-bold text-[#1a4438]">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#59786c]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <ShieldCheck className="size-5 text-[#3b7662]" />
            <span className="text-xs text-[#5f7d71]">
              All inquiries are handled in strict confidence by our support specialists.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
