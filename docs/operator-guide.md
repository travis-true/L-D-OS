# Operator guide

## Standard execution cycle

For each applicable workflow:

1. Confirm project identity, lane, current state, accountable owner, governing baseline, and prior handoff.
2. Confirm required inputs and applicable decision gates.
3. Validate source authority, classification, permissions, roles, and evidence.
4. Perform the work and record facts, assumptions, decisions, limitations, and outputs.
5. Complete independent review at the depth required by the lane.
6. Obtain the named human gate decision.
7. Update evidence, findings, changes, effort, and the next-owner handoff.

## Authority levels

| Level | May do | May not do |
| --- | --- | --- |
| Executor | perform assigned work; prepare evidence; recommend | self-approve; accept material risk; waive required controls |
| Independent reviewer | test evidence and quality; classify findings; recommend disposition | implement and independently approve the same decision without an explicit role transition |
| Authorizer | approve gates, exceptions, risk treatment, release, and lifecycle disposition within assigned authority | rely on an assistant statement as approval evidence |

One person may hold multiple roles when permitted, but every role transition and decision must remain separate and timestamped.

## Evidence labels

Use exactly: `FACT`, `ASSUMPTION`, `INFERENCE`, `EXAMPLE`, `CONFLICT`, `GAP`, `DECISION REQUIRED`, and `NOT VERIFIED`.

## Stop conditions

Pause affected work for:

- critical control failure;
- invalid or missing authorization;
- missing evidence that could materially change the result;
- uncontrolled baseline change;
- information-boundary breach;
- inability to preserve attribution or traceability;
- unresolved blocker or critical QA defect;
- automation that lacks deterministic rules, permissions, failure behavior, or human controls.

Contain the issue, preserve state and evidence, notify the accountable authority, and record the decision before resuming.

## Fast-track restrictions

Fast-track may compress intake, brief, and build records into one pull request. It may not skip:

- a real problem or change statement;
- source and information-handling checks;
- training-fit diagnosis;
- acceptance criteria;
- independent review;
- release authorization;
- publication verification;
- an owner and review trigger.

## Assistant use

Assistants may support discovery, comparison, drafting, formatting, checklist preparation, and metadata recommendations. Their output remains draft evidence. Missing information must be labeled rather than invented. See `automation/assistant-boundaries.md`.

