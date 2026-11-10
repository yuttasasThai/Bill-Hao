/**
 * Enhanced Voice and Chime Alert Service for Over-Budget Warnings
 *
 * Supported Announcements:
 * 1. Daily Over Budget: "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 * 2. Monthly Over Budget: "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 */

let sharedAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null;

// Initialize and unlock AudioContext on modern mobile browsers
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
  } catch {
    // Non-fatal
  }
  return sharedAudioCtx;
};

// Preload voices cache
if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }

  // Auto unlock on first user gesture (touch or click)
  const unlockAudio = () => {
    getAudioContext();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true, once: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
}

/**
 * Play a clear, melodic 3-tone attention chime using Web Audio API
 */
export const playAttentionChime = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // 3 Ascending Notes: F5 (698Hz) -> A5 (880Hz) -> C6 (1046Hz)
    const notes = [698.46, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.36);
    });
  } catch {
    // Non-fatal
  }
};

/**
 * Speak a Thai message using Web Speech API with retry loop
 */
const speakThaiMessage = (message: string, repeats: number = 2) => {
  if (typeof window === 'undefined') return;

  // Always play attention chime first
  playAttentionChime();

  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch {
    // Non-fatal
  }

  let count = 0;

  const speakOnce = () => {
    if (count >= repeats) {
      activeUtterance = null;
      return;
    }

    try {
      window.speechSynthesis.resume();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95; // Clear natural Thai pace
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick a Thai voice if available
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(
      (v) =>
        v.lang === 'th-TH' ||
        v.lang === 'th_TH' ||
        v.lang.toLowerCase().includes('th') ||
        v.name.toLowerCase().includes('thai')
    );

    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => {
      count++;
      if (count < repeats) {
        setTimeout(speakOnce, 800);
      } else {
        activeUtterance = null;
      }
    };

    utterance.onerror = () => {
      activeUtterance = null;
    };

    // Keep global reference to prevent JavaScript garbage collection from silencing the audio
    activeUtterance = utterance;
    (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance | null }).__activeUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  };

  // Give 180ms delay after chime tone before speech begins
  setTimeout(speakOnce, 180);
};

/**
 * Daily Over Budget Alert:
 * "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 */
export const playDailyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ';
  speakThaiMessage(message, repeats);
};

/**
 * Monthly Over Budget Alert:
 * "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 */
export const playMonthlyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ';
  speakThaiMessage(message, repeats);
};

/**
 * Backward compatibility alias
 */
export const playOverBudgetVoiceAlert = (repeats: number = 2) => {
  playDailyOverBudgetVoiceAlert(repeats);
};
