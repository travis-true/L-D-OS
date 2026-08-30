# Tool adapter contract

Tool adapters convert approved structured inputs into draft candidates or publish authorized candidates. They do not own business decisions.

Every adapter must declare:

- adapter ID, version, owner, license, and supported environment;
- accepted input and output schemas;
- permissions and data classifications;
- deterministic and non-deterministic behavior;
- failure, timeout, retry, duplicate-prevention, rollback, and evidence behavior;
- accessibility and interoperability limits;
- tests and known findings;
- actions requiring human authorization.

The supplied reference engine is not included here. Its shared-theme idea is represented by `schemas/theme.schema.json`; any renderer must satisfy Gate `G07` and final-byte QA before use.

