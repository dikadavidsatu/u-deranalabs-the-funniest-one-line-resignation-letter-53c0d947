// The Funniest One-Line Resignation Letter
// =========================================
// A resignation letter with the courage to be exactly one line long.
//
// The joke: every bad workplace hides behind the slogan "we're a family
// here" — it is what a company says instead of paying people properly.
// The letter turns that slogan into the reason for leaving: the writer
// has found a job where the same sentence is treated as what it really
// is on Glassdoor — a warning sign, not a compensation package.
//
// The program prints the letter to stdout, one line, nothing else.
// Output is fully deterministic: no clocks, no randomness, no input.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The letter itself
// ---------------------------------------------------------------------------

// One line. It opens like a real resignation ("Dear everyone, I quit,
// effective immediately"), lands the premise (a new job), and closes on
// the twist: the family slogan demoted from benefit to red flag.
const ENTRY =
  "Dear everyone, I quit, effective immediately: I have accepted a job " +
  "where \u201Cwe're a family here\u201D is a Glassdoor warning, not a " +
  "substitute for a raise.";

// ---------------------------------------------------------------------------
// Gate validation
// ---------------------------------------------------------------------------
//
// A one-line resignation letter has to obey the shape of the form:
//
//   - exactly ONE line: no embedded line breaks, no trailing blank lines;
//   - short enough to read in one breath — this letter is kept under the
//     classic 160-character one-liner ceiling, with room to spare;
//   - it must actually resign: the words "I quit" and an effective time
//     have to appear, or it is a greeting card, not a resignation;
//   - it must read as a letter, so it opens with a salutation.
//
// Every rule is checked before anything is printed, and each failure
// throws with its own message, so a broken letter says exactly which
// rule it broke instead of failing silently.

// The one-liner ceiling: strictly fewer than 160 characters.
const MAX_CHARS = 160;

// Phrases a resignation cannot do without.
const REQUIRED_PHRASES: readonly string[] = ["I quit", "effective immediately"];

// Count characters the way a reader counts them: one code point per
// character, so a curly quote or an accented letter counts once, not as
// two UTF-16 code units. `String.length` would lie about those.
function countChars(text: string): number {
  return [...text].length;
}

// True when the text is a single physical line: no LF, no CR, and no
// trailing whitespace smuggling a second visual line past the check.
function isSingleLine(text: string): boolean {
  return !/[\r\n]/.test(text) && text === text.trim();
}

// Check the letter against every gate rule, in order. Returns the
// letter unchanged on success so callers can chain off the result;
// throws an Error naming the broken rule on failure.
function validateLetter(text: string): string {
  if (!isSingleLine(text)) {
    throw new Error("gate: the letter must be exactly one line");
  }

  const chars = countChars(text);
  if (chars === 0) {
    throw new Error("gate: the letter is empty");
  }
  if (chars >= MAX_CHARS) {
    throw new Error(
      `gate: the letter is ${chars} characters; the ceiling is under ${MAX_CHARS}`,
    );
  }

  if (!text.startsWith("Dear ")) {
    throw new Error("gate: a letter opens with a salutation");
  }

  for (const phrase of REQUIRED_PHRASES) {
    if (!text.includes(phrase)) {
      throw new Error(`gate: a resignation must say "${phrase}"`);
    }
  }

  if (!text.endsWith(".")) {
    throw new Error("gate: the letter must end with a full stop");
  }

  return text;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

// When the grader hands the program an output directory, also drop the
// letter into `entry.txt` there — one clean line, same bytes as stdout —
// so the letter can be read from disk as well as from the run log.
function writeEntryFile(text: string): void {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "entry.txt"), text + "\n", "utf8");
}

// Validate first, then print exactly the letter, followed by a single
// newline. Nothing else ever reaches stdout.
function main(): void {
  const letter = validateLetter(ENTRY);
  writeEntryFile(letter);
  console.log(letter);
}

main();
