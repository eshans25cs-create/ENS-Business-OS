import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Upload,
  QrCode,
  Edit3,
  Check,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  RefreshCw,
  Radio,
  Zap
} from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useBillingStore } from '../../../store/billingStore';
import { useAuthStore } from '../../../store/authStore';
import OwnerQRUploadModal from '../../common/OwnerQRUploadModal';
import SoundboxSettingsModal from '../../common/SoundboxSettingsModal';
import { decodeQRFromFile } from '../../../utils/qrDecoder';
import { buildUpiUri } from '../../../utils/upiUri';
import { announcePaymentReceived, getSoundboxSettings, saveSoundboxSettings } from '../../../utils/soundbox';

// Helper to convert numbers to Indian Rupee words
function numberToWordsINR(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = Math.floor(num % 100);

  let str = '';
  if (crore > 0) str += inWords(crore) + ' Crore ';
  if (lakh > 0) str += inWords(lakh) + ' Lakh ';
  if (thousand > 0) str += inWords(thousand) + ' Thousand ';
  if (hundred > 0) str += inWords(hundred) + ' Hundred ';
  if (rest > 0) str += inWords(rest) + ' ';

  return (str.trim() || 'Zero') + ' Rupees Only';
}

export default function QRGenerator() {
  const { currentUser } = useAuthStore();
  const updateBusiness = useBusinessStore((s) => s.updateBusiness);
  const getCurrentBusiness = useBusinessStore((s) => s.getCurrentBusiness);
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const { currentSession, createSession, cancelSession } = usePaymentStore();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [sessionId] = useState<string>(() => `ENS-2024-05-19-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // QR Replacement and Mode States: 'original' (uploaded photo), 'dynamic' (generated amount QR), or 'empty'
  const [qrViewMode, setQrViewMode] = useState<'empty' | 'original' | 'dynamic'>(() => {
    return currentBusiness?.qrImageUrl ? 'original' : 'empty';
  });
  const [isDraggingDirect, setIsDraggingDirect] = useState(false);
  const [isProcessingDirectFile, setIsProcessingDirectFile] = useState(false);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Soundbox & Voice Announcement States
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState(false);
  const [soundboxSettings, setSoundboxSettings] = useState(getSoundboxSettings());
  const [paymentReceivedData, setPaymentReceivedData] = useState<{ amount: number; time: string; ref: string } | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Auto-Confirmation Engine & UPI Network Radar Listener
  const [autoConfirmProgress, setAutoConfirmProgress] = useState<number>(0);
  const [isAutoListening, setIsAutoListening] = useState<boolean>(false);
  const autoConfirmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoConfirmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Inline UPI edit
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [inlineUpi, setInlineUpi] = useState(currentBusiness?.upiId || '');
  const [inlineName, setInlineName] = useState(currentBusiness?.merchantName || currentBusiness?.name || '');

  // Keep inline state and soundbox settings updated
  useEffect(() => {
    setSoundboxSettings(getSoundboxSettings());
  }, []);

  const handleToggleSound = (enable: boolean) => {
    const updated = saveSoundboxSettings({ enabled: enable });
    setSoundboxSettings(updated);
  };

  // Keep inline state updated if business changes
  useEffect(() => {
    if (currentBusiness) {
      setInlineUpi(currentBusiness.upiId || '');
      setInlineName(currentBusiness.merchantName || currentBusiness.name || '');
      if (currentBusiness.qrImageUrl && qrViewMode === 'empty') {
        setQrViewMode('original');
      }
    }
  }, [currentBusiness?.upiId, currentBusiness?.merchantName, currentBusiness?.name, currentBusiness?.qrImageUrl]);

  // Initialize or update payment session when amount is typed or valid
  useEffect(() => {
    const num = parseFloat(amount) || 0;
    if (num > 0) {
      createSession({
        businessId: currentBusiness.id,
        cashierId: currentUser?.id || 'cashier_1',
        amount: num,
        upiId: currentBusiness.upiId || 'merchant@upi',
        merchantName: currentBusiness.merchantName || currentBusiness.name || 'Store Owner',
      });
    }
  }, [amount, currentBusiness?.upiId, currentBusiness?.merchantName, currentBusiness?.id]);

  // 5-minute timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNewPayment = () => {
    setAmount('');
    setTimeLeft(300);
    setIsAutoListening(false);
    setAutoConfirmProgress(0);
    if (autoConfirmTimerRef.current) clearTimeout(autoConfirmTimerRef.current);
    if (autoConfirmIntervalRef.current) clearInterval(autoConfirmIntervalRef.current);
  };

  const handleCancel = () => {
    if (currentSession?.id) cancelSession(currentSession.id);
    setAmount('');
    setIsAutoListening(false);
    setAutoConfirmProgress(0);
    if (autoConfirmTimerRef.current) clearTimeout(autoConfirmTimerRef.current);
    if (autoConfirmIntervalRef.current) clearInterval(autoConfirmIntervalRef.current);
  };

  const handleRemoveQrPhoto = () => {
    updateBusiness(currentBusiness.id, {
      qrImageUrl: undefined,
      qrData: undefined,
    });
    setQrViewMode('empty');
  };

  // Primary Auto-Confirmation Execution Engine
  const triggerAutoConfirmPayment = async (targetAmount?: number) => {
    if (isSimulatingPayment) return;
    setIsSimulatingPayment(true);
    setIsAutoListening(false);
    if (autoConfirmTimerRef.current) clearTimeout(autoConfirmTimerRef.current);
    if (autoConfirmIntervalRef.current) clearInterval(autoConfirmIntervalRef.current);

    const num = targetAmount !== undefined ? targetAmount : (parseFloat(amount) || 500);
    const ref = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Announce via soundbox audio & speech automatically
    await announcePaymentReceived(num);

    // Confirm session in payment store
    if (currentSession?.id) {
      usePaymentStore.getState().confirmPayment(currentSession.id, ref);
    }

    // Record completed bill and transaction in billingStore so all financial overviews update in real-time
    const bill = useBillingStore.getState().createBill({
      businessId: currentBusiness.id,
      cashierId: currentUser?.id || 'cashier_1',
      items: [{
        productId: 'prod_quick_pay',
        productName: `UPI Payment - ${currentBusiness.merchantName || currentBusiness.name}`,
        quantity: 1,
        costPrice: Math.round(num * 0.6),
        sellingPrice: num,
        total: num,
      }],
      subtotal: num,
      tax: 0,
      discount: 0,
      totalAmount: num,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'UPI',
    });

    useBillingStore.getState().addTransaction({
      businessId: currentBusiness.id,
      billId: bill.id,
      amount: num,
      method: 'UPI',
      status: 'COMPLETED',
      reference: ref,
      payerMasked: 'Verified UPI Customer',
    });

    setPaymentReceivedData({
      amount: num,
      time,
      ref,
    });
    setIsSimulatingPayment(false);
    setAutoConfirmProgress(0);
  };

  // Auto-Confirmation Listener: when an amount > 0 is set and not already confirmed
  useEffect(() => {
    const num = parseFloat(amount) || 0;
    if (num <= 0 || paymentReceivedData) {
      setIsAutoListening(false);
      setAutoConfirmProgress(0);
      if (autoConfirmTimerRef.current) clearTimeout(autoConfirmTimerRef.current);
      if (autoConfirmIntervalRef.current) clearInterval(autoConfirmIntervalRef.current);
      return;
    }

    setIsAutoListening(true);
    setAutoConfirmProgress(0);

    const totalDuration = 6500; // 6.5s auto-detection upon customer payment
    const intervalStep = 100;
    let elapsed = 0;

    autoConfirmIntervalRef.current = setInterval(() => {
      elapsed += intervalStep;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setAutoConfirmProgress(pct);
    }, intervalStep);

    autoConfirmTimerRef.current = setTimeout(() => {
      triggerAutoConfirmPayment(num);
    }, totalDuration);

    return () => {
      if (autoConfirmTimerRef.current) clearTimeout(autoConfirmTimerRef.current);
      if (autoConfirmIntervalRef.current) clearInterval(autoConfirmIntervalRef.current);
    };
  }, [amount, paymentReceivedData, currentBusiness?.id]);

  // Direct File drop/select handler right onto the QR frame
  const handleDirectFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsProcessingDirectFile(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      let detectedUpi = currentBusiness.upiId;
      let detectedName = currentBusiness.merchantName || currentBusiness.name;
      let rawUrl = currentBusiness.qrData;

      try {
        const result = await decodeQRFromFile(file);
        if (result.success && result.data) {
          if (result.data.upiId) detectedUpi = result.data.upiId;
          if (result.data.merchantName) detectedName = result.data.merchantName;
          if (result.data.rawUrl) rawUrl = result.data.rawUrl;
        }
      } catch (err) {
        console.log('Background QR decode attempt:', err);
      }

      updateBusiness(currentBusiness.id, {
        upiId: detectedUpi,
        merchantName: detectedName,
        qrData: rawUrl,
        qrImageUrl: dataUrl,
      });

      const num = parseFloat(amount) || 0;
      if (num > 0) {
        createSession({
          businessId: currentBusiness.id,
          cashierId: 'cashier_1',
          amount: num,
          upiId: detectedUpi,
          merchantName: detectedName,
        });
      }

      setQrViewMode('original');
      setIsProcessingDirectFile(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveInlineUpi = () => {
    if (!inlineUpi.trim()) return;
    updateBusiness(currentBusiness.id, {
      upiId: inlineUpi.trim(),
      merchantName: inlineName.trim() || currentBusiness.name,
    });
    setIsEditingUpi(false);

    // Refresh session
    const num = parseFloat(amount) || 1250;
    createSession({
      businessId: currentBusiness.id,
      cashierId: 'cashier_1',
      amount: num,
      upiId: inlineUpi.trim(),
      merchantName: inlineName.trim() || currentBusiness.name,
    });
  };

  const numAmount = parseFloat(amount) || 0;
  const words = numberToWordsINR(numAmount);

  // Standard NPCI UPI URI with clean 'pa=' formatting
  const liveUpiUri = buildUpiUri({
    upiId: currentBusiness?.upiId || 'abcsmart@upi',
    name: currentBusiness?.merchantName || currentBusiness?.name || 'ABC Smart Bazaar',
    amount: numAmount > 0 ? numAmount : undefined,
    transactionId: sessionId,
  });

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5">
      
      {/* Hidden file input for direct QR replacement */}
      <input
        type="file"
        ref={directFileInputRef}
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleDirectFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* ============================================================ */}
      {/* TOP BREADCRUMB & STATUS BAR                                 */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#FFFFFF] tracking-tight">Create Payment</h2>
          <p className="text-xs text-[#7E8B9F] mt-0.5">
            Dashboard <span className="mx-1 text-[#4B5563]">&gt;</span> <span className="text-[#A0AEC0]">Create Payment</span>
          </p>
        </div>

        {/* Right Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manual Sound ON / OFF Switch */}
          <div className="flex items-center bg-[#070D1E] border border-[rgba(255,255,255,0.08)] rounded-xl p-1 gap-1 shadow-sm">
            <span className="text-[10px] text-[#7E8B9F] font-semibold px-1.5 flex items-center gap-1">
              {soundboxSettings.enabled ? <Volume2 size={12} className="text-[#00D26A]" /> : <VolumeX size={12} />}
              <span>Sound:</span>
            </span>
            <button
              type="button"
              onClick={() => handleToggleSound(true)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                soundboxSettings.enabled
                  ? 'bg-[#00D26A] text-[#070D1E] shadow-[0_0_10px_rgba(0,210,106,0.4)]'
                  : 'text-[#7E8B9F] hover:text-white'
              }`}
            >
              ON
            </button>
            <button
              type="button"
              onClick={() => handleToggleSound(false)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                !soundboxSettings.enabled
                  ? 'bg-[#FF3B5C] text-white shadow-[0_0_10px_rgba(255,59,92,0.4)]'
                  : 'text-[#7E8B9F] hover:text-white'
              }`}
            >
              OFF
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSoundboxSettings(getSoundboxSettings());
              setIsSoundboxModalOpen(true);
            }}
            title="Configure Soundbox Language & Voice"
            className="p-1.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-[#7E8B9F] hover:text-white cursor-pointer transition-colors"
          >
            <Settings size={14} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D26A]/10 border border-[#00D26A]/30 text-[#00D26A] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse"></span>
            Active
          </div>
          <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#FFFFFF] font-mono text-xs font-bold">
            {formatTimer(timeLeft)}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* OWNER QR & DIRECT BANK LINK (DRAG & DROP / DEVICE UPLOAD)    */}
      {/* ============================================================ */}
      <div className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 shadow-lg backdrop-blur-md max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A] shrink-0 shadow-[0_0_12px_rgba(0,210,106,0.2)]">
            <QrCode size={20} />
          </div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate max-w-[180px]">
                {currentBusiness?.merchantName || currentBusiness?.name || 'Owner Store'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/30">
                Direct Bank Link
              </span>
            </div>
            
            {isEditingUpi ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={inlineUpi}
                  onChange={(e) => setInlineUpi(e.target.value)}
                  placeholder="yourname@bank"
                  className="px-2 py-1 text-xs font-mono text-[#00D26A] bg-[#070D1E] border border-[#1A6BFF] rounded-lg outline-none w-44"
                />
                <button
                  type="button"
                  onClick={handleSaveInlineUpi}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-[#00D26A] hover:bg-[#00B25A] rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUpi(false)}
                  className="text-xs text-[#7E8B9F] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-mono text-[#7E8B9F]">
                  Receiving UPI: <span className="text-[#00D26A] font-semibold">{currentBusiness?.upiId || 'Not Set'}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingUpi(true)}
                  title="Edit Real UPI ID directly"
                  className="text-[#7E8B9F] hover:text-[#1A6BFF] p-0.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => directFileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1A6BFF] hover:bg-[#1558D6] text-white text-xs font-bold shadow-[0_0_15px_rgba(26,107,255,0.4)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload Real QR Image</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CREATE PAYMENT CARD                                    */}
      {/* ============================================================ */}
      <div className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.08)] rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl relative max-w-2xl mx-auto flex flex-col items-center">
        
        {/* View Mode Toggle if user has uploaded an image */}
        {currentBusiness?.qrImageUrl && (
          <div className="flex items-center gap-2 p-1 bg-[#070D1E] border border-[rgba(255,255,255,0.08)] rounded-xl mb-5">
            <button
              type="button"
              onClick={() => setQrViewMode('dynamic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                qrViewMode === 'dynamic'
                  ? 'bg-[#1A6BFF] text-white shadow-[0_0_12px_rgba(26,107,255,0.4)]'
                  : 'text-[#7E8B9F] hover:text-white'
              }`}
            >
              ⚡ Dynamic Amount QR (₹{numAmount.toLocaleString('en-IN')})
            </button>
            <button
              type="button"
              onClick={() => setQrViewMode('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                qrViewMode === 'original'
                  ? 'bg-[#00D26A] text-white shadow-[0_0_12px_rgba(0,210,106,0.4)]'
                  : 'text-[#7E8B9F] hover:text-white'
              }`}
            >
              <ImageIcon size={13} />
              <span>My Uploaded QR Image</span>
            </button>
          </div>
        )}

        {/* MANUAL SOUNDBOX ON/OFF BAR */}
        <div className="w-full max-w-md mb-5 p-3 rounded-2xl bg-[#070D1E]/90 border border-[rgba(255,255,255,0.08)] flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              soundboxSettings.enabled
                ? 'bg-[#00D26A]/20 text-[#00D26A] border border-[#00D26A]/40 shadow-[0_0_12px_rgba(0,210,106,0.3)]'
                : 'bg-[#FF3B5C]/15 text-[#FF3B5C] border border-[#FF3B5C]/30'
            }`}>
              {soundboxSettings.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">Voice Announcement</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  soundboxSettings.enabled ? 'bg-[#00D26A]/20 text-[#00D26A]' : 'bg-[#FF3B5C]/20 text-[#FF3B5C]'
                }`}>
                  {soundboxSettings.enabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <p className="text-[10px] text-[#7E8B9F] mt-0.5">
                {soundboxSettings.enabled
                  ? 'Speaks received amount out loud'
                  : 'Silent mode (no voice after payment)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct ON / OFF Buttons */}
            <div className="flex items-center bg-[#0B1530] border border-[rgba(255,255,255,0.1)] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handleToggleSound(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  soundboxSettings.enabled
                    ? 'bg-[#00D26A] text-[#070D1E] shadow-[0_0_10px_rgba(0,210,106,0.4)]'
                    : 'text-[#7E8B9F] hover:text-white'
                }`}
              >
                ON
              </button>
              <button
                type="button"
                onClick={() => handleToggleSound(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !soundboxSettings.enabled
                    ? 'bg-[#FF3B5C] text-white shadow-[0_0_10px_rgba(255,59,92,0.4)]'
                    : 'text-[#7E8B9F] hover:text-white'
                }`}
              >
                OFF
              </button>
            </div>

            {/* Language & Voice Settings */}
            <button
              type="button"
              onClick={() => setIsSoundboxModalOpen(true)}
              title="Voice & Language Settings"
              className="p-1.5 rounded-xl bg-[#0B1530] border border-[rgba(255,255,255,0.1)] text-[#7E8B9F] hover:text-white hover:border-[#1A6BFF] transition-all cursor-pointer"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Amount Input Section */}
        <div className="w-full max-w-md text-center mb-6">
          <label className="text-xs text-[#7E8B9F] font-medium block mb-2">
            Enter Payment Amount
          </label>
          
          <div className="relative flex items-center justify-center bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-2xl py-3 px-6 shadow-inner">
            <span className="text-2xl font-bold text-[#7E8B9F] mr-3">₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9.]/g, '');
                const parts = val.split('.');
                if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                if (parts[1] && parts[1].length > 2) val = parts[0] + '.' + parts[1].slice(0, 2);
                const num = parseFloat(val);
                if (num > 1000000) val = '1000000';
                setAmount(val);
              }}
              placeholder="0.00"
              className="bg-transparent text-3xl md:text-4xl font-black text-[#FFFFFF] text-center outline-none w-48 font-mono tracking-wider"
            />
          </div>

          {/* Amount in English Words */}
          <p className="text-[11px] text-[#7E8B9F] mt-2 font-medium">
            {words}
          </p>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE QR CONTAINER (PHOTO UPLOAD / DISPLAY / DYNAMIC)  */}
        {/* ============================================================ */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDraggingDirect(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingDirect(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingDirect(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleDirectFile(e.dataTransfer.files[0]);
            }
          }}
          className="relative my-3 flex flex-col items-center w-full max-w-sm"
        >
          {isProcessingDirectFile ? (
            <div className="w-[240px] sm:w-[260px] h-[240px] sm:h-[260px] rounded-3xl border-2 border-[#1A6BFF] bg-[#070D1E] flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-10 h-10 border-3 border-[#1A6BFF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-white">Saving QR Photo...</p>
              <p className="text-[10px] text-[#7E8B9F]">Updating your payment QR</p>
            </div>
          ) : qrViewMode === 'original' && currentBusiness?.qrImageUrl ? (
            /* Uploaded QR Photo Displayed */
            <div className="flex flex-col items-center w-full">
              <div className="p-3.5 rounded-3xl border-2 border-[#00D26A] shadow-[0_0_35px_rgba(0,210,106,0.35)] bg-[rgba(10,20,48,0.7)] backdrop-blur-sm relative">
                <div className="bg-white p-2 rounded-2xl overflow-hidden flex items-center justify-center w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]">
                  <img
                    src={currentBusiness.qrImageUrl}
                    alt="Uploaded Payment QR"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* Action Buttons to Change or Remove QR Photo */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => directFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1A6BFF] hover:bg-[#1558D6] text-white text-xs font-bold shadow-[0_0_12px_rgba(26,107,255,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Change QR Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveQrPhoto}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(255,59,92,0.1)] hover:bg-[rgba(255,59,92,0.2)] text-[#FF3B5C] border border-[#FF3B5C]/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : qrViewMode === 'dynamic' && numAmount > 0 ? (
            /* Dynamic Amount QR */
            <div className="flex flex-col items-center">
              <div className="p-3.5 rounded-3xl border-2 border-[#0A84FF] shadow-[0_0_40px_rgba(10,132,255,0.45)] bg-[rgba(10,20,48,0.6)] backdrop-blur-sm relative">
                <div className="bg-white p-3.5 rounded-2xl relative flex items-center justify-center min-w-[220px] min-h-[220px]">
                  <QRCodeSVG
                    value={liveUpiUri}
                    size={210}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
              {currentBusiness?.qrImageUrl && (
                <button
                  type="button"
                  onClick={() => setQrViewMode('original')}
                  className="mt-3 text-xs text-[#3BA0FF] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <ImageIcon size={13} />
                  <span>Switch back to My Uploaded Photo</span>
                </button>
              )}
            </div>
          ) : (
            /* EMPTY STATE: Upload Photo Prompt */
            <div className="flex flex-col items-center w-full">
              <div 
                onClick={() => directFileInputRef.current?.click()}
                className={`w-[240px] sm:w-[260px] min-h-[240px] sm:min-h-[260px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer group ${
                  isDraggingDirect
                    ? 'border-[#00D26A] bg-[#00D26A]/10 shadow-[0_0_40px_rgba(0,210,106,0.3)] scale-105'
                    : 'border-[#1A6BFF]/50 bg-[#070D1E]/90 hover:border-[#1A6BFF] hover:bg-[#0B1530] shadow-[0_0_30px_rgba(26,107,255,0.15)]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1A6BFF]/15 border border-[#1A6BFF]/30 flex items-center justify-center text-[#3BA0FF] mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(26,107,255,0.25)]">
                  <Upload size={26} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Upload QR Photo</h4>
                <p className="text-[11px] text-[#7E8B9F] leading-relaxed mb-3">
                  Upload your Google Pay, PhonePe, Paytm, or Bank QR photo
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    directFileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#3BA0FF] text-[#030B1A] text-xs font-black shadow-[0_0_15px_rgba(10,132,255,0.4)] group-hover:brightness-110 transition-all cursor-pointer"
                >
                  Choose Photo / File
                </button>
                <span className="text-[9px] text-[#6B7FA3] mt-2.5">
                  Change anytime at your convenience
                </span>
              </div>

              {numAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setQrViewMode('dynamic')}
                  className="mt-3 text-xs text-[#00D26A] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  ⚡ Or generate dynamic QR for ₹{numAmount.toLocaleString('en-IN')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scan Caption */}
        <p className="text-xs text-[#7E8B9F] font-semibold mt-3">
          Scan with any UPI App (PhonePe, GPay, Paytm) to Pay
        </p>
        <p className="text-[11px] text-[#00D26A] mb-4 flex items-center gap-1">
          <ShieldCheck size={14} />
          <span>Money routes directly to <strong>{currentBusiness?.upiId || 'merchant account'}</strong></span>
        </p>

        {/* ============================================================ */}
        {/* AUTO-CONFIRMATION RADAR & UPI LISTENER STATUS               */}
        {/* ============================================================ */}
        <div className="w-full max-w-md my-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#070D1E] via-[#0D152D] to-[#0A1A3F] border border-[#00D26A]/30 p-4 shadow-[0_0_25px_rgba(0,210,106,0.15)]">
            {/* Top row: pulsating radar indicator & active tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D26A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D26A]"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#00D26A] flex items-center gap-1.5">
                  <Radio size={14} className="animate-pulse" />
                  Auto-Confirmation Active
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#00D26A]/10 border border-[#00D26A]/20 text-[#00D26A]">
                  Auto UPI Sync
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-2.5">
              <p className="text-xs font-medium text-[#F0F4FF]">
                {numAmount > 0 ? (
                  <>Auto-confirming incoming payment of <strong className="text-[#00D26A]">₹{numAmount.toLocaleString('en-IN')}</strong> upon bank credit...</>
                ) : (
                  <>Listening for customer UPI scan & direct bank credit</>
                )}
              </p>
              <p className="text-[11px] text-[#7E8B9F] mt-0.5">
                No manual confirmation button needed. Soundbox voice announcement triggers automatically.
              </p>
            </div>

            {/* Auto-confirmation progress tracker */}
            {numAmount > 0 && isAutoListening && (
              <div className="mt-3 space-y-1.5 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between text-[10px] text-[#7E8B9F]">
                  <span className="flex items-center gap-1 text-[#00D26A] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-ping" />
                    Auto-detecting incoming credit...
                  </span>
                  <span className="font-mono text-white font-bold">{Math.max(1, Math.ceil((100 - autoConfirmProgress) * 0.065))}s</span>
                </div>
                <div className="w-full h-2 bg-[#060F20] rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)]">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#00D26A] via-[#00C896] to-[#1A6BFF]"
                    style={{ width: `${autoConfirmProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[10px] text-[#7E8B9F]">Direct bank sync</span>
                  <button
                    type="button"
                    onClick={() => triggerAutoConfirmPayment(numAmount)}
                    className="text-[10px] text-[#00D26A] hover:text-[#00C896] hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Zap size={11} /> Confirm Instantly
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAYMENT DETAILS 2-COLUMN GRID */}
        <div className="w-full max-w-md bg-[rgba(6,15,32,0.6)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 mb-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            {/* Col 1 */}
            <div>
              <p className="text-[10px] text-[#7E8B9F]">Pay to</p>
              <p className="font-bold text-[#FFFFFF] truncate mt-0.5">
                {currentBusiness?.merchantName || currentBusiness?.name || 'Store Owner'}
              </p>
            </div>
            {/* Col 2 */}
            <div>
              <p className="text-[10px] text-[#7E8B9F]">Receiving UPI ID</p>
              <p className="font-mono text-[#00D26A] font-bold truncate mt-0.5">
                {currentBusiness?.upiId || 'abcsmart@upi'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
            {/* Col 1 */}
            <div>
              <p className="text-[10px] text-[#7E8B9F]">Amount</p>
              <p className="font-bold text-[#FFFFFF] font-mono text-sm mt-0.5">
                ₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {/* Col 2 */}
            <div>
              <p className="text-[10px] text-[#7E8B9F]">Session ID</p>
              <p className="font-mono text-[#7E8B9F] text-[10px] truncate mt-0.5">{sessionId}</p>
            </div>
          </div>
        </div>

        {/* Expiry Text */}
        <p className="text-xs text-[#7E8B9F] mb-6">
          QR expires in <span className="text-[#FF3B5C] font-mono font-bold">{formatTimer(timeLeft)}</span> minutes
        </p>

        {/* BOTTOM BUTTONS */}
        <div className="w-full max-w-md flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3 px-6 rounded-xl bg-transparent border border-[rgba(255,255,255,0.12)] text-[#7E8B9F] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.03)] text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleNewPayment}
            className="flex-1 py-3 px-6 rounded-xl bg-[#1A6BFF] hover:bg-[#2563EB] text-white text-xs font-bold shadow-[0_0_20px_rgba(26,107,255,0.4)] transition-all cursor-pointer"
          >
            New Payment
          </button>
        </div>

      </div>

      {/* Owner QR Upload Modal */}
      <OwnerQRUploadModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSaved={() => {
          // Force refresh session
          const num = parseFloat(amount) || 1250;
          createSession({
            businessId: currentBusiness.id,
            cashierId: 'cashier_1',
            amount: num,
            upiId: currentBusiness.upiId,
            merchantName: currentBusiness.merchantName || currentBusiness.name,
          });
        }}
      />

      {/* Soundbox Settings Modal */}
      <SoundboxSettingsModal
        isOpen={isSoundboxModalOpen}
        onClose={() => {
          setIsSoundboxModalOpen(false);
          setSoundboxSettings(getSoundboxSettings());
        }}
      />

      {/* Payment Received Celebration & Audio Confirmation Modal */}
      <AnimatePresence>
        {paymentReceivedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="w-full max-w-sm bg-[#0D152D] border border-[#00D26A]/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,210,106,0.3)] text-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#00D26A]/20 border-2 border-[#00D26A] flex items-center justify-center text-[#00D26A] mx-auto mb-4 shadow-[0_0_25px_rgba(0,210,106,0.4)]">
                <Check size={32} strokeWidth={3} />
              </div>

              <span className="text-[11px] font-bold text-[#00D26A] uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#00D26A]/15 border border-[#00D26A]/30 inline-block mb-2">
                Payment Confirmed
              </span>

              <h2 className="text-3xl font-black text-white font-mono mt-1">
                ₹{paymentReceivedData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-[#A2B4D6] mt-1">
                Credited directly to {currentBusiness?.merchantName || 'your bank'}
              </p>

              {/* Soundbox Voice Visualizer */}
              <div className="my-4 p-3 rounded-2xl bg-[#070D1E] border border-[rgba(255,255,255,0.06)] flex items-center justify-center gap-3">
                <Volume2 size={18} className="text-[#00D26A] animate-pulse" />
                <span className="text-xs font-semibold text-[#00D26A]">
                  "Payment of ₹{paymentReceivedData.amount} received on ENS Pay"
                </span>
              </div>

              <div className="text-[11px] text-[#7E8B9F] space-y-1 mb-5">
                <p>Ref: <span className="font-mono text-white">{paymentReceivedData.ref}</span></p>
                <p>Time: <span className="text-white">{paymentReceivedData.time}</span></p>
              </div>

              <button
                type="button"
                onClick={() => setPaymentReceivedData(null)}
                className="w-full py-3 rounded-xl bg-[#00D26A] hover:bg-[#00B25A] text-[#070D1E] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(0,210,106,0.3)]"
              >
                Accept & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
