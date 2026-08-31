# Controlled change record — intake triage automation

## Identity

- Change ID: `CHG-LDOS-2026-08-31-002`
- Baseline: `v0.2.0` pilot candidate
- Target: `v0.2.0` pilot candidate with governed intake preparation
- Decision owner: Travis True
- Implementation authorization: `APPROVED`
- Earliest affected stage: Intake

## Purpose

Automate repeatable GitHub administration and triage preparation after a public intake is submitted while preserving human authority for scope, source, lane, solution, design, build, risk, and release decisions.

## Authorized behavior

- Create and maintain a controlled repository label catalog.
- Parse structured public intake Markdown without fetching linked source content.
- Apply deterministic request-type, state, provisional lane, initial risk, and information-needed labels.
- Identify missing fields, unsupported consequences, source-authority contradictions, accessibility unknowns, and date-format warnings.
- Create or update a single non-authoritative triage-preparation comment.
- Optionally assign a configured intake owner.
- Reject gate labels from actors below repository write permission.
- Advance to diagnosis, design, or build only after the complete preceding human-gate label sequence exists.
- Process existing open `[Intake]` Issues once when the workflow is first merged to `main`.

## Prohibited behavior

- Do not approve or waive any gate.
- Do not retrieve or copy linked source content.
- Do not infer that training is the correct solution.
- Do not generate learning assets or production branches.
- Do not accept risk or publish content.
- Do not treat labels as substitutes for complete gate-decision evidence.

## Verification contract

1. The label catalog has unique names, valid colors, and controlled descriptions.
2. The parser extracts the request identity, routing evidence, sources, constraints, and success information used by the rules.
3. Issue #4-style gaps and contradictions are detected deterministically.
4. Default guidance remains standard/moderate for an enterprise request without a controlled-risk trigger.
5. State progression fails closed when any preceding human gate label is absent.
6. The generated comment states that it is non-authoritative and prohibits premature production.
7. Existing core, site, schema, and intake tests continue to pass.

## Rollback

Disable `.github/workflows/intake-triage.yml` or revert this change. Existing Issues, comments, and labels remain visible evidence; do not delete them during rollback. Return affected Issues to the last verified human state and record any corrected gate status explicitly.
