# WF-001 — Govern, intake, and triage

Trigger: a new request, mandated change, incident, content-review finding, or improvement opportunity.  
Outcome: an authorized project identity, governed request, selected lane, and acknowledged next owner.  
Accountable role: intake owner.

| Step | Actor | Action | Output/evidence |
| --- | --- | --- | --- |
| 1.1 | Intake owner | Create request ID; record requester, need, desired outcome, audience, timing, constraints, and consequences. | request record |
| 1.2 | Governance owner | Identify information classification, repository boundary, permitted uses, and required specialists. | project controls |
| 1.3 | Intake owner | Distinguish the stated request from the observable performance or business problem. | problem/change statement |
| 1.4 | Triage reviewer | Assess risk, complexity, reach, volatility, urgency, reversibility, and service fit. | applicability record |
| 1.5 | Triage reviewer | Select fast-track, standard, or controlled lane using `decisions/lanes.json`. | lane recommendation |
| 1.6 | Authorizer | Authorize entry, return for information, redirect, defer, or reject. | G00/G02 decision |
| 1.7 | Intake owner | Record next owner, due date, conditions, and acknowledged handoff. | handoff evidence |

Required gates: `G00`, `G02`.  
Conditional gate: `G01` may begin here when sources arrive with the request.

Stop when identity, authority, classification, audience, or a materially important need is unknown.

