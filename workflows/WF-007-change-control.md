# WF-007 — Change control

Trigger: proposed change to a source, approved decision, workflow, schema, profile, standard, tool, asset, or release.  
Outcome: an authorized, traceable change or an explicit rejection/deferment.  
Accountable role: change owner.

| Step | Actor | Action | Output/evidence |
| --- | --- | --- | --- |
| 7.1 | Change owner | Create change ID; identify trigger, affected baseline, reason, urgency, and requested result. | change record |
| 7.2 | Analyst | Identify the earliest affected lifecycle stage and all downstream records, assets, tests, audiences, and channels. | impact assessment |
| 7.3 | Governance reviewer | Classify the change as editorial, execution correction, minor controlled change, or material baseline change. | classification |
| 7.4 | Specialist reviewers | Assess content, accessibility, privacy/security, technical, legal/policy, and operational effects as applicable. | review evidence |
| 7.5 | Change authority | Approve, condition, defer, or reject the change and its implementation/retest plan. | G12 decision |
| 7.6 | Implementer | Apply only the authorized change and create a new candidate/version. | implementation evidence |
| 7.7 | Independent reviewer | Run targeted and regression tests proportional to impact. | verification evidence |
| 7.8 | Change authority | Close or carry forward the change; update baselines and lifecycle dates. | closure decision |

Required gate: `G12`.

Later workflow stages may not silently absorb a change that affects an earlier approved decision.

