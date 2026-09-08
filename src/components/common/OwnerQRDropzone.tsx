import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Upload, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { decodeQRFromFile } from '../../utils/qrDecoder';

interface OwnerQRDropzoneProps {
  initialUpiId?: string;
  initialMerchantName?: string;
  onQRConfirmed: (data: { upiId: string; merchantName: string; qrImagePreview?: string; rawQrData?: string }) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function OwnerQRDropzone({
  initialUpiId = '',
  initialMerchantName = '',
  onQRConfirmed,
  title = "Upload Owner's Payment QR",
  subtitle = "Drag & drop your store's Google Pay, PhonePe, Paytm or BHIM QR code, or choose from device",
  compact = false
}: OwnerQRDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedUpi, setDetectedUpi] = useState(initialUpiId);
  const [detectedName, setDetectedName] = useState(initialMerchantName);
  const [rawUrl, setRawUrl] = useState<string | undefined>();
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Process selected or dropped file
  const handleProcessFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setDecodeError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setDecodeError(null);
    setIsDecoding(true);
    setIsSuccess(false);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const result = await decodeQRFromFile(file);
      if (result.success && result.data) {
        const upi = result.data.upiId || '';
        const name = result.data.merchantName || 'Store Owner';
        
        setDetectedUpi(upi);
        setDetectedName(name);
        setRawUrl(result.data.rawUrl);
        setIsSuccess(true);
        
        onQRConfirmed({
          upiId: upi,
          merchantName: name,
          qrImagePreview: objectUrl,
          rawQrData: result.data.rawUrl
        });
      } else {
        setDecodeError(result.error || 'Could not detect a valid UPI QR code. Please ensure the QR is clear, or enter your UPI ID below.');
      }
    } catch {
      setDecodeError('Error analyzing image. Please try another image file or enter your UPI ID manually.');
    } finally {
      setIsDecoding(false);
    }
  };

  // Drag event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  // Quick Demo Sample QR option
  const handleUseDemoSample = () => {
    const sampleUpi = 'owner.store@upi';
    const sampleName = 'Express Mart';
    setDetectedUpi(sampleUpi);
    setDetectedName(sampleName);
    setIsSuccess(true);
    setDecodeError(null);
    onQRConfirmed({
      upiId: sampleUpi,
      merchantName: sampleName,
      rawQrData: `upi://pay?pa=${sampleUpi}&pn=${encodeURIComponent(sampleName)}&cu=INR`
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Info */}
      <div>
        <h3 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
          <QrCode size={18} className="text-[#1A6BFF]" />
          {title}
        </h3>
        <p className="text-xs text-[#7E8B9F] mt-0.5">{subtitle}</p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-[#1A6BFF] bg-[#1A6BFF]/15 shadow-[0_0_30px_rgba(26,107,255,0.35)] scale-[1.01]'
            : isSuccess
            ? 'border-[#00D26A]/40 bg-[#00D26A]/5 hover:border-[#00D26A]'
            : 'border-[rgba(255,255,255,0.12)] bg-[#070D1E]/70 hover:border-[#1A6BFF]/50 hover:bg-[rgba(26,107,255,0.03)]'
        }`}
      >
        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-white p-1.5 shadow-lg">
              <img src={previewUrl} alt="Owner QR Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">Change</span>
              </div>
            </div>

            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00D26A]">
                <CheckCircle2 size={16} />
                <span>QR Image Loaded & Decoded</span>
              </div>
              <p className="text-xs text-[#FFFFFF] font-medium">
                Merchant: <span className="font-bold">{detectedName || 'Extracted Name'}</span>
              </p>
              <p className="text-xs text-[#1A6BFF] font-mono font-semibold">
                UPI ID: {detectedUpi || 'Detected UPI'}
              </p>
              <p className="text-[10px] text-[#7E8B9F]">Click or drop another image to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3">
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                isDragging
                  ? 'bg-[#1A6BFF] text-white'
                  : 'bg-[#1A6BFF]/15 border border-[#1A6BFF]/30 text-[#1A6BFF]'
              }`}
            >
              {isDecoding ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload size={24} />
              )}
            </motion.div>

            <h4 className="text-sm font-bold text-[#FFFFFF]">
              {isDragging ? 'Drop QR Image Here' : 'Drag & Drop Your QR Code Image'}
            </h4>
            <p className="text-xs text-[#7E8B9F] mt-1 max-w-xs">
              Supports GPay, PhonePe, Paytm, BHIM, Bank UPI static QR codes (PNG, JPG, WEBP)
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isDecoding}
                className="px-4 py-2 rounded-xl bg-[#1A6BFF] hover:bg-[#1558D6] text-white text-xs font-bold shadow-[0_0_15px_rgba(26,107,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon size={14} />
                <span>Choose Image from Device</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseDemoSample();
                }}
                className="px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[#A0AEC0] hover:text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={13} className="text-[#FFD700]" />
                <span>Use Demo QR</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decode Error Notice */}
      {decodeError && (
        <div className="p-3 rounded-xl bg-[rgba(255,59,92,0.1)] border border-[#FF3B5C]/30 text-xs text-[#FF3B5C] flex items-start gap-2.5 text-left">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{decodeError}</p>
            <p className="text-[11px] text-[#A0AEC0] mt-0.5">You can still enter or confirm your UPI ID below manually.</p>
          </div>
        </div>
      )}

      {/* Manual Verification & Edit Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
        <div>
          <label className="text-[11px] font-semibold text-[#A0AEC0] block mb-1">
            Owner / Merchant Name
          </label>
          <input
            type="text"
            value={detectedName}
            onChange={(e) => {
              const val = e.target.value;
              setDetectedName(val);
              onQRConfirmed({ upiId: detectedUpi, merchantName: val, rawQrData: rawUrl });
            }}
            placeholder="e.g. Express Mart / Store Owner"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs text-[#F0F4FF] placeholder-[#7E8B9F] focus:border-[#1A6BFF] focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#A0AEC0] block mb-1">
            Receiving UPI ID (Direct to Bank)
          </label>
          <input
            type="text"
            value={detectedUpi}
            onChange={(e) => {
              const val = e.target.value;
              setDetectedUpi(val);
              onQRConfirmed({ upiId: val, merchantName: detectedName, rawQrData: rawUrl });
            }}
            placeholder="e.g. yourname@okhdfcbank"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#00D26A] placeholder-[#7E8B9F] focus:border-[#1A6BFF] focus:outline-none font-semibold"
          />
        </div>
      </div>

      {/* Direct-to-bank notice */}
      <div className="p-2.5 rounded-xl bg-[#00D26A]/10 border border-[#00D26A]/20 flex items-center gap-2 text-[11px] text-[#A2B4D6]">
        <CheckCircle2 size={14} className="text-[#00D26A] shrink-0" />
        <span>ENS creates dynamic QRs that route 100% of customer payments directly to this UPI ID without any intermediary account.</span>
      </div>
    </div>
  );
}
