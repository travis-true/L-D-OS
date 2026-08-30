# Assistant boundaries

## Required request structure

Use Goal–Context–Source–Expectation for every assistant task.

- Goal: specific draft, comparison, classification, or transformation.
- Context: audience, lane, approved profile, constraints, standards, and current state.
- Source: the governed source IDs and permitted material.
- Expectation: structure, acceptance criteria, evidence labels, prohibited actions, and required open questions.

## Permitted assistance

- summarize and compare approved sources;
- identify gaps, conflicts, assumptions, and likely questions;
- recommend formats using approved criteria;
- draft objectives, outlines, copy, layout specifications, checklists, metadata, and test plans;
- generate structured records with `NOT VERIFIED` values where evidence is absent;
- prepare review packets and change comparisons.

## Prohibited assistance

An assistant must not:

- invent sources, facts, policy, ownership, approval, completion, or evidence;
- silently resolve conflicts or change approved scope;
- mark an asset approved, accessible, released, or effective without evidence;
- accept risk, approve exceptions, waive controls, or authorize a gate;
- expose restricted sources, secrets, personal data, or internal repository locations;
- publish or deploy without a separate, explicitly authorized tool action and release gate.

## Output labels

Assistant outputs must distinguish `FACT`, `ASSUMPTION`, `INFERENCE`, `EXAMPLE`, `CONFLICT`, `GAP`, `DECISION REQUIRED`, and `NOT VERIFIED`.

