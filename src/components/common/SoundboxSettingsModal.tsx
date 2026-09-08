import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Play, Bell, Sparkles, Check, Globe } from 'lucide-react';
import { 
  getSoundboxSettings, 
  saveSoundboxSettings, 
  announcePaymentReceived, 
  type SoundboxSettings, 
  type VoiceLanguage 
} from '../../utils/soundbox';

interface SoundboxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES: { id: VoiceLanguage; label: string; sample: string }[] = [
  { id: 'en-IN', label: 'English (Indian)', sample: 'Payment of ₹1,250 received on ENS Pay' },
  { id: 'hi-IN', label: 'हिंदी (Hindi)', sample: 'ई एन एस पे पर 1250 रुपये प्राप्त हुए' },
  { id: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', sample: 'ಇ ಎನ್ ಎಸ್ ಪೇ ನಲ್ಲಿ 1250 ರೂಪಾಯಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
  { id: 'ta-IN', label: 'தமிழ் (Tamil)', sample: 'இ என் எஸ் பேயில் 1250 ரூபாய் பெறப்பட்டது' },
  { id: 'te-IN', label: 'తెలుగు (Telugu)', sample: 'ఈ ఎన్ ఎస్ పే లో 1250 రూపాయలు అందాయి' },
];

export default function SoundboxSettingsModal({ isOpen, onClose }: SoundboxSettingsModalProps) {
  const [settings, setSettings] = useState<SoundboxSettings>(getSoundboxSettings());
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSoundboxSettings());
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof SoundboxSettings>(key: K, value: SoundboxSettings[K]) => {
    const updated = saveSoundboxSettings({ [key]: value });
    setSettings(updated);
  };

  const handleTestVoice = async () => {
    setIsTesting(true);
    await announcePaymentReceived(1250, settings);
    setTimeout(() => setIsTesting(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#0D152D] border border-[rgba(255,255,255,0.1)] rounded-3xl p-6 shadow-2xl relative text-left"
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A] shadow-[0_0_15px_rgba(0,210,106,0.3)]">
              <Volume2 size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">ENS Soundbox & Voice Alerts</h2>
              <p className="text-xs text-[#7E8B9F]">Automatic audio announcement after customer payment</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Master Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#070D1E] border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#FFFFFF] text-xs">Enable Voice Announcements</p>
                <p className="text-[11px] text-[#7E8B9F] mt-0.5">Speaks received amount out loud like a physical soundbox</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('enabled', !settings.enabled)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.enabled ? 'bg-[#00D26A] justify-end' : 'bg-[#1A2542] justify-start'
                }`}
              >
                <motion.div
                  layout
                  className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>

            {/* Chime Tone Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#070D1E] border border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#FFFFFF] text-xs">Cashier Chime Sound</p>
                <p className="text-[11px] text-[#7E8B9F] mt-0.5">Plays a double chime before the voice announcement</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('chime', !settings.chime)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.chime ? 'bg-[#1A6BFF] justify-end' : 'bg-[#1A2542] justify-start'
                }`}
              >
                <motion.div
                  layout
                  className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>

            {/* Language Selection */}
            <div>
              <label className="font-semibold text-[#A0AEC0] block mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-[#1A6BFF]" />
                Voice Language
              </label>
              <div className="space-y-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => updateSetting('language', lang.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      settings.language === lang.id
                        ? 'bg-[#1A6BFF]/15 border-[#1A6BFF] text-white'
                        : 'bg-[#070D1E] border-[rgba(255,255,255,0.06)] text-[#7E8B9F] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${settings.language === lang.id ? 'text-white' : 'text-[#D1D9E6]'}`}>
                        {lang.label}
                      </p>
                      <p className="text-[10px] text-[#7E8B9F]">{lang.sample}</p>
                    </div>
                    {settings.language === lang.id && (
                      <div className="w-5 h-5 rounded-full bg-[#1A6BFF] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[#A0AEC0]">Volume Level</label>
                <span className="font-mono text-[#00D26A] font-bold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                className="w-full accent-[#00D26A] cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-5 mt-5 border-t border-[rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={isTesting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.12)] hover:border-[#00D26A]/50 text-[#F0F4FF] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play size={13} className={isTesting ? 'animate-spin text-[#00D26A]' : 'text-[#00D26A]'} />
              <span>{isTesting ? 'Playing Voice...' : 'Test Speaker (₹1,250)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D26A] to-[#1A6BFF] hover:from-[#00B25A] hover:to-[#1558D6] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,210,106,0.3)] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
