'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import {
  Upload, Camera, Check, Loader2, ChevronRight,
  ChevronLeft, Pencil, X, Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api, { aiApi } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import Script from 'next/script';
import Image from 'next/image';
// ─── Types ───────────────────────────────────────────────────────────────────
interface Measurements {
  height_cm: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
}

interface Sizes {
  shirt_size: string;
  pant_size: string;
  jacket_size: string;
}

// ─── Colour hex map (mirrors Python colour_theory) ───────────────────────────
const COLOUR_HEX: Record<string, string> = {
  Beige:'#F5F0E8', Camel:'#C19A6B', Rust:'#B7410E', Olive:'#808000',
  Mustard:'#FFDB58', Terracotta:'#E2725B', Brown:'#795548', Coral:'#FF6B6B',
  Navy:'#003366', Emerald:'#50C878', Burgundy:'#800020', Lavender:'#C8A2C8',
  Cobalt:'#0047AB', Rose:'#FF007F', Slate:'#708090', Plum:'#8E4585',
  White:'#FFFFFF', Grey:'#9E9E9E', Black:'#1A1A1A', Taupe:'#B8A99A',
  Blush:'#F4C2C2', Sage:'#87AE73', 'Dusty Blue':'#6699CC', Mauve:'#E0B0FF',
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden mb-10">
      <motion.div
        className="h-full bg-black dark:bg-gradient-to-r dark:from-[#E5C158] dark:to-[#D4AF37] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${((step) / total) * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ─── Step labels ─────────────────────────────────────────────────────────────
const STEP_LABELS = ['Upload Photo', 'Body Detection', 'Measurements', 'Colour Palette'];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SmartSetupPage() {
  const router = useRouter();
  const { setMeasurements, setSkinTone, setMode } = useUserStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  // Shared state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Step 2
  const [heightCm, setHeightCm] = useState<number>(175);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);
  const [localMeasurements, setLocalMeasurements] = useState<Measurements | null>(null);
  const [landmarks, setLandmarks] = useState<{x: number, y: number}[]>([]);
  const [landmarksDetected, setLandmarksDetected] = useState(false);


  // Step 3
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [sizes, setSizes] = useState<Sizes | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  // Step 4
  const [skinTone, setSkinToneLocal] = useState<string | null>(null);
  const [colourPalette, setColourPaletteLocal] = useState<{ name: string; hex: string }[]>([]);
  const [analyzingSkin, setAnalyzingSkin] = useState(false);
  const [saving, setSaving] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { isLoggedIn } = useUserStore();

  // Redirect if not logged in
  useEffect(() => {
    if (useUserStore.persist.hasHydrated() && !isLoggedIn) {
      router.push('/auth');
    }
  }, [isLoggedIn, router]);

  // ── Upload photo ──────────────────────────────────────────────────────────
  const uploadPhoto = useCallback(async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post('/api/upload-photo', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setPhotoUrl(data.url);
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [token]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    uploadPhoto(file);
  }, [uploadPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const captureWebcam = () => {
    const img = webcamRef.current?.getScreenshot();
    if (!img) return;
    setPhotoPreview(img);
    setShowCamera(false);
    // Convert base64 → File
    fetch(img).then(r => r.blob()).then(blob => {
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      uploadPhoto(file);
    });
  };

  // ── Body detection ────────────────────────────────────────────────────────
  const runDetection = async () => {
    if (!photoUrl || !photoPreview) return;
    setDetecting(true);
    setLandmarks([]);
    
    try {
      // 1. Client-side detection for animation (if Pose is loaded)
      // @ts-expect-error: Pose is loaded via CDN and not in types
      if (typeof window !== 'undefined' && window.Pose) {
        // @ts-expect-error: Pose is loaded via CDN and not in types
        const pose = new window.Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const imageElement = new window.Image();
        imageElement.src = photoPreview;
        await new Promise((resolve) => { imageElement.onload = resolve; });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pose.onResults((results: any) => {
          if (results.poseLandmarks) {
            // Animate dots appearing one by one
            const lms = results.poseLandmarks;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lms.forEach((lm: any, i: number) => {
              setTimeout(() => {
                setLandmarks(prev => [...prev, { x: lm.x, y: lm.y }]);
              }, i * 30); // 0.03s stagger
            });
          }
        });
        await pose.send({ image: imageElement });
      }

      // 2. Server-side call for accurate measurements
      const { data } = await aiApi.post('/ai/body-detection', {
        photo_url: photoUrl,
        height_cm: heightCm,
      });
      setLocalMeasurements({
        height_cm: heightCm,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        shoulders: data.shoulders,
      });
      setLandmarksDetected(data.landmarks_detected);
      setDetected(true);
    } catch (err) {
      console.error(err);
      toast.error('Detection failed. Please try again.');
    } finally {
      setDetecting(false);
    }
  };

  // ── Size recalculate ──────────────────────────────────────────────────────
  const recalculateSizes = async () => {
    if (!localMeasurements) return;
    setRecalculating(true);
    try {
      const { data } = await aiApi.post('/ai/size-recommend', localMeasurements);
      setSizes(data);
    } catch {
      toast.error('Size recalculation failed.');
    } finally {
      setRecalculating(false);
    }
  };

  // Auto-calculate sizes when reaching step 2
  useEffect(() => {
    const isComplete = localMeasurements && 
      Object.values(localMeasurements).every(v => typeof v === 'number' && !isNaN(v));

    if (step === 2 && isComplete && !sizes && !recalculating) {
      recalculateSizes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, localMeasurements, sizes]);

  // ── Skin tone ─────────────────────────────────────────────────────────────
  const analyzeSkinTone = async () => {
    if (!photoUrl) return;
    setAnalyzingSkin(true);
    try {
      const { data } = await aiApi.post('/ai/skin-tone', { photo_url: photoUrl });
      setSkinToneLocal(data.skin_tone);
      setColourPaletteLocal(data.colour_palette);
    } catch {
      toast.error('Skin tone analysis failed.');
    } finally {
      setAnalyzingSkin(false);
    }
  };

  // Auto-run on step 3
  useEffect(() => {
    if (step === 3 && !skinTone) {
      analyzeSkinTone();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Save & finish ─────────────────────────────────────────────────────────
  const saveAndFinish = async () => {
    if (!localMeasurements || !sizes || !skinTone) return;
    setSaving(true);
    try {
      await api.put(
        '/api/account/measurements',
        {
          measurements: { ...localMeasurements, photo_url: photoUrl },
          sizes,
          skin_tone: skinTone,
          colour_palette: colourPalette.map(c => c.name),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await api.put('/api/auth/mode', { mode: 'smart' });
      
      setMeasurements({
        height_cm: localMeasurements.height_cm,
        chest_inches: localMeasurements.chest,
        waist_inches: localMeasurements.waist,
        hips_inches: localMeasurements.hips,
        shoulders_inches: localMeasurements.shoulders,
        shirt_size: sizes.shirt_size,
        pant_size: sizes.pant_size,
        jacket_size: sizes.jacket_size,
        photo_url: photoUrl,
      });
      setSkinTone(skinTone, colourPalette.map(c => c.name));
      setMode('smart');
      toast.success('🎉 Smart profile saved! Happy shopping!');
      router.push('/products');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const msg = err.response?.data?.error || err.message || 'Failed to save profile. Please retry.';
      toast.error(msg);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit measurement row ───────────────────────────────────────────────────
  const startEdit = (key: string, val: number) => {
    setEditingRow(key);
    setEditVal(String(val));
  };
  const commitEdit = (key: keyof Measurements) => {
    if (!localMeasurements) return;
    const num = parseFloat(editVal);
    if (!isNaN(num)) {
      setLocalMeasurements({ ...localMeasurements, [key]: num });
    }
    setEditingRow(null);
  };

  // ── Slide variants ────────────────────────────────────────────────────────
  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  if (!isLoggedIn) return null; // Wait for hydration/check

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center relative z-10 bg-[#FAFAFA] text-[#080808] dark:bg-[#000000] dark:text-[#F3F3F3] transition-colors duration-300">
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
        strategy="lazyOnload"
      />
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 mb-3">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`transition-colors tracking-wide font-light ${i === step ? 'text-black dark:text-[#E5C158] font-semibold font-serif italic' : ''}`}
            >
              {label}
            </span>
          ))}
        </div>

        <ProgressBar step={step + 1} total={STEP_LABELS.length} />

        {/* Camera Modal */}
        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            >
              <div className="bg-white/80 dark:bg-white/[0.01] backdrop-blur-xl border border-neutral-200/60 dark:border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_48px_rgba(0,0,0,0.8)] rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-neutral-900 dark:text-white font-serif italic tracking-tight text-lg">Take a Photo</h3>
                  <button onClick={() => setShowCamera(false)} className="text-neutral-400 hover:text-neutral-600 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/[0.06]"
                  videoConstraints={{ facingMode: 'user' }}
                />
                <motion.button
                  onClick={captureWebcam}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-4 w-full py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors"
                >
                  Capture
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-white/80 dark:bg-white/[0.01] backdrop-blur-xl border border-neutral-200/60 dark:border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_48px_rgba(0,0,0,0.8)] rounded-2xl p-8"
            >

              {/* ════ STEP 0: Upload Photo ════ */}
              {step === 0 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-serif italic tracking-tight text-neutral-900 dark:text-white mb-1">Upload Your Photo</h2>
                    <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">Stand in good lighting against a plain background for best results.</p>
                  </div>

                  {photoPreview ? (
                    <div className="relative">
                    <div className="relative w-full h-72 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-900/20">
                      <Image src={photoPreview} alt="preview" fill className="object-contain" unoptimized />
                    </div>
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl flex items-center justify-center">
                          <Loader2 className="animate-spin text-black dark:text-[#E5C158]" size={32} />
                        </div>
                      )}
                      {photoUrl && !uploadingPhoto && (
                        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-md">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => { setPhotoPreview(null); setPhotoUrl(null); }}
                        className="mt-3 text-sm text-neutral-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-white underline transition-colors"
                      >
                        Remove & re-upload
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-black dark:border-[#E5C158] bg-neutral-100 dark:bg-[#E5C158]/5'
                            : 'border-neutral-200 dark:border-white/20 hover:border-neutral-400 dark:hover:border-white/40'
                        }`}
                        style={{
                          animation: 'pulse-border 2s ease-in-out infinite',
                        }}
                      >
                        <input {...getInputProps()} />
                        <motion.div
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Upload size={40} className="text-neutral-700 dark:text-[#E5C158]" strokeWidth={1.5} />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-neutral-900 dark:text-white font-medium">Drag & drop your photo here</p>
                          <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm mt-1">or click to browse</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-neutral-200 dark:bg-white/10" />
                        <span className="text-neutral-400 dark:text-gray-500 text-sm font-light">OR</span>
                        <div className="flex-1 h-px bg-neutral-200 dark:bg-white/10" />
                      </div>

                      <motion.button
                        onClick={() => setShowCamera(true)}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-transparent border border-neutral-300 dark:border-white/15 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors"
                      >
                        <Camera size={20} /> Use Camera
                      </motion.button>
                    </>
                  )}
                </div>
              )}

              {/* ════ STEP 1: Body Detection ════ */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-serif italic tracking-tight text-neutral-900 dark:text-white mb-1">Detecting Your Body</h2>
                    <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">AI will detect your measurements. Enter your height for best accuracy.</p>
                  </div>

                  {photoPreview && (
                    <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-neutral-900/20 group">
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/[0.06]">
                      <Image src={photoPreview} alt="body" fill className="object-contain" unoptimized />
                    </div>
                      
                      {/* Landmarks Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {landmarks.map((lm, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute w-1.5 h-1.5 bg-black dark:bg-[#E5C158] rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_#D4AF37]"
                            style={{ 
                              left: `${lm.x * 100}%`, 
                              top: `${lm.y * 100}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        ))}
                      </div>

                      {detected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/30"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="bg-green-500 rounded-full p-4"
                          >
                            <Check size={32} className="text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm tracking-wide font-light text-neutral-500 dark:text-neutral-400">Enter your height for accuracy</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={heightCm}
                        onChange={e => setHeightCm(Number(e.target.value))}
                        className="flex-1 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-[#D4AF37] transition-colors"
                        min={100}
                        max={250}
                      />
                      <span className="flex items-center px-3 text-gray-400">cm</span>
                    </div>
                  </div>

                  {detected && localMeasurements && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-4 gap-3 overflow-hidden rounded-xl"
                    >
                      {(['chest','waist','hips','shoulders'] as const).map(k => (
                        <motion.div 
                          key={k} 
                          whileHover={{ scale: 1.025 }}
                          transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.3 }}
                          className="bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.06] rounded-lg p-3 text-center"
                        >
                          <p className="text-xs tracking-wide font-light text-neutral-500 dark:text-neutral-400 capitalize mb-1">{k}</p>
                          <p className="text-black dark:text-[#E5C158] font-semibold">{localMeasurements[k]}&quot;</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {!landmarksDetected && detected && (
                    <p className="text-amber-600 dark:text-yellow-500/80 text-xs">⚠️ Pose not clearly detected — using estimates based on height</p>
                  )}

                  <motion.button
                    onClick={runDetection}
                    disabled={detecting}
                    whileHover={detecting ? {} : { scale: 1.015 }}
                    whileTap={detecting ? {} : { scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors disabled:opacity-50 w-full"
                  >
                    {detecting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {detecting ? 'Detecting…' : detected ? 'Re-detect' : 'Detect Measurements'}
                  </motion.button>
                </div>
              )}

              {/* ════ STEP 2: Confirm Measurements ════ */}
              {step === 2 && !localMeasurements && (
                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 dark:bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-serif italic text-neutral-900 dark:text-white mb-2">No Measurements Found</h2>
                    <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">
                      Please go back to Step 1 and run body detection first.
                    </p>
                  </div>
                  <motion.button
                    onClick={goBack}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-neutral-300 dark:border-white/15 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors"
                  >
                    <ChevronLeft size={18} /> Go Back & Detect
                  </motion.button>
                </div>
              )}
              {step === 2 && localMeasurements && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-serif italic tracking-tight text-neutral-900 dark:text-white mb-1">Confirm Your Measurements</h2>
                    <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">Review and edit your measurements. Click Recalculate to update sizes.</p>
                  </div>

                  <table className="w-full">
                     <tbody>
                      {(
                        [
                          { key: 'height_cm', label: 'Height', unit: 'cm' },
                          { key: 'chest',     label: 'Chest',     unit: 'in' },
                          { key: 'waist',     label: 'Waist',     unit: 'in' },
                          { key: 'hips',      label: 'Hips',      unit: 'in' },
                          { key: 'shoulders', label: 'Shoulders', unit: 'in' },
                        ] as const
                      ).map(({ key, label, unit }) => (
                        <tr key={key} className="border-b border-neutral-200 dark:border-white/[0.06]">
                          <td className="py-3 tracking-wide font-light text-neutral-500 dark:text-neutral-400 w-1/3">{label}</td>
                          <td className="py-3 text-neutral-900 dark:text-white font-medium">
                            {editingRow === key ? (
                              <input
                                type="number"
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                onBlur={() => commitEdit(key)}
                                autoFocus
                                className="bg-neutral-100 dark:bg-white/[0.03] border border-[#D4AF37] dark:border-[#E5C158] rounded px-2 py-1 w-24 text-neutral-900 dark:text-white focus:outline-none"
                              />
                            ) : (
                              <span>{localMeasurements?.[key] || 0} {unit}</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {editingRow === key ? (
                              <button onClick={() => commitEdit(key)} className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 text-sm">
                                <Check size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => startEdit(key, localMeasurements?.[key] || 0)}
                                className="text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <motion.button
                    onClick={recalculateSizes}
                    disabled={recalculating}
                    whileHover={recalculating ? {} : { scale: 1.015 }}
                    whileTap={recalculating ? {} : { scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors disabled:opacity-50 w-full"
                  >
                    {recalculating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Recalculate Sizes
                  </motion.button>

                  {sizes && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 flex-wrap overflow-hidden rounded-xl"
                    >
                      {[
                        { label: 'Shirt', val: sizes.shirt_size },
                        { label: 'Jacket', val: sizes.jacket_size },
                        { label: 'Pant', val: sizes.pant_size },
                      ].map(({ label, val }, i) => (
                        <motion.div
                          key={label}
                          animate={{ scale: 1 }}
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.025 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.1 }}
                          className="flex flex-col items-center bg-[#D4AF37]/10 dark:bg-[#D4AF37]/5 border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 rounded-xl px-6 py-4"
                        >
                          <span className="text-xs tracking-wide font-light text-neutral-500 dark:text-neutral-400 mb-1">{label}</span>
                          <span className="text-2xl font-bold text-black dark:text-[#E5C158]">{val}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ════ STEP 3: Skin Tone ════ */}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-serif italic tracking-tight text-neutral-900 dark:text-white mb-1">Your Colour Palette</h2>
                    <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">We&apos;ll recommend colours that complement your skin tone.</p>
                  </div>

                  {analyzingSkin && (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <Loader2 className="animate-spin text-black dark:text-[#E5C158]" size={36} />
                      <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm">Analysing your skin tone…</p>
                    </div>
                  )}

                  {!analyzingSkin && skinTone && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                      <div className="text-center">
                        <p className="tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-sm mb-1">Your skin tone</p>
                        <p className="text-3xl font-serif italic text-neutral-950 dark:text-white capitalize">{skinTone}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-3 overflow-hidden rounded-xl">
                        {colourPalette.map((colour, i) => (
                          <motion.div
                            key={colour.name}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.025 }}
                            transition={{ type: 'spring', delay: i * 0.08 }}
                            className="flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-12 h-12 rounded-full border border-neutral-200 dark:border-white/10 shadow-lg transition-transform"
                              style={{ backgroundColor: colour.hex || COLOUR_HEX[colour.name] || '#888' }}
                            />
                            <span className="text-xs tracking-wide font-light text-neutral-500 dark:text-neutral-400 text-center leading-tight">{colour.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {!analyzingSkin && !skinTone && (
                    <motion.button
                      onClick={analyzeSkinTone}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors w-full"
                    >
                      Analyse Skin Tone
                    </motion.button>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <motion.button
            onClick={goBack}
            disabled={step === 0}
            whileHover={step === 0 ? {} : { scale: 1.015 }}
            whileTap={step === 0 ? {} : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-neutral-300 dark:border-white/15 text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={18} /> Back
          </motion.button>

          {step < 3 ? (
            <motion.button
              onClick={goNext}
              disabled={
                (step === 0 && !photoUrl) ||
                (step === 1 && !detected)
              }
              whileHover={((step === 0 && !photoUrl) || (step === 1 && !detected)) ? {} : { scale: 1.015 }}
              whileTap={((step === 0 && !photoUrl) || (step === 1 && !detected)) ? {} : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors disabled:opacity-40"
            >
              Next <ChevronRight size={18} />
            </motion.button>
          ) : (
            <motion.button
              onClick={saveAndFinish}
              disabled={saving || !skinTone || !sizes}
              whileHover={(saving || !skinTone || !sizes) ? {} : { scale: 1.015 }}
              whileTap={(saving || !skinTone || !sizes) ? {} : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-black text-white hover:bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:bg-gradient-to-b dark:from-[#E5C158] dark:to-[#D4AF37] dark:text-black dark:shadow-[0_4px_20px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Save & Start Shopping
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
