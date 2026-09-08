import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, Bot } from 'lucide-react';
import type { AICheckResult } from '../utils/aiChecks';

interface AIAmountCheckProps {
  result: AICheckResult;
  amount: number;
  onAccept: () => void;
  onEdit: () => void;
  onChangeTo?: (v: number) => void;
}

export default function AIAmountCheck({ result, amount, onAccept, onEdit, onChangeTo }: AIAmountCheckProps) {
  if (result.level === 'ok') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl border border-[#00E676]/25 bg-[#00E676]/5"
      >
        <div className="flex items-start gap-3">
          <Bot size={16} className="text-[#00F5D4] mt-0.5 shrink-0" />
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#00F5D4]">🤖 AI PAYMENT CHECK</p>
            {['Amount verified', 'UPI ID format checked', 'No obvious amount anomaly', 'Payment request ready'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Check size={11} className="text-[#00E676]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`p-5 rounded-xl border ${
          result.level === 'error'
            ? 'border-[#FF1744]/30 bg-[#FF1744]/5'
            : 'border-[#FFD600]/30 bg-[#FFD600]/5'
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle
            size={16}
            className={result.level === 'error' ? 'text-[#FF1744]' : 'text-[#FFD600]'}
          />
          <div>
            <p className={`text-[10px] font-bold tracking-[0.2em] mb-1 ${
              result.level === 'error' ? 'text-[#FF1744]' : 'text-[#FFD600]'
            }`}>
              🤖 AI CHECK {result.level === 'error' ? '— ISSUE FOUND' : '— REVIEW REQUIRED'}
            </p>
            <p className="text-xs text-[#F8FAFC] leading-relaxed">{result.message}</p>
            {result.suggestion && (
              <p className="text-xs text-[#94A3B8] mt-1">
                Did you mean: <span className="text-[#00F5D4] font-medium">₹{result.suggestion.toLocaleString('en-IN')}</span>?
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {result.suggestion && onChangeTo && (
            <button
              onClick={() => onChangeTo(result.suggestion!)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#00F5D4]/15 border border-[#00F5D4]/30 text-[#00F5D4] hover:bg-[#00F5D4]/25 transition-colors"
            >
              CHANGE TO ₹{result.suggestion.toLocaleString('en-IN')}
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            EDIT AMOUNT
          </button>
          {result.level !== 'error' && (
            <button
              onClick={onAccept}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FFD600]/10 border border-[#FFD600]/25 text-[#FFD600] hover:bg-[#FFD600]/20 transition-colors"
            >
              CONTINUE WITH ₹{amount.toLocaleString('en-IN')}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
