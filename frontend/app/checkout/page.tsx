'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Package, Loader2, CheckCircle, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  // Hydration fix
  useEffect(() => {
    setMounted(true);
    // If cart is empty and not placed order, redirect to cart
    // But we need to make sure we don't redirect if order is just placed.
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_FEE = 200;
  const delivery = totalPrice >= FREE_DELIVERY_THRESHOLD || items.length === 0 ? 0 : DELIVERY_FEE;
  const finalTotal = totalPrice + delivery;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API POST /api/orders
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderId(newOrderId);
    setIsSubmitting(false);
    setOrderPlaced(true);
    clearCart();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) return null;

  // --- ORDER CONFIRMATION VIEW ---
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Confetti Animation Elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
          {Array.from({ length: 50 }).map((_, i) => {
            const colors = ['#D4AF37', '#000000', '#ffffff', '#4CAF50', '#F44336'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = Math.random() * 2 + 2;
            const delay = Math.random() * 0.5;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: '50vh', x: '50vw', scale: 0 }}
                animate={{
                  y: [null, Math.random() * -500 - 100, Math.random() * 1000 + 500],
                  x: [null, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800],
                  opacity: [1, 1, 0],
                  scale: [0, 1, 1],
                  rotate: Math.random() * 360
                }}
                transition={{ duration, delay, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ backgroundColor: color, left: '0', top: '0' }}
              />
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 md:p-12 max-w-2xl w-full mx-4 z-10 text-center"
        >
          {/* Animated Checkmark */}
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24 text-green-500" viewBox="0 0 52 52">
              <circle className="stroke-current fill-none animate-[dash_1.5s_ease-out_forwards]" cx="26" cy="26" r="25" strokeWidth="2" strokeDasharray="166" strokeDashoffset="166" />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="stroke-current fill-none" 
                d="M14.1 27.2l7.1 7.2 16.7-16.8" 
                strokeWidth="2" 
              />
            </svg>
            <style jsx>{`
              @keyframes dash {
                0% { stroke-dashoffset: 166; }
                100% { stroke-dashoffset: 0; }
              }
            `}</style>
          </div>

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 mb-8">Thank you for shopping with StyleAI.</p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono text-xl font-bold text-gold">{orderId}</p>
              </div>
              <div className="mt-4 md:mt-0 md:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                <p className="font-semibold text-text-primary dark:text-white flex items-center md:justify-end gap-1">
                  <Package className="w-4 h-4 text-gold" /> Cash on Delivery
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
              <p className="font-medium text-text-primary dark:text-white">{formData.fullName}</p>
              <p className="text-gray-600 dark:text-gray-300">{formData.address}</p>
              <p className="text-gray-600 dark:text-gray-300">{formData.city}, {formData.postalCode}</p>
              <p className="text-gray-600 dark:text-gray-300">{formData.phone}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Estimated delivery: 3-5 business days. Pay when order arrives.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/account"
              className="flex-1 bg-text-primary dark:bg-white text-bg-light dark:text-bg-dark py-3 rounded font-semibold uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
            >
              Track Order
            </Link>
            <Link 
              href="/products"
              className="flex-1 border-2 border-gold text-gold py-3 rounded font-semibold uppercase tracking-wider text-center hover:bg-gold hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // If cart is empty and not placing order
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 flex flex-col items-center">
        <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-gold hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Go back to products
        </Link>
      </div>
    );
  }

  // --- CHECKOUT FORM VIEW ---
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="font-playfair text-4xl font-bold text-text-primary dark:text-white mb-10">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Delivery Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100 dark:border-gray-800">
              <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white mb-6">
                Delivery Details
              </h2>
              
              <div className="space-y-6">
                {/* Full Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full px-4 pt-6 pb-2 text-text-primary dark:text-white bg-transparent border rounded appearance-none focus:outline-none focus:ring-0 peer ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-gold dark:focus:border-gold'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold pointer-events-none">
                    Full Name
                  </label>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full px-4 pt-6 pb-2 text-text-primary dark:text-white bg-transparent border rounded appearance-none focus:outline-none focus:ring-0 peer ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-gold dark:focus:border-gold'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold pointer-events-none">
                    Phone Number
                  </label>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full px-4 pt-6 pb-2 text-text-primary dark:text-white bg-transparent border rounded appearance-none focus:outline-none focus:ring-0 peer ${
                      errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-gold dark:focus:border-gold'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold pointer-events-none">
                    Complete Address
                  </label>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`block w-full px-4 pt-6 pb-2 text-text-primary dark:text-white bg-transparent border rounded appearance-none focus:outline-none focus:ring-0 peer ${
                        errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-gold dark:focus:border-gold'
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold pointer-events-none">
                      City
                    </label>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`block w-full px-4 pt-6 pb-2 text-text-primary dark:text-white bg-transparent border rounded appearance-none focus:outline-none focus:ring-0 peer ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-gold dark:focus:border-gold'
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold pointer-events-none">
                      Postal Code
                    </label>
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method Details (Visual Only) */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 lg:p-8 border border-gray-100 dark:border-gray-800">
              <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white mb-6">
                Payment Method
              </h2>
              <div className="border-2 border-gold bg-gold/5 rounded-lg p-4 flex items-start gap-4">
                <div className="mt-1 text-gold">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary dark:text-white text-lg">Cash on Delivery</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    You pay when your order arrives at your door. Fast, secure, and hassle-free.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 lg:p-8 sticky top-24 border border-gray-100 dark:border-gray-800">
              <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white mb-6">
                Order Summary
              </h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-16 h-20 relative rounded overflow-hidden flex-shrink-0 bg-gray-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="font-semibold text-text-primary dark:text-white text-sm line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                      <p className="text-gold font-bold text-sm mt-1">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4 text-sm mb-6 border-t border-gray-200 dark:border-gray-800 pt-6">
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
              </div>

              <div className="flex justify-between items-end mb-8 border-t border-gray-200 dark:border-gray-800 pt-4">
                <span className="font-inter font-semibold text-text-primary dark:text-white">Total</span>
                <span className="font-playfair text-3xl font-bold text-gold">
                  Rs {finalTotal.toFixed(2)}
                </span>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-light text-white py-4 rounded font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
