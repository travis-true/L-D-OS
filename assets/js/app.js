const DEFAULT_REPOSITORY = "travis-true/L-D-OS";
const REQUEST_SCHEMA_URL = `https://raw.githubusercontent.com/${DEFAULT_REPOSITORY}/main/schemas/request.schema.json`;

export function splitLines(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function slugify(value) {
  return String(value || "request")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "request";
}

export function generateRequestId(date = new Date(), randomValue = Math.random()) {
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(randomValue * 1679616).toString(36).padStart(4, "0").toUpperCase();
  return `REQ-${day}-${suffix}`;
}

export function isVisible(field, state) {
  if (!field.showWhen) return true;
  const value = state[field.showWhen.field];
  return field.showWhen.in.includes(value);
}

export function computeRecommendation(state, laneCatalog = null) {
  const risks = Array.isArray(state.risk_factors) ? state.risk_factors : [];
  const gaps = splitLines(state.source_gaps);
  let lane = "standard";
  const controlled = risks.length > 0 || ["high", "critical"].includes(state.criticality) || state.reach_scope === "external";
  const fastTrack = state.criticality === "low"
    && risks.length === 0
    && gaps.length === 0
    && ["individual", "team"].includes(state.reach_scope)
    && state.memory === "reference"
    && state.request_type === "performance-support";
  if (controlled) lane = "controlled";
  else if (fastTrack) lane = "fast-track";

  let format = "diagnosis required";
  const typeFormats = {
    "live-training": "facilitated session",
    "self-paced": "self-paced learning",
    "performance-support": state.moment === "multiple" ? "performance-support system" : "quick-reference or job aid",
    "assessment-evaluation": "assessment or evaluation",
    "communication-change": "communication and change-enablement plan",
    "blended-program": "blended program"
  };
  if (typeFormats[state.request_type]) format = typeFormats[state.request_type];
  if (state.request_type === "undetermined") {
    if (state.memory === "reference" && ["during", "after-error"].includes(state.moment)) format = "quick-reference or performance support";
    else if (["interpersonal", "decision"].includes(state.skill_type)) format = "facilitated practice with feedback";
    else if (state.memory === "recall" && ["department", "enterprise", "external"].includes(state.reach_scope) && state.shelf_life === "stable") format = "self-paced learning with practice and assessment";
  }

  const laneRecord = laneCatalog?.lanes?.find((item) => item.lane_id === lane);
  const requiredGates = laneRecord?.required_gates || {
    "fast-track": ["G00", "G01", "G02", "G03", "G05", "G06", "G08", "G09", "G10", "G11"],
    "standard": ["G00", "G01", "G02", "G03", "G04", "G05", "G06", "G08", "G09", "G10", "G11"],
    "controlled": ["G00", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12"]
  }[lane];
  const conditionalGates = laneRecord?.conditional_gates || [];

  const warnings = [];
  if (state.request_type !== "undetermined") warnings.push("The requested output is an input; diagnosis may recommend a different intervention.");
  if (["high", "critical"].includes(state.criticality)) warnings.push("High-consequence performance requires controlled review, practice, and evidence proportional to risk.");
  if (state.shelf_life === "high-change") warnings.push("High-change content needs a short review trigger and a maintenance-efficient format.");
  if (state.memory === "recall" && state.moment === "during") warnings.push("The recall requirement conflicts with point-of-need support; confirm the actual performance condition.");
  if (gaps.length) warnings.push("Material source gaps or conflicts must be resolved or explicitly conditioned at G01.");
  if (state.request_type === "self-paced" && ["interpersonal", "decision"].includes(state.skill_type)) warnings.push("Self-paced delivery may not provide sufficient authentic practice and feedback for the required skill.");

  return { lane, format, requiredGates, conditionalGates, warnings };
}

export function findMissingInformation(state) {
  const checks = [
    ["title", "Request name"], ["requester", "Requester"], ["request_type", "Request type"], ["sponsor", "Sponsor"],
    ["business_need", "Business or performance need"], ["consequence_if_unaddressed", "Consequence"], ["desired_outcome", "Desired outcome"],
    ["audience_description", "Audience"], ["estimated_reach", "Estimated reach"], ["current_proficiency", "Current proficiency"],
    ["moment", "Moment of need"], ["memory", "Recall or reference"], ["frequency", "Task frequency"], ["criticality", "Consequence of error"],
    ["skill_type", "Required performance"], ["shelf_life", "Content volatility"], ["reach_scope", "Audience reach"],
    ["needed_by", "Need-by timing"], ["flexibility", "Timing flexibility"], ["asset_owner", "Operational owner"], ["review_trigger", "Review trigger"]
  ];
  const missing = checks.filter(([key]) => state[key] === undefined || state[key] === null || String(state[key]).trim() === "").map(([, label]) => label);
  if (!Array.isArray(state.sources) || !state.sources.some((source) => source.title && source.owner && source.version && source.authority && source.access_notes)) missing.push("At least one complete source reference");
  if (!splitLines(state.constraints).length) missing.push("Project constraints");
  if (!splitLines(state.stakeholders).length) missing.push("Stakeholders and reviewers");
  if (!splitLines(state.success_measures).length) missing.push("Success measures");
  if (!splitLines(state.acceptance_criteria).length) missing.push("Acceptance criteria");
  if (!state.public_data_acknowledgment) missing.push("Public-data acknowledgment");
  return missing;
}

export function buildRequestRecord(state, options = {}) {
  const now = options.now || new Date();
  const complete = options.complete ?? findMissingInformation(state).length === 0;
  const requestId = state.request_id || options.requestId || generateRequestId(now, options.randomValue);
  const recommendation = computeRecommendation(state, options.laneCatalog);
  return {
    $schema: REQUEST_SCHEMA_URL,
    document_status: complete ? "SUBMISSION_CANDIDATE" : "DRAFT",
    authority_notice: "This intake and its recommendations are not gate approval or release authorization.",
    request_id: requestId,
    title: String(state.title || "Untitled request"),
    requester: String(state.requester || "not provided"),
    requested_date: now.toISOString().slice(0, 10),
    business_need: String(state.business_need || "Not provided in draft"),
    evidence_of_need: splitLines(state.evidence_of_need),
    consequence_if_unaddressed: String(state.consequence_if_unaddressed || "Not provided in draft"),
    audience: {
      description: String(state.audience_description || "Not provided in draft"),
      estimated_reach: Math.max(1, Number.parseInt(state.estimated_reach, 10) || 1),
      current_proficiency: String(state.current_proficiency || "not-verified"),
      constraints: splitLines(state.audience_constraints)
    },
    desired_outcome: String(state.desired_outcome || "Not provided in draft"),
    requested_output: String(state.request_type || "undetermined"),
    timing: {
      needed_by: String(state.needed_by || "not provided"),
      flexibility: String(state.flexibility || "not-verified")
    },
    constraints: splitLines(state.constraints),
    existing_materials: (state.sources || []).filter((source) => source.title).map((source) => source.title),
    stakeholders: splitLines(state.stakeholders),
    classification: "public-safe-reference-only",
    status: complete ? "submitted" : "needs-information",
    intake_extensions: {
      config_version: "0.2.0",
      sponsor: String(state.sponsor || "not provided"),
      accessibility_needs: splitLines(state.accessibility_needs),
      sources: (state.sources || []).filter((source) => Object.values(source).some(Boolean)),
      source_gaps: splitLines(state.source_gaps),
      routing_evidence: {
        moment: state.moment || "not-verified",
        memory: state.memory || "not-verified",
        frequency: state.frequency || "not-verified",
        criticality: state.criticality || "not-verified",
        skill_type: state.skill_type || "not-verified",
        shelf_life: state.shelf_life || "not-verified",
        reach: state.reach_scope || "not-verified"
      },
      conditional_details: Object.fromEntries([
        "session_modality", "session_duration", "practice_feedback", "delivery_platform", "assessment_purpose", "change_description", "known_components"
      ].filter((key) => state[key] && (Array.isArray(state[key]) ? state[key].length : true)).map((key) => [key, state[key]])),
      risk_factors: Array.isArray(state.risk_factors) ? state.risk_factors : [],
      success_measures: splitLines(state.success_measures),
      acceptance_criteria: splitLines(state.acceptance_criteria),
      proposed_owner: String(state.asset_owner || "not provided"),
      review_trigger: String(state.review_trigger || "not provided"),
      unresolved_questions: splitLines(state.additional_questions),
      public_data_acknowledgment: Boolean(state.public_data_acknowledgment),
      recommendation
    }
  };
}

function markdownText(value) {
  return String(value ?? "Not provided").replaceAll("<", "&lt;").replaceAll(">", "&gt;").trim() || "Not provided";
}

function markdownList(items) {
  const values = Array.isArray(items) ? items.filter((item) => String(item).trim()) : splitLines(items);
  return values.length ? values.map((item) => `- ${markdownText(item)}`).join("\n") : "- Not provided";
}

export function buildMarkdown(state, options = {}) {
  const record = options.record || buildRequestRecord(state, options);
  const ext = record.intake_extensions;
  const rec = ext.recommendation;
  const sources = ext.sources.length
    ? ext.sources.map((source, index) => `### Source ${index + 1}: ${markdownText(source.title)}\n\n- Owner/authority: ${markdownText(source.owner)}\n- Version/date: ${markdownText(source.version)}\n- Authority class: ${markdownText(source.authority)}\n- Link: ${source.url ? markdownText(source.url) : "Not provided"}\n- Access/use notes: ${markdownText(source.access_notes)}`).join("\n\n")
    : "No complete source references provided.";
  const conditional = Object.entries(ext.conditional_details).length
    ? Object.entries(ext.conditional_details).map(([key, value]) => `- ${key.replaceAll("_", " ")}: ${Array.isArray(value) ? value.map(markdownText).join("; ") : markdownText(value)}`).join("\n")
    : "- None provided";

  return `# ${record.document_status === "DRAFT" ? "DRAFT — " : ""}L&D intake: ${markdownText(record.title)}

> **Authority notice:** ${record.authority_notice}

## Request

- Request ID: ${record.request_id}
- Requester: ${markdownText(record.requester)}
- Sponsor/decision owner: ${markdownText(ext.sponsor)}
- Requested date: ${record.requested_date}
- Request type: ${markdownText(record.requested_output)}
- Status: ${record.status}
- Classification: ${record.classification}

## Performance need

${markdownText(record.business_need)}

### Evidence of need

${markdownList(record.evidence_of_need)}

### Consequence if unaddressed

${markdownText(record.consequence_if_unaddressed)}

### Desired observable outcome

${markdownText(record.desired_outcome)}

## Audience

- Description: ${markdownText(record.audience.description)}
- Estimated reach: ${record.audience.estimated_reach}
- Current proficiency: ${markdownText(record.audience.current_proficiency)}

### Audience constraints

${markdownList(record.audience.constraints)}

### Known accessibility or accommodation needs

${markdownList(ext.accessibility_needs)}

## Governed source references

${sources}

### Source gaps or conflicts

${markdownList(ext.source_gaps)}

## Routing evidence

- Moment of need: ${markdownText(ext.routing_evidence.moment)}
- Recall or reference: ${markdownText(ext.routing_evidence.memory)}
- Frequency: ${markdownText(ext.routing_evidence.frequency)}
- Consequence of error: ${markdownText(ext.routing_evidence.criticality)}
- Required performance: ${markdownText(ext.routing_evidence.skill_type)}
- Content volatility: ${markdownText(ext.routing_evidence.shelf_life)}
- Audience reach: ${markdownText(ext.routing_evidence.reach)}

### Conditional request details

${conditional}

## Constraints and risk

- Need-by timing: ${markdownText(record.timing.needed_by)}
- Timing flexibility: ${markdownText(record.timing.flexibility)}

### Project constraints

${markdownList(record.constraints)}

### Stakeholders and reviewers

${markdownList(record.stakeholders)}

### Risk factors

${markdownList(ext.risk_factors)}

## Success and ownership

### Success measures

${markdownList(ext.success_measures)}

### Acceptance criteria

${markdownList(ext.acceptance_criteria)}

- Proposed operational owner: ${markdownText(ext.proposed_owner)}
- Review trigger: ${markdownText(ext.review_trigger)}

### Unresolved questions

${markdownList(ext.unresolved_questions)}

## Non-authoritative routing recommendation

- Suggested lane: **${rec.lane}**
- Likely intervention direction: **${rec.format}**
- Required gate IDs: ${rec.requiredGates.join(", ")}
- Conditional gate IDs: ${rec.conditionalGates.length ? rec.conditionalGates.join(", ") : "None identified"}

### Review warnings

${markdownList(rec.warnings)}

## Public-data acknowledgment

${ext.public_data_acknowledgment ? "Confirmed." : "Not confirmed — draft cannot be submitted."}
`;
}

export function buildIssuePlan(state, config, options = {}) {
  const record = options.record || buildRequestRecord(state, options);
  const body = options.markdown || buildMarkdown(state, { ...options, record });
  const title = `[Intake] ${record.title}`;
  const typeLabel = `type:${slugify(state.request_type || "undetermined")}`;
  const labels = ["intake", "state:submitted", typeLabel];
  const base = config.issue_url || `https://github.com/${config.repository || DEFAULT_REPOSITORY}/issues/new`;
  const query = new URLSearchParams({ title, body, labels: labels.join(",") });
  const fullUrl = `${base}?${query.toString()}`;
  const compactQuery = new URLSearchParams({ title, labels: labels.join(",") });
  const compactUrl = `${base}?${compactQuery.toString()}`;
  const limit = config.issue_body_url_limit || 6000;
  return { title, body, labels, fullUrl, compactUrl, useClipboardFallback: fullUrl.length > limit };
}

function initialState() {
  return { sources: [{}], risk_factors: [], public_data_acknowledgment: false };
}

function fieldValue(state, id) {
  const value = state[id];
  return value === undefined || value === null ? "" : value;
}

function requiredText(field) {
  return field.required ? '<span class="required-marker" aria-hidden="true"> *</span><span class="visually-hidden"> required</span>' : "";
}

function renderField(field, state) {
  const wrapper = document.createElement(field.type === "checkboxes" ? "fieldset" : "div");
  wrapper.className = `field${field.showWhen ? " conditional-field" : ""}`;
  wrapper.dataset.fieldContainer = field.id;
  wrapper.id = `${field.id}-field`;
  if (field.showWhen) wrapper.dataset.conditional = "true";
  const helpId = `${field.id}-help`;
  const errorId = `${field.id}-error`;
  const describedBy = [field.help ? helpId : "", errorId].filter(Boolean).join(" ");

  if (field.type === "checkboxes") {
    wrapper.innerHTML = `<legend>${field.label}${requiredText(field)}</legend>${field.help ? `<p class="help-text" id="${helpId}">${field.help}</p>` : ""}<div class="choice-list"></div><p class="field-error" id="${errorId}" hidden></p>`;
    const list = wrapper.querySelector(".choice-list");
    field.options.forEach((option) => {
      const item = document.createElement("div");
      item.className = "choice";
      const checked = (state[field.id] || []).includes(option.value);
      item.innerHTML = `<input type="checkbox" id="${field.id}-${option.value}" data-field="${field.id}" value="${option.value}" ${checked ? "checked" : ""}><label for="${field.id}-${option.value}">${option.label}</label>`;
      list.append(item);
    });
    return wrapper;
  }

  if (field.type === "repeatable") return renderRepeatable(field, state);

  if (field.type === "checkbox") {
    const checked = Boolean(state[field.id]);
    wrapper.innerHTML = `<div class="choice"><input type="checkbox" id="${field.id}" data-field="${field.id}" ${field.required ? "required" : ""} ${checked ? "checked" : ""} aria-describedby="${describedBy}"><label for="${field.id}">${field.label}${requiredText(field)}</label></div>${field.help ? `<p class="help-text" id="${helpId}">${field.help}</p>` : ""}<p class="field-error" id="${errorId}" hidden></p>`;
    return wrapper;
  }

  const label = `<label for="${field.id}">${field.label}${requiredText(field)}</label>`;
  const common = `id="${field.id}" data-field="${field.id}" ${field.required ? "required" : ""} ${field.minLength ? `minlength="${field.minLength}"` : ""} aria-describedby="${describedBy}"`;
  let control = "";
  if (field.type === "select") {
    control = `<select ${common}><option value="">Select an option</option>${field.options.map((option) => `<option value="${option.value}" ${fieldValue(state, field.id) === option.value ? "selected" : ""}>${option.label}</option>`).join("")}</select>`;
  } else if (["textarea", "textarea-lines"].includes(field.type)) {
    const value = Array.isArray(state[field.id]) ? state[field.id].join("\n") : fieldValue(state, field.id);
    control = `<textarea ${common} rows="${field.rows || 4}"></textarea>`;
    wrapper.innerHTML = `${label}${control}${field.help ? `<p class="help-text" id="${helpId}">${field.help}</p>` : ""}<p class="field-error" id="${errorId}" hidden></p>`;
    wrapper.querySelector("textarea").value = value;
    return wrapper;
  } else {
    const inputType = ["text", "number", "url", "date"].includes(field.type) ? field.type : "text";
    control = `<input type="${inputType}" ${common} value="" ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.step !== undefined ? `step="${field.step}"` : ""} ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ""}>`;
    wrapper.innerHTML = `${label}${control}${field.help ? `<p class="help-text" id="${helpId}">${field.help}</p>` : ""}<p class="field-error" id="${errorId}" hidden></p>`;
    wrapper.querySelector("input").value = fieldValue(state, field.id);
    return wrapper;
  }
  wrapper.innerHTML = `${label}${control}${field.help ? `<p class="help-text" id="${helpId}">${field.help}</p>` : ""}<p class="field-error" id="${errorId}" hidden></p>`;
  return wrapper;
}

function renderRepeatable(field, state) {
  const wrapper = document.createElement("fieldset");
  wrapper.className = "field";
  wrapper.dataset.fieldContainer = field.id;
  wrapper.id = field.id;
  wrapper.innerHTML = `<legend>${field.label}${requiredText(field)}</legend><div class="repeatable-list"></div><button type="button" class="button button-secondary add-repeatable" data-repeatable="${field.id}">${field.addLabel || "Add item"}</button><p class="field-error" id="${field.id}-error" hidden></p>`;
  const list = wrapper.querySelector(".repeatable-list");
  const items = Array.isArray(state[field.id]) && state[field.id].length ? state[field.id] : [{}];
  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "repeatable-item";
    card.innerHTML = `<div class="repeatable-header"><h3>${field.label.replace(/s$/, "")} ${index + 1}</h3><button type="button" class="button button-quiet remove-repeatable" data-repeatable="${field.id}" data-index="${index}" ${items.length === 1 ? "disabled" : ""}>Remove</button></div><div class="repeatable-fields"></div>`;
    const fields = card.querySelector(".repeatable-fields");
    field.fields.forEach((subfield) => {
      const sub = document.createElement("div");
      sub.className = "field";
      const id = `${field.id}-${index}-${subfield.id}`;
      const required = requiredText(subfield);
      let control;
      if (subfield.type === "select") {
        control = `<select id="${id}" data-field="${field.id}" data-index="${index}" data-subfield="${subfield.id}" ${subfield.required ? "required" : ""}><option value="">Select an option</option>${subfield.options.map((option) => `<option value="${option.value}" ${item[subfield.id] === option.value ? "selected" : ""}>${option.label}</option>`).join("")}</select>`;
      } else if (subfield.type === "textarea") {
        control = `<textarea id="${id}" data-field="${field.id}" data-index="${index}" data-subfield="${subfield.id}" rows="${subfield.rows || 2}" ${subfield.required ? "required" : ""}></textarea>`;
      } else {
        control = `<input id="${id}" type="${subfield.type === "url" ? "url" : "text"}" data-field="${field.id}" data-index="${index}" data-subfield="${subfield.id}" ${subfield.required ? "required" : ""}>`;
      }
      sub.innerHTML = `<label for="${id}">${subfield.label}${required}</label>${control}`;
      const input = sub.querySelector("input, textarea");
      if (input) input.value = item[subfield.id] || "";
      fields.append(sub);
    });
    list.append(card);
  });
  return wrapper;
}

function validateField(field, state) {
  if (!isVisible(field, state)) return [];
  const value = state[field.id];
  const messages = [];
  if (field.type === "repeatable") {
    const completeItems = (Array.isArray(value) ? value : []).filter((item) => Object.values(item).some((entry) => String(entry || "").trim()));
    if (field.required && completeItems.length < (field.minItems || 1)) messages.push(`${field.label} requires at least ${field.minItems || 1} item.`);
    completeItems.forEach((item, index) => field.fields.forEach((subfield) => {
      if (subfield.required && !String(item[subfield.id] || "").trim()) messages.push(`${field.label} ${index + 1}: ${subfield.label} is required.`);
      if (subfield.type === "url" && item[subfield.id]) {
        try { new URL(item[subfield.id]); } catch { messages.push(`${field.label} ${index + 1}: ${subfield.label} must be a valid URL.`); }
      }
    }));
    return messages;
  }
  if (field.type === "checkbox") {
    if (field.required && value !== true) messages.push(`${field.label} is required.`);
    return messages;
  }
  if (["textarea-lines", "checkboxes"].includes(field.type)) {
    const items = Array.isArray(value) ? value.filter(Boolean) : splitLines(value);
    if (field.required && items.length < (field.minItems || 1)) messages.push(`${field.label} requires at least ${field.minItems || 1} item.`);
    return messages;
  }
  const text = String(value ?? "").trim();
  if (field.required && !text) messages.push(`${field.label} is required.`);
  if (text && field.minLength && text.length < field.minLength) messages.push(`${field.label} must contain at least ${field.minLength} characters.`);
  if (field.type === "number" && text && Number(text) < Number(field.min ?? -Infinity)) messages.push(`${field.label} must be ${field.min} or greater.`);
  if (field.type === "url" && text) {
    try { new URL(text); } catch { messages.push(`${field.label} must be a valid URL.`); }
  }
  return messages;
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function startApp() {
  const form = document.querySelector("#intake-form");
  if (!form) return;
  let config;
  let laneCatalog;
  let state = initialState();
  let currentStep = 0;
  let autosaveTimer;

  const stepsRoot = document.querySelector("#form-steps");
  const stepList = document.querySelector("#step-list");
  const navigation = document.querySelector(".form-navigation");
  const previousButton = document.querySelector("#previous-step");
  const nextButton = document.querySelector("#next-step");
  const progressText = document.querySelector("#progress-text");
  const progressBar = document.querySelector("#progress-bar");
  const saveState = document.querySelector("#save-state");
  const errorSummary = document.querySelector("#error-summary");

  function announce(message) { saveState.textContent = message; }

  function render() {
    stepsRoot.replaceChildren();
    stepList.replaceChildren();
    config.steps.forEach((step, index) => {
      const item = document.createElement("li");
      item.dataset.number = index + 1;
      item.textContent = step.title;
      if (index === currentStep) item.setAttribute("aria-current", "step");
      if (index < currentStep) item.classList.add("is-complete");
      stepList.append(item);

      const section = document.createElement("section");
      section.className = "form-step";
      section.dataset.step = step.id;
      section.hidden = index !== currentStep;
      section.setAttribute("aria-labelledby", `step-${step.id}-title`);
      section.innerHTML = `<div class="step-heading"><p class="eyebrow">Step ${index + 1} of ${config.steps.length}</p><h2 id="step-${step.id}-title" tabindex="-1">${step.title}</h2><p>${step.description}</p></div><div class="field-list"></div>`;
      const fieldList = section.querySelector(".field-list");
      step.fields.forEach((field) => fieldList.append(renderField(field, state)));
      if (step.summary) fieldList.append(renderReview());
      stepsRoot.append(section);
    });
    navigation.hidden = false;
    previousButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === config.steps.length - 1;
    nextButton.textContent = currentStep === config.steps.length - 2 ? "Review intake" : "Continue";
    progressText.textContent = `Step ${currentStep + 1} of ${config.steps.length}`;
    progressBar.style.width = `${((currentStep + 1) / config.steps.length) * 100}%`;
    updateConditionals();
  }

  function renderReview() {
    const container = document.createElement("div");
    const missing = validateAll().map((result) => result.message);
    const complete = missing.length === 0;
    const record = buildRequestRecord(state, { complete, laneCatalog });
    state.request_id = record.request_id;
    const recommendation = record.intake_extensions.recommendation;
    const markdown = buildMarkdown(state, { record, laneCatalog });
    container.innerHTML = `
      <div class="${complete ? "notice notice-success" : "notice notice-warning"}">
        <h3>${complete ? "Ready to prepare a GitHub Issue" : "Draft needs more information"}</h3>
        <p>${complete ? "All required intake fields are complete. Human diagnosis and gate decisions are still required." : `${missing.length} required item${missing.length === 1 ? " is" : "s are"} incomplete. Draft downloads remain available.`}</p>
      </div>
      <div class="review-grid">
        <article class="review-card"><h3>Request</h3><p><strong>${markdownText(record.title)}</strong></p><p>${record.request_id} · ${markdownText(record.requested_output)}</p></article>
        <article class="review-card"><h3>Suggested lane</h3><p><span class="badge">${recommendation.lane}</span></p><p>Non-authoritative; confirm at G02.</p></article>
        <article class="review-card"><h3>Likely intervention direction</h3><p><strong>${recommendation.format}</strong></p><p>Confirm after diagnosis and G04 when applicable.</p></article>
        <article class="review-card"><h3>Required gates</h3><p>${recommendation.requiredGates.join(", ")}</p><p>${recommendation.conditionalGates.length ? `Conditional: ${recommendation.conditionalGates.join(", ")}` : "No additional conditional gates identified."}</p></article>
        <article class="review-card review-card-full"><h3>Missing information</h3>${missing.length ? `<ul class="readiness-list">${missing.map((item) => `<li>${markdownText(item)}</li>`).join("")}</ul>` : "<p>None identified by the intake validator.</p>"}</article>
        <article class="review-card review-card-full"><h3>Routing warnings</h3>${recommendation.warnings.length ? `<ul class="readiness-list">${recommendation.warnings.map((item) => `<li>${markdownText(item)}</li>`).join("")}</ul>` : "<p>No additional routing warnings identified.</p>"}</article>
        <article class="review-card review-card-full"><h3>Generated Markdown preview</h3><pre class="generated-preview" tabindex="0"></pre></article>
      </div>
      <div class="output-actions" aria-label="Generated intake actions">
        <button type="button" class="button button-secondary" data-output="json">Download JSON</button>
        <button type="button" class="button button-secondary" data-output="markdown">Download Markdown</button>
        <button type="button" class="button button-secondary" data-output="copy">Copy build brief</button>
        <button type="button" class="button button-secondary" data-output="print">Print review</button>
        <button type="button" class="button button-primary" data-output="issue" ${complete ? "" : "disabled"}>Open prefilled GitHub Issue</button>
      </div>`;
    container.querySelector("pre").textContent = markdown;
    return container;
  }

  function updateStateFromControl(control) {
    const key = control.dataset.field;
    if (!key) return;
    if (control.dataset.subfield !== undefined) {
      const index = Number(control.dataset.index);
      state[key] ||= [{}];
      state[key][index] ||= {};
      state[key][index][control.dataset.subfield] = control.value;
    } else if (control.type === "checkbox" && control.value && control.closest("fieldset")?.querySelectorAll(`input[data-field="${key}"]`).length > 1) {
      state[key] = [...document.querySelectorAll(`input[data-field="${key}"]:checked`)].map((input) => input.value);
    } else if (control.type === "checkbox") {
      state[key] = control.checked;
    } else if (control.dataset.field && control.closest(".field") && config.steps.flatMap((step) => step.fields).find((field) => field.id === key)?.type === "textarea-lines") {
      state[key] = splitLines(control.value);
    } else {
      state[key] = control.value;
    }
    updateConditionals();
    scheduleAutosave();
  }

  function updateConditionals() {
    const fields = config.steps.flatMap((step) => step.fields);
    fields.filter((field) => field.showWhen).forEach((field) => {
      const wrapper = document.querySelector(`[data-field-container="${field.id}"]`);
      if (!wrapper) return;
      const visible = isVisible(field, state);
      wrapper.hidden = !visible;
      wrapper.querySelectorAll("input, select, textarea, button").forEach((control) => { control.disabled = !visible; });
    });
  }

  function validateStep(stepIndex, showErrors = true) {
    const step = config.steps[stepIndex];
    const results = [];
    step.fields.forEach((field) => {
      const messages = validateField(field, state);
      messages.forEach((message) => results.push({ field, message, stepIndex }));
      if (showErrors) showFieldErrors(field, messages);
    });
    if (showErrors) showErrorSummary(results);
    return results;
  }

  function validateAll() {
    return config.steps.flatMap((step, index) => step.summary ? [] : validateStep(index, false));
  }

  function showFieldErrors(field, messages) {
    const wrapper = document.querySelector(`[data-field-container="${field.id}"]`);
    if (!wrapper) return;
    const error = wrapper.querySelector(`#${CSS.escape(field.id)}-error`);
    wrapper.querySelectorAll("input, select, textarea, fieldset").forEach((control) => control.removeAttribute("aria-invalid"));
    if (messages.length) {
      wrapper.querySelectorAll("input, select, textarea").forEach((control) => control.setAttribute("aria-invalid", "true"));
      wrapper.setAttribute("aria-invalid", "true");
      if (error) { error.textContent = messages.join(" "); error.hidden = false; }
    } else {
      wrapper.removeAttribute("aria-invalid");
      if (error) { error.textContent = ""; error.hidden = true; }
    }
  }

  function showErrorSummary(results) {
    if (!results.length) { errorSummary.hidden = true; errorSummary.replaceChildren(); return; }
    errorSummary.innerHTML = `<h2>Check ${results.length} item${results.length === 1 ? "" : "s"}</h2><ul>${results.map((result) => `<li><a href="#${result.field.id}">${result.message}</a></li>`).join("")}</ul>`;
    errorSummary.hidden = false;
    errorSummary.focus();
  }

  function goToStep(index, focus = true) {
    currentStep = Math.max(0, Math.min(index, config.steps.length - 1));
    errorSummary.hidden = true;
    render();
    window.scrollTo({ top: document.querySelector(".intake-layout").offsetTop - 16, behavior: "smooth" });
    if (focus) document.querySelector(`[data-step="${config.steps[currentStep].id}"] h2`)?.focus();
  }

  function saveDraft(message = "Saved") {
    localStorage.setItem(config.storage_key, JSON.stringify({ version: config.version, saved_at: new Date().toISOString(), currentStep, state }));
    announce(message);
  }

  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => saveDraft("Autosaved"), 350);
  }

  function resumeDraft() {
    const raw = localStorage.getItem(config.storage_key);
    if (!raw) { announce("No saved draft found"); return; }
    try {
      const saved = JSON.parse(raw);
      state = { ...initialState(), ...(saved.state || {}) };
      currentStep = Math.min(saved.currentStep || 0, config.steps.length - 1);
      render();
      announce("Draft resumed");
    } catch {
      announce("Saved draft could not be read");
    }
  }

  function handleOutput(action) {
    const errors = validateAll();
    const complete = errors.length === 0;
    const record = buildRequestRecord(state, { complete, laneCatalog });
    state.request_id = record.request_id;
    const markdown = buildMarkdown(state, { record, laneCatalog });
    const baseName = `${record.document_status === "DRAFT" ? "DRAFT-" : ""}${slugify(record.title)}-${record.request_id}`;
    if (action === "json") downloadText(`${baseName}.json`, `${JSON.stringify(record, null, 2)}\n`, "application/json");
    if (action === "markdown") downloadText(`${baseName}.md`, markdown, "text/markdown");
    if (action === "print") window.print();
    if (action === "copy") {
      navigator.clipboard?.writeText(markdown).then(() => announce("Build brief copied")).catch(() => announce("Clipboard unavailable; use the Markdown download"));
    }
    if (action === "issue") {
      if (!complete) {
        const first = errors[0];
        goToStep(first.stepIndex);
        showErrorSummary(errors.filter((item) => item.stepIndex === first.stepIndex));
        return;
      }
      const plan = buildIssuePlan(state, config, { record, markdown, laneCatalog });
      if (plan.useClipboardFallback) {
        const issueWindow = window.open(plan.compactUrl, "_blank", "noopener");
        navigator.clipboard?.writeText(plan.body)
          .then(() => announce("Issue body copied; paste it into the new GitHub Issue"))
          .catch(() => announce("Download the Markdown and paste it into the new GitHub Issue"));
        if (!issueWindow) announce("Popup blocked; allow popups, then try again");
      } else {
        window.open(plan.fullUrl, "_blank", "noopener");
        announce("Prefilled GitHub Issue opened for review");
      }
    }
  }

  form.addEventListener("input", (event) => updateStateFromControl(event.target));
  form.addEventListener("change", (event) => updateStateFromControl(event.target));
  form.addEventListener("click", (event) => {
    const add = event.target.closest(".add-repeatable");
    const remove = event.target.closest(".remove-repeatable");
    const output = event.target.closest("[data-output]");
    if (add) { state[add.dataset.repeatable] ||= []; state[add.dataset.repeatable].push({}); render(); scheduleAutosave(); }
    if (remove) { state[remove.dataset.repeatable].splice(Number(remove.dataset.index), 1); render(); scheduleAutosave(); }
    if (output) handleOutput(output.dataset.output);
  });
  nextButton.addEventListener("click", () => {
    const errors = validateStep(currentStep);
    if (!errors.length) goToStep(currentStep + 1);
  });
  previousButton.addEventListener("click", () => goToStep(currentStep - 1));
  document.querySelector("#save-draft").addEventListener("click", () => saveDraft("Saved"));
  document.querySelector("#resume-draft").addEventListener("click", resumeDraft);
  document.querySelector("#clear-draft").addEventListener("click", () => {
    if (!window.confirm("Clear all intake responses and the saved browser draft?")) return;
    localStorage.removeItem(config.storage_key);
    state = initialState();
    currentStep = 0;
    render();
    announce("Draft cleared");
  });

  Promise.all([
    fetch("data/intake-form.json").then((response) => { if (!response.ok) throw new Error("Form configuration unavailable"); return response.json(); }),
    fetch("decisions/lanes.json").then((response) => response.ok ? response.json() : null)
  ]).then(([loadedConfig, loadedLanes]) => {
    config = loadedConfig;
    laneCatalog = loadedLanes;
    render();
  }).catch((error) => {
    console.error(error);
    document.querySelector("#load-error").hidden = false;
    form.hidden = true;
  });
}

if (typeof document !== "undefined") startApp();
