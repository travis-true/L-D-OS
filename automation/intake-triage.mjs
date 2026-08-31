import { readFile } from "node:fs/promises";

const TYPE_LABELS = {
  "undetermined": "type:undetermined",
  "live-training": "type:live-training",
  "self-paced": "type:self-paced",
  "performance-support": "type:performance-support",
  "assessment-evaluation": "type:assessment-evaluation",
  "communication-change": "type:communication-change",
  "blended-program": "type:blended-program"
};

const LABEL_FAMILIES = {
  state: "state:",
  type: "type:",
  lane: "lane:",
  risk: "risk:"
};

const GATE_LABELS = new Set([
  "gate:g00-authorized",
  "gate:g01-approved",
  "gate:g02-authorized",
  "gate:g03-approved",
  "gate:g04-approved",
  "gate:g05-authorized"
]);

const EMPTY_VALUE = /^(?:not provided|none|n\/a|not verified|unknown|-)\.?$/i;

export function bulletValue(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, "mi"))?.[1]?.trim() || "";
}

export function sectionValue(body, heading, level = 2) {
  const marker = `${"#".repeat(level)} ${heading}`;
  const start = body.toLowerCase().indexOf(marker.toLowerCase());
  if (start < 0) return "";
  const contentStart = start + marker.length;
  const remainder = body.slice(contentStart);
  const next = remainder.search(new RegExp(`^#{1,${level}}\\s+`, "m"));
  return (next < 0 ? remainder : remainder.slice(0, next)).trim();
}

function cleanSection(value) {
  return value.replace(/^[-*]\s+/gm, "").trim();
}

function isMissing(value) {
  return !value || EMPTY_VALUE.test(cleanSection(value));
}

export function parseIntake(body = "") {
  const sources = sectionValue(body, "Governed source references");
  return {
    requestId: bulletValue(body, "Request ID"),
    requestType: bulletValue(body, "Request type"),
    requestedDate: bulletValue(body, "Requested date"),
    classification: bulletValue(body, "Classification"),
    performanceNeed: cleanSection(sectionValue(body, "Performance need")),
    evidence: cleanSection(sectionValue(body, "Evidence of need", 3)),
    consequence: cleanSection(sectionValue(body, "Consequence if unaddressed", 3)),
    outcome: cleanSection(sectionValue(body, "Desired observable outcome", 3)),
    audienceReach: bulletValue(body, "Audience reach"),
    consequenceOfError: bulletValue(body, "Consequence of error"),
    sourceAuthority: bulletValue(sources, "Authority class"),
    sourceNotes: bulletValue(sources, "Access/use notes"),
    sourceGaps: cleanSection(sectionValue(body, "Source gaps or conflicts", 3)),
    stakeholders: cleanSection(sectionValue(body, "Stakeholders and reviewers", 3)),
    riskFactors: cleanSection(sectionValue(body, "Risk factors", 3)),
    needBy: bulletValue(body, "Need-by timing"),
    successMeasures: cleanSection(sectionValue(body, "Success measures", 3)),
    acceptanceCriteria: cleanSection(sectionValue(body, "Acceptance criteria", 3)),
    accessibilityNeeds: cleanSection(sectionValue(body, "Known accessibility or accommodation needs", 3)),
    publicDataConfirmed: /## Public-data acknowledgment[\s\S]*?\bConfirmed\.?/i.test(body)
  };
}

export function analyzeIntake(intake) {
  const gaps = [];
  const warnings = [];
  if (!intake.requestId) gaps.push("Request ID is missing.");
  if (isMissing(intake.performanceNeed)) gaps.push("Observable performance or business need is missing.");
  if (isMissing(intake.evidence)) gaps.push("Evidence of the need is not provided.");
  if (isMissing(intake.outcome) || intake.outcome.length < 24) gaps.push("Desired outcome is not yet specific and observable.");
  if (isMissing(intake.stakeholders)) gaps.push("Stakeholders and reviewers are not identified.");
  if (isMissing(intake.acceptanceCriteria)) gaps.push("Acceptance criteria are not defined.");
  if (isMissing(intake.successMeasures) || /^(?:more|increase|improve)\b.*(?:use|usage|adoption)\.?$/i.test(intake.successMeasures)) {
    gaps.push("Success measures need a verifiable baseline, target, or observable performance measure.");
  }
  if (!intake.publicDataConfirmed) gaps.push("Public-data acknowledgment is not confirmed.");
  if (isMissing(intake.evidence) && !isMissing(intake.consequence)) warnings.push("The stated consequence remains ungrounded until supporting evidence is provided.");
  if (/^reference$/i.test(intake.sourceAuthority) && /source of truth|governing|authoritative/i.test(intake.sourceNotes)) {
    warnings.push("Source authority is inconsistent: the source is classified as reference but described as authoritative.");
  }
  if (intake.needBy && !/^\d{4}-\d{2}-\d{2}$/.test(intake.needBy)) warnings.push("Need-by timing should use YYYY-MM-DD when a firm date exists.");
  if (isMissing(intake.accessibilityNeeds)) warnings.push("Accessibility needs are not verified; apply the reusable accessibility baseline and confirm exceptions.");
  return { gaps, warnings };
}

export function recommendRouting(intake) {
  const controlledText = `${intake.riskFactors} ${intake.sourceGaps}`;
  const controlled = /regulated|contractual|policy-governed|security|privacy|safety|external release|production deployment|privileged|contested|difficult to detect|difficult to reverse/i.test(controlledText);
  const enterprise = /^enterprise$/i.test(intake.audienceReach);
  const highConsequence = /^(?:high|critical)$/i.test(intake.consequenceOfError);
  return {
    lane: controlled || (enterprise && highConsequence) ? "controlled" : "standard",
    risk: controlled || highConsequence ? "high" : enterprise || /^moderate$/i.test(intake.consequenceOfError) ? "moderate" : "low"
  };
}

export function nextState(labels) {
  const present = new Set(labels);
  const g00 = present.has("gate:g00-authorized");
  const g01 = present.has("gate:g01-approved");
  const g02 = present.has("gate:g02-authorized");
  const g03 = present.has("gate:g03-approved");
  const g04 = present.has("gate:g04-approved");
  const g05 = present.has("gate:g05-authorized");
  if (g00 && g01 && g02 && g03 && g04 && g05) return "build";
  if (g00 && g01 && g02 && g03) return "design";
  if (g00 && g02) return "diagnosis";
  return "triage";
}

export function desiredLabels(intake, analysis, existingLabels = []) {
  const route = recommendRouting(intake);
  const state = nextState(existingLabels);
  const labels = [
    "intake",
    TYPE_LABELS[intake.requestType] || "type:undetermined",
    `lane:${route.lane}`,
    `risk:${route.risk}`,
    `state:${state}`,
    "gate:decision-required"
  ];
  if (analysis.gaps.length) labels.push("needs:information");
  return labels;
}

export function triageComment(issue, intake, analysis, labels) {
  const route = recommendRouting(intake);
  const state = nextState(labels);
  const gapLines = analysis.gaps.length ? analysis.gaps.map((item) => `- GAP: ${item}`).join("\n") : "- No deterministic completeness gaps found.";
  const warningLines = analysis.warnings.length ? analysis.warnings.map((item) => `- DECISION REQUIRED: ${item}`).join("\n") : "- No deterministic routing warnings found.";
  return `<!-- ldos-triage-prep -->
## Automated triage preparation

> This comment is non-authoritative. A named human must make every gate, lane, source, solution, risk, build, and release decision.

- Request ID: ${intake.requestId || "NOT VERIFIED"}
- Suggested lane: **${route.lane}** (provisional until G02)
- Suggested initial risk: **${route.risk}**
- Workflow state: **${state}**
- Requested output: ${intake.requestType || "undetermined"}

### Completeness findings

${gapLines}

### Warnings

${warningLines}

### Next human decisions

- G00: authorize, authorize with conditions, return, or decline initiation and scope.
- G02: confirm the service disposition and operating lane.
- Do not begin diagnosis until G00 and G02 are recorded.
- Do not begin design until G01 and G03 are approved.
- Do not begin asset production until G04 and G05 are approved.

Automation source: \`automation/intake-triage.mjs\`. Issue #${issue.number}.`;
}

async function labelCatalog() {
  const url = new URL("../data/github-labels.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8"));
}

async function ensureLabels(github, repo, core) {
  const catalog = await labelCatalog();
  const current = await github.paginate(github.rest.issues.listLabelsForRepo, { ...repo, per_page: 100 });
  const byName = new Map(current.map((label) => [label.name, label]));
  for (const label of catalog.labels) {
    const existing = byName.get(label.name);
    if (!existing) {
      await github.rest.issues.createLabel({ ...repo, ...label });
      core.info(`Created label ${label.name}`);
    } else if (existing.color.toLowerCase() !== label.color.toLowerCase() || (existing.description || "") !== label.description) {
      await github.rest.issues.updateLabel({ ...repo, name: label.name, color: label.color, description: label.description });
      core.info(`Updated label ${label.name}`);
    }
  }
}

async function replaceFamilyLabels(github, repo, issueNumber, existing, desired) {
  const desiredSet = new Set(desired);
  const managedPrefixes = Object.values(LABEL_FAMILIES);
  const remove = existing.filter((name) => managedPrefixes.some((prefix) => name.startsWith(prefix)) && !desiredSet.has(name));
  if (!desiredSet.has("needs:information") && existing.includes("needs:information")) remove.push("needs:information");
  for (const name of [...new Set(remove)]) {
    await github.rest.issues.removeLabel({ ...repo, issue_number: issueNumber, name }).catch((error) => {
      if (error.status !== 404) throw error;
    });
  }
  await github.rest.issues.addLabels({ ...repo, issue_number: issueNumber, labels: desired });
}

async function upsertComment(github, repo, issueNumber, body) {
  const comments = await github.paginate(github.rest.issues.listComments, { ...repo, issue_number: issueNumber, per_page: 100 });
  const prior = comments.find((comment) => comment.body?.includes("<!-- ldos-triage-prep -->"));
  if (prior) await github.rest.issues.updateComment({ ...repo, comment_id: prior.id, body });
  else await github.rest.issues.createComment({ ...repo, issue_number: issueNumber, body });
}

async function processIssue({ github, repo, issue, core, intakeOwner }) {
  if (!/^\[Intake\]/i.test(issue.title || "")) return;
  const intake = parseIntake(issue.body || "");
  const analysis = analyzeIntake(intake);
  const existing = (issue.labels || []).map((label) => typeof label === "string" ? label : label.name);
  const desired = desiredLabels(intake, analysis, existing);
  await replaceFamilyLabels(github, repo, issue.number, existing, desired);
  const combined = [...new Set([...existing.filter((name) => GATE_LABELS.has(name)), ...desired])];
  await upsertComment(github, repo, issue.number, triageComment(issue, intake, analysis, combined));
  if (intakeOwner && !(issue.assignees || []).some((assignee) => assignee.login === intakeOwner)) {
    await github.rest.issues.addAssignees({ ...repo, issue_number: issue.number, assignees: [intakeOwner] });
  }
  core.info(`Prepared intake issue #${issue.number}`);
}

export async function run({ github, context, core, issueNumber, bootstrapOpen = false, intakeOwner = "" }) {
  const repo = context.repo;
  await ensureLabels(github, repo, core);
  const eventLabel = context.payload?.label?.name || "";
  if (context.eventName === "issues" && context.payload?.action === "labeled" && GATE_LABELS.has(eventLabel)) {
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({ ...repo, username: context.actor });
    if (!["admin", "maintain", "write"].includes(data.permission)) {
      await github.rest.issues.removeLabel({ ...repo, issue_number: context.payload.issue.number, name: eventLabel });
      core.setFailed(`Removed unauthorized gate label ${eventLabel}; ${context.actor} has ${data.permission} permission.`);
      return;
    }
  }
  if (issueNumber) {
    const { data: issue } = await github.rest.issues.get({ ...repo, issue_number: Number(issueNumber) });
    await processIssue({ github, repo, issue, core, intakeOwner });
    return;
  }
  if (bootstrapOpen) {
    const issues = await github.paginate(github.rest.issues.listForRepo, { ...repo, state: "open", per_page: 100 });
    for (const issue of issues.filter((item) => !item.pull_request && /^\[Intake\]/i.test(item.title || ""))) {
      await processIssue({ github, repo, issue, core, intakeOwner });
    }
  }
}
