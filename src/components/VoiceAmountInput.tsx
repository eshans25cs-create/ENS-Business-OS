import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { parseSpokenAmount } from '../utils/currency';

interface VoiceAmountInputProps {
  onAmount: (amount: number) => void;
}

export default function VoiceAmountInput({ onAmount }: VoiceAmountInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detected, setDetected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      const amount = parseSpokenAmount(text);
      setDetected(amount);
      if (!amount) setError('Could not detect an amount. Please try again.');
    };

    recognition.onerror = () => {
      setError('Could not capture audio. Please try again.');
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setTranscript('');
    setDetected(null);
    setError('');
  }, []);

  const confirm = () => {
    if (detected) {
      onAmount(detected);
      setDetected(null);
      setTranscript('');
    }
  };

  const cancel = () => {
    setDetected(null);
    setTranscript('');
    setError('');
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={startListening}
        disabled={listening}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide border transition-all ${
          listening
            ? 'border-[#FF1744]/50 bg-[#FF1744]/10 text-[#FF1744]'
            : 'border-white/10 bg-white/[0.03] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20'
        }`}
      >
        {listening ? (
          <>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <MicOff size={13} className="text-[#FF1744]" />
            </motion.span>
            LISTENING...
          </>
        ) : (
          <>
            <Mic size={13} />
            🎙️ SPEAK AMOUNT
          </>
        )}
      </button>

      <AnimatePresence>
        {(transcript || error) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 p-4 rounded-xl border border-white/10"
            style={{ background: 'rgba(8,17,31,0.9)', backdropFilter: 'blur(20px)' }}
          >
            <p className="text-[10px] tracking-[0.2em] text-[#94A3B8] mb-2">🤖 AI AMOUNT DETECTION</p>
            {error ? (
              <p className="text-xs text-[#FF1744]">{error}</p>
            ) : (
              <>
                <p className="text-[10px] text-[#94A3B8] mb-1">You said: <span className="text-[#F8FAFC]">"{transcript}"</span></p>
                {detected ? (
                  <>
                    <p className="text-2xl font-bold text-[#00F5D4] mb-3">
                      ₹{detected.toLocaleString('en-IN')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={confirm}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/30 transition-colors"
                      >
                        <Check size={12} /> CONFIRM
                      </button>
                      <button
                        onClick={cancel}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                      >
                        <X size={12} /> CANCEL
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-[#FFD600]">Amount not detected. Please try speaking clearly.</p>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
