# QA and release report

## Candidate

- Package: L&D Operating System generic core and intake site
- Version: `0.2.0`
- Review date: `2026-08-30`
- Candidate status: `PILOT CANDIDATE`
- QA disposition: `QA_PASS_WITH_CONDITIONS`
- Public deployment authorization: `AUTHORIZED FOR CONTROLLED PILOT`
- Asset-build authorization: `NOT GRANTED BY INTAKE`

This disposition applies to the repository and intake-site candidate. It does not approve an organization profile, generated learning asset, renderer, LMS integration, or automated publishing adapter.

## Verification performed

| Check | Result | Evidence |
| --- | --- | --- |
| Package inventory | PASS | Deterministic `MANIFEST.json` with path, byte size, and SHA-256 for every controlled file other than the manifest itself. |
| Core JSON and schema subset | PASS | Decision catalogs, schemas, examples, checklists, profiles, registries, and local schema references validated. |
| Intake configuration | PASS | Unique step/field IDs, conditional references, required contract fields, choices, repeatable fields, and repository target validated. |
| JavaScript syntax and logic | PASS | Syntax checks plus deterministic tests for helpers, draft/final records, lanes, routing, Markdown, labels, and Issue fallback. |
| Generated examples | PASS | Sample JSON and Markdown regenerated deterministically from the controlled fixture. |
| HTML structure and links | PASS | Titles, language, main landmarks, heading presence, unique IDs, and local links checked. |
| Accessibility code controls | PASS | Skip link, semantic landmarks, native controls, required/error associations, live regions, visible focus, reduced motion, and contrast-token checks present. |
| Responsive design rules | PASS | Desktop, tablet, and mobile breakpoints plus single-column fallbacks present. |
| Privacy/security boundary | PASS | No analytics, backend, upload control, credential, or automatic Issue write; public-data acknowledgment required. |
| Generic boundary | PASS | No prohibited organization-specific names or internal contacts found. |
| Authority boundary | PASS | Recommendations are non-authoritative; human gates and release decisions remain explicit. |
| Live browser and keyboard execution | NOT VERIFIED | Cloud browser could not reach the local-only preview; repeat on the deployed public Pages URL. |
| Automated accessibility scan | NOT VERIFIED | Run against the deployed public Pages URL before closing the pilot gate. |
| GitHub Pages retrieval | NOT VERIFIED | Requires repository visibility and Pages settings plus a successful deployment run. |

## Conditions

1. Make the repository public and select GitHub Actions as the Pages source.
2. Confirm the validation and Pages workflows pass on the committed candidate.
3. Complete live desktop/mobile, keyboard-only, and automated accessibility checks on the public Pages URL.
4. Create the documented intake labels and protect `main` after the `validate` check has run successfully.
5. Publish `v0.2.0` as a prerelease only after the public site is retrieved successfully.
6. Run the controlled pilot in `pilot-plan.md` before broader operational adoption.
7. Validate each future renderer, connector, publishing job, and learning asset independently.

## Decision

The candidate may be committed and used to establish the public test environment. Final Pages verification and prerelease publication remain conditioned on the unverified checks above. Intake submission does not authorize asset generation; the applicable human gate decisions remain required.
