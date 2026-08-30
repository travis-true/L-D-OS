# WF-005 — QA, authorize, and publish

Trigger: frozen candidate and builder self-check.  
Outcome: separately recorded QA disposition, release authorization, publication evidence, and operational handoff.  
Accountable role: release owner.

| Step | Actor | Action | Output/evidence |
| --- | --- | --- | --- |
| 5.1 | QA reviewer | Identify exact candidate, baseline, formats, environments, requirements, and required tests. | QA contract |
| 5.2 | QA reviewer | Inspect final bytes for accuracy, completeness, usability, visual quality, accessibility, technical integrity, privacy, brand/profile fidelity, and package integrity. | test/evidence ledger |
| 5.3 | QA reviewer | Classify defects as blocker, critical, major, minor, or note. | defect records |
| 5.4 | Builder | Correct authorized defects and provide a new candidate. | revised candidate |
| 5.5 | QA reviewer | Retest the fix and affected regression areas. | retest evidence |
| 5.6 | QA reviewer | Record `QA PASS`, `QA PASS WITH CONDITIONS`, `QA FAIL`, or `NOT VERIFIED`. | G08 decision |
| 5.7 | Release authority | Separately authorize, condition, or reject the identified candidate for the stated audience and channel. | G09 decision |
| 5.8 | Publisher | Publish only the authorized candidate and record destination, access, version, date, and responsible actor. | release evidence |
| 5.9 | Independent verifier | Retrieve the asset through the intended user path and verify displayed status and access. | G10 decision |
| 5.10 | Release owner | Assign owner, support route, measures, review trigger, rollback/containment, and next handoff. | operational record |

Required gates: `G08`, `G09`, `G10`.  
Conditional gate: `G07` applies to automation, LMS packages, integrations, or other technical components.

QA never grants release authority. Authorization without publication evidence means “authorized for release,” not “released.”

