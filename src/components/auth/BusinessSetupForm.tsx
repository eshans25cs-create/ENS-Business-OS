import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, ChevronLeft, Check, MapPin, Phone, AlertCircle } from 'lucide-react';
import { useBusinessStore, type BusinessType } from '../../store/businessStore';
import OwnerQRDropzone from '../common/OwnerQRDropzone';

const BUSINESS_TYPES: BusinessType[] = [
  'Smart Bazaar', 'Supermarket', 'Shopping Mall', 'Restaurant', 'Retail Shop',
  'Hotel', 'Petrol Station', 'Grocery', 'Pharmacy', 'Electronics', 'Other',
];

interface BusinessData {
  name: string;
  type: BusinessType;
  address: string;
  phone: string;
  upiId: string;
  merchantName: string;
  qrData?: string;
  qrImagePreview?: string;
}

interface BusinessSetupFormProps {
  onComplete: (data: BusinessData) => void;
  userName: string;
  userId?: string;
  userEmail?: string;
}

export default function BusinessSetupForm({ onComplete, userName, userId, userEmail: _userEmail }: BusinessSetupFormProps) {
  const { createBusiness, setCurrentBusiness } = useBusinessStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Generate personalized defaults from user's name
  const cleanName = userName?.trim() || 'My Business';
  const defaultShopName = `${cleanName.toUpperCase()} STORE`;
  const defaultMerchantName = cleanName;
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'merchant';
  const defaultUpi = `${slug}@upi`;

  const [data, setData] = useState<BusinessData>({
    name: defaultShopName,
    type: 'Smart Bazaar',
    address: 'Commercial Street, Main Market',
    phone: '+91 98000 00000',
    upiId: defaultUpi,
    merchantName: defaultMerchantName,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessData, string>>>({});

  const updateField = (field: keyof BusinessData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Step 1: Validate QR / UPI details
  const validateStep1 = () => {
    const errs: Partial<Record<keyof BusinessData, string>> = {};
    if (!data.upiId.trim()) errs.upiId = 'UPI ID is required (e.g. yourname@bank)';
    else if (!/^[\w.\-_]+@[\w]+$/.test(data.upiId.trim())) errs.upiId = 'Enter a valid UPI ID (e.g. abcsmart@upi)';
    if (!data.merchantName.trim()) errs.merchantName = 'Merchant / Owner name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2: Validate Business profile details
  const validateStep2 = () => {
    const errs: Partial<Record<keyof BusinessData, string>> = {};
    if (!data.name.trim()) errs.name = 'Business / Shop name is required';
    if (!data.type) errs.type = 'Select a business type';
    if (!data.address.trim()) errs.address = 'Address is required';
    if (!data.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQRConfirmed = (qrRes: { upiId: string; merchantName: string; qrImagePreview?: string; rawQrData?: string }) => {
    setData(prev => ({
      ...prev,
      upiId: qrRes.upiId || prev.upiId,
      merchantName: qrRes.merchantName || prev.merchantName,
      name: prev.name === 'ABC SMART BAZAAR' && qrRes.merchantName ? qrRes.merchantName : prev.name,
      qrData: qrRes.rawQrData || prev.qrData,
      qrImagePreview: qrRes.qrImagePreview || prev.qrImagePreview
    }));
    setErrors(prev => ({ ...prev, upiId: '', merchantName: '' }));
  };

  const handleFinalSave = () => {
    const owner = userId || 'user_current';
    const saved = createBusiness({
      ownerId: owner,
      name: data.name,
      type: data.type,
      address: data.address,
      phone: data.phone,
      upiId: data.upiId,
      merchantName: data.merchantName,
      qrData: data.qrData,
      qrImageUrl: data.qrImagePreview,
    });
    setCurrentBusiness(saved.id);
    onComplete(data);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-[#F0F4FF] placeholder-[#6B7FA3]/60 outline-none transition-all duration-200";
  const inputStyle = {
    background: 'rgba(10,20,48,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
  };
  const inputFocusStyle = { border: '1px solid #0A84FF', boxShadow: '0 0 0 3px rgba(10,132,255,0.12)' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
          style={{ background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.25)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Building2 size={24} className="text-[#0A84FF]" />
        </motion.div>
        <h3 className="text-lg font-bold text-[#F0F4FF] tracking-wide uppercase">ENS SMART TRANSACTION</h3>
        <p className="text-sm text-[#6B7FA3] mt-1">One-Time Business & Payment QR Setup</p>
        <p className="text-[10px] text-[#00D26A] font-semibold mt-1.5 tracking-wide">
          🔓 OPEN SOURCE • ZERO COMMISSION • MONEY GOES DIRECTLY TO YOUR BANK
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3">
            <motion.div
              animate={{
                background: s < step ? '#00C896' : s === step ? '#0A84FF' : 'rgba(255,255,255,0.1)',
                scale: s === step ? 1.1 : 1,
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ color: s <= step ? '#030B1A' : '#6B7FA3' }}
            >
              {s < step ? <Check size={14} strokeWidth={3} /> : s}
            </motion.div>
            {s < 3 && (
              <motion.div
                className="w-10 h-[1px]"
                animate={{ background: s < step ? '#00C896' : 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload Owner QR First (Drag & Drop or Choose File) */}
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center mb-1">
            <p className="text-xs text-[#0A84FF] tracking-widest uppercase font-semibold">
              Step 1 — Provide Owner QR / UPI ID
            </p>
            <p className="text-[11px] text-[#6B7FA3] mt-1">
              Provide your existing UPI details <span className="text-[#F0F4FF] font-semibold">ONCE</span>. ENS uses this to generate dynamic amount QRs.
            </p>
            <p className="text-[10px] text-[#00D26A] mt-0.5">
              💰 All payments go directly to YOUR bank account — ENS never holds your money.
            </p>
          </div>

          {/* Owner QR Dropzone */}
          <OwnerQRDropzone
            initialUpiId={data.upiId}
            initialMerchantName={data.merchantName}
            onQRConfirmed={handleQRConfirmed}
          />

          {errors.upiId && (
            <p className="text-xs text-[#FF3B5C] flex items-center gap-1.5 mt-1">
              <AlertCircle size={13} /> {errors.upiId}
            </p>
          )}
        </motion.div>
      )}

      {/* Step 2: Business Profile */}
      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-xs text-[#0A84FF] tracking-widest uppercase font-semibold">Step 2 — Business Profile</p>
            <p className="text-[11px] text-[#6B7FA3] mt-0.5">Confirm details for receipt header and store display</p>
          </div>

          <div>
            <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">BUSINESS / SHOP NAME</label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. ABC SMART BAZAAR"
              value={data.name}
              onChange={e => updateField('name', e.target.value)}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, inputStyle)}
            />
            {errors.name && <p className="text-xs text-[#FF3B5C] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">BUSINESS TYPE</label>
            <div className="grid grid-cols-3 gap-2">
              {BUSINESS_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('type', type)}
                  className="py-2 px-2 rounded-lg text-[11px] font-medium transition-all text-center leading-tight truncate cursor-pointer"
                  style={{
                    background: data.type === type ? 'rgba(10,132,255,0.25)' : 'rgba(10,20,48,0.8)',
                    border: data.type === type ? '1px solid #0A84FF' : '1px solid rgba(255,255,255,0.06)',
                    color: data.type === type ? '#3BA0FF' : '#6B7FA3',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-[#FF3B5C] mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">
              <MapPin size={10} className="inline mr-1" />STORE ADDRESS
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="Store / Cab Location Address"
              value={data.address}
              onChange={e => updateField('address', e.target.value)}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, inputStyle)}
            />
            {errors.address && <p className="text-xs text-[#FF3B5C] mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="text-xs tracking-wider text-[#6B7FA3] uppercase mb-1.5 block">
              <Phone size={10} className="inline mr-1" />CONTACT PHONE NUMBER
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="+91 88675 41037"
              value={data.phone}
              onChange={e => updateField('phone', e.target.value)}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, inputStyle)}
            />
            {errors.phone && <p className="text-xs text-[#FF3B5C] mt-1">{errors.phone}</p>}
          </div>
        </motion.div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4 text-center py-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00C896]/15 border-2 border-[#00C896]/40 text-[#00C896] mb-2"
          >
            <Check size={32} strokeWidth={3} />
          </motion.div>

          <h4 className="text-lg font-black text-[#F0F4FF] uppercase tracking-wide">
            {data.name}
          </h4>
          <p className="text-xs text-[#00C896] font-semibold tracking-wider uppercase">
            Payment Account Successfully Linked
          </p>

          <div className="p-4 rounded-xl bg-[rgba(6,15,32,0.8)] border border-[rgba(255,255,255,0.08)] text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">Merchant / Owner Name:</span>
              <span className="text-[#F0F4FF] font-semibold">{data.merchantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">Receiving Bank UPI ID:</span>
              <span className="text-[#0A84FF] font-mono font-semibold">{data.upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">Business Category:</span>
              <span className="text-[#F0F4FF]">{data.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">ENS Dynamic QR Engine:</span>
              <span className="text-[#00C896] font-semibold">Active & Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">Payment Routing:</span>
              <span className="text-[#00C896] font-semibold">Direct to Your Bank ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7FA3]">ENS Commission:</span>
              <span className="text-[#00C896] font-semibold">₹0 — Free Forever</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        {step > 1 && step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as any)}
            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#6B7FA3] hover:text-[#F0F4FF] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} /> BACK
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (step === 1 && validateStep1()) setStep(2);
            else if (step === 2 && validateStep2()) setStep(3);
            else if (step === 3) handleFinalSave();
          }}
          className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0A84FF] to-[#3BA0FF] text-[#030B1A] hover:shadow-[0_0_20px_rgba(10,132,255,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {step === 3 ? 'ENTER BUSINESS DASHBOARD' : 'CONTINUE'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
