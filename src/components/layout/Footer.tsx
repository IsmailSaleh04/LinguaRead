'use client';

import Link from 'next/link';
import { BookOpen, Mail, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/about' },
      { label: 'How it Works', href: '/about#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Languages', href: '/languages-supported' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Status', href: '/status' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/linguaread', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/linguaread', label: 'Facebook' },
    { icon: Linkedin, href: 'https://linkedin.com/company/linguaread', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/linguaread', label: 'GitHub' },
  ];

  const supportedLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic'
  ];

  return (
    <footer className="bg-cream border-t-2 border-darkbrown border-opacity-20 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-5 gap-8 mb-6">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <BookOpen size={32} className="text-orange" />
              <span className="text-2xl font-bold text-dark">LinguaRead</span>
            </Link>
            <p className="text-darkbrown font-semibold mb-6">
              Learn languages by reading. Discover articles, track vocabulary, and watch your progress grow.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border-2 border-darkbrown border-opacity-20 flex items-center justify-center
                           hover:border-orange hover:bg-orange hover:bg-opacity-10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={20} className="text-brown" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Product</h3>
            <ul className="space-y-1.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-darkbrown font-semibold hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Company</h3>
            <ul className="space-y-1.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-darkbrown font-semibold hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Legal</h3>
            <ul className="space-y-1.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-darkbrown font-semibold hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold text-dark mb-4">Support</h3>
            <ul className="space-y-1.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-darkbrown font-semibold hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark font-semibold">
            © {currentYear} LinguaRead. All rights reserved.
          </p>
            <a href="mailto:support@linguaread.com" className="flex items-center gap-2 text-darkbrown font-semibold hover:text-orange transition-colors">
              <Mail size={18} />
              support@linguaread.com
            </a>
        </div>
      </div>
    </footer>
  );
}
