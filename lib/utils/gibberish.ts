/**
 * Lightweight gibberish detection for AI input validation.
 * Prevents wasting AI credits on nonsensical text.
 */

// ~120 of the most common English words — covers ~50% of typical text
const COMMON_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "has", "had",
  "was", "were", "been", "are", "is", "am", "did", "does", "done",
  // Resume-specific common words
  "managed", "developed", "led", "created", "implemented", "designed",
  "built", "improved", "delivered", "team", "project", "system", "data",
  "business", "company", "experience", "skills", "professional", "results",
  "responsible", "support", "service", "management", "development",
  "software", "engineer", "analyst", "manager", "director", "senior",
]);

// Common English bigrams — appear frequently in real words
const COMMON_BIGRAMS = new Set([
  "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd",
  "ti", "es", "or", "te", "of", "ed", "is", "it", "al", "ar",
  "st", "to", "nt", "ng", "se", "ha", "as", "ou", "io", "le",
  "ve", "co", "me", "de", "hi", "ri", "ro", "ic", "ne", "ea",
  "ra", "ce", "li", "ch", "ll", "be", "ma", "si", "om", "ur",
]);

/**
 * Checks if a word looks like plausible English using bigram frequency.
 */
function looksLikeRealWord(word: string): boolean {
  if (word.length <= 1) return false;
  // Short words (2-3 chars) must be in the dictionary — too short for heuristics
  if (word.length <= 3) return false;
  // Check vowel presence — real English words have vowels
  if (!/[aeiouy]/.test(word)) return false;
  // Check vowel ratio — reject extreme values
  const vowels = (word.match(/[aeiouy]/g) || []).length;
  const ratio = vowels / word.length;
  if (ratio < 0.15 || ratio > 0.8) return false;
  // Check for common English bigrams
  let bigramHits = 0;
  for (let i = 0; i < word.length - 1; i++) {
    if (COMMON_BIGRAMS.has(word.slice(i, i + 2))) bigramHits++;
  }
  const bigramRatio = bigramHits / (word.length - 1);
  return bigramRatio >= 0.35;
}

/**
 * Returns the fraction of words (0–1) that appear to be real English.
 * Checks against common words + bigram heuristic for unknown words.
 */
function realWordRatio(text: string): number {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (words.length === 0) return 0;

  let realCount = 0;
  for (const word of words) {
    if (COMMON_WORDS.has(word) || looksLikeRealWord(word)) {
      realCount++;
    }
  }

  return realCount / words.length;
}

/**
 * Checks whether input text is likely gibberish.
 * Returns null if text looks valid, or an error message if it looks like nonsense.
 *
 * @param text - The text to check
 * @param minWords - Minimum words required (default: 3)
 */
export function detectGibberish(text: string, minWords = 3): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null; // Empty text is handled elsewhere

  const words = trimmed.split(/\s+/);
  if (words.length < minWords) return null; // Too short to judge — let other validation handle it

  const ratio = realWordRatio(trimmed);

  if (ratio < 0.3) {
    return "Your text doesn't appear to contain meaningful content. Please write a real description before using AI.";
  }

  return null;
}
