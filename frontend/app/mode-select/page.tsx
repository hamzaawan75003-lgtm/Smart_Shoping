'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ModeSelectPage() {
  const router = useRouter();
  const { isLoggedIn, setMode, setMeasurements } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Wait for hydration to complete to avoid false auto-logout on refresh
    const hydrated = useUserStore.persist.hasHydrated();
    if (!hydrated) return;

    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }

    const checkProfile = async () => {
      try {
        const { data } = await api.get('/api/account/measurements', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (data && data.measurements) {
          setMeasurements(data.measurements);
          toast.success('Welcome back! Your profile is loaded', {
            style: {
              background: '#333',
              color: '#fff',
            },
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
          });
          router.push('/products');
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [isLoggedIn, router, setMeasurements]);

  const handleSelectMode = async (mode: 'simple' | 'smart') => {
    setIsUpdating(mode);
    try {
      await api.put('/api/account/profile', 
        { mode }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMode(mode);
      
      if (mode === 'smart') {
        router.push('/smart-setup');
      } else {
        router.push('/products');
      }
    } catch {
      toast.error('Failed to update mode');
      setIsUpdating(null);
    }
  };

  if (!isLoggedIn || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-light text-white mb-4">Choose Your Experience</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          How would you like to shop today? You can always change this later in your profile settings.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
        {/* Simple Mode Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 group cursor-pointer"
          onClick={() => handleSelectMode('simple')}
        >
          <div className="h-full bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-white/30">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-[#D4AF37]">
              <ShoppingBag size={40} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-4">Simple Mode</h2>
            <p className="text-gray-400 mb-8 flex-grow">
              Browse and shop normally. Choose your own size and view standard product images.
            </p>
            
            <button 
              disabled={isUpdating !== null}
              className="w-full py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors flex justify-center items-center h-[56px]"
            >
              {isUpdating === 'simple' ? <Loader2 className="animate-spin" /> : 'Continue Shopping'}
            </button>
          </div>
        </motion.div>

        {/* Smart Mode Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 group cursor-pointer"
          onClick={() => handleSelectMode('smart')}
        >
          <div className="h-full bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-[#D4AF37]/50 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Sparkles size={40} strokeWidth={1.5} />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-[#D4AF37] rounded-full opacity-50 border-dashed"
              />
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-white">Smart Mode</h2>
              <span className="px-3 py-1 text-xs font-semibold bg-[#D4AF37] text-black rounded-full">
                AI Powered
              </span>
            </div>
            
            <p className="text-gray-400 mb-8 flex-grow">
              Upload your photo. AI detects your measurements, recommends sizes, and shows you wearing every outfit.
            </p>
            
            <button 
              disabled={isUpdating !== null}
              className="w-full py-4 rounded-xl bg-[#D4AF37] text-black font-semibold hover:bg-[#E5C158] transition-colors flex justify-center items-center h-[56px]"
            >
              {isUpdating === 'smart' ? <Loader2 className="animate-spin" /> : 'Set Up Smart Mode'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
