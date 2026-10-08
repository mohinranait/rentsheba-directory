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
import ContactForm from "./components/contact-form";

const baseUrl = (config.app_url ?? "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Contact Us — Rentsheba Directory",
  description:
    "Get in touch with the Rentsheba team. Inquire about listing your business, verification assistance, partnerships, advertising, or account support.",
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: "Contact Us — Rentsheba Directory",
    description:
      "Have questions about listing your business or services? Contact our support and directory onboarding team in Bangladesh.",
    url: `${baseUrl}/contact`,
    siteName: "Rentsheba Directory",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How long does it take to get a listing approved?",
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

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden ">
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
              listing, or partnering with Bangladesh&apos;s curated directory?
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
                        Dhaka, Bangladesh
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
                        href="mailto:support@rentsheba.com"
                        className="text-sm font-semibold text-[#1c4337] hover:underline"
                      >
                        support@rentsheba.com
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
                      <p className="text-sm font-semibold text-[#1c4337]">
                        +880 1700-000000
                      </p>
                      <p className="text-xs text-[#769387]">
                        Saturday – Thursday (9:00 AM – 7:00 PM)
                      </p>
                    </div>
                  </div>

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
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#356a57]">
                  <Sparkles className="size-3.5 text-[#e5a93b]" /> Instant Listing
                </div>
                <h4 className="mt-2 text-lg font-bold text-[#143d33]">
                  Ready to add your business right now?
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#507366]">
                  You don&apos;t need to wait for assistance. Use our guided
                  wizard to create your public profile in 3 simple steps.
                </p>
                <Link
                  href="/listing/add"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#133f35] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1a4f43]"
                >
                  Create Your Listing Now <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Directory FAQ Section */}
      <section className="relative bg-white/50   pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bcd6c6] bg-white/70 px-3 py-1 text-xs font-semibold text-[#366c5b]">
              <HelpCircle className="size-3.5" /> Frequent Questions
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#153e34]">
              Common questions answered
            </h2>
            <p className="mt-2 text-sm text-[#617e73]">
              Find quick answers about publishing, subscription plans, and verification.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-[#e1ece4] bg-white/70 p-6 shadow-xs backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-5 shrink-0 text-[#4b8b71] mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1b4337]">
                      {faq.q}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#5a766c]">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
