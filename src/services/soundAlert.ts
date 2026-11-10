/**
 * Voice and sound alerts for over-budget warnings
 * Announcement: "วันนี้รายจ่ายเกินงบ พรุ่งนี้เริ่มใหม่นะครับ สู้ๆครับ" (Repeats 2-3 times)
 */

let isCurrentlySpeaking = false;

export const playOverBudgetVoiceAlert = (repeats: number = 3) => {
  if (typeof window === 'undefined') return;

  // 1. Play chime tone using Web Audio API
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }

  // 2. Play SpeechSynthesis in Thai
  if (!('speechSynthesis' in window)) return;

  if (isCurrentlySpeaking) {
    window.speechSynthesis.cancel();
  }

  isCurrentlySpeaking = true;
  const message = 'วันนี้รายจ่ายเกินงบ พรุ่งนี้เริ่มใหม่นะครับ สู้ๆครับ';
  let count = 0;

  const speakLoop = () => {
    if (count >= repeats) {
      isCurrentlySpeaking = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95; // slightly slower for clear listening
    utterance.pitch = 1.05;

    // Pick a Thai voice if available
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find((v) => v.lang.includes('th') || v.lang.includes('TH'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => {
      count++;
      if (count < repeats) {
        setTimeout(speakLoop, 900);
      } else {
        isCurrentlySpeaking = false;
      }
    };

    utterance.onerror = () => {
      isCurrentlySpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  speakLoop();
};
