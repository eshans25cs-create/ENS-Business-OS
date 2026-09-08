export type VoiceLanguage = 'en-IN' | 'hi-IN' | 'kn-IN' | 'ta-IN' | 'te-IN';

export interface SoundboxSettings {
  enabled: boolean;
  language: VoiceLanguage;
  volume: number; // 0.0 to 1.0
  chime: boolean;
}

const STORAGE_KEY = 'ens_soundbox_settings';

export const DEFAULT_SOUNDBOX_SETTINGS: SoundboxSettings = {
  enabled: true,
  language: 'en-IN',
  volume: 1.0,
  chime: true,
};

export const getSoundboxSettings = (): SoundboxSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SOUNDBOX_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading soundbox settings:', e);
  }
  return DEFAULT_SOUNDBOX_SETTINGS;
};

export const saveSoundboxSettings = (settings: Partial<SoundboxSettings>): SoundboxSettings => {
  const current = getSoundboxSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving soundbox settings:', e);
  }
  return updated;
};

// Unlock browser Web Audio on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
}

/**
 * Plays a crisp cash-register chime using Web Audio API.
 * Automatically resumes suspended AudioContext to bypass modern browser autoplay restrictions.
 */
export const playPaymentChime = async (volume = 1.0): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        resolve();
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const vol = Math.max(0.1, Math.min(1.0, volume));

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3 * vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880Hz) - Cash receipt chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.35 * vol, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);

      setTimeout(() => {
        try { ctx.close(); } catch {}
        resolve();
      }, 500);
    } catch {
      resolve();
    }
  });
};

/**
 * Converts speech text based on selected language and payment amount
 */
export const getSpeechText = (amount: number, language: VoiceLanguage): string => {
  const rounded = Math.round(amount);
  switch (language) {
    case 'hi-IN':
      return `ई एन एस पे पर ${rounded} रुपये प्राप्त हुए।`;
    case 'kn-IN':
      return `ಇ ಎನ್ ಎಸ್ ಪೇ ನಲ್ಲಿ ${rounded} ರೂಪಾಯಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ।`;
    case 'ta-IN':
      return `இ என் எஸ் பேயில் ${rounded} ரூபாய் பெறப்பட்டது।`;
    case 'te-IN':
      return `ఈ ఎన్ ఎస్ పే లో ${rounded} రూపాయలు అందాయి।`;
    case 'en-IN':
    default:
      return `Payment of Rupees ${rounded} received successfully on ENS Pay.`;
  }
};

/**
 * Speaks out the payment announcement using Web Speech Synthesis API.
 * Fixed for Chrome/Edge:
 * 1. Resumes speech synthesis if paused
 * 2. Fallbacks gracefully if Indian voice is not installed on the OS
 * 3. Prevents V8 garbage collection dropping utterances mid-sentence
 */
export const announcePaymentReceived = async (amount: number, customSettings?: Partial<SoundboxSettings>): Promise<void> => {
  const settings = { ...getSoundboxSettings(), ...customSettings };
  
  if (!settings.enabled) {
    return;
  }

  // 1. Play melodic chime first
  if (settings.chime) {
    try {
      await playPaymentChime(settings.volume);
    } catch (e) {
      console.warn('Chime play error:', e);
    }
  }

  // 2. Text-to-Speech
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const phrase = getSpeechText(amount, settings.language);
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.volume = Math.max(0.3, Math.min(1.0, settings.volume));
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Pick best available voice or fallback to default
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').includes(settings.language.toLowerCase())) ||
                         voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    // Retain global reference so Chrome garbage collector does not terminate audio mid-speech
    (window as any).__ensCurrentSpeech = utterance;
    utterance.onend = () => {
      (window as any).__ensCurrentSpeech = null;
    };
    utterance.onerror = () => {
      (window as any).__ensCurrentSpeech = null;
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 80);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
};
