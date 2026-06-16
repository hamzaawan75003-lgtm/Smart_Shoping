'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Edit2, Check, Package, 
  ChevronDown, ChevronUp, Heart, X, Sparkles, AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import ProductCard, { Product } from '@/components/ProductCard';
import toast from 'react-hot-toast';

// --- MOCK DATA ---
const MOCK_ORDERS = [
  {
    id: 'ORD-A8392BC',
    date: '2026-04-20',
    total: 325,
    status: 'delivered',
    items: [
      { name: 'Midnight Silk Slip Dress', size: 'S', quantity: 1, price: 180, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100' },
      { name: 'Merino Wool Turtleneck', size: 'M', quantity: 1, price: 145, image: 'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=100' }
    ]
  },
  {
    id: 'ORD-X7721YQ',
    date: '2026-04-24',
    total: 120,
    status: 'dispatched',
    items: [
      { name: 'Pleated Chiffon Midi Skirt', size: 'M', quantity: 1, price: 120, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100' }
    ]
  }
];

const MOCK_WISHLIST: Product[] = [
  {
    id: 'p6',
    name: 'Velvet Evening Gown',
    price: 350,
    category: 'Women',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'],
    colours_available: ['#000080', '#800020', '#000000'],
    sizes_available: ['XS', 'S', 'M'],
    matchesSkinTone: true,
  },
  {
    id: 'p12',
    name: 'Leather Biker Jacket',
    price: 420,
    category: 'Men',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
    colours_available: ['#000000', '#8b4513'],
    sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
    matchesSkinTone: true,
  }
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, measurements, skinTone, colourPalette, logout, setMode, setUser } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Profile Edit
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  // Orders & Wishlist
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Wait for hydration to complete to avoid false auto-logout on refresh
    if (!useUserStore.persist.hasHydrated()) return;

    if (!isLoggedIn) {
      router.push('/auth');
    } else {
      setEditName(user?.name || '');
      setWishlist(MOCK_WISHLIST);
    }
  }, [isLoggedIn, router, user]);

  if (!mounted || !isLoggedIn || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    try {
      // Mock PUT /api/account/profile
      await new Promise(r => setTimeout(r, 500));
      setUser({ ...user, name: editName }, useUserStore.getState().token || '');
      setIsEditingName(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update name');
    } finally {
      // Done
    }
  };

  const toggleMode = async () => {
    const newMode = user.mode === 'smart' ? 'simple' : 'smart';
    // Mock update DB
    toast.promise(
      new Promise(r => setTimeout(r, 800)),
      {
        loading: 'Switching modes...',
        success: () => {
          setMode(newMode);
          return `${newMode === 'smart' ? 'Smart' : 'Simple'} Mode activated`;
        },
        error: 'Failed to switch mode'
      }
    );
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(p => p.id !== id));
    toast.success('Removed from wishlist');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'placed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'dispatched': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        
        {/* PROFILE SECTION */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 lg:p-10 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 w-full">
            <div className="w-24 h-24 rounded-full bg-gold text-white flex items-center justify-center text-3xl font-playfair font-bold shadow-lg flex-shrink-0">
              {getInitials(user.name)}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditingName ? (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border-b-2 border-gold bg-transparent font-playfair text-3xl font-bold focus:outline-none w-auto max-w-[200px] text-text-primary dark:text-white"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h1 className="font-playfair text-3xl font-bold text-text-primary dark:text-white">
                    {user.name}
                  </h1>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gold transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-gray-500 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="inline-block bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 border border-gray-200 dark:border-gray-700">
                  {user.role} Account
                </div>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 bg-[#0B0B0B] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 border border-black dark:border-white px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Go to Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center z-10 w-full md:w-64 flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Experience Mode
            </span>
            <button 
              onClick={toggleMode}
              className="relative w-full h-12 bg-gray-200 dark:bg-gray-900 rounded-full p-1 flex items-center cursor-pointer overflow-hidden shadow-inner"
            >
              <div className="flex-1 text-center z-10 text-sm font-semibold transition-colors duration-300" style={{ color: user.mode === 'simple' ? '#fff' : '#888' }}>
                Simple
              </div>
              <div className="flex-1 text-center z-10 text-sm font-semibold transition-colors duration-300" style={{ color: user.mode === 'smart' ? '#fff' : '#888' }}>
                Smart
              </div>
              
              <motion.div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md"
                style={{ backgroundColor: user.mode === 'smart' ? '#D4AF37' : '#111827' }}
                animate={{ left: user.mode === 'smart' ? 'calc(50% + 2px)' : '4px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </button>
          </div>
        </div>

        {/* SMART MODE SECTION */}
        <AnimatePresence>
          {user.mode === 'smart' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden border-2 border-gold/20"
            >
              <div className="bg-gold/5 p-4 border-b border-gold/20 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h2 className="font-playfair text-xl font-bold text-text-primary dark:text-white">Smart Fashion Profile</h2>
              </div>
              
              <div className="p-6 lg:p-8">
                {measurements ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Saved Photo */}
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-56 relative rounded-lg overflow-hidden bg-gray-100 shadow-md mb-4 border border-gray-200 dark:border-gray-700">
                        {measurements.photo_url ? (
                          <Image src={measurements.photo_url} alt="User Body" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
                        )}
                      </div>
                      <Link href="/smart-setup" className="text-sm font-semibold text-gold hover:underline">
                        Update Photo & Measurements
                      </Link>
                    </div>

                    {/* Measurements & Sizes */}
                    <div className="md:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Body Measurements</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { label: 'Height', val: measurements.height_cm, unit: 'cm' },
                            { label: 'Chest', val: measurements.chest_inches, unit: 'in' },
                            { label: 'Waist', val: measurements.waist_inches, unit: 'in' },
                            { label: 'Hips', val: measurements.hips_inches, unit: 'in' },
                            { label: 'Shoulders', val: measurements.shoulders_inches, unit: 'in' },
                          ].map(m => (
                            <div key={m.label} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                              <p className="font-mono font-semibold text-text-primary dark:text-white text-lg">
                                {m.val ? `${m.val} ${m.unit}` : '--'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Recommended Sizes</h3>
                        <div className="flex gap-3">
                          {[
                            { label: 'Shirt', val: measurements.shirt_size },
                            { label: 'Pant', val: measurements.pant_size },
                            { label: 'Jacket', val: measurements.jacket_size },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-2 border-2 border-gold rounded-full px-4 py-2 bg-gold/5">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">{s.label}:</span>
                              <span className="font-bold text-text-primary dark:text-white">{s.val || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {skinTone && (
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Color Analysis</h3>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded shadow-sm text-sm font-semibold flex items-center gap-2 text-text-primary dark:text-white">
                              Skin Tone: <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D2B48C' }} /> {skinTone}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {colourPalette.map(c => (
                              <div key={c} className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: c }} title={c} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                    <h3 className="font-playfair text-2xl font-bold mb-2 text-text-primary dark:text-white">Complete Your Smart Setup</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Get personalized size recommendations, colour matching, and virtual try-ons by completing your smart profile.</p>
                    <Link href="/smart-setup" className="bg-gold text-white px-6 py-3 rounded font-semibold hover:bg-gold-light transition-colors inline-block">
                      Start Smart Setup
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ORDER HISTORY */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <Package className="w-5 h-5 text-gray-500" />
            <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white">Order History</h2>
          </div>

          {MOCK_ORDERS.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">You haven&apos;t placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {MOCK_ORDERS.map(order => (
                <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div 
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div>
                      <p className="font-mono font-semibold text-text-primary dark:text-white">{order.id}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-bold text-gold">Rs {order.total}</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <div className="text-gray-400">
                        {expandedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Expand */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-gray-800"
                      >
                        <div className="p-4 sm:p-6 space-y-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-center">
                              <div className="w-16 h-20 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-text-primary dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-sm text-text-primary dark:text-white">Rs {item.price}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WISHLIST */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <Heart className="w-5 h-5 text-gray-500" />
            <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white">Wishlist</h2>
          </div>

          {wishlist.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">Your wishlist is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence>
                {wishlist.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* The wishlist heart inside ProductCard is disabled/hidden by our absolute button overlay conceptually, 
                        but to avoid conflicts we just let our remove button sit on top right, ProductCard's heart is also top right.
                        Ideally ProductCard accepts a prop, but we'll place this slightly below. */}
                    <ProductCard product={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-full font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
