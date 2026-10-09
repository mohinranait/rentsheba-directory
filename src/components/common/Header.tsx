"use client";

import { ArrowRight, Globe2, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import UserMenu, { type MeUser } from "./UserMenu";

// The cookie set on login/registration. Its presence tells the header it may
// need the current user, so /api/me is only called when someone is signed in.
const AUTH_STATUS_COOKIE = "auth_status";

const isAuthenticated = () =>
  typeof document !== "undefined" &&
  document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${AUTH_STATUS_COOKIE}=`));

export interface HeaderSettingsProps {
  siteName?: string;
  headerLogo?: string | null;
}

interface HeaderProps {
  settings?: HeaderSettingsProps | null;
}

const Header = ({ settings: initialSettings }: HeaderProps = {}) => {
  const [user, setUser] = useState<MeUser | null>(null);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<HeaderSettingsProps | null>(
    initialSettings || null,
  );

  useEffect(() => {
    let cancelled = false;

    // Load public settings if not provided as props
    if (!initialSettings) {
      fetch("/api/public/settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!cancelled && json?.success && json.data) {
            setSettings({
              siteName: json.data.siteName,
              headerLogo: json.data.headerLogo,
            });
          }
        })
        .catch(() => {
          // ignore error and use defaults
        });
    }

    if (!isAuthenticated()) {
      setReady(true);
      return;
    }

    fetch("/api/me", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (response.status === 401) return null;
        return response.json().catch(() => null);
      })
      .then((json) => {
        if (cancelled) return;
        setUser(json?.success ? json.user : null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  const siteName = settings?.siteName || "Rentsheba";

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe8e3] bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${siteName} home`}
        >
          {settings?.headerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.headerLogo}
              alt={siteName}
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <>
              <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35]">
                <Globe2 className="size-5" />
              </span>
              <span className="text-xl font-bold tracking-[-0.04em]">
                {siteName}
                <span className="text-[#4c796b]">.</span>
              </span>
            </>
          )}
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#557068] md:flex">
          <a href="#explore" className="hover:text-[#133f35]">
            Explore
          </a>
          <a href="#categories" className="hover:text-[#133f35]">
            Categories
          </a>
          <a href="#pricing" className="hover:text-[#133f35]">
            Pricing
          </a>
          <a href="/#how" className="hover:text-[#133f35]">
            How it works
          </a>
          <Link href="/contact" className="hover:text-[#133f35]">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {!ready ? (
            <span className="h-10 w-20 animate-pulse rounded-lg bg-[#e8efe9] md:w-24" />
          ) : user ? (
            <UserMenu user={user} onLogout={() => setUser(null)} />
          ) : (
            <Link
              href="/login"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-[#46645a] transition-colors hover:bg-white"
            >
              Log in
            </Link>
          )}
          <Link
            href="/listing/add"
            className="hidden sm:inline-flex items-center rounded-lg bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d5548]"
          >
            Add your listing <ArrowRight className="ml-1 inline size-4" />
          </Link>
          <Button
            aria-label="Toggle navigation menu"
            className="grid size-10 place-items-center rounded-lg border border-[#dfe8e3] md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
