# Architecture

## Layer model

TEOS separates stable governance from organization-specific implementation.

| Layer | Contents | Change rate |
| --- | --- | --- |
| Governance core | authority, evidence, gates, stop conditions, lifecycle | low |
| Operating workflows | intake, diagnosis, design, production, QA, release, maintenance | moderate |
| Structured records | JSON Schemas and project records | moderate |
| Standards registry | instructional, accessibility, technical, and evaluation references | controlled |
| Organization profile | terminology, channels, brand, accessibility target, classification | organization-controlled |
| Tool adapters | renderers, LMS connectors, assistant prompts, publishing scripts | high |

## Practical lifecycle crosswalk

| Operating stage | Approved lifecycle coverage | Primary gate outcomes |
| --- | --- | --- |
| Intake | Phases 0–2 | scope authorized; request accepted and routed |
| Brief | Phases 1, 3–5 | source set approved; solution and design approved |
| Build | Phases 5–7 | build specification and roles authorized; candidate produced |
| Review | Phases 7–9 | independent QA disposition recorded |
| Publish | Phase 9 | release authorized; publication verified |
| Measure | Phase 10 | evaluation evidence collected at the approved level |
| Maintain | Phase 10 plus change control | continue, revise, constrain, replace, or retire |

## Three lanes

The lanes change record depth and workflow compression, not mandatory authority or safety controls.

- Fast-track: low-risk updates or simple assets with complete sources and no material policy, technical, or audience change.
- Standard: normal new training, job aids, workshops, videos, or eLearning.
- Controlled: high-consequence, regulated, security-sensitive, enterprise-wide, automated, or materially uncertain work.

See `decisions/lanes.json` for deterministic triggers.

## State model

`submitted → triage → governed → diagnosed → designed → building → review → authorized → published → measuring → maintenance → retired`

A project may move backward when evidence, scope, source, design, or acceptance criteria materially change. A stop condition moves it to `paused` until an authorized disposition is recorded.

## Brand architecture

The generic core contains only a fictional example profile. A real organization should keep its profile, brand assets, internal sources, contacts, policies, and publishing rules in a separate private repository. The private implementation pins a specific TEOS core version.

## GitHub boundary

GitHub manages requests, records, evidence references, review, changes, and releases. Learner delivery remains in approved platforms such as an LMS, intranet, document repository, webinar platform, or knowledge base.

