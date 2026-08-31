import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeIntake, desiredLabels, nextState, parseIntake, recommendRouting, triageComment } from "../automation/intake-triage.mjs";

const TEST_BODY = `# L&D intake: Test #1

## Request

- Request ID: REQ-20260831-B5U9
- Request type: performance-support
- Requested date: 2026-08-31
- Classification: public-safe-reference-only

## Performance need

How to use Copilot in Word

### Evidence of need

- Not provided

### Consequence if unaddressed

Lose Copilot license

### Desired observable outcome

More Copilot use

## Governed source references

- Authority class: reference
- Link: https://docs.google.com/document/d/example/edit?usp=drivesdk&ouid=1234
- Access/use notes: This is the source of truth and needs to be reformatted

### Source gaps or conflicts

- Not provided

## Routing evidence

- Audience reach: enterprise
- Consequence of error: moderate

## Constraints and risk

- Need-by timing: 09/01/2026

### Stakeholders and reviewers

- None

### Risk factors

- Not provided

## Success and ownership

### Success measures

- More Copilot use

### Acceptance criteria

- None

- Proposed operational owner: True
- Review trigger: Annual

### Known accessibility or accommodation needs

- Not provided

## Public-data acknowledgment

Confirmed.`;

test("label catalog is unique and structurally valid", async () => {
  const catalog = JSON.parse(await readFile(new URL("../data/github-labels.json", import.meta.url), "utf8"));
  assert.equal(new Set(catalog.labels.map((label) => label.name)).size, catalog.labels.length);
  assert.ok(catalog.labels.every((label) => /^[0-9A-F]{6}$/i.test(label.color)));
  assert.ok(catalog.labels.every((label) => label.description.length > 0 && label.description.length <= 100));
});

test("intake parser extracts controlled fields", () => {
  const intake = parseIntake(TEST_BODY);
  assert.equal(intake.requestId, "REQ-20260831-B5U9");
  assert.equal(intake.requestType, "performance-support");
  assert.equal(intake.audienceReach, "enterprise");
  assert.equal(intake.publicDataConfirmed, true);
});

test("triage analysis identifies gaps and contradictions without deciding gates", () => {
  const analysis = analyzeIntake(parseIntake(TEST_BODY));
  assert.ok(analysis.gaps.some((item) => item.includes("Evidence")));
  assert.ok(analysis.gaps.some((item) => item.includes("Acceptance")));
  assert.ok(analysis.warnings.some((item) => item.includes("authority is inconsistent")));
  assert.ok(analysis.warnings.some((item) => item.includes("sharing parameters")));
  assert.ok(analysis.warnings.some((item) => item.includes("YYYY-MM-DD")));
});

test("enterprise moderate request receives provisional standard and moderate guidance", () => {
  assert.deepEqual(recommendRouting(parseIntake(TEST_BODY)), { lane: "standard", risk: "moderate" });
});

test("state transitions require the complete human gate sequence", () => {
  assert.equal(nextState([]), "triage");
  assert.equal(nextState(["gate:g00-authorized"]), "triage");
  assert.equal(nextState(["gate:g00-authorized", "gate:g02-authorized"]), "diagnosis");
  assert.equal(nextState(["gate:g00-authorized", "gate:g02-authorized", "gate:g03-approved"]), "diagnosis");
  assert.equal(nextState(["gate:g00-authorized", "gate:g01-approved", "gate:g02-authorized", "gate:g03-approved"]), "design");
  assert.equal(nextState(["gate:g00-authorized", "gate:g01-approved", "gate:g02-authorized", "gate:g03-approved", "gate:g05-authorized"]), "design");
  assert.equal(nextState(["gate:g00-authorized", "gate:g01-approved", "gate:g02-authorized", "gate:g03-approved", "gate:g04-approved", "gate:g05-authorized"]), "build");
});

test("desired labels and comment preserve human authority", () => {
  const issue = { number: 4 };
  const intake = parseIntake(TEST_BODY);
  const analysis = analyzeIntake(intake);
  const labels = desiredLabels(intake, analysis, []);
  assert.ok(labels.includes("type:performance-support"));
  assert.ok(labels.includes("state:triage"));
  assert.ok(labels.includes("needs:information"));
  const comment = triageComment(issue, intake, analysis, labels);
  assert.match(comment, /non-authoritative/i);
  assert.match(comment, /named human/i);
  assert.match(comment, /Do not begin asset production/i);
});
