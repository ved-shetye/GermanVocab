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
 * Strips punctuation characters (commas, apostrophes, hyphens, etc.) and extra spaces
 */
export function cleanPunctuation(str) {
  if (!str) return "";
  return str.replace(/['",\-!?:;./]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;
  if (Math.abs(lenA - lenB) > 2) return Math.abs(lenA - lenB);

  let prevRow = Array.from({ length: lenB + 1 }, (_, i) => i);
  let currRow = new Array(lenB + 1);

  for (let i = 1; i <= lenA; i++) {
    currRow[0] = i;
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,       // deletion
        currRow[j - 1] + 1,   // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    for (let j = 0; j <= lenB; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return prevRow[lenB];
}

/**
 * Validates whether user answer matches target answer (supports multiple meanings,
 * punctuation tolerance like missing commas/apostrophes, and 1-letter typo allowance).
 */
export function checkAnswer(userAnswer, targetAnswer) {
  if (!userAnswer || !targetAnswer) return false;
  
  let normUser = normalizeText(userAnswer);
  let userPunctClean = cleanPunctuation(normUser);

  // Strip article prefixes for flexible matching
  let userStripped = normUser.replace(/^(to|das|der|die|a|an|the)\s+/, "").trim();
  let userStrippedClean = cleanPunctuation(userStripped);
  
  let variants = getTranslationVariants(targetAnswer);
  
  for (let v of variants) {
    let normV = normalizeText(v);
    let vPunctClean = cleanPunctuation(normV);

    // 1. Exact or Punctuation-insensitive match (missing comma, apostrophe, hyphen, quotes)
    if (
      normUser === normV || 
      userPunctClean === vPunctClean || 
      userStripped === normV || 
      userStrippedClean === vPunctClean
    ) {
      return true;
    }
    
    // 2. Umlaut fallback checks (e.g., 'ae' -> 'ä', 'oe' -> 'ö', 'ue' -> 'ü', 'ss' -> 'ß')
    const deUmlautUser = userStrippedClean
      .replace(/ae/g, "ä")
      .replace(/oe/g, "ö")
      .replace(/ue/g, "ü")
      .replace(/ss/g, "ß");

    const deUmlautVar = vPunctClean
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss");

    if (deUmlautUser === vPunctClean || userStrippedClean === deUmlautVar) {
      return true;
    }

    // 3. Minor Spelling Mistake Tolerance (1 letter typo / edit distance <= 1)
    // Only applied if target variant length >= 3 to prevent over-matching short words
    if (vPunctClean.length >= 3) {
      const dist1 = levenshteinDistance(userPunctClean, vPunctClean);
      const dist2 = levenshteinDistance(userStrippedClean, vPunctClean);
      const distUmlaut = levenshteinDistance(deUmlautUser, vPunctClean);

      if (dist1 <= 1 || dist2 <= 1 || distUmlaut <= 1) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Generates an accurate, multi-part hint containing:
 * 1. A riddle-style clue sentence
 * 2. Masked word pattern (e.g. h _ _ _ e)
 * 3. Word count (if phrase > 1 word)
 * 4. Number of possible/accepted answers
 * 5. Article & Gender info (for German nouns)
 */
export function generateDetailedHint(card, targetAnswer, isGermanQuestion) {
  if (!targetAnswer) return null;

  // Clean target string (remove parenthetical context like "(with a verb)")
  const cleanTargetFull = targetAnswer.replace(/\([^)]*\)/g, "").trim();

  // Extract distinct listed translation alternatives
  const listedMeanings = cleanTargetFull
    .split(/[,/;\n]|\bor\b/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  // All accepted variants computed by answer engine
  const variants = getTranslationVariants(targetAnswer);
  
  // Count of distinct possible answer options
  const possibleAnswersCount = Math.max(listedMeanings.length, 1);

  // Select primary answer for hint clues
  let primaryAnswer = listedMeanings[0] || cleanTargetFull;
  primaryAnswer = primaryAnswer.replace(/\s+/g, " ").trim();

  // Split into words
  const words = primaryAnswer.split(" ").filter(Boolean);
  const wordCount = words.length;
  const isMultiWord = wordCount > 1;

  // Article / Gender check for German target answers (EN to DE direction)
  let articleInfo = null;
  let nounCoreWord = primaryAnswer;
  
  if (!isGermanQuestion) {
    const artMatch = primaryAnswer.match(/^(der|die|das)\s+(.+)$/i);
    if (artMatch) {
      const art = artMatch[1].toLowerCase();
      nounCoreWord = artMatch[2];
      const genderMap = {
        der: 'Masculine (der)',
        die: 'Feminine (die)',
        das: 'Neuter (das)'
      };
      articleInfo = {
        article: art,
        label: genderMap[art] || `Article (${art})`
      };
    }
  }

  // Generate Masked Word Pattern (e.g. h _ _ _ e or d i e   F _ a u)
  const createWordMask = (w) => {
    const cleanW = w.replace(/[^a-zA-ZäöüßÄÖÜ]/g, "");
    if (['der', 'die', 'das', 'to', 'a', 'an', 'the'].includes(w.toLowerCase())) {
      return w; // Keep common lead articles explicit
    }
    if (cleanW.length <= 2) {
      return w.charAt(0) + '_'.repeat(Math.max(w.length - 1, 1));
    }
    if (cleanW.length === 3) {
      return w.charAt(0) + '_' + w.charAt(w.length - 1);
    }
    return w.charAt(0) + ' ' + '_ '.repeat(w.length - 2) + w.charAt(w.length - 1);
  };

  const maskedWord = words.map(createWordMask).join('   ');

  // Letter count of core letters (excluding spaces/punctuation)
  const coreCleanLetters = nounCoreWord.replace(/[^a-zA-ZäöüßÄÖÜ]/g, "");
  const letterCount = coreCleanLetters.length;
  const firstLetter = coreCleanLetters.length > 0 ? coreCleanLetters.charAt(0).toUpperCase() : '?';
  const lastLetter = coreCleanLetters.length > 0 ? coreCleanLetters.slice(-1).toUpperCase() : '?';

  // Category label
  const categoryName = card?.category ? card.category.toLowerCase() : 'word';
  const targetLangLabel = isGermanQuestion ? 'English' : 'German';

  // Riddle sentence generation
  let riddle = '';
  if (articleInfo) {
    riddle = `I am a German ${categoryName} that takes the ${articleInfo.label} article! My core noun starts with '${firstLetter}' and ends with '${lastLetter}' (${letterCount} letters).`;
  } else if (isMultiWord) {
    riddle = `I am a ${wordCount}-word ${targetLangLabel} ${categoryName} phrase. My first word starts with '${firstLetter}' and my phrase finishes with '${lastLetter}' (${letterCount} total letters).`;
  } else {
    riddle = `I am a ${letterCount}-letter ${targetLangLabel} ${categoryName}. I start with '${firstLetter}' and finish with '${lastLetter}'. What word am I?`;
  }

  return {
    primaryAnswer,
    wordCount,
    isMultiWord,
    possibleAnswersCount,
    articleInfo,
    letterCount,
    firstLetter,
    lastLetter,
    maskedWord,
    riddle
  };
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
