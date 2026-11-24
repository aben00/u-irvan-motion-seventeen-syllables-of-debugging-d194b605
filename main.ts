// Seventeen Syllables of Debugging — u-irvan-motion-seventeen-syllables-of-debugging-d194b605
// Node 22, standard library only. Writes one haiku about debugging — three
// lines in the 5-7-5 syllable shape, at most 200 characters — to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR). Deterministic: the haiku is a
// constant, and the program self-checks it against the gate before writing —
// three lines, 5-7-5 syllables, <= 200 chars, not only whitespace — then
// reads the file back and verifies it byte-for-byte. No clock, no randomness,
// no network, so two runs write byte-identical output.
//
// The haiku:
//   I set the breakpoint            (5: I-set-the-break-point)
//   the bug strolls right on past it (7: the-bug-strolls-right-on-past-it)
//   wearing my own name            (5: wear-ing-my-own-name)
// Concrete centre: a breakpoint the bug walks straight past. Turn: the last
// line reframes the bug — it wears my own name, so the fault is mine.
//
// Run outside the grader's container with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HAIKU = [
  'I set the breakpoint',
  'the bug strolls right on past it',
  'wearing my own name',
].join('\n');

// Syllable counts for every word in the haiku, counted by hand. The
// generic fallback below only ever runs for a word not in this table.
const SYLLABLES = {
  i: 1,
  set: 1,
  the: 1,
  breakpoint: 2,
  bug: 1,
  strolls: 1,
  right: 1,
  on: 1,
  past: 1,
  it: 1,
  wearing: 2,
  my: 1,
  own: 1,
  name: 1,
};

function countSyllables(word) {
  const lower = word.toLowerCase();
  if (lower in SYLLABLES) return SYLLABLES[lower];
  // Fallback: count vowel groups, never used for this haiku's words.
  const groups = lower.replace(/[^aeiouy]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  return Math.max(1, groups.length);
}

function checkGate(text) {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`gate: length ${text.length} not in 1..200`);
  }
  if (text.trim().length === 0) {
    throw new Error('gate: text is only whitespace');
  }
  const lines = text.split('\n');
  if (lines.length !== 3) {
    throw new Error(`gate: expected 3 lines, got ${lines.length}`);
  }
  const expected = [5, 7, 5];
  lines.forEach((line, i) => {
    if (line.trim().length === 0) {
      throw new Error(`gate: line ${i + 1} is blank`);
    }
    if (line !== line.trim()) {
      throw new Error(`gate: line ${i + 1} has leading/trailing space`);
    }
    const count = line
      .split(/\s+/)
      .reduce((sum, word) => sum + countSyllables(word), 0);
    if (count !== expected[i]) {
      throw new Error(
        `gate: line ${i + 1} has ${count} syllables, expected ${expected[i]}`,
      );
    }
  });
}

checkGate(HAIKU);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'entry.txt');
writeFileSync(outPath, HAIKU, 'utf8');
// Read the file back and verify it byte-for-byte, so a silent write
// failure can never pass as a good entry.
if (readFileSync(outPath, 'utf8') !== HAIKU) {
  throw new Error('gate: written entry.txt does not match the haiku');
}
