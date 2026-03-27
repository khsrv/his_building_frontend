/**
 * #16 fix: Validates that all i18n dictionaries have the same keys.
 *
 * Run: npx tsx scripts/check-i18n.ts
 * Or add to package.json: "check:i18n": "tsx scripts/check-i18n.ts"
 */

import { enDictionary } from "../src/shared/i18n/dictionaries/en";
import { ruDictionary } from "../src/shared/i18n/dictionaries/ru";
import { tgDictionary } from "../src/shared/i18n/dictionaries/tg";
import { uzDictionary } from "../src/shared/i18n/dictionaries/uz";

const dictionaries: Record<string, Record<string, string>> = {
  en: enDictionary,
  ru: ruDictionary,
  tg: tgDictionary,
  uz: uzDictionary,
};

const reference = "en";
const referenceKeys = new Set(Object.keys(dictionaries[reference]));

let hasErrors = false;

for (const [locale, dict] of Object.entries(dictionaries)) {
  if (locale === reference) continue;

  const localeKeys = new Set(Object.keys(dict));

  // Keys in reference but missing in this locale
  const missing: string[] = [];
  for (const key of referenceKeys) {
    if (!localeKeys.has(key)) {
      missing.push(key);
    }
  }

  // Keys in this locale but not in reference (possible stale keys)
  const extra: string[] = [];
  for (const key of localeKeys) {
    if (!referenceKeys.has(key)) {
      extra.push(key);
    }
  }

  if (missing.length > 0) {
    hasErrors = true;
    console.error(`\n[${locale.toUpperCase()}] Missing ${missing.length} keys from ${reference}:`);
    for (const key of missing.slice(0, 20)) {
      console.error(`  - "${key}"`);
    }
    if (missing.length > 20) {
      console.error(`  ... and ${missing.length - 20} more`);
    }
  }

  if (extra.length > 0) {
    console.warn(`\n[${locale.toUpperCase()}] Has ${extra.length} extra keys not in ${reference}:`);
    for (const key of extra.slice(0, 10)) {
      console.warn(`  ~ "${key}"`);
    }
    if (extra.length > 10) {
      console.warn(`  ... and ${extra.length - 10} more`);
    }
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log(`[${locale.toUpperCase()}] OK — ${localeKeys.size} keys match ${reference}`);
  }
}

console.log(`\nReference (${reference}): ${referenceKeys.size} keys total`);

if (hasErrors) {
  console.error("\ni18n check FAILED — missing keys found.");
  process.exit(1);
} else {
  console.log("\ni18n check PASSED.");
}
