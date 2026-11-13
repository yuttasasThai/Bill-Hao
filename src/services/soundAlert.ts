/**
 * Bulletproof Voice & Chime Alert Service for Over-Budget Warnings
 *
 * Supported Announcements:
 * 1. Daily Over Budget: "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 * 2. Monthly Over Budget: "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 *
 * Architecture:
 * - Primary Engine: 100% Offline Embedded High-Fidelity Thai MP3 Data URIs (no external network, no Referer 404, no CORS).
 * - Synchronous Start: Round 1 plays synchronously inside the user gesture (click/submit) to guarantee playback on iOS Safari, Android Chrome, and LINE WebView.
 * - Chime: Web Audio API melodic notification chime played cleanly alongside voice.
 * - Fallback Engine: Web Speech API (th-TH) if HTMLAudioElement is ever unavailable.
 */

import { DAILY_OVER_BUDGET_AUDIO, MONTHLY_OVER_BUDGET_AUDIO } from './voiceAssets';

let sharedAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let persistentAudioPlayer: HTMLAudioElement | null = null;
let isAudioUnlocked = false;
let isCurrentlyPlayingVoice = false;
let repeatTimeoutId: ReturnType<typeof setTimeout> | null = null;

export type AlertType = 'daily' | 'monthly';
export type AlertListener = (info: { type: AlertType; message: string } | null) => void;
const alertListeners = new Set<AlertListener>();

export const subscribeVoiceAlertBanner = (listener: AlertListener): (() => void) => {
  alertListeners.add(listener);
  return () => {
    alertListeners.delete(listener);
  };
};

const notifyAlertListeners = (info: { type: AlertType; message: string } | null) => {
  alertListeners.forEach((fn) => {
    try {
      fn(info);
    } catch {
      // Non-fatal
    }
  });
};

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

const getPersistentPlayer = (): HTMLAudioElement | null => {
  if (typeof window === 'undefined') return null;
  if (!persistentAudioPlayer) {
    persistentAudioPlayer = new Audio();
    persistentAudioPlayer.preload = 'auto';
  }
  return persistentAudioPlayer;
};

// 2. Universal Audio Session Unlocker for Mobile Browsers (iOS Safari / Android Chrome / LINE)
export const unlockAudioSession = () => {
  if (isAudioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }

    // Only prime the persistent player if it is NOT actively playing a real alert
    if (!isCurrentlyPlayingVoice) {
      const player = getPersistentPlayer();
      if (player) {
        player.src =
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        player.volume = 0.01;
        player
          .play()
          .then(() => {
            player.pause();
            player.volume = 1.0;
            isAudioUnlocked = true;
          })
          .catch(() => {
            // Will unlock on the next real user click
          });
      }
    }
  } catch {
    // Non-fatal
  }
};

// Auto-register touch/click listeners to unlock audio seamlessly on first interaction
if (typeof window !== 'undefined') {
  const onUserInteraction = () => {
    unlockAudioSession();
  };
  window.addEventListener('click', onUserInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', onUserInteraction, { passive: true, once: true });
  window.addEventListener('keydown', onUserInteraction, { passive: true, once: true });

  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

/**
 * Play a crisp 2-tone attention chime using Web Audio API (plays in first 200ms)
 */
export const playAttentionChime = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // 2 Bright Chime Notes: A5 (880Hz) -> C#6 (1108.73Hz)
    const notes = [880.0, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.24);
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
    window.speechSynthesis.resume();
  } catch {}

  let count = 0;

  const speakOnce = () => {
    if (count >= repeats) {
      isCurrentlyPlayingVoice = false;
      return;
    }

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
        setTimeout(speakOnce, 600);
      } else {
        isCurrentlyPlayingVoice = false;
      }
    };

    utterance.onerror = () => {
      isCurrentlyPlayingVoice = false;
    };

    (window as unknown as { __activeUtterance?: SpeechSynthesisUtterance | null }).__activeUtterance =
      utterance;

    window.speechSynthesis.speak(utterance);
  };

  speakOnce();
};

/**
 * Core Player: Plays embedded offline Thai MP3 synchronously inside user gesture
 */
const playEmbeddedThaiVoice = (
  audioDataUri: string,
  fallbackText: string,
  type: AlertType,
  repeats: number = 2
) => {
  if (typeof window === 'undefined') return;

  // Notify visual toast banner listeners
  notifyAlertListeners({ type, message: fallbackText });
  setTimeout(() => {
    notifyAlertListeners(null);
  }, 7500);

  // Clear any pending repeat timer
  if (repeatTimeoutId) {
    clearTimeout(repeatTimeoutId);
    repeatTimeoutId = null;
  }

  // Play crisp Web Audio notification chime
  playAttentionChime();

  const player = getPersistentPlayer();
  if (!player) {
    speakWithSpeechSynthesis(fallbackText, repeats);
    return;
  }

  let playCount = 0;
  isCurrentlyPlayingVoice = true;

  // Stop previous playback cleanly
  try {
    player.pause();
  } catch {}

  player.src = audioDataUri;
  player.volume = 1.0;
  player.currentTime = 0;

  player.onended = () => {
    playCount++;
    if (playCount < repeats) {
      repeatTimeoutId = setTimeout(() => {
        try {
          player.currentTime = 0;
          player.volume = 1.0;
          player.play().catch(() => {
            isCurrentlyPlayingVoice = false;
          });
        } catch {
          isCurrentlyPlayingVoice = false;
        }
      }, 450);
    } else {
      isCurrentlyPlayingVoice = false;
    }
  };

  player.onerror = () => {
    isCurrentlyPlayingVoice = false;
    speakWithSpeechSynthesis(fallbackText, Math.max(1, repeats - playCount));
  };

  // Call .play() SYNCHRONOUSLY inside the user's click/submit call stack!
  try {
    const playPromise = player.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Fallback to Web Speech API if HTMLAudioElement is blocked
        speakWithSpeechSynthesis(fallbackText, repeats);
      });
    }
  } catch {
    speakWithSpeechSynthesis(fallbackText, repeats);
  }
};

/**
 * Daily Over Budget Alert:
 * "วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ"
 */
export const playDailyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'วันนี้คุณใช้จ่ายเกินตามที่ตั้งไว้ พรุ่งนี้เริ่มต้นใหม่นะครับ สู้ๆนะครับ';
  playEmbeddedThaiVoice(DAILY_OVER_BUDGET_AUDIO, message, 'daily', repeats);
};

/**
 * Monthly Over Budget Alert:
 * "เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ"
 */
export const playMonthlyOverBudgetVoiceAlert = (repeats: number = 2) => {
  const message = 'เดือนนี้ค่าใช้จ่ายประจำเดือนเกิน เดือนหน้าเริ่มต้นใหม่นะครับสู้ๆครับ';
  playEmbeddedThaiVoice(MONTHLY_OVER_BUDGET_AUDIO, message, 'monthly', repeats);
};

/**
 * Backward compatibility alias
 */
export const playOverBudgetVoiceAlert = (repeats: number = 2) => {
  playDailyOverBudgetVoiceAlert(repeats);
};
