'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useUserStore } from '@/store/userStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { isLoggedIn } = useUserStore();

  // Redirect if already logged in
  useEffect(() => {
    if (useUserStore.persist.hasHydrated() && isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isReset) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setIsLoading(true);
      try {
        await api.post('/api/auth/reset-password', {
          email: formData.email.trim(),
          password: formData.password,
        });
        setSuccessMsg('Password updated successfully! Please log in now.');
        setIsReset(false);
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      } catch (err) {
        setError((err as any).response?.data?.error || 'Password reset failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/api/auth/login', {
          email: formData.email.trim(),
          password: formData.password,
        });
        localStorage.setItem('token', data.token);
        setUser(data.user, data.token);
        router.push('/mode-select');
      } else {
        const { data } = await api.post('/api/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        localStorage.setItem('token', data.token);
        setUser(data.user, data.token);
        router.push('/mode-select');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative z-10 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Tabs or Reset Header */}
        {!isReset ? (
          <div className="flex relative mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center text-lg font-medium transition-colors ${
                isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center text-lg font-medium transition-colors ${
                !isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Register
            </button>
            {/* Gold Underline */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-[#D4AF37] w-1/2"
              animate={{ x: isLogin ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        ) : (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            <p className="text-sm text-gray-400 mt-2">Enter your email and new password to manually reset.</p>
          </div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', x: [-10, 10, -10, 10, 0] }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.form
              key={isReset ? 'reset' : (isLogin ? 'login' : 'register')}
              initial={{ opacity: 0, x: isReset ? 20 : (isLogin ? -20 : 20) }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isReset ? -20 : (isLogin ? 20 : -20) }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {isReset ? (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm text-gray-400">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full bg-[#D4AF37] text-black font-semibold py-3 rounded-lg hover:bg-[#E5C158] transition-colors disabled:opacity-50 flex justify-center items-center h-[50px]"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsReset(false); setError(''); setSuccessMsg(''); }}
                    className="mt-2 text-center text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-sm text-gray-400">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {isLogin && (
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => { setIsReset(true); setError(''); setSuccessMsg(''); }}
                          className="text-xs text-[#D4AF37] hover:underline"
                        >
                          Forgot/Reset Password?
                        </button>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required={!isLogin}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full bg-[#D4AF37] text-black font-semibold py-3 rounded-lg hover:bg-[#E5C158] transition-colors disabled:opacity-50 flex justify-center items-center h-[50px]"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      isLogin ? 'Login' : 'Register'
                    )}
                  </button>
                </>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
