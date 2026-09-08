import React from 'react';
import { CheckCircle2, Printer, Download } from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';

export default function PrintCenter() {
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[550px] space-y-5">
      
      {/* ============================================================ */}
      {/* TOP NOTIFICATION BANNER (EXACT REPLICA OF SCREEN 6)          */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 text-left w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-[#00D26A]/20 border border-[#00D26A]/40 flex items-center justify-center text-[#00D26A] shrink-0 shadow-[0_0_15px_rgba(0,210,106,0.3)]">
          <CheckCircle2 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#FFFFFF] leading-tight">Payment Successful!</h3>
          <p className="text-[11px] text-[#7E8B9F] font-mono mt-0.5">
            Transaction ID: <span className="text-[#A0AEC0]">TXN5f6a8b7c9d0e</span>
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* THERMAL PAYMENT RECEIPT CARD (EXACT REPLICA OF SCREEN 6)     */}
      {/* ============================================================ */}
      <div className="w-full max-w-sm bg-[#FFFFFF] text-[#1A202C] rounded-2xl p-6 shadow-2xl font-mono text-xs relative overflow-hidden">
        
        {/* Receipt Header */}
        <div className="text-center pb-3">
          <h2 className="text-sm font-black text-black tracking-wider uppercase">
            {currentBusiness?.name || 'ABC SMART BAZAAR'}
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-widest mt-0.5">
            PAYMENT RECEIPT
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-1 py-3 text-[11px] text-gray-600 border-t border-b border-gray-200">
          <div className="flex justify-between">
            <span>Bill ID</span>
            <span>: ENS-125</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>: 19 May 2024</span>
          </div>
          <div className="flex justify-between">
            <span>Time</span>
            <span>: 10:35 AM</span>
          </div>
        </div>

        {/* Line Items List */}
        <div className="py-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span>Milk (1L)</span>
            <span className="text-gray-500">x2</span>
            <span className="font-bold">₹120</span>
          </div>
          <div className="flex justify-between">
            <span>Rice (5kg)</span>
            <span className="text-gray-500">x1</span>
            <span className="font-bold">₹500</span>
          </div>
          <div className="flex justify-between">
            <span>Bread</span>
            <span className="text-gray-500">x1</span>
            <span className="font-bold">₹45</span>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Total and Payment Method */}
        <div className="flex justify-between items-center text-sm font-black text-black py-1">
          <span>TOTAL</span>
          <span>₹620</span>
        </div>
        <p className="text-[10px] text-gray-500 text-left">
          Paid via UPI
        </p>

        {/* Footer Note */}
        <div className="text-center pt-5 text-[10px] text-gray-400">
          Thank you! Visit again.
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM ACTION BUTTONS: [ Print Receipt ]  [ Download ]       */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 w-full max-w-sm pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[#F0F4FF] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Printer size={14} className="text-[#0A84FF]" />
          <span>Print Receipt</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[#F0F4FF] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Download size={14} className="text-[#00D26A]" />
          <span>Download</span>
        </button>
      </div>

    </div>
  );
}
