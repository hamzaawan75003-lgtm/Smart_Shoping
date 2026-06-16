'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

interface SmartModeImageProps {
  productId: string;
  originalImageUrl: string;
  userId: string;
  userPhotoUrl: string;
}

export default function SmartModeImage({
  productId,
  originalImageUrl,
  userId,
  userPhotoUrl,
}: SmartModeImageProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(originalImageUrl);
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkCache = async () => {
      try {
        // We'll use the AI API to check cache or handle it here
        // For simplicity, we just check if tryon result exists in supabase tryon_cache via the AI service
        // In a real app, you'd have a separate GET endpoint for this
        // But for now, we'll let the user click "Generate" to check
      } catch (err) {
        console.error(err);
      }
    };
    checkCache();
  }, [productId, userId]);

  const handleGenerateTryOn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userPhotoUrl) {
      toast.error('Set up your Smart Mode photo first!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${AI_API}/ai/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_photo_url: userPhotoUrl,
          clothing_image_url: originalImageUrl,
          user_id: userId,
          product_id: productId,
        }),
      });

      if (!res.ok) throw new Error('Try-on failed');
      const data = await res.json();
      setCurrentImageUrl(data.result_image_url);
      setIsCached(true);
      toast.success('Generated! You look great.');
    } catch (err) {
      console.error(err);
      toast.error('Generation failed. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full h-full group/smart"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <Image
        src={currentImageUrl}
        alt="Product"
        fill
        className={`object-cover transition-all duration-700 ${isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'}`}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-gold mb-2" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-center">AI Styling...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-20"
          >
            <button
              onClick={handleGenerateTryOn}
              className="bg-white/90 backdrop-blur-md text-bg-dark px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-gold hover:text-white transition-all transform hover:scale-105"
            >
              {isCached ? <RefreshCw className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {isCached ? 'Redo Try-On' : 'Try This On'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isCached && !isLoading && (
        <div className="absolute top-2 right-2 bg-gold text-white p-1 rounded-full shadow-lg z-10">
          <Sparkles className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
