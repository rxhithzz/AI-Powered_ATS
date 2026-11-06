import { scoreMatch, calculateMatchDetails } from "./matching";

/**
 * Unit tests for matching and scoring logic
 */
export function runMatchingTests() {
  // Test 1: Empty job skills
  const test1 = scoreMatch([], ["React", "TypeScript"]);
  if (test1 !== 100) throw new Error(`Test 1 failed: Expected 100, got ${test1}`);

  // Test 2: Required skill (weight 2) vs optional (weight 1)
  // Total weight: 2 + 1 = 3. Candidate has only required skill: 2 / 3 = 66.67% -> 67%
  const job1 = [
    { skill: "TypeScript", required: true },
    { skill: "Docker", required: false },
  ];
  const test2 = scoreMatch(job1, ["TypeScript"]);
  if (test2 !== 67) throw new Error(`Test 2 failed: Expected 67, got ${test2}`);

  // Test 3: Candidate has only optional skill: 1 / 3 = 33.33% -> 33%
  const test3 = scoreMatch(job1, ["Docker"]);
  if (test3 !== 33) throw new Error(`Test 3 failed: Expected 33, got ${test3}`);

  // Test 4: Full match
  const test4 = scoreMatch(job1, ["TypeScript", "Docker"]);
  if (test4 !== 100) throw new Error(`Test 4 failed: Expected 100, got ${test4}`);

  // Test 5: Zero match
  const test5 = scoreMatch(job1, ["Python", "Rust"]);
  if (test5 !== 0) throw new Error(`Test 5 failed: Expected 0, got ${test5}`);

  // Test 6: Alias and case insensitivity
  const test6 = scoreMatch(["TypeScript"], ["typescript"]);
  if (test6 !== 100) throw new Error(`Test 6 failed: Expected 100, got ${test6}`);

  // Test 7: Breakdown details
  const details = calculateMatchDetails(job1, ["TypeScript"]);
  if (details.matchScore !== 67) throw new Error("Details score mismatch");
  if (!details.matchedSkills.includes("TypeScript")) throw new Error("Missing matched skill");
  if (!details.missingSkills.includes("Docker")) throw new Error("Missing missing skill");

  console.log("✅ All matching & scoring tests passed!");
  return true;
}

if (require.main === module) {
  runMatchingTests();
}

