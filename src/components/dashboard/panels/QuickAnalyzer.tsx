import { motion } from 'framer-motion';
import { Zap, Shield } from 'lucide-react';
import { useState } from 'react';

export default function QuickAnalyzer() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [upiId, setUpiId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!amount) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{ background: 'rgba(8,17,31,0.7)', backdropFilter: 'blur(30px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-[#00C6FF]/10 border border-[#00C6FF]/20">
          <Zap size={14} className="text-[#00C6FF]" />
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-[0.15em] text-[#F8FAFC]">QUICK PAYMENT ANALYSIS</h3>
          <p className="text-[10px] text-[#94A3B8]">Powered by Cyber Surety AI</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase mb-1.5">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#00C6FF]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase mb-1.5">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient name"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#00C6FF]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase mb-1.5">UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="example@upi"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#00C6FF]/50 transition-colors"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !amount}
          className="w-full py-3 rounded-xl font-semibold text-xs tracking-[0.12em] uppercase bg-gradient-to-r from-[#00C6FF] to-[#00F5D4] text-[#030712] disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#00C6FF]/20 active:scale-98"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="w-3.5 h-3.5 border-2 border-[#030712] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              />
              ANALYZING...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield size={13} />
              ANALYZE WITH AI
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
