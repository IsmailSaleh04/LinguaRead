"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, BookMarked, Trophy, Menu, X } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { LANGUAGES } from "@/lib/utils/constants";

export default function TopNav() {
  const pathname = usePathname();
  const { currentLanguage, setCurrentLanguage, targetLanguages } =
    useLanguage();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BookOpen },
    { href: "/reading", label: "Articles", icon: BookMarked },
    { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: Trophy },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              isActive
                ? "bg-orange text-white border-2 border-brown"
                : "text-darkbrown hover:bg-brown hover:bg-opacity-10"
            } ${mobile ? "w-full" : ""}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-cream border-b-2 border-brown border-opacity-20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <BookOpen size={32} className="text-orange" />
            <span className="text-2xl font-bold text-dark">LinguaRead</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            {targetLanguages.length > 0 && (
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-brown rounded-lg 
                         text-dark font-bold focus:outline-none focus:border-orange"
              >
                {targetLanguages.map((lang) => {
                  const language = LANGUAGES.find(
                    (l) => l.code === lang.language_code,
                  );
                  return (
                    <option key={lang.language_code} value={lang.language_code}>
                      {language?.flag} {language?.name}
                    </option>
                  );
                })}
              </select>
            )}
            <ProfileDropdown />
          </div>

          {/* Mobile Burger */}
          <button
            className="md:hidden text-dark"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t-2 border-brown border-opacity-20 bg-cream px-6 py-4 space-y-4">
          <div className="flex flex-col gap-2">
            <NavLinks mobile />
          </div>

          {targetLanguages.length > 0 && (
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-brown rounded-lg 
                       text-dark font-bold focus:outline-none focus:border-orange"
            >
              {targetLanguages.map((lang) => {
                const language = LANGUAGES.find(
                  (l) => l.code === lang.language_code,
                );
                return (
                  <option key={lang.language_code} value={lang.language_code}>
                    {language?.flag} {language?.name}
                  </option>
                );
              })}
            </select>
          )}

          <ProfileDropdown />
        </div>
      )}
    </nav>
  );
}
