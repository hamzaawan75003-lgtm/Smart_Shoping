'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ArrowRight, Upload, ScanLine, Ruler, ShoppingBag,
  MessageCircle, Sparkles,
} from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa6';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import VideoBackground from '@/components/VideoBackground';
import { supabase } from '@/lib/supabase';

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const SectionReveal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

import { MOCK_PRODUCTS } from '@/lib/mockProducts';

// ─── Fallback data shown while Supabase loads ─────────────────────────────────
const FALLBACK_PRODUCTS: Product[] = MOCK_PRODUCTS as Product[];

const HERO_WORDS = ['Wear', 'It', 'Before', 'You', 'Buy', 'It.'];

const CATEGORIES = [
  { label: 'Men',   slug: 'men',   img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80' },
  { label: 'Women', slug: 'women', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' },
  { label: 'Kids',  slug: 'kids',  img: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80' },
];

const HOW_IT_WORKS = [
  { icon: Upload,     step: '01', title: 'Upload Photo',    desc: 'Take or upload a front-facing photo in fitted clothing.' },
  { icon: ScanLine,   step: '02', title: 'Detect Body',     desc: 'MediaPipe maps 33 landmarks to estimate your measurements.' },
  { icon: Ruler,      step: '03', title: 'Get Your Size',   desc: 'ML model predicts shirt, trouser and jacket sizes accurately.' },
  { icon: ShoppingBag,step: '04', title: 'Shop Smart',      desc: 'Browse a personalised feed filtered for your body and palette.' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch featured products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category, images, hover_video_url, colours_available')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error || !data?.length) {
        setProducts(FALLBACK_PRODUCTS);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <div className="bg-bg-primary overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          § 1  HERO — full screen video background
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <VideoBackground overlayOpacity={0.58} />

        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">

          {/* Staggered headline */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
            {HERO_WORDS.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
                className="font-playfair text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight"
              >
                {word === 'It.' ? <span className="text-gold italic">{word}</span> : word}
              </motion.span>
            ))}
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: 'easeOut' }}
            className="font-inter text-gray-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered fashion. See yourself in every outfit.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.95, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden shimmer-btn px-10 py-4 bg-gold text-bg-dark font-inter font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-gold-light transition-all duration-300 shadow-[0_0_30px_rgba(201,168,76,0.4)]"
              >
                Shop Now
              </motion.button>
            </Link>
            <Link href="/smart-setup">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#C9A84C', color: '#C9A84C' }}
                whileTap={{ scale: 0.96 }}
                className="px-10 py-4 border-2 border-white text-white font-inter font-semibold uppercase tracking-widest text-sm rounded-sm transition-all duration-300"
              >
                Try Smart Mode
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Bouncing scroll arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-7 h-7 text-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 2  FEATURED PRODUCTS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <SectionReveal>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-gold text-xs uppercase tracking-[0.25em] font-inter mb-3">Curated For You</p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-text-primary">Featured Collection</h2>
            <div className="w-16 h-px bg-gold mx-auto mt-5" />
          </motion.div>
        </SectionReveal>

        {loading ? (
          <LoadingSkeleton variant="card" count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-14">
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-gold text-gold font-inter font-semibold uppercase tracking-widest text-sm hover:bg-gold hover:text-bg-dark transition-all duration-300"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 3  CATEGORIES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionReveal>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold text-text-primary">Shop by Category</h2>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </motion.div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <SectionReveal key={cat.slug}>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.15 } }
                }}
              >
                <Link href={`/products?category=${cat.slug}`}>
                  <div className="relative overflow-hidden rounded-sm cursor-pointer group" style={{ aspectRatio: '3/4' }}>
                    <Image
                      src={cat.img}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <h3 className="font-playfair text-white text-4xl font-bold">{cat.label}</h3>
                      <p className="font-inter text-gold text-xs uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Shop Now →
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 4  SMART MODE BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-bg-dark py-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left — slides in from left */}
          <SectionReveal>
            <motion.div
              variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }}
            >
              <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-gold text-xs font-inter uppercase tracking-widest">AI Smart Mode</span>
              </div>
              <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                See Yourself in<br />
                <span className="text-gold italic">Every Outfit.</span>
              </h2>
              <ul className="space-y-4 mb-10 font-inter text-gray-300 text-sm">
                {[
                  '📸  Upload one photo — we do the rest',
                  '🎨  Skin tone analysis builds your colour palette',
                  '📏  Body measurements predict your perfect fit',
                  '👗  Virtual try-on powered by Hugging Face IDM-VTON',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed">{item}</li>
                ))}
              </ul>
              <Link href="/smart-setup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(201,168,76,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 bg-gold text-bg-dark font-inter font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-gold-light transition-colors duration-300"
                >
                  Try Smart Mode Now →
                </motion.button>
              </Link>
            </motion.div>
          </SectionReveal>

          {/* Right — decorative mockup */}
          <SectionReveal>
            <motion.div
              variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2, ease: 'easeOut' } } }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-2xl" style={{ aspectRatio: '4/5' }}>
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=85"
                  alt="Smart Mode showcase"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent" />
                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-bg-dark/80 backdrop-blur-md border border-gold/20 rounded-xl p-4">
                  <p className="text-gold text-xs uppercase tracking-widest font-inter mb-1">Skin Tone Match</p>
                  <div className="flex items-center gap-3">
                    {['#F5CBA7','#E59866','#CA6F1E','#C9A84C','#2ECC71'].map((c) => (
                      <div key={c} className="w-7 h-7 rounded-full border-2 border-white/20" style={{ backgroundColor: c }} />
                    ))}
                    <span className="text-white text-xs font-inter ml-auto">Your palette →</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 5  HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="font-playfair text-4xl font-bold text-text-primary">How It Works</h2>
              <div className="w-16 h-px bg-gold mx-auto mt-4" />
            </motion.div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {HOW_IT_WORKS.map((item, i) => (
              <SectionReveal key={item.title}>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.15 } }
                  }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-gold" />
                    </div>
                    <span className="absolute -top-2 -right-3 font-playfair text-gold/30 text-3xl font-bold leading-none select-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-text-primary">{item.title}</h3>
                  <p className="font-inter text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 6  NEWSLETTER
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-bg-primary border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <SectionReveal>
            <motion.div variants={fadeUp}>
              <h2 className="font-playfair text-3xl font-bold text-text-primary mb-3">
                Stay Ahead of the Trend
              </h2>
              <p className="font-inter text-gray-500 text-sm mb-8">
                New drops, style tips, and AI features — delivered to your inbox.
              </p>
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.p
                    key="thanks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-success font-inter font-semibold text-lg"
                  >
                    ✓ You&apos;re subscribed!
                  </motion.p>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-grow px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-gold font-inter text-sm transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gold text-bg-dark font-inter font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-gold-light transition-colors duration-300 whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 7  MINI FOOTER (main Footer in layout)
          Social icons strip above the full Footer component
      ═══════════════════════════════════════════════════════════ */}
      <SectionReveal className="bg-bg-dark border-t border-gray-800 py-6 px-6">
        <motion.div 
          variants={fadeUp}
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <span className="font-playfair text-2xl font-bold text-white">
            StyleAI<span className="text-gold">.</span>
          </span>
          <div className="flex items-center gap-6">
            {[
              { icon: FaInstagram, href: '#', label: 'Instagram' },
              { icon: FaFacebook, href: '#', label: 'Facebook' },
              { icon: MessageCircle, href: '#', label: 'WhatsApp' },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label} href={href} aria-label={label}
                whileHover={{ scale: 1.2, color: '#C9A84C' }}
                className="text-gray-400 hover:text-gold transition-colors"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
          <p className="font-inter text-gray-500 text-xs">
            © {new Date().getFullYear()} StyleAI — All rights reserved
          </p>
        </motion.div>
      </SectionReveal>

    </div>
  );
}
