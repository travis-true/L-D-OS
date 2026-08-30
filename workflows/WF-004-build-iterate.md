# WF-004 — Build and iterate

Trigger: approved design and asset specification.  
Outcome: frozen review candidate with completed builder self-check.  
Accountable role: production lead.

| Step | Actor | Action | Output/evidence |
| --- | --- | --- | --- |
| 4.1 | Production lead | Confirm approved inputs, profile, template, tool, roles, file locations, and acceptance criteria. | build-start record |
| 4.2 | Builder | Produce the lowest useful prototype when iteration is required. | prototype |
| 4.3 | Reviewer/stakeholder | Review prototype against outcomes and scope; record decisions without silently expanding scope. | iteration decision |
| 4.4 | Builder | Build content and visuals from the approved sources and design. Label missing information; do not invent it. | draft asset |
| 4.5 | Builder | Apply the common and format-specific definition-of-done checklist. | self-check evidence |
| 4.6 | Builder | Resolve defects within authority or raise findings/change requests. | correction evidence |
| 4.7 | Production lead | Freeze and fingerprint the review candidate. | candidate ID and hash |
| 4.8 | Production lead | Confirm the candidate, checklist, source map, and open findings are ready for independent review. | G06 decision |

Required gate: `G06`.  
Conditional gate: `G07` is required before automated tooling or technical deployment proceeds.

Assistant-produced text, design specifications, metadata, or files remain draft material until inspected in the final candidate.

