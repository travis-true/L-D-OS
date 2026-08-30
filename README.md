# L&D Operating System

[![Validate L&D OS](https://github.com/travis-true/L-D-OS/actions/workflows/validate.yml/badge.svg)](https://github.com/travis-true/L-D-OS/actions/workflows/validate.yml)
[![Deploy GitHub Pages](https://github.com/travis-true/L-D-OS/actions/workflows/pages.yml/badge.svg)](https://github.com/travis-true/L-D-OS/actions/workflows/pages.yml)

Status: `PILOT CANDIDATE v0.2.0`  
Website: <https://travis-true.github.io/L-D-OS/>  
Purpose: A generic, GitHub-run operating system for governed training and enablement intake, design, delivery, evaluation, and maintenance.

## Start with the guided intake

The repository root is a dependency-free GitHub Pages site. Its JSON-configured intake:

- branches for live training, self-paced learning, performance support, assessment/evaluation, communication/change enablement, blended programs, and undetermined solutions;
- saves and resumes browser-only drafts;
- downloads draft or completed JSON and Markdown;
- creates a reviewable, prefilled GitHub Issue without storing credentials;
- produces a copy-ready build brief;
- recommends a lane, likely intervention direction, and applicable gates without granting approval;
- blocks Issue creation until required information and the public-data acknowledgment are complete.

The public form accepts source references only. Do not enter confidential, personal, regulated, proprietary, or restricted information.

## Operating lifecycle

1. Intake
2. Brief
3. Build
4. Review
5. Publish
6. Measure
7. Maintain

The seven stages are an operating surface, not permission to skip governance. Each request receives a lane and must pass the applicable decision gates.

## Run locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/>. Directly opening `index.html` from the filesystem will not load JSON configuration in browsers that block local `fetch` requests.

## Validate

```bash
python3 scripts/generate_manifest.py
python3 scripts/validate_core.py
python3 scripts/validate_site.py
node --test tests/*.test.mjs
node scripts/generate_examples.mjs
```

No package installation or production dependency is required.

## Repository map

| Path | Purpose |
| --- | --- |
| `index.html`, `system.html` | Intake homepage and accessible system guide |
| `assets/` | Configurable CSS, JavaScript, and generic visual assets |
| `data/` | Versioned intake configuration |
| `tests/` | Deterministic JavaScript and fixture tests |
| `workflows/` | Human-readable operating procedures |
| `decisions/` | Machine-readable gates, lanes, and format-routing rules |
| `schemas/` | JSON Schemas for controlled records and the intake configuration |
| `profiles/` | Organization-neutral configuration and future private overlays |
| `standards/` | Verified or verification-required standards registry |
| `checklists/` | Format-specific definition-of-done controls |
| `automation/` | Safe adapter contracts with no release authority |
| `docs/` | Architecture, governance, pilot, QA, change, and deployment guidance |
| `.github/` | Issue forms, pull-request controls, validation, and Pages deployment |

## Authority boundary

- Diagnose before prescribing training.
- Treat requester format preferences as inputs, not decisions.
- Use approved sources and label facts, assumptions, inferences, conflicts, and gaps.
- Keep execution, independent review, QA disposition, and release authorization separate.
- Automation may draft, classify, compare, and recommend; it may not approve, waive controls, accept risk, or authorize release.
- Publishing is complete only after the authorized candidate is retrieved through the intended user path.
- Every operational asset requires an owner, review trigger, and lifecycle disposition.

## Licensing

- Software code: [MIT](LICENSE)
- Documentation, schemas, decision catalogs, workflows, checklists, examples, and L&D OS content: [CC BY 4.0](LICENSE-CONTENT.md)

## Current readiness

- Generic core and intake site: `QA_PASS_WITH_CONDITIONS`
- Pilot status: `PILOT REQUIRED`
- Asset-build authorization: `NOT GRANTED BY INTAKE`
- External rendering engine: `NOT INCLUDED OR AUTHORIZED`

See [the QA report](docs/qa-release-report.md) and [controlled pilot plan](docs/pilot-plan.md).
