'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, Download, ShoppingCart, 
  RotateCcw, Upload, Shirt, Eye, AlertCircle, Loader2, Camera
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LOADING_MESSAGES = [
  "Our AI is styling you...",
  "Fitting the perfect outfit...",
  "Almost ready for the runway...",
  "Adjusting the fabric drape...",
  "Adding finishing touches...",
  "Making you look fabulous...",
];

const TUTORIAL_STEPS = [
  { icon: Upload, title: 'Upload Photo', desc: 'Use your saved Smart Mode photo or upload a new full-body picture.' },
  { icon: Shirt, title: 'Select Clothing', desc: 'Browse and pick any clothing item you want to virtually try on.' },
  { icon: Eye, title: 'See Yourself!', desc: 'AI generates a realistic image of you wearing the selected outfit.' },
];

interface ProductResult {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
}

export default function TryOnPage() {
  const router = useRouter();
  const { user, isLoggedIn, measurements } = useUserStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [tryOnState, setTryOnState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const msgRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn) {
      router.push('/auth');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (measurements?.photo_url) {
      setUserPhoto(measurements.photo_url);
    }
  }, [measurements]);

  useEffect(() => {
    if (tryOnState === 'loading') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      msgRef.current = setInterval(() => setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length), 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (msgRef.current) clearInterval(msgRef.current);
      setTimer(0);
      setMsgIndex(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (msgRef.current) clearInterval(msgRef.current);
    };
  }, [tryOnState]);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchProducts(searchQuery), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchProducts]);

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !selectedProduct) {
      toast.error('Please select a photo and a product');
      return;
    }
    setTryOnState('loading');
    try {
      const res = await fetch(`${AI_API}/ai/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_photo_url: userPhoto,
          clothing_image_url: selectedProduct.images[0],
          user_id: user?.id || 'anonymous',
          product_id: selectedProduct.id,
        }),
      });
      if (!res.ok) throw new Error('Try-on failed');
      const data = await res.json();
      setResultUrl(data.result_image_url);
      setTryOnState('result');
      toast.success('Try-on generated!');
    } catch {
      toast.error('Try-on failed. Please try again.');
      setTryOnState('idle');
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `styleai-tryon-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.images[0],
      size: 'M',
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  const handleReset = () => {
    setTryOnState('idle');
    setResultUrl(null);
    setSelectedProduct(null);
  };

  if (!mounted || !isLoggedIn) return null;

  if (!user || user.mode !== 'smart' || !measurements) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md text-center px-4">
          <AlertCircle className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="font-playfair text-3xl font-bold mb-4">Smart Mode Required</h1>
          <p className="text-gray-500 mb-8">Set up your Smart Mode profile to unlock Virtual Try-On.</p>
          <Link href="/smart-setup" className="bg-gold text-white px-8 py-3 rounded-full font-bold hover:bg-gold-light transition-colors shadow-lg">
            Set Up Smart Mode
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">Virtual <span className="text-gold">Try-On</span></h1>
          <p className="text-gray-500">See yourself in our latest collection instantly.</p>
        </motion.div>

        <AnimatePresence>
          {tryOnState === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mb-8">
                <Sparkles className="w-16 h-16 text-gold" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p key={msgIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-white text-xl font-playfair mb-4 text-center">
                  {LOADING_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>
              <p className="text-gold font-mono text-2xl mb-2">{timer}s</p>
              <p className="text-gray-400 text-sm italic">This may take 2-5 minutes — AI is working hard!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {tryOnState === 'result' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 font-bold text-center">Original</div>
                <div className="relative aspect-[3/4]">
                  <Image src={selectedProduct?.images[0] || ''} alt="Original" fill className="object-cover" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl border-2 border-gold">
                <div className="p-4 bg-gold/10 font-bold text-center text-gold">You in this outfit!</div>
                <div className="relative aspect-[3/4]">
                  <Image src={resultUrl!} alt="Result" fill className="object-cover" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={handleDownload} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-8 py-3 rounded-full font-bold hover:border-gold transition-colors">
                <Download className="w-5 h-5" /> Download Image
              </button>
              <button onClick={handleAddToCart} className="flex items-center gap-2 bg-gold text-white px-8 py-3 rounded-full font-bold hover:bg-gold-light transition-colors shadow-lg">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 px-8 py-3 rounded-full font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                <RotateCcw className="w-5 h-5" /> Try Another
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="font-playfair text-xl font-bold mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-gold" /> Your Photo</h2>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                  {userPhoto ? (
                    <Image src={userPhoto} alt="User" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Camera className="w-12 h-12 mb-2" />
                      <p>No photo found</p>
                    </div>
                  )}
                </div>
                <Link href="/smart-setup" className="block text-center text-gold font-bold hover:underline">Change Photo</Link>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="font-playfair text-xl font-bold mb-4 flex items-center gap-2"><Shirt className="w-5 h-5 text-gold" /> Select Clothing</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold animate-spin" />}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${selectedProduct?.id === product.id ? 'border-gold ring-4 ring-gold/20' : 'border-transparent'}`}
                    >
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      {selectedProduct?.id === product.id && (
                        <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateTryOn}
                disabled={!selectedProduct || !userPhoto || tryOnState === 'loading'}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${selectedProduct && userPhoto ? 'bg-gold text-white hover:bg-gold-light' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
              >
                <Sparkles className="w-6 h-6" /> Generate Try-On
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TUTORIAL_STEPS.map((step, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
