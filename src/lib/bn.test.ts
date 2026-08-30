import { toBnDigits, toEnDigits, formatCurrency } from "./bn";

// Simple self-test without vitest dependency — run with `bun run src/lib/bn.test.ts`
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("✓ " + msg);
}

assert(toBnDigits(123) === "১২৩", "toBnDigits 123");
assert(toEnDigits("১২৩") === "123", "toEnDigits");
assert(formatCurrency(25450, false) === "৳ 25,450", "formatCurrency en");
assert(formatCurrency(25450, true).includes("২৫"), "formatCurrency bn");
assert(toBnDigits("৳ 25,450") === "৳ ২৫,৪৫০", "currency bn digits");
console.log("All bn tests passed ✓");
