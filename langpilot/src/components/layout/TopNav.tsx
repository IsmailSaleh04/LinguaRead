'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, BookMarked, Trophy } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { LANGUAGES } from '@/lib/utils/constants';

export default function TopNav() {
  const pathname = usePathname();
  const { currentLanguage, setCurrentLanguage, targetLanguages } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { href: '/reading', label: 'Articles', icon: BookMarked },
    { href: '/vocabulary', label: 'Vocabulary', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: Trophy },
  ];

  return (
    <nav className="bg-cream border-b-2 border-brown border-opacity-20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <BookOpen size={32} className="text-orange" />
            <span className="text-2xl font-bold text-dark">LinguaRead</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-bold transition-all ${
                    isActive
                      ? 'bg-orange text-white border-2 border-brown'
                      : 'text-darkbrown border-1 border-darkbrown hover:bg-brown hover:bg-opacity-10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Language Selector & Profile */}
          <div className="flex items-center gap-4">
            {targetLanguages.length > 0 && (
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-brown rounded-lg 
                         text-dark font-bold focus:outline-none focus:border-orange"
              >
                {targetLanguages.map((lang) => {
                  const language = LANGUAGES.find(l => l.code === lang.language_code);
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
        </div>
      </div>
    </nav>
  );
}
