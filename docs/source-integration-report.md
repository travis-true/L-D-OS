# Source integration report

## Intake boundary

- Purpose: convert the approved L&D operating system into a practical, brand-neutral, GitHub-ready core.
- Mode: controlled deconstruction.
- Governing baseline: the approved Phase 0–10 L&D Operating System and its controlled implementation toolkit.
- Reference inputs: four attached packages produced by another language model.
- Restriction: reference inputs may improve usability but may not silently revise approved authority, controls, approval boundaries, or terminology.

## Source inventory

| Source ID | Source | Authority | Use |
| --- | --- | --- | --- |
| SRC-001 | Approved Phase 0–10 consolidated package | Governing | lifecycle, roles, controls, decisions |
| SRC-002 | Controlled toolkit v1.0.1 | Approved supporting | practical execution, templates, evidence records |
| SRC-003 | First live pilot and Phase 10 review | Operational evidence | usability findings and limitations |
| SRC-004 | Master index and executive overview | Approved supporting | navigation and source precedence |
| SRC-005 | `engine.zip` | Unverified reference | configuration and adapter patterns only |
| SRC-006 | `grounding-standards-library.zip` | Unverified reference | candidate methodology registry |
| SRC-007 | `process-framework-library.zip` | Unverified reference | simplified production surface and checklists |
| SRC-008 | `prompt-library.zip` | Unverified reference | assistant prompt structure and stage mapping |

## Adopted or adapted elements

| Decision | Source | Treatment | Reason |
| --- | --- | --- | --- |
| INT-001 | SRC-007 | Adapted | Six-step production path becomes the operator-facing surface, expanded with Measure as an explicit stage. |
| INT-002 | SRC-007 | Adopted with controls | Moment of need, recall/reference, frequency/criticality, skill type, and shelf-life/reach become format-routing evidence. |
| INT-003 | SRC-007 | Adapted | QRG, video, VILT, and eLearning completion checks are converted to structured checklists and subordinated to the QA gate. |
| INT-004 | SRC-007 | Adopted | Named owner plus review trigger is required at publication to reduce content rot. |
| INT-005 | SRC-008 | Adopted | Goal–Context–Source–Expectation becomes the default assistant-request structure. |
| INT-006 | SRC-008 | Adapted | Five prompt phases become optional assistant contracts; all outputs remain drafts and human gate decisions remain mandatory. |
| INT-007 | SRC-005 | Adapted | One shared theme/profile contract is adopted so brand values are configuration, not hardcoded logic. |
| INT-008 | SRC-005 | Adapted | JSON content specifications become a future renderer interface, subject to schema validation and accessibility QA. |
| INT-009 | SRC-006 | Adapted | ADDIE, SAM, Mager, Bloom, LTEM, visual-design principles, UDL, WCAG, SCORM, and xAPI become selectable reference lenses, not universal governing mandates. |

## Rejected or deferred elements

| Decision | Source | Disposition | Reason |
| --- | --- | --- | --- |
| INT-010 | SRC-005 | Deferred | The PowerPoint builder does not provide sufficient accessibility, template-fidelity, semantic, or final-render validation for production authorization. |
| INT-011 | SRC-005 | Rejected from core | The `wkhtmltopdf` pipeline is not accepted as the default document engine; PDF accessibility and rendering fidelity are not established. |
| INT-012 | SRC-005 | Utility only | Icon background removal is not a core L&D workflow and can damage light-colored pixels; require asset-specific review. |
| INT-013 | SRC-005 | Blocked | `UNLICENSED` code is not redistributed in the generic core. |
| INT-014 | SRC-008 | Modified | “Publish-ready draft” is replaced with “review-ready candidate.” Publishing requires independent QA and human authorization. |
| INT-015 | SRC-006 | Modified | WCAG 2.1 AA is not hardcoded as the generic current target. Profiles must specify an approved target; the example uses WCAG 2.2 AA and includes non-web guidance as applicable. |
| INT-016 | SRC-006 | Modified | SCORM 1.2 is not treated as a generic default. The target platform and approved interoperability requirement determine the standard. |

## Conflicts, gaps, and risks

| ID | Type | Issue | Effect | Required action |
| --- | --- | --- | --- | --- |
| GAP-001 | License | Public license not selected. | Blocks public release. | Owner selects and records licenses. |
| GAP-002 | Governance | Generic decision-authority roles are placeholders. | Blocks operational authorization. | Implementing organization assigns named roles. |
| GAP-003 | Standards | Some reference summaries lack primary-source citations. | Prevents them from becoming governing requirements. | Validate and approve the standards registry. |
| RISK-001 | Automation | Rendering adapters may produce inaccessible or visually incorrect files. | Blocks automated release. | Add final-byte rendering, accessibility, and regression tests. |
| RISK-002 | GitHub | Sensitive source content could be committed to a repository. | Privacy/security exposure. | Use evidence references and approved storage; enforce repository classification. |
| RISK-003 | Simplification | Operators may mistake the seven-step surface for permission to omit approved controls. | Governance failure. | Require lane and gate records and preserve the phase crosswalk. |

## Readiness

The structured generic core is `READY WITH CONDITIONS` for controlled configuration and pilot testing. It is not authorized for public release, organizational deployment, or automated publishing until the open license, authority, profile, and pilot decisions are resolved.

