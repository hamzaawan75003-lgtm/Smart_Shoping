'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa6';

const footerLinks = {
  Shop: [
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Men', href: '/products?category=men' },
    { name: 'Women', href: '/products?category=women' },
    { name: 'Accessories', href: '/products?category=accessories' },
    { name: 'Sale', href: '/products?filter=sale' },
  ],
  StyleAI: [
    { name: 'Virtual Try-On', href: '/try-on' },
    { name: 'Smart Setup', href: '/smart-setup' },
    { name: 'Skin Tone Analysis', href: '/smart-setup#skin-tone' },
    { name: 'Size Recommendation', href: '/smart-setup#measurements' },
    { name: 'AI Stylist Chat', href: '/#chatbot' },
  ],
  Help: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping & Returns', href: '/shipping' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
};

const socials = [
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  return (
    <footer className="bg-bg-dark text-white font-inter">
      {/* Top Gold Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <span className="font-playfair text-4xl font-bold tracking-wider">
                StyleAI<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-xs">
              Where artificial intelligence meets personal style. Try clothes on virtually, 
              discover your palette, and shop with total confidence.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-8">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, color: '#C9A84C' }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400 hover:text-gold transition-colors duration-200"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-10">
              <p className="text-sm text-gray-300 mb-3 font-medium uppercase tracking-widest">
                Style updates to your inbox
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center border border-gray-700 rounded-md overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-gold/50 focus-within:border-gold"
              >
                <div className="flex items-center pl-3 text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-grow bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="relative overflow-hidden bg-gold text-bg-dark px-4 py-2.5 hover:bg-gold-light transition-colors duration-200 flex items-center group"
                >
                  <div className="absolute inset-0 w-full h-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <ArrowRight className="w-4 h-4 relative z-10" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-playfair font-semibold text-base mb-5 tracking-wide">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-gold transition-colors duration-200 hover:underline underline-offset-4"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} StyleAI. All rights reserved. Built with
            <span className="text-gold mx-1">♥</span>
            and AI.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-gold transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
