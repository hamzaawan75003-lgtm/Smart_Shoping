"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// --- GLOBAL STYLES FOR LIQUID-GLASS AND TYPOGRAPHY ---
const LiquidGlassStyle = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:italic&family=Inter:wght@300;400;500&display=swap');
    
    :root {
      --spotlight-color: rgba(0, 0, 0, 0.8);
      --ambience-color: rgba(255, 255, 255, 0.1);
    }
    .dark {
      --spotlight-color: rgba(255, 255, 255, 0.8);
      --ambience-color: rgba(0, 0, 0, 0.1);
    }

    .font-serif-italic {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
    }
    .font-inter {
      font-family: 'Inter', sans-serif;
    }

    /* Liquid Glass Engine */
    .liquid-glass {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.05);
    }
    .dark .liquid-glass {
      background: rgba(255, 255, 255, 0.05);
    }
    .light .liquid-glass {
      background: rgba(0, 0, 0, 0.05);
    }

    .liquid-glass-strong {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .liquid-glass-strong:hover {
       background: rgba(255, 255, 255, 0.15);
    }

    /* Mobile Carousel Snap */
    .snap-x-mandatory {
      scroll-snap-type: x mandatory;
    }
    .snap-center {
      scroll-snap-align: center;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);

// --- SPOTLIGHT NAVBAR COMPONENT ---
const SpotlightNavbar = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setMousePosition({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const navItems = ["Women", "Men", "Editorial", "Archive", "Cart (0)"];

  return (
    <motion.nav 
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 liquid-glass rounded-full px-6 py-3 flex items-center gap-6 md:gap-8 border border-white/10 overflow-hidden w-[90%] md:w-auto justify-between md:justify-center"
    >
      <motion.div 
        className="absolute w-32 h-32 rounded-full pointer-events-none blur-2xl z-0"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
        style={{ background: 'var(--spotlight-color)', opacity: 0.3 }}
      />
      {navItems.map((item, i) => (
        <a key={i} href="#" className="font-inter uppercase text-[10px] md:text-[11px] tracking-widest text-white/80 hover:text-white transition-colors relative z-10 whitespace-nowrap">
          {item}
        </a>
      ))}
    </motion.nav>
  );
};

// --- MAGNETIC BUTTON COMPONENT ---
const MagneticButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`liquid-glass-strong rounded-full px-8 py-4 flex items-center gap-2 group text-white cursor-pointer ${className}`}
    >
      <span className="font-inter uppercase text-xs tracking-widest">{children}</span>
      <div className="relative w-4 h-4 overflow-hidden">
        <ArrowUpRight className="w-4 h-4 absolute top-0 left-0 group-hover:-top-4 group-hover:left-4 transition-all duration-300" />
        <ArrowUpRight className="w-4 h-4 absolute -top-4 -left-4 group-hover:top-0 group-hover:left-0 transition-all duration-300" />
      </div>
    </motion.button>
  );
};

// --- TEXT REVEAL COMPONENT ---
const TextReveal = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const words = text.split(" ");
  return (
    <div className="overflow-hidden inline-flex flex-wrap justify-center">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: delay + i * 0.1 }}
          className="inline-block mr-4 md:mr-6 last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function AuraLanding() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 250]);

  return (
    <div className="dark bg-black min-h-screen text-[#F3F3F3] selection:bg-white selection:text-black antialiased">
      <LiquidGlassStyle />
      
      {/* Background Entrance */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1.5 }}
        className="fixed inset-0 pointer-events-none z-[-1] bg-black"
      />

      <SpotlightNavbar />

      {/* SECTION 1: CINEMATIC HERO */}
      <section className="relative h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden border-b border-white/10">
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
          className="absolute inset-0 z-0"
        >
          {/* Replacing video with a cinematic gif/image for demonstration */}
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Cinematic" 
            className="w-full h-full object-cover opacity-60 grayscale object-top"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif-italic text-6xl md:text-8xl lg:text-[140px] leading-none mb-6">
            <TextReveal text="NEW COLLECTION" delay={1.0} />
          </h1>
        </div>

        <div className="absolute bottom-10 left-10 z-10 hidden md:block">
          <p className="font-inter uppercase text-[10px] tracking-[0.3em] opacity-50">Scroll to explore</p>
        </div>
        
        <div className="absolute bottom-10 right-10 z-10">
          <MagneticButton>Explore FW26</MagneticButton>
        </div>
      </section>

      {/* SECTION 2: ASYMMETRIC EDITORIAL GRID (NEW IN) */}
      <section className="border-b border-white/10 relative">
        {/* Mobile Swipe Carousel Layout vs Desktop Grid */}
        <div className="flex md:grid md:grid-cols-3 w-full overflow-x-auto snap-x-mandatory hide-scrollbar border-r border-white/10">
          
          {/* Large Portrait (2 columns) */}
          <div className="w-[85vw] md:w-auto flex-shrink-0 snap-center md:col-span-2 border-r border-white/10 border-b md:border-b-0 overflow-hidden relative group h-[600px] md:h-[900px]">
            <motion.div style={{ y: yParallax }} className="w-full h-[120%] -mt-[10%]">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-between items-end liquid-glass">
              <div>
                <h3 className="font-serif-italic text-3xl md:text-4xl mb-1">Tailored Structure Coat</h3>
                <p className="font-inter text-xs tracking-widest uppercase opacity-70">FW26 / Look 01</p>
              </div>
              <button className="font-inter uppercase text-[11px] tracking-widest border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md">
                Add - $1,200
              </button>
            </div>
          </div>
          
          {/* Small Details (1 column divided vertically) */}
          <div className="w-[85vw] md:w-auto flex-shrink-0 snap-center md:col-span-1 flex flex-col h-[600px] md:h-[900px]">
            <div className="flex-1 border-b border-white/10 border-r md:border-r-0 border-white/10 overflow-hidden relative group">
               <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=1974&auto=format&fit=crop"
                  className="w-full h-full object-cover grayscale"
                />
            </div>
            <div className="flex-1 overflow-hidden relative group border-r md:border-r-0 border-white/10">
               <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  src="https://images.unsplash.com/photo-1485230895905-31d011713626?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                />
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 3: THE CAPABILITIES / FABRIC SHOWCASE */}
      <section className="py-24 md:py-32 px-4 md:px-10 border-b border-white/10 bg-black">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="font-serif-italic text-5xl md:text-7xl mb-6"
          >
            The Capabilities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-inter text-xs md:text-sm uppercase tracking-[0.3em] opacity-50"
          >
            Technical Structural Forms
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 max-w-[1600px] mx-auto">
          {[
            { id: 1, title: "Material Synthesis", desc: "Engineered fibers crossing molecular boundaries for extreme durability." },
            { id: 2, title: "Thermal Architecture", desc: "Heat-reactive webbing adapts structural rigidity based on climate." },
            { id: 3, title: "Void Weave", desc: "Micro-perforated density granting zero-gravity weightlessness." }
          ].map((item) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: item.id * 0.1, duration: 0.6 }}
              key={item.id} 
              className="border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 p-8 md:p-12 aspect-[4/3] md:aspect-square flex flex-col justify-between group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10">
                 <p className="font-inter text-[10px] tracking-[0.2em] opacity-50 mb-4">0{item.id}</p>
                 <h3 className="font-serif-italic text-3xl md:text-4xl">{item.title}</h3>
               </div>
               <div className="relative z-10 font-inter text-xs md:text-sm opacity-70 leading-relaxed max-w-[80%]">
                 {item.desc}
               </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 font-inter uppercase text-[10px] tracking-[0.2em] opacity-50 bg-black">
        <p>© 2026 AURA DIGITAL</p>
        <p>Design System: Liquid-Glass</p>
      </footer>
    </div>
  );
}
