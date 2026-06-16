'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Try-On', href: '/try-on' },
  { name: 'About', href: '/about' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const { isLoggedIn, user } = useUserStore();
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Spotlight and active tab spring coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const spotlightX = useMotionValue(0);
  const ambienceX = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const spotlightSpringX = useSpring(spotlightX, springConfig);
  const ambienceSpringX = useSpring(ambienceX, springConfig);

  const spotlightPx = useTransform(spotlightSpringX, (v) => `${v}px`);
  const ambiencePx = useTransform(ambienceSpringX, (v) => `${v}px`);

  const isHomepage = pathname === '/';

  useEffect(() => {
    setHasHydrated(true);
    // Sync theme from document class
    setIsDark(document.documentElement.classList.contains('dark'));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    if (isHomepage) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    } else {
      setIsScrolled(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Handle active tab center positioning in dynamic spotlight
  useEffect(() => {
    const activeLink = navLinks.find(link => link.href === pathname) || navLinks[0];
    const el = itemRefs.current[activeLink.name];
    const container = containerRef.current;
    if (el && container) {
      const rect = el.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      ambienceX.set(rect.left - parentRect.left + rect.width / 2);
    }
  }, [pathname, ambienceX]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      spotlightX.set(e.clientX - rect.left);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Trigger cart bounce animation when totalItems changes
  useEffect(() => {
    if (totalItems > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const navbarBg = isHomepage 
    ? (isScrolled 
        ? 'bg-[#FAFAFA]/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/[0.06] text-[#080808] dark:text-[#F3F3F3] shadow-[0_4px_30px_rgba(0,0,0,0.03)]' 
        : 'bg-transparent text-neutral-800 dark:text-white') 
    : 'bg-[#FAFAFA]/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-neutral-200 dark:border-white/[0.06] text-[#080808] dark:text-[#F3F3F3] shadow-[0_4px_30px_rgba(0,0,0,0.03)]';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navStyle: any = {
    '--spotlight-x': spotlightPx,
    '--ambience-x': ambiencePx,
    '--spotlight-color': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
    '--ambience-color': isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.8)',
  };

  return (
    <motion.nav 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={navStyle}
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${navbarBg}`}
    >
      {/* ── Theme Spotlight Background Layer ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 transition-opacity duration-300 bg-[radial-gradient(circle_160px_at_var(--spotlight-x)_50%,var(--spotlight-color),transparent),radial-gradient(circle_100px_at_var(--ambience-x)_100%,var(--ambience-color)_4%,transparent)]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-playfair text-3xl font-bold tracking-wider text-neutral-900 dark:text-white">
              StyleAI<span className="text-[#D4AF37] dark:text-[#E5C158]">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                ref={el => { itemRefs.current[link.name] = el; }}
                className={`relative group text-sm uppercase tracking-widest font-medium transition-colors ${pathname === link.href ? 'active-nav-link text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                {link.name}
                <span className="absolute left-0 bottom-[-4px] w-full h-[2px] bg-[#D4AF37] dark:bg-[#E5C158] origin-left transform scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Icons: Theme, Cart & Auth */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-[#E5C158]" /> : <Moon className="w-5 h-5 text-neutral-600 dark:text-gray-400" />}
            </button>

            <Link href="/cart" className="relative group text-neutral-800 dark:text-[#F3F3F3]">
              <motion.div
                animate={isCartBouncing ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="w-6 h-6 hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors duration-300" />
              </motion.div>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] dark:bg-[#E5C158] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {hasHydrated && isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/account" className="flex items-center space-x-2 text-neutral-800 dark:text-[#F3F3F3] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors duration-300">
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium uppercase tracking-widest">{user?.name?.split(' ')[0] || 'ACCOUNT'}</span>
                </Link>
              </div>
            ) : (
              <Link href="/auth" className="flex items-center space-x-2 text-neutral-800 dark:text-[#F3F3F3] hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors duration-300">
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">LOGIN</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
             <Link href="/cart" className="relative text-neutral-800 dark:text-[#F3F3F3]">
              <motion.div
                animate={isCartBouncing ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="w-6 h-6" />
              </motion.div>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] dark:bg-[#E5C158] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-neutral-800 dark:text-[#F3F3F3] focus:outline-none"
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
          >
            <div className="w-full sm:w-80 h-full bg-white dark:bg-black text-neutral-900 dark:text-white p-6 shadow-2xl flex flex-col border-l border-neutral-200 dark:border-white/[0.06]">
              <div className="flex justify-between items-center mb-10">
                <span className="font-playfair text-2xl font-bold">
                  StyleAI<span className="text-[#D4AF37] dark:text-[#E5C158]">.</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-8 h-8 hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors" />
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg uppercase tracking-wider hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="border-neutral-200 dark:border-gray-800 my-4" />
                
                <Link 
                  href="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-lg uppercase tracking-wider hover:text-[#D4AF37] dark:hover:text-[#E5C158] transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span>Login / Account</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
