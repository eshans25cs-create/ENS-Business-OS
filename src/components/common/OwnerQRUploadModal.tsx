import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check } from 'lucide-react';
import OwnerQRDropzone from './OwnerQRDropzone';
import { useBusinessStore } from '../../store/businessStore';

interface OwnerQRUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function OwnerQRUploadModal({ isOpen, onClose, onSaved }: OwnerQRUploadModalProps) {
  const { getCurrentBusiness, updateBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness();

  const [currentUpi, setCurrentUpi] = useState(currentBusiness?.upiId || '');
  const [currentName, setCurrentName] = useState(currentBusiness?.merchantName || currentBusiness?.name || '');
  const [qrPreview, setQrPreview] = useState<string | undefined>();
  const [rawQrData, setRawQrData] = useState<string | undefined>();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleQRConfirmed = (data: { upiId: string; merchantName: string; qrImagePreview?: string; rawQrData?: string }) => {
    if (data.upiId) setCurrentUpi(data.upiId);
    if (data.merchantName) setCurrentName(data.merchantName);
    if (data.qrImagePreview) setQrPreview(data.qrImagePreview);
    if (data.rawQrData) setRawQrData(data.rawQrData);
  };

  const handleSave = () => {
    if (!currentUpi.trim()) return;

    updateBusiness(currentBusiness.id, {
      upiId: currentUpi.trim(),
      merchantName: currentName.trim() || currentBusiness.name,
      qrData: rawQrData || currentBusiness.qrData,
      qrImageUrl: qrPreview || currentBusiness.qrImageUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved?.();
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#0D152D] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 text-[#7E8B9F] hover:text-white p-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-5 text-left">
            <span className="text-[10px] font-bold text-[#00D26A] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00D26A]/15 border border-[#00D26A]/30 inline-block mb-2">
              Direct-to-Bank Link
            </span>
            <h2 className="text-lg font-bold text-[#FFFFFF]">Set Up Owner Payment QR</h2>
            <p className="text-xs text-[#7E8B9F] mt-0.5">
              Upload your shop/cab's existing UPI QR once. ENS will generate dynamic amount QRs pointing straight to your bank.
            </p>
          </div>

          {/* Dropzone Component */}
          <OwnerQRDropzone
            initialUpiId={currentUpi}
            initialMerchantName={currentName}
            onQRConfirmed={handleQRConfirmed}
            title="Drag & Drop or Choose QR Image"
            subtitle="Upload the static QR image from your Google Pay, PhonePe, Paytm or BHIM app"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-5 mt-4 border-t border-[rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-transparent border border-[rgba(255,255,255,0.1)] text-[#7E8B9F] hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!currentUpi.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1A6BFF] to-[#3BA0FF] hover:from-[#1558D6] hover:to-[#2F8BF5] text-white text-xs font-bold shadow-[0_0_20px_rgba(26,107,255,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} className="text-[#00D26A]" />
                  <span>Saved & Applied!</span>
                </>
              ) : (
                <span>Save & Apply for Payments</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
