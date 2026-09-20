"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type MeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
};

type UserMenuProps = {
  user: MeUser;
  onLogout: () => void;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const isAdmin = (user: MeUser) => user.role === "ADMIN";

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoggingOut(false);
      setOpen(false);
      onLogout();
      router.refresh();
    }
  }

  const initials = getInitials(user.name || user.email || "U");

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name} account menu`}
        className="flex h-10 items-center gap-2 rounded-lg border border-[#dfe8e3] bg-white px-2 text-sm font-bold text-[#31594c] transition hover:bg-[#f0f6f2]"
      >
        <span className="grid size-7 place-items-center rounded-md bg-[#e8f2ec] text-xs font-bold text-[#2e6c57]">
          {initials}
        </span>
        <ChevronDown
          className={`size-4 text-[#6d857b] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#dfe8e3] bg-white p-2 shadow-[0_18px_45px_rgba(40,88,62,.18)]"
        >
          <div className="flex items-center gap-3 border-b border-[#edf1ee] px-3 py-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f2ec] text-sm font-bold text-[#2e6c57]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#254d40]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[#7d9289]">{user.email}</p>
            </div>
          </div>

          <div className="py-1.5">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3c5b4f] transition hover:bg-[#f0f6f2]"
            >
              <LayoutDashboard className="size-4 text-[#4b8b71]" />
              Dashboard
            </Link>

            {isAdmin(user) && (
              <Link
                href="/admin/dashboard"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#3c5b4f] transition hover:bg-[#f0f6f2]"
              >
                <ShieldCheck className="size-4 text-[#4b8b71]" />
                Admin dashboard
                <span className="ml-auto rounded-full bg-[#edf7ef] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4b8b71]">
                  Admin
                </span>
              </Link>
            )}
          </div>

          <div className="border-t border-[#edf1ee] pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#b0523f] transition hover:bg-[#fdf0ed] disabled:opacity-60"
            >
              <LogOut className="size-4" />
              {loggingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
