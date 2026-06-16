'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration fix & simulate fetch
  useEffect(() => {
    setMounted(true);
    // Simulate network fetch as per requirements
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_FEE = 200;
  
  const delivery = totalPrice >= FREE_DELIVERY_THRESHOLD || items.length === 0 ? 0 : DELIVERY_FEE;
  const finalTotal = totalPrice + delivery;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-10">
          Your Cart
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : items.length === 0 ? (
          // --- EMPTY STATE ---
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="relative w-64 h-64 mb-8 grayscale opacity-50"
            >
              <Image 
                src="/empty-cart.png" 
                alt="Empty Cart" 
                fill 
                className="object-contain"
              />
            </motion.div>
            <h2 className="font-playfair text-3xl font-bold text-text-primary dark:text-white mb-3">
              Your bag is empty
            </h2>
            <p className="text-gray-500 mb-10 max-w-md">
              Looks like you haven&apos;t added anything to your cart yet. Discover our latest collection and find something you love.
            </p>
            <Link 
              href="/products"
              className="bg-gold hover:bg-gold-light text-white px-10 py-4 rounded-full font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          // --- CART CONTENTS ---
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, x: -50, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 50, height: 0, margin: 0, padding: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden"
                  >
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <div className="w-20 h-24 relative rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <Link href={`/products/${item.id}`} className="font-playfair font-bold text-lg text-text-primary dark:text-white hover:text-gold transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">Size: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.size}</span></p>
                        <p className="text-gold font-semibold md:hidden mt-2">Rs {item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded h-10 w-28">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="px-3 h-full text-gray-500 hover:text-text-primary dark:hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center font-semibold text-sm text-text-primary dark:text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="px-3 h-full text-gray-500 hover:text-text-primary dark:hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Line Price */}
                    <div className="hidden md:block col-span-2 text-right font-inter font-bold text-text-primary dark:text-white">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <div className="absolute top-4 right-0 md:static md:col-span-1 flex justify-end">
                      <button 
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 lg:p-8 sticky top-24">
                <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 text-sm mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary dark:text-white">Rs {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-text-primary dark:text-white">
                      {delivery === 0 ? <span className="text-green-500">Free</span> : `Rs ${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  {delivery > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Add Rs {(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)} more for free delivery!
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="font-inter font-semibold text-text-primary dark:text-white">Total</span>
                  <span className="font-playfair text-3xl font-bold text-gold">
                    Rs {finalTotal.toFixed(2)}
                  </span>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-gold hover:bg-gold-light text-white py-4 rounded font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
