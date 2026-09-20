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

const Header = () => {
  const [user, setUser] = useState<MeUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

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
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe8e3] bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="directory home"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[#d3f36b] text-[#133f35]">
            <Globe2 className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-[-0.04em]">
            directory<span className="text-[#4c796b]">.</span>
          </span>
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
          <a href="#how" className="hover:text-[#133f35]">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {!ready ? (
            <span className="h-10 w-20 animate-pulse rounded-lg bg-[#e8efe9] md:w-24" />
          ) : user ? (
            <UserMenu user={user} onLogout={() => setUser(null)} />
          ) : (
            <Link href={"/login"}>
              <Button className="flex rounded-lg bg-transparent px-3 py-2 text-sm font-semibold text-[#46645a] hover:bg-white">
                Log in
              </Button>
            </Link>
          )}
          <Link href={"/listing/add"} className="hidden sm:inline-flex">
            <Button className="rounded-lg bg-[#133f35] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d5548]">
              Add your listing <ArrowRight className="ml-1 inline size-4" />
            </Button>
          </Link>
          <Button className="grid size-10 place-items-center rounded-lg border border-[#dfe8e3] md:hidden">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
