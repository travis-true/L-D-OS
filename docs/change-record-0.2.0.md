# Controlled change record — v0.2.0

## Identity

- Change ID: `CHG-LDOS-2026-08-30-001`
- Baseline: `v0.1.0`
- Target: `v0.2.0` pilot candidate
- Decision owner: Travis True
- Implementation authorization: `APPROVED`
- Earliest affected stage: Intake

## Purpose

Deploy the approved generic core to `travis-true/L-D-OS` and add a public GitHub Pages homepage that functions as the primary governed intake for future learning assets and training sessions.

## Authorized decisions

- Keep the repository and site generic and public.
- Preserve all governed v0.1.0 core paths and IDs.
- Use dependency-free HTML, CSS, and JavaScript.
- Drive the guided, conditional form from versioned JSON configuration.
- Create JSON, Markdown, build-brief, and reviewable GitHub Issue outputs.
- Store unfinished drafts only in the user’s browser.
- Require a public-data acknowledgment and accept source references instead of uploads.
- Provide non-authoritative lane, format, gap, warning, and gate guidance.
- Prevent intake submission from automatically starting asset generation.
- Target WCAG 2.2 AA and current desktop, tablet, and mobile browsers.
- License code under MIT and content under CC BY 4.0.
- Deploy from `main` after validation and identify the release as a prerelease pilot candidate.

## Impact analysis

| Area | Impact | Control |
| --- | --- | --- |
| Intake | New public guided interface | Required-field validation, public-data boundary, draft state |
| Request records | Additional `intake_extensions` object | Existing request schema permits controlled extension; generated sample retained |
| Routing | Automated suggestion | Explicitly non-authoritative; G02 and G04 remain human decisions |
| GitHub Issues | New prefilled submission path | User reviews and submits; no token or automatic API write |
| Accessibility | New web surface | Semantic structure, keyboard operation, error summary, focus, contrast, reduced motion, manual verification |
| Security/privacy | Public site and repository | No uploads, no analytics, no backend, no secrets, source references only |
| Release | GitHub Pages and v0.2.0 prerelease | Validation workflow, Pages environment, QA report, pilot status |

## Acceptance criteria

1. Core, site, configuration, examples, and test records validate.
2. Conditional questions expose only applicable request details.
3. Save, Resume, Clear, draft downloads, final downloads, brief copy, and Issue preparation work.
4. Incomplete drafts cannot open a GitHub Issue from the form.
5. Complete long submissions use the documented clipboard fallback.
6. Keyboard and responsive browser testing identify no blocker or critical defect.
7. The public site displays no organization-specific brand or internal contact.
8. GitHub Actions validate before Pages deployment.

## Rollback

Move `main` back to the v0.1.0 baseline commit or disable the Pages deployment workflow. Preserve failed-run logs, downloaded evidence, and this change record. Do not delete submitted Issues during rollback; label and disposition them under change control.

## Verification corrective action

Live keyboard verification on `2026-08-31` identified two presentation defects: the skip target did not accept focus, and the final-step navigation button's `hidden` state was overridden by its component display rule. The corrective change adds a focusable main target, enforces the native hidden state, and extends automated validation to prevent regression. No governed path, ID, schema, routing rule, or intake record contract changed.
