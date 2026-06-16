'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart, ShoppingCart, Star, Plus, Minus, 
  ChevronRight, Sparkles, Check
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import toast from 'react-hot-toast';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mockProducts';
import { api } from '@/lib/api';

interface ColourOption {
  name: string;
  hex: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { addItem } = useCartStore();
  const { user, measurements } = useUserStore();
  
  const isSmartMode = user?.mode === 'smart';
  
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColour, setSelectedColour] = useState<ColourOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Reviews
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.warn('Failed to fetch product from API, falling back to mock data:', err);
        const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
        setProduct(mockProduct || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedColour(product.colours_available?.[0] || null);
      setSelectedSize(isSmartMode ? product.recommendedSize || '' : '');
      setQuantity(1);
      setIsWishlisted(false);
    }
  }, [product, isSmartMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium text-text-primary dark:text-white">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium text-text-primary dark:text-white mb-4">Product not found</p>
          <Link href="/products" className="text-gold underline">Back to collection</Link>
        </div>
      </div>
    );
  }

  const activeColour = selectedColour || product.colours_available?.[0] || { name: '', hex: '' };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity,
    });
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-bg-dark shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 text-gold">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-text-primary dark:text-white">
                Added to cart
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {quantity}x {product.name} ({selectedSize})
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push('/cart');
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gold hover:text-gold-light focus:outline-none"
          >
            View Cart
          </button>
        </div>
      </div>
    ));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    toast.success('Review submitted successfully!');
    setReviewText('');
    setReviewStars(5);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-gold transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary dark:text-gray-300 font-medium">{product.name}</span>
        </nav>

        {/* Product Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* LEFT: Image Gallery & Video */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100 group cursor-crosshair">
              <Image 
                src={product.images[activeImageIdx]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              
              {/* Smart Mode Try-On Prompt */}
              {isSmartMode && !product.images[activeImageIdx].includes('tryon') && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link 
                    href={`/try-on?productId=${product.id}`}
                    className="bg-gold text-white px-6 py-3 rounded font-semibold uppercase tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Try-On
                  </Link>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-24 h-32 flex-shrink-0 rounded overflow-hidden transition-all ${
                    activeImageIdx === idx ? 'ring-2 ring-gold ring-offset-2 dark:ring-offset-bg-dark' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Video Player */}
            {product.video_url && (
              <div className="mt-8 rounded-lg overflow-hidden bg-black aspect-video relative">
                <video 
                  src={product.video_url} 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-text-primary dark:text-white mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="font-inter text-2xl font-bold text-gold">
                  ${product.price.toFixed(2)}
                </span>
                
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span>({product.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Colours */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-inter font-semibold text-text-primary dark:text-white">
                  Colour: <span className="font-normal text-gray-500">{activeColour?.name}</span>
                </h3>
                {isSmartMode && product.matchesSkinTone && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                    <Check className="w-4 h-4" /> Colour Match
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {product.colours_available?.map((colour: ColourOption) => (
                  <button
                    key={colour.name}
                    onClick={() => setSelectedColour(colour)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      activeColour?.name === colour.name 
                        ? 'border-gold scale-110' 
                        : 'border-transparent ring-1 ring-gray-200 dark:ring-gray-700 hover:scale-105'
                    }`}
                    style={{ backgroundColor: colour.hex }}
                    title={colour.name}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-inter font-semibold text-text-primary dark:text-white">Size</h3>
                <button className="text-sm text-gray-500 hover:text-gold transition-colors underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes_available.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded border flex items-center justify-center font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-gold bg-gold text-white shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {isSmartMode && measurements?.photo_url && (
                <p className="mt-3 text-sm text-gold flex items-center gap-2 bg-gold/10 p-2 rounded">
                  <Sparkles className="w-4 h-4" />
                  AI recommended size <strong>{product.recommendedSize}</strong> based on your measurements.
                </p>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 mt-auto">
              {/* Quantity */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded h-12 w-32">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-gray-500 hover:text-text-primary dark:hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-semibold text-text-primary dark:text-white">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 h-full text-gray-500 hover:text-text-primary dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-gold hover:bg-gold-light text-white h-12 rounded font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              {/* Wishlist */}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-12 w-12 flex items-center justify-center rounded border transition-colors ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gold'
                }`}
              >
                <motion.div animate={{ scale: isWishlisted ? [1, 1.3, 1] : 1 }}>
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </motion.div>
              </button>
            </div>

            {/* Virtual Try-On Large Button */}
            <Link 
              href={`/try-on?productId=${product.id}`}
              className="w-full bg-bg-dark dark:bg-gray-800 text-white h-14 rounded font-semibold uppercase tracking-wider hover:bg-black dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-gold" />
              Virtual Try-On
            </Link>

            {/* Accordions / Extra Info (Static for now) */}
            <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
              <div className="flex justify-between items-center py-2 cursor-pointer group">
                <span className="font-semibold text-text-primary dark:text-white group-hover:text-gold transition-colors">Details & Care</span>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
              </div>
              <div className="flex justify-between items-center py-2 cursor-pointer group border-t border-gray-200 dark:border-gray-800 pt-4">
                <span className="font-semibold text-text-primary dark:text-white group-hover:text-gold transition-colors">Delivery & Returns</span>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-16">
          <h2 className="font-playfair text-3xl font-bold text-text-primary dark:text-white mb-8">
            Customer Reviews
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Write a Review */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg">
              <h3 className="font-inter font-semibold text-xl mb-4 text-text-primary dark:text-white">Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="flex gap-1 mb-4 text-gold">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewStars ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 h-32 focus:outline-none focus:border-gold mb-4 text-text-primary dark:text-white resize-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-text-primary dark:bg-white text-bg-light dark:text-bg-dark font-semibold py-3 rounded hover:bg-gold hover:text-white transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary dark:text-white">{review.user}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.stars ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-3">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
