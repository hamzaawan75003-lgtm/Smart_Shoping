'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const stats = [
    { label: 'Founded', value: '2024' },
    { label: 'Products', value: '1,000+' },
    { label: 'AI Accuracy', value: '99%' },
    { label: 'Happy Customers', value: '50k+' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#080808] dark:bg-[#000000] dark:text-[#F3F3F3] pt-32 pb-16 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6">
              Revolutionizing <span className="text-gold">Fashion</span> Through AI.
            </h1>
            <p className="text-neutral-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              StyleAI was born from a simple question: &ldquo;How can we make online shopping more personal and sustainable?&rdquo; 
              By combining cutting-edge computer vision with a passion for style, we&apos;ve created the world&apos;s first true 
              virtual fitting room.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-gold text-2xl font-bold">{stat.value}</p>
                  <p className="text-gray-500 text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative aspect-square w-full max-w-lg"
          >
            <div className="absolute inset-0 border-2 border-gold/30 translate-x-4 translate-y-4 rounded-2xl" />
            <div className="relative h-full w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10">
               {/* Note: In a real app, use a high quality image. Using placeholder for now */}
               <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-[#1A1A1A] dark:to-[#0A0A0A] flex items-center justify-center p-12">
                  <div className="text-center">
                    <p className="font-playfair text-3xl italic text-gold opacity-80 dark:opacity-50">&ldquo;Our mission is to eliminate the guesswork of online shopping.&rdquo;</p>
                    <p className="mt-4 text-neutral-500 dark:text-white/40 uppercase tracking-widest text-sm">— StyleAI Founders</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Vision Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-3xl p-12 md:p-20 text-center mb-24"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-8">Our Vision</h2>
          <p className="text-neutral-600 dark:text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            We believe that every person deserves to feel confident in what they wear. Our technology removes 
            the frustration of incorrect sizing and the environmental impact of returns, creating a more 
            inclusive and sustainable future for fashion.
          </p>
        </motion.div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Innovation', 
              desc: 'We are constantly pushing the boundaries of what AI can do for your personal style.' 
            },
            { 
              title: 'Sustainability', 
              desc: 'By reducing returns, we significantly decrease the carbon footprint of e-commerce.' 
            },
            { 
              title: 'Integrity', 
              desc: 'Your data is yours. We prioritize privacy and ethical AI practices in everything we do.' 
            },
          ].map((value, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 border border-neutral-200 dark:border-white/10 bg-white dark:bg-transparent shadow-sm dark:shadow-none rounded-2xl hover:border-gold/50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gold mb-4">{value.title}</h3>
              <p className="text-neutral-500 dark:text-gray-400">{value.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
