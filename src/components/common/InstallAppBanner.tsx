import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function InstallAppBanner() {
  const [show, setShow] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isMobileApp = Capacitor.isNativePlatform() || 
                      (typeof window !== 'undefined' && (
                        window.location.protocol === 'capacitor:' || 
                        window.location.protocol === 'file:' ||
                        window.location.hostname === 'localhost' ||
                        window.navigator.userAgent.includes('wv') ||
                        window.navigator.userAgent.includes('ENSBusinessOS')
                      ));

  useEffect(() => {
    // Never show download prompt if already inside the installed native mobile app
    if (isMobileApp) {
      return;
    }

    // Check if user already dismissed banner this session
    const dismissed = sessionStorage.getItem('ens_apk_banner_dismissed');
    if (!dismissed) {
      // Small delay on page open so user sees smooth slide-in notification
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isMobileApp]);

  if (isMobileApp) {
    return null;
  }

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('ens_apk_banner_dismissed', 'true');
  };

  const handleDownload = () => {
    setDownloading(true);
    // Trigger download of the APK directly from public directory
    const link = document.createElement('a');
    link.href = '/ENS-Business-OS.apk';
    link.download = 'ENS-Business-OS.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 2500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl p-4 bg-[#060F20]/95 border border-[rgba(10,132,255,0.4)] backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(10,132,255,0.25)]">
            {/* Top gradient glow strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0A84FF] to-[#00C896]" />

            <div className="flex items-center justify-between gap-3">
              {/* Icon */}
              <div className="relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#0A84FF]/20 to-[#00C896]/20 border border-[rgba(10,132,255,0.3)] flex items-center justify-center text-[#0A84FF]">
                <Smartphone className="w-6 h-6 text-[#3BA0FF]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00C896] rounded-full border-2 border-[#060F20] animate-pulse" />
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#F0F4FF] tracking-wide">
                    ENS Business OS Mobile App
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
                    <Sparkles className="w-2.5 h-2.5" /> APK
                  </span>
                </div>
                <p className="text-xs text-[#6B7FA3] truncate mt-0.5">
                  Install on Android for faster offline access & sound alerts
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#030B1A] bg-gradient-to-r from-[#0A84FF] to-[#3BA0FF] hover:brightness-110 shadow-[0_0_15px_rgba(10,132,255,0.4)] transition-all cursor-pointer active:scale-95 disabled:opacity-80"
                >
                  {downloading ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-spin text-[#030B1A]" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download APK</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  title="Dismiss notification"
                  className="p-1.5 text-[#6B7FA3] hover:text-[#F0F4FF] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}