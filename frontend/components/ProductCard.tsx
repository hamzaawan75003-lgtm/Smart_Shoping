'use client';

import React, { useState, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import SmartModeImage from './SmartModeImage';

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  hover_video_url?: string;
  category?: string;
  sizes_available?: string[];
  colours_available?: (string | { name: string; hex: string })[];
  matchesSkinTone?: boolean;
  tryOnResultUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addItem } = useCartStore();
  const { user, measurements } = useUserStore();

  const displayImage = product.tryOnResultUrl ?? (product.images?.[0] ?? '/placeholder.jpg');

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (videoRef.current && product.hover_video_url) {
      videoRef.current.play().catch(() => {});
    }
  }, [product.hover_video_url]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsVideoReady(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ 
      id: product.id, 
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: 'M', // Default size for quick add
      quantity: 1 
    });
  }, [addItem, product]);

  return (
    <div className="card group">
      <Link href={`/products/${product.id}`} className="block">
      <div
        className="wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ aspectRatio: '3/4' }}
      >
        {/* --- Static Product Image (cover layer) --- */}
        <div
          className="cover-image absolute inset-0 transition-opacity duration-500"
          style={{ opacity: isHovered && isVideoReady ? 0 : 1 }}
        >
          {user?.mode === 'smart' && user?.id ? (
            <SmartModeImage 
              productId={product.id}
              originalImageUrl={displayImage}
              userId={user.id}
              userPhotoUrl={measurements?.photo_url || ''}
            />
          ) : (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* --- Hover Video --- */}
        {product.hover_video_url && (
          <video
            ref={videoRef}
            src={product.hover_video_url}
            loop
            muted
            playsInline
            onCanPlay={() => setIsVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: isHovered && isVideoReady ? 1 : 0 }}
          />
        )}

        {/* --- 3D Pop-out character image (pops out on hover) --- */}
        <div className="character pointer-events-none">
          <Image
            src={product.images[1] || product.images[0] || '/placeholder.jpg'}
            alt={`${product.name} detail`}
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* --- Smart Mode Skin Tone Badge (top-left) --- */}
        {product.matchesSkinTone && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-green-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>Your Skin Tone</span>
          </div>
        )}

        {/* --- Wishlist Heart (top-right) --- */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 z-[15]"
        >
          <motion.div
            whileTap={{ scale: 1.4 }}
            animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
          >
            <Heart
              className="w-5 h-5 transition-colors duration-200"
              style={{
                fill: isWishlisted ? '#EF4444' : 'transparent',
                color: isWishlisted ? '#EF4444' : '#1A1A1A',
              }}
            />
          </motion.div>
        </button>

        {/* --- Hover Overlay Info: Name + Price + CTA --- */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex flex-col gap-2">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white font-playfair font-semibold text-lg leading-snug drop-shadow">
                  {product.name}
                </p>
                <p className="text-gold font-inter font-bold text-base drop-shadow">
                  ${product.price.toFixed(2)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={handleAddToCart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-2 bg-gold text-bg-dark font-inter font-semibold text-sm uppercase tracking-widest py-2.5 rounded hover:bg-gold-light transition-all duration-200 shadow-lg relative overflow-hidden shimmer-btn"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Card title below image (always visible) --- */}
      <div className="block mt-3 px-1">
        <h3 className="font-playfair font-semibold text-text-primary text-base leading-tight truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="font-inter text-gold font-bold text-sm">
            ${product.price.toFixed(2)}
          </span>
          {product.category && (
            <span className="font-inter text-gray-400 text-xs uppercase tracking-wider">
              {product.category}
            </span>
          )}
        </div>
      </div>
      </Link>

      <style jsx>{`
        /* ── Card container — sets the 3-D perspective stage ── */
        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          perspective: 2500px;
          border-radius: 12px;
        }

        /* ── Wrapper — the tilting plane ── */
        .wrapper {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          width: 100%;
          border-radius: 12px;
          background-size: cover;
          overflow: visible; /* ALLOW character to overflow for pop-out */
          transform-style: preserve-3d;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .wrapper:hover {
          transform: rotateX(25deg) translateY(-5%) translateZ(0);
          box-shadow: 0 45px 40px -10px rgba(0, 0, 0, 0.8);
        }

        /* ── Character Pop-out ── */
        .character {
          position: absolute;
          inset: 0;
          z-index: 5;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          transform: translate3d(0, 15%, 0px);
          pointer-events: none;
          /* Remove overflow:hidden to allow popping out if needed, 
             but we clip it via the wrapper logic if we want the Dark Rider look */
        }

        .wrapper:hover .character {
          opacity: 1;
          /* Pop the character forward and up */
          transform: translate3d(0%, -15%, 120px);
        }

        /* ── Inner cover image ── */
        .cover-image {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
        }

        /* ── Gradient overlays ── */
        .wrapper::before {
          content: '';
          opacity: 0.6;
          width: 100%;
          height: 100%;
          transition: all 0.5s;
          position: absolute;
          left: 0;
          top: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 50%);
          z-index: 2;
          pointer-events: none;
        }

        .wrapper:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
