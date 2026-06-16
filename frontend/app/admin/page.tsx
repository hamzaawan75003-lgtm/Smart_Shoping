'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, DollarSign, 
  TrendingUp, Plus, Trash2, X, UploadCloud,
  Loader2
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sizes_available: string[];
  colours_available: string[];
  images: string[];
  hover_video_url: string | null;
  stock_count: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: unknown;
  total_price: number;
  delivery_address: unknown;
  payment_method: string;
  status: string;
  created_at: string;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
] as const;

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn) {
      router.push('/auth');
    } else if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoggedIn, user, router]);

  if (!mounted || !isLoggedIn || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col md:flex-row font-inter pt-20 text-[#080808] dark:text-[#F3F3F3] transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0B0B0B] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 md:min-h-screen flex flex-col fixed md:sticky top-20 z-30 pt-4 md:pt-8">
        <div className="px-6 pb-8 hidden md:block">
          <h2 className="font-playfair text-2xl font-bold text-[#D4AF37] tracking-wider">StyleAI Admin</h2>
        </div>
        <nav className="flex md:flex-col gap-2 px-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden pt-24 md:pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'products' && <ProductsTab key="products" />}
          {activeTab === 'orders' && <OrdersTab key="orders" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', icon: DollarSign, color: 'text-green-500' },
    { label: 'Total Orders', value: '0', icon: ShoppingCart, color: 'text-blue-500' },
    { label: 'Total Products', value: '0', icon: Package, color: 'text-purple-500' },
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch products count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch orders and calculate stats
        const { data: orders } = await supabase
          .from('orders')
          .select('total_price');

        const orderCount = orders?.length || 0;
        const revenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0) || 0;

        setStats([
          { label: 'Total Revenue', value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Total Orders', value: orderCount.toString(), icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'Total Products', value: (productCount || 0).toString(), icon: Package, color: 'text-purple-500' },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className="text-2xl font-bold mb-8 text-black dark:text-white tracking-wide">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#0B0B0B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/10 flex items-center justify-between transition-colors"
          >
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-full bg-gray-50 dark:bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-[#0B0B0B] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/10 h-80 flex flex-col items-center justify-center text-center">
        <TrendingUp className="w-12 h-12 text-[#D4AF37] mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Live Database Synchronized</h3>
        <p className="text-sm text-gray-500 max-w-sm">All changes to products and orders are saved directly to your live Supabase database instance.</p>
      </div>
    </motion.div>
  );
}

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load products');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action is permanent.')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Failed to delete product');
        console.error(err);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white tracking-wide">Products</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E5C158] transition-colors shadow-md text-sm"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0B0B0B] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                <AnimatePresence>
                  {products.map(product => (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-black dark:text-white max-w-xs truncate">{product.name}</td>
                      <td className="p-4 text-sm text-gray-500 capitalize">{product.category}</td>
                      <td className="p-4 font-semibold text-[#D4AF37]">${product.price}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.stock_count > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                          {product.stock_count} in stock
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No products found in the database.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in Form Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#0B0B0B] border-l border-gray-200 dark:border-white/10 shadow-2xl z-50 overflow-y-auto flex flex-col text-[#080808] dark:text-[#F3F3F3]"
            >
              <ProductForm 
                onClose={() => setIsFormOpen(false)} 
                onSave={(newProduct: Product) => {
                  setProducts([newProduct, ...products]);
                  setIsFormOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PRODUCT FORM (Slide-in with live upload & Supabase insert) ─────────────
function ProductForm({ onClose, onSave }: { onClose: () => void, onSave: (p: Product) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women',
    description: '',
    sizes: [] as string[],
    colours: [] as string[],
    stock_count: '',
    hover_video_url: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [sizeInput, setSizeInput] = useState('');
  const [colourInput, setColourInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock_count) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!imageFile) {
      toast.error('Please upload a product image');
      return;
    }

    setIsSaving(true);
    setStatusText('Uploading image to Cloudinary...');

    try {
      // 1. Upload to Cloudinary
      const cloudinaryName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwiz87slk';
      const uploadPreset = 'fashion_preset';

      const uploadData = new FormData();
      uploadData.append('file', imageFile);
      uploadData.append('upload_preset', uploadPreset);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      );

      if (!cloudinaryRes.ok) {
        throw new Error('Cloudinary image upload failed. Please verify your preset.');
      }

      const fileData = await cloudinaryRes.json();
      const secureUrl = fileData.secure_url;
      if (!secureUrl) {
        throw new Error('Cloudinary response is missing secure URL.');
      }

      setStatusText('Saving product to Supabase database...');

      // Parse custom sizes & colours from comma-separated inputs
      // Parse custom sizes & colours from comma-separated inputs without using Set to avoid downlevelIteration errors
      let finalSizes = [...formData.sizes];
      if (sizeInput) {
        const parsedSizes = sizeInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        finalSizes = finalSizes.concat(parsedSizes).filter((item, index, self) => self.indexOf(item) === index);
      }

      let finalColours = [...formData.colours];
      if (colourInput) {
        const parsedColours = colourInput.split(',').map(c => c.trim()).filter(Boolean);
        finalColours = finalColours.concat(parsedColours).filter((item, index, self) => self.indexOf(item) === index);
      }

      // 2. Insert product row in Supabase
      const productRow = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock_count: parseInt(formData.stock_count),
        sizes_available: finalSizes,
        colours_available: finalColours,
        images: [secureUrl],
        hover_video_url: formData.hover_video_url.trim() || null
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productRow])
        .select();

      if (error) throw error;

      toast.success('Product successfully uploaded and live!');
      onSave(data[0]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(errMsg);
      console.error(err);
    } finally {
      setIsSaving(false);
      setStatusText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0B0B]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-150 dark:border-white/10">
        <h2 className="text-xl font-bold text-black dark:text-white tracking-wide">
          Add New Product
        </h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Product Name *</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors" 
            placeholder="e.g. Linen Suit Blazer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Price ($) *</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors" 
              placeholder="120.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Stock Count *</label>
            <input 
              type="number" 
              required
              value={formData.stock_count}
              onChange={e => setFormData({...formData, stock_count: e.target.value})}
              className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors" 
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Category *</label>
          <select 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0B0B] rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors"
          >
            <option value="Women">Women</option>
            <option value="Men">Men</option>
            <option value="Kids">Kids</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Description</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors h-24 resize-none" 
            placeholder="Introduce details, fabrics, and size fits..."
          />
        </div>

        {/* Sizes Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Standard Sizes Available</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
              const isSelected = formData.sizes.includes(size);
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                      : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <input 
            type="text"
            placeholder="Or type custom sizes (e.g. 32, 34, 36)"
            value={sizeInput}
            onChange={e => setSizeInput(e.target.value)}
            className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-xs focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>

        {/* Colours Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Colours Available (Comma Separated)</label>
          <input 
            type="text" 
            placeholder="e.g. Black, Crisp White, Emerald Green"
            value={colourInput}
            onChange={e => setColourInput(e.target.value)}
            className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors" 
          />
        </div>

        {/* Hover Video URL (Optional) */}
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Hover Video URL (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. https://assets.mixkit.co/videos/preview/..."
            value={formData.hover_video_url}
            onChange={e => setFormData({...formData, hover_video_url: e.target.value})}
            className="w-full border border-gray-200 dark:border-white/10 bg-transparent rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none transition-colors" 
          />
        </div>

        {/* Image File Input */}
        <div>
          <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Product Cover Image *</label>
          <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center relative hover:border-[#D4AF37] transition-colors bg-gray-50/50 dark:bg-white/5">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded overflow-hidden border border-gray-200 dark:border-white/10">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setImageFile(null); setImagePreview(null); }} 
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2 animate-bounce" />
                <span className="text-xs text-gray-500 font-medium">Select Image File to Upload</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*"
              required={!imagePreview}
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </form>

      {/* Form Action */}
      <div className="p-6 border-t border-gray-150 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col gap-3">
        {isSaving && (
          <div className="flex items-center gap-3 justify-center text-sm font-medium text-[#D4AF37] animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            {statusText}
          </div>
        )}
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-semibold text-base hover:bg-[#E5C158] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isSaving ? 'Processing...' : 'Upload & Launch Product'}
        </button>
      </div>
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'placed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'dispatched': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white tracking-wide">Orders</h1>
        
        <div className="flex bg-white dark:bg-[#0B0B0B] border border-gray-200 dark:border-white/10 rounded-lg p-1 shadow-sm transition-colors">
          {['all', 'placed', 'confirmed', 'dispatched', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                filter === status 
                  ? 'bg-gray-100 dark:bg-white/5 text-black dark:text-white' 
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0B0B0B] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer ID</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                <AnimatePresence>
                  {filteredOrders.map(order => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-mono font-semibold text-xs text-black dark:text-white truncate max-w-xs">{order.id}</td>
                      <td className="p-4 text-sm max-w-xs truncate">{order.user_id}</td>
                      <td className="p-4 text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-[#D4AF37]">${order.total_price}</td>
                      <td className="p-4">
                        <select 
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wider rounded p-1.5 border-none outline-none cursor-pointer appearance-none ${getStatusColor(order.status)}`}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No orders found matching the selected filter.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
