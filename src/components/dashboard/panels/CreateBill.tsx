import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useBillingStore } from '../../../store/billingStore';
import { useBusinessStore } from '../../../store/businessStore';
import { usePaymentStore } from '../../../store/paymentStore';
import { useAuthStore } from '../../../store/authStore';

interface BillItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export default function CreateBill() {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const { createSession } = usePaymentStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);

  // Pre-loaded items matching the reference image screen 5
  const [items, setItems] = useState<BillItem[]>([
    { name: 'Milk (1L)', qty: 2, price: 60, total: 120 },
    { name: 'Rice (5kg)', qty: 1, price: 500, total: 500 },
    { name: 'Bread', qty: 1, price: 45, total: 45 },
  ]);

  const [billId] = useState('ENS-125');
  const [dateStr] = useState('19 May 2024, 10:35 AM');
  const [discount, setDiscount] = useState(45);
  const [taxPercent, setTaxPercent] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);
  const [successRedirect, setSuccessRedirect] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (taxPercent / 100);
  const totalAmount = Math.max(0, subtotal - discount + tax);

  const handleProceedToPayment = () => {
    setIsProceeding(true);

    // 1. Record bill in billingStore
    const bill = useBillingStore.getState().createBill({
      businessId: currentBusiness.id,
      cashierId: 'cashier_1',
      items: items.map((item, idx) => ({
        productId: `item_${idx}_${Date.now()}`,
        productName: item.name,
        quantity: item.qty,
        costPrice: Math.round(item.price * 0.6),
        sellingPrice: item.price,
        total: item.total,
      })),
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentStatus: 'PENDING',
    });

    // 2. Create payment session for this bill
    createSession({
      businessId: currentBusiness.id,
      cashierId: 'cashier_1',
      amount: totalAmount,
      upiId: currentBusiness.upiId || 'abcsmart@upi',
      merchantName: currentBusiness.merchantName || currentBusiness.name,
      note: `Bill #${billId} - ${items.map(i => i.name).join(', ')}`,
      billId: bill.id,
    });

    setTimeout(() => {
      setSuccessRedirect(true);
      setIsProceeding(false);
    }, 600);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      {/* ============================================================ */}
      {/* BILL SUMMARY CARD (EXACT REPLICA OF SCREEN 5)               */}
      {/* ============================================================ */}
      <div className="bg-[#0D152D]/95 border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
        
        {/* Header */}
        <div className="pb-5 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">Bill Summary</h2>
          <div className="flex flex-wrap items-center justify-between text-xs text-[#7E8B9F] mt-1 gap-2">
            <span>Bill ID: <strong className="text-[#F0F4FF] font-mono">{billId}</strong></span>
            <span>Date: <strong className="text-[#A0AEC0]">{dateStr}</strong></span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[#7E8B9F] border-b border-[rgba(255,255,255,0.06)] pb-2">
                <th className="pb-2.5 font-semibold">Item</th>
                <th className="pb-2.5 font-semibold text-center">Qty</th>
                <th className="pb-2.5 font-semibold text-right">Price</th>
                <th className="pb-2.5 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <td className="py-3 text-[#F0F4FF] font-medium">{item.name}</td>
                  <td className="py-3 text-center text-[#7E8B9F] font-mono">{item.qty}</td>
                  <td className="py-3 text-right text-[#7E8B9F] font-mono">₹{item.price}</td>
                  <td className="py-3 text-right text-[#F0F4FF] font-mono font-semibold">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Breakdown */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-[#7E8B9F]">
            <span>Subtotal</span>
            <span className="font-mono text-[#F0F4FF]">₹{subtotal}</span>
          </div>

          <div className="flex justify-between items-center text-[#7E8B9F]">
            <span>Discount</span>
            <span className="font-mono text-[#FF3B5C]">-₹{discount}</span>
          </div>

          <div className="flex justify-between items-center text-[#7E8B9F]">
            <span>Tax ({taxPercent}%)</span>
            <span className="font-mono text-[#F0F4FF]">₹{tax}</span>
          </div>

          {/* Total Amount in Green */}
          <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.06)] text-sm">
            <span className="text-[#00D26A] font-bold">Total Amount</span>
            <span className="text-[#00D26A] font-mono font-black text-xl">₹{totalAmount}</span>
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={isProceeding}
            className="w-full py-3.5 rounded-xl bg-[#1A6BFF] hover:bg-[#2563EB] text-white font-bold text-xs shadow-[0_0_20px_rgba(26,107,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProceeding ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                GENERATING DYNAMIC QR...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>

        {/* Success message */}
        {successRedirect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 text-xs text-[#00D26A] text-center font-semibold"
          >
            ✅ Payment Request for ₹{totalAmount} created! Switch to "Create Payment" tab to view customer QR.
          </motion.div>
        )}

      </div>

    </div>
  );
}
