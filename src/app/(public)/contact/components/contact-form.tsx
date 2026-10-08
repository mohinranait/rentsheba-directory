"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const INQUIRY_TOPICS = [
  "General Inquiry",
  "List My Business / Verification",
  "Subscription & Payment Support",
  "Partnership & Advertising",
  "Report an Issue with a Listing",
  "Other",
] as const;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit message");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(21,63,53,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold tracking-tight text-[#153e34]">
          Send us a message
        </h3>
        <p className="mt-1 text-sm text-[#5d7a6f]">
          Fill out the form below and we will respond as soon as possible.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-2xl border border-[#b4dbbf] bg-[#eef8f1] p-5 text-[#23583f]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-[#3c8c5c] mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Message received successfully!</h4>
              <p className="mt-1 text-xs text-[#3c6b54] leading-relaxed">
                Thank you for reaching out. Your inquiry has been forwarded to
                our support desk, and our team will get back to you via email
                shortly.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-3 text-xs font-semibold text-[#1e5239] underline underline-offset-2 hover:text-[#113926]"
              >
                Send another message
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-[#f3c8c8] bg-[#fdf2f2] p-4 text-[#8a2b2b]">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="size-4 shrink-0 text-[#b83838]" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Email Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#355b4e]"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7d998e]" />
              <input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Mahbub Rahman"
                className="w-full rounded-xl border border-[#d6e4dc] bg-white/90 py-2.5 pl-10 pr-3.5 text-sm text-[#153e34] outline-none transition focus:border-[#4b8b71] focus:ring-2 focus:ring-[#4b8b71]/20 placeholder:text-[#94aba1]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#355b4e]"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7d998e]" />
              <input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#d6e4dc] bg-white/90 py-2.5 pl-10 pr-3.5 text-sm text-[#153e34] outline-none transition focus:border-[#4b8b71] focus:ring-2 focus:ring-[#4b8b71]/20 placeholder:text-[#94aba1]"
              />
            </div>
          </div>
        </div>

        {/* Phone & Subject Topic */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-phone"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#355b4e]"
            >
              Phone Number <span className="text-xs text-[#829e92] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7d998e]" />
              <input
                id="contact-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+880 1..."
                className="w-full rounded-xl border border-[#d6e4dc] bg-white/90 py-2.5 pl-10 pr-3.5 text-sm text-[#153e34] outline-none transition focus:border-[#4b8b71] focus:ring-2 focus:ring-[#4b8b71]/20 placeholder:text-[#94aba1]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#355b4e]"
            >
              Inquiry Topic
            </label>
            <select
              id="contact-subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full rounded-xl border border-[#d6e4dc] bg-white/90 px-3.5 py-2.5 text-sm text-[#153e34] outline-none transition focus:border-[#4b8b71] focus:ring-2 focus:ring-[#4b8b71]/20"
            >
              {INQUIRY_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#355b4e]"
          >
            Your Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#7d998e]" />
            <textarea
              id="contact-message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Tell us about your query, listing verification request, or how we can help you..."
              className="w-full rounded-xl border border-[#d6e4dc] bg-white/90 py-3 pl-10 pr-3.5 text-sm text-[#153e34] outline-none transition focus:border-[#4b8b71] focus:ring-2 focus:ring-[#4b8b71]/20 placeholder:text-[#94aba1]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#133f35] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1a4f43] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#d3f36b]" />
                Sending inquiry…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send Message
                <Send className="size-4" />
              </span>
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] text-[#7d988d]">
          By submitting, you agree to our terms. We protect your privacy and
          never share your contact details.
        </p>
      </form>
    </div>
  );
}
