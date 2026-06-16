import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import NetworkStatus from "@/components/NetworkStatus";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "StyleAI — Wear it before you buy it",
  description: "AI-powered fashion store. Upload your photo, see yourself in every outfit before buying.",
  metadataBase: new URL('https://styleai-fashion.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StyleAI — Wear it before you buy it',
    description: 'AI-powered fashion store. Upload your photo, see yourself in every outfit before buying.',
    url: 'https://styleai-fashion.vercel.app',
    siteName: 'StyleAI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StyleAI — Wear it before you buy it',
    description: 'AI-powered fashion store. Upload your photo, see yourself in every outfit before buying.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} min-h-screen flex flex-col font-inter`}>
        <NetworkStatus />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <ChatBot />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
