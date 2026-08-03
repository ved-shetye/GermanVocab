// Utility functions for DeutschVocab Game Engine

/**
 * Normalizes text by removing extra spaces, converting to lowercase, 
 * stripping punctuation and optional articles.
 */
export function normalizeText(text) {
  if (!text) return "";
  let str = text.toLowerCase().trim();
  
  // Remove parenthetical notes e.g. "time (hour)" -> "time"
  str = str.replace(/\([^)]*\)/g, "").trim();
  
  // Replace multiple spaces
  str = str.replace(/\s+/g, " ");
  
  return str;
}

/**
 * Parses potential translation variants from string like "to become, get" or "big / large"
 */
export function getTranslationVariants(translationString) {
  if (!translationString) return [];
  
  // Clean string parenthetical remarks
  let cleanStr = translationString.replace(/\([^)]*\)/g, " ");
  
  // Split by comma, slash, semicolon, or " or "
  let parts = cleanStr.split(/[,/;\n]|\bor\b/gi).map(s => s.trim()).filter(Boolean);
  
  let set = new Set();
  
  parts.forEach(part => {
    let normalized = normalizeText(part);
    if (normalized) {
      set.add(normalized);
      
      // Strip common English infinitives ("to be" -> "be")
      if (normalized.startsWith("to ")) {
        set.add(normalized.replace(/^to\s+/, ""));
      }
      
      // Strip German articles ("das jahr" -> "jahr", "der mann" -> "mann", "die frau" -> "frau")
      if (/^(das|der|die)\s+/.test(normalized)) {
        set.add(normalized.replace(/^(das|der|die)\s+/, ""));
      }
    }
  });
  
  // Also add full normalized string
  let fullNorm = normalizeText(translationString);
  if (fullNorm) set.add(fullNorm);
  
  return Array.from(set);
}

/**
 * Validates whether user answer matches target answer (supports multiple meanings)
 */
export function checkAnswer(userAnswer, targetAnswer) {
  if (!userAnswer || !targetAnswer) return false;
  
  let normUser = normalizeText(userAnswer);
  
  // Strip article prefixes for flexible matching
  let userStripped = normUser.replace(/^(to|das|der|die|a|an|the)\s+/, "").trim();
  
  let variants = getTranslationVariants(targetAnswer);
  
  for (let v of variants) {
    if (normUser === v || userStripped === v) return true;
    
    // Umlaut fallback check (e.g., 'ae' -> 'ä', 'oe' -> 'ö', 'ue' -> 'ü', 'ss' -> 'ß')
    let deUmlautUser = userStripped
      .replace(/ae/g, "ä")
      .replace(/oe/g, "ö")
      .replace(/ue/g, "ü")
      .replace(/ss/g, "ß");
    if (deUmlautUser === v) return true;
    
    let deUmlautVar = v
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss");
    if (userStripped === deUmlautVar) return true;
  }
  
  return false;
}

/**
 * Web Audio API Sound Effects Synthesizer (No external asset dependency)
 */
class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Arpeggio sound: E5 -> G#5 -> B5
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.setValueAtTime(830.61, now + 0.08);
      osc1.frequency.setValueAtTime(987.77, now + 0.16);

      osc2.frequency.setValueAtTime(329.63, now);
      osc2.frequency.setValueAtTime(415.30, now + 0.08);
      osc2.frequency.setValueAtTime(493.88, now + 0.16);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }

  playIncorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }

  playStreak() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }
}

export const sfx = new SoundEffectsManager();

/**
 * Text-To-Speech Pronunciation Helper for German words
 */
export function speakGerman(text) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9;
  
  // Find German voice if available
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.startsWith('de') || v.lang.includes('DE'));
  if (deVoice) {
    utterance.voice = deVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Shuffles array in place (Fisher-Yates)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
