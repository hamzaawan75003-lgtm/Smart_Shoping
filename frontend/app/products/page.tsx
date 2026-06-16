'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useUserStore } from '@/store/userStore';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 12;
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductsPage() {
  const { user } = useUserStore();
  const isSmartMode = user?.mode === 'smart';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortOption, setSortOption] = useState('Newest');
  
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/products');
        if (res.data && res.data.products) {
          setProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Failed to fetch products from backend, falling back to local mocks:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      // Category
      if (selectedCategories.length > 0 && p.category && !selectedCategories.includes(p.category)) {
        return false;
      }
      // Sizes
      if (selectedSizes.length > 0) {
        const hasSize = p.sizes_available?.some(s => selectedSizes.includes(s));
        if (!hasSize) return false;
      }
      // Price
      if (p.price < priceRange[0] || p.price > priceRange[1]) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOption === 'Price ↑') return a.price - b.price;
      if (sortOption === 'Price ↓') return b.price - a.price;
      // 'Newest' just uses original order
      return 0;
    });
  }, [products, debouncedSearch, selectedCategories, selectedSizes, priceRange, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange([0, 500]);
    setSearch('');
    setSortOption('Newest');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#080808] dark:bg-[#000000] dark:text-[#F3F3F3] pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="font-playfair text-4xl font-bold text-text-primary dark:text-white">
            Collection
          </h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-colors text-text-primary dark:text-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select 
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer text-text-primary dark:text-white"
              >
                <option>Newest</option>
                <option>Price ↑</option>
                <option>Price ↓</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle (Mobile/Desktop) */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-text-primary dark:bg-white text-bg-light dark:text-bg-dark px-4 py-2 rounded-full hover:opacity-90 transition-opacity text-sm font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex relative">
          
          {/* Filter Sidebar overlay for mobile, sliding for desktop */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-40 lg:hidden"
                />
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto p-6 flex flex-col gap-8 lg:absolute lg:inset-y-auto lg:left-0 lg:h-auto lg:z-10 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:w-64 lg:p-0 lg:pr-8"
                  style={{ position: sidebarOpen && window.innerWidth >= 1024 ? 'relative' : undefined }}
                >
                  <div className="flex items-center justify-between lg:hidden">
                    <h2 className="font-playfair text-2xl font-bold text-text-primary dark:text-white">Filters</h2>
                    <button onClick={() => setSidebarOpen(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="hidden lg:flex items-center justify-between mb-2">
                    <h2 className="font-playfair text-xl font-bold text-text-primary dark:text-white">Filters</h2>
                    <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gold transition-colors">
                      Clear
                    </button>
                  </div>

                  {/* Category */}
                  <div>
                    <h3 className="font-inter font-semibold mb-3 text-text-primary dark:text-white">Category</h3>
                    <div className="flex flex-col gap-2">
                      {['Men', 'Women', 'Kids'].map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="w-4 h-4 accent-gold cursor-pointer"
                          />
                          <span className="text-gray-600 dark:text-gray-400 group-hover:text-text-primary dark:group-hover:text-white transition-colors">
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <h3 className="font-inter font-semibold mb-3 text-text-primary dark:text-white">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-10 h-10 rounded border text-sm font-semibold transition-colors ${
                            selectedSizes.includes(size)
                              ? 'border-gold bg-gold text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gold dark:hover:border-gold'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="font-inter font-semibold mb-3 text-text-primary dark:text-white flex justify-between">
                      <span>Price Range</span>
                      <span className="text-gold text-sm font-normal">${priceRange[0]} - ${priceRange[1]}</span>
                    </h3>
                    <input 
                      type="range" 
                      min="0" 
                      max="500" 
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([priceRange[0], parseInt(e.target.value)]);
                        setCurrentPage(1);
                      }}
                      className="w-full accent-gold h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Mobile Actions */}
                  <div className="mt-auto lg:hidden flex gap-4">
                    <button 
                      onClick={clearFilters}
                      className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded font-semibold text-text-primary dark:text-white"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="flex-1 py-3 bg-gold text-white rounded font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
            {loading ? (
              <LoadingSkeleton variant="card" count={12} />
            ) : paginatedProducts.length > 0 ? (
              <motion.div 
                key={currentPage + debouncedSearch + selectedCategories.join() + selectedSizes.join() + sortOption}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              >
                {paginatedProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <ProductCard product={{
                      ...product,
                      // Smart mode override for badge if needed (already set in mock, but we restrict to Smart Mode)
                      matchesSkinTone: isSmartMode ? product.matchesSkinTone : false
                    }} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative w-64 h-64 mb-8 grayscale opacity-50">
                  <Image 
                    src="/empty-state.png" 
                    alt="No products found" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-text-primary dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  We couldn&apos;t find any products matching your current filters. Try adjusting them or search for something else.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-text-primary dark:bg-white text-bg-light dark:text-bg-dark px-8 py-3 rounded-full font-bold hover:bg-gold hover:text-white transition-all shadow-lg"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text-primary dark:text-white" />
                </button>
                <span className="font-inter font-medium text-text-primary dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-text-primary dark:text-white" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
