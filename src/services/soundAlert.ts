/**
 * Bulletproof Voice and Chime Alert Service for Over-Budget Warnings
 *
 * Supported Announcements:
 * 1. Daily Over Budget: "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 * 2. Monthly Over Budget: "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 *
 * Features:
 * - Dual Engine: High-fidelity natural Thai audio stream (HTML5 Audio) + Web Speech API fallback.
 * - Melodic 3-tone chime (Web Audio API) played before voice announcement.
 * - Global Audio Session Unlocker for iOS Safari, Android Chrome, and LINE / Facebook WebViews.
 * - Repetition support with natural pauses.
 */

let sharedAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentAudioElement: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

// 1. Initialize and unlock Web Audio AudioContext
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

// 2. Universal Audio Session Unlocker for Mobile Browsers
export const unlockAudioSession = () => {
  if (isAudioUnlocked) return;
  try {
    // A) Resume Web Audio
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // B) Unlock SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }

    // C) Prime HTML5 Audio with a 1-sample silent data URI
    const silentAudio = new Audio(
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
    );
    silentAudio.volume = 0.01;
    silentAudio
      .play()
      .then(() => {
        isAudioUnlocked = true;
      })
      .catch(() => {
        // Handled silently
      });
  } catch {
    // Non-fatal
  }
};

// Auto-register touch/click listeners to unlock audio seamlessly on first interaction
if (typeof window !== 'undefined') {
  const onUserInteraction = () => {
    unlockAudioSession();
    window.removeEventListener('click', onUserInteraction);
    window.removeEventListener('touchstart', onUserInteraction);
    window.removeEventListener('keydown', onUserInteraction);
  };
  window.addEventListener('click', onUserInteraction, { passive: true });
  window.addEventListener('touchstart', onUserInteraction, { passive: true });
  window.addEventListener('keydown', onUserInteraction, { passive: true });

  // Preload speech synthesis voices cache
  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

/**
 * Play a clear, melodic 3-tone attention chime using Web Audio API
 */
export const playAttentionChime = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // 3 Ascending Notes: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.5Hz)
    const notes = [698.46, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.12 + 0.02);
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
 * Fallback Engine: Web Speech API (speechSynthesis)
 */
const speakWithSpeechSynthesis = (message: string, repeats: number = 2) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch {}

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
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

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
        setTimeout(speakOnce, 700);
      } else {
        activeUtterance = null;
      }
    };

    utterance.onerror = () => {
      activeUtterance = null;
    };

    activeUtterance = utterance;
    (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance | null }).__activeUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  };

  speakOnce();
};

/**
 * Primary Voice Engine: Natural High-Fidelity Thai Voice Stream
 * Uses HTML5 Audio with fallback to Web Speech API
 */
export const playThaiVoiceWithRepeats = (message: string, repeats: number = 2) => {
  if (typeof window === 'undefined') return;

  unlockAudioSession();
  playAttentionChime();

  // Stop any previously playing audio
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {}
    currentAudioElement = null;
  }

  // URL for crystal-clear natural Thai human voice
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=${encodeURIComponent(
    message
  )}`;

  let playCount = 0;

  const playStreamOnce = () => {
    if (playCount >= repeats) {
      currentAudioElement = null;
      return;
    }

    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    currentAudioElement = audio;

    audio.onended = () => {
      playCount++;
      if (playCount < repeats) {
        setTimeout(playStreamOnce, 650);
      } else {
        currentAudioElement = null;
      }
    };

    audio.onerror = () => {
      // Fallback to speech synthesis if network or stream fails
      speakWithSpeechSynthesis(message, repeats - playCount);
    };

    audio.play().catch(() => {
      // If HTML5 Audio was blocked by autoplay policy, fallback to Web Speech API
      speakWithSpeechSynthesis(message, repeats - playCount);
    });
  };

  // Small delay after chime before speech begins
  setTimeout(playStreamOnce, 220);
};

/**
 * Daily Over Budget Alert:
 * "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 */
export const playDailyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ';
  playThaiVoiceWithRepeats(message, repeats);
};

/**
 * Monthly Over Budget Alert:
 * "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 */
export const playMonthlyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ';
  playThaiVoiceWithRepeats(message, repeats);
};

/**
 * Backward compatibility alias
 */
export const playOverBudgetVoiceAlert = (repeats: number = 2) => {
  playDailyOverBudgetVoiceAlert(repeats);
};
