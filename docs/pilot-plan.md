# Controlled pilot plan

## Objective

Verify that a small operator group can run a real request from intake through publication verification while preserving evidence, gate decisions, authority boundaries, and lifecycle ownership.

## Pilot sample

Use three non-sensitive projects:

1. One low-risk revision that appears eligible for fast-track.
2. One new, moderate-risk asset using the standard lane.
3. One scenario that triggers the controlled lane or is intentionally stopped before production.

Do not begin with regulated, personal, confidential, external, or production-integrated content.

## Entry criteria

- Named product owner, workflow owner, independent reviewer, release authority, and repository administrator.
- Approved organization profile and repository classification.
- Selected license for any intended distribution.
- Protected default branch, required validation, and functioning access controls.
- Evidence-storage and retention locations defined.
- Pilot success measures and rollback owner approved.

## Measures

| Measure | Method | Suggested pilot threshold |
| --- | --- | --- |
| Intake completeness | Required fields complete before G00 | 100% |
| Gate traceability | Applicable decisions linked to evidence and authority | 100% |
| First-pass validation | Pull requests passing automated validation without repair | Baseline, then improve |
| Rework | Returned gates and cause | Trend only; investigate recurrence |
| Cycle time | Submitted to publication verification by lane | Baseline by lane |
| Operator effort | Active minutes by workflow | Baseline by workflow |
| Defect escape | Defects found after G08 | 0 blocker or critical |
| Retrieval | Authorized asset retrieved through intended user path | 100% |
| Lifecycle readiness | Owner and review trigger recorded at publication | 100% |

Thresholds are starting hypotheses, not universal targets. The pilot authority approves local targets before execution.

## Exit and decision

At G11, record one disposition: continue, continue with conditions, revise, constrain, pause, replace, or retire. A broader rollout requires resolved blocker and critical findings, a named operating owner, confirmed permissions, an approved organization profile, and an explicit human authorization record.
