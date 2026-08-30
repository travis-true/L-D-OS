import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildIssuePlan,
  buildMarkdown,
  buildRequestRecord,
  computeRecommendation,
  findMissingInformation,
  generateRequestId,
  slugify,
  splitLines
} from "../assets/js/app.js";

const config = JSON.parse(await readFile(new URL("../data/intake-form.json", import.meta.url), "utf8"));
const laneCatalog = JSON.parse(await readFile(new URL("../decisions/lanes.json", import.meta.url), "utf8"));

const completeState = {
  title: "Customer support workflow launch",
  requester: "sample-requester",
  request_type: "live-training",
  sponsor: "Operations sponsor",
  business_need: "Support specialists need to complete the revised workflow accurately at launch.",
  evidence_of_need: ["Pilot observations identified inconsistent routing."],
  consequence_if_unaddressed: "Incorrect routing will increase rework and resolution time.",
  desired_outcome: "Specialists route representative cases correctly using the approved workflow.",
  audience_description: "Customer support specialists with mixed experience.",
  estimated_reach: "40",
  current_proficiency: "mixed",
  audience_constraints: ["Distributed schedules"],
  accessibility_needs: ["Captions and keyboard-accessible materials"],
  sources: [{ title: "Workflow standard", owner: "Operations", version: "2026-08-15", url: "https://example.org/workflow", authority: "governing", access_notes: "Public-safe fictional sample" }],
  source_gaps: [],
  moment: "before",
  memory: "both",
  frequency: "high",
  criticality: "moderate",
  skill_type: "procedural",
  shelf_life: "moderate-change",
  reach_scope: "department",
  session_modality: "virtual",
  session_duration: "60 minutes",
  practice_feedback: "Learners practice three cases and receive facilitator feedback.",
  needed_by: "2026-10-01",
  flexibility: "limited",
  constraints: ["One hour maximum"],
  stakeholders: ["Operations", "Quality", "Learning team"],
  risk_factors: [],
  public_data_acknowledgment: true,
  success_measures: ["At least 90% correct routing in the approved simulation"],
  acceptance_criteria: ["All scenarios trace to the governing workflow"],
  asset_owner: "Operations enablement owner",
  review_trigger: "Workflow revision or annual review",
  additional_questions: []
};

test("line and slug helpers normalize input", () => {
  assert.deepEqual(splitLines(" one \n\n two "), ["one", "two"]);
  assert.equal(slugify("Live Training Session"), "live-training-session");
  assert.equal(generateRequestId(new Date("2026-08-30T12:00:00Z"), 0), "REQ-20260830-0000");
});

test("complete fixture has no missing information", () => {
  assert.deepEqual(findMissingInformation(completeState), []);
});

test("routing recommendation remains non-authoritative and lane-aware", () => {
  const standard = computeRecommendation(completeState, laneCatalog);
  assert.equal(standard.lane, "standard");
  assert.equal(standard.format, "facilitated session");
  assert.ok(standard.requiredGates.includes("G09"));

  const controlled = computeRecommendation({ ...completeState, criticality: "critical" }, laneCatalog);
  assert.equal(controlled.lane, "controlled");
  assert.ok(controlled.warnings.some((warning) => warning.includes("High-consequence")));

  const fastTrack = computeRecommendation({ ...completeState, request_type: "performance-support", criticality: "low", memory: "reference", reach_scope: "team", source_gaps: [] }, laneCatalog);
  assert.equal(fastTrack.lane, "fast-track");
});

test("request record aligns to the controlled request contract", () => {
  const record = buildRequestRecord(completeState, { complete: true, laneCatalog, requestId: "REQ-20260830-SAMPLE", now: new Date("2026-08-30T12:00:00Z") });
  assert.equal(record.request_id, "REQ-20260830-SAMPLE");
  assert.equal(record.status, "submitted");
  assert.equal(record.document_status, "SUBMISSION_CANDIDATE");
  assert.equal(record.audience.estimated_reach, 40);
  assert.equal(record.classification, "public-safe-reference-only");
  assert.match(record.authority_notice, /not gate approval/);
});

test("draft records and Markdown are clearly marked", () => {
  const draft = buildRequestRecord({}, { complete: false, requestId: "REQ-20260830-DRAFT", now: new Date("2026-08-30T12:00:00Z") });
  const markdown = buildMarkdown({}, { record: draft });
  assert.equal(draft.document_status, "DRAFT");
  assert.equal(draft.status, "needs-information");
  assert.match(markdown, /^# DRAFT/);
  assert.match(markdown, /Authority notice/);
});

test("Issue plan uses required title and labels", () => {
  const record = buildRequestRecord(completeState, { complete: true, requestId: "REQ-20260830-SAMPLE", now: new Date("2026-08-30T12:00:00Z") });
  const markdown = buildMarkdown(completeState, { record });
  const plan = buildIssuePlan(completeState, { ...config, issue_body_url_limit: 50000 }, { record, markdown });
  assert.equal(plan.title, "[Intake] Customer support workflow launch");
  assert.deepEqual(plan.labels, ["intake", "state:submitted", "type:live-training"]);
  assert.equal(plan.useClipboardFallback, false);
  assert.match(plan.fullUrl, /body=/);

  const fallback = buildIssuePlan(completeState, { ...config, issue_body_url_limit: 1000 }, { record, markdown });
  assert.equal(fallback.useClipboardFallback, true);
  assert.doesNotMatch(fallback.compactUrl, /body=/);
});
