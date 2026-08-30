# GitHub implementation

The generic v0.2.0 repository includes a dependency-free GitHub Pages intake site, automated validation, and a Pages deployment workflow. Repository owners should complete the [GitHub administration checklist](github-admin-setup.md) after the first validated push.

## Minimum setup

1. Create a repository from this package.
2. Protect the default branch.
3. Require pull requests and the validation workflow.
4. Activate CODEOWNERS by copying `.github/CODEOWNERS.example` to `.github/CODEOWNERS` and replacing role placeholders.
5. Create labels for lane, risk, state, asset type, and gate status.
6. Create a project board using the state model in `docs/architecture.md`.
7. Store only permitted records and evidence references in GitHub.

## Recommended labels

- `lane:fast-track`, `lane:standard`, `lane:controlled`
- `risk:low`, `risk:moderate`, `risk:high`, `risk:critical`
- `state:triage`, `state:diagnosis`, `state:design`, `state:build`, `state:review`, `state:published`, `state:maintenance`, `state:paused`
- `asset:qrg`, `asset:video`, `asset:vilt`, `asset:elearning`, `asset:other`
- `gate:decision-required`, `gate:authorized`, `gate:not-authorized`

## Pull-request rules

- Link the project or request ID.
- Identify the lane and gates affected.
- Include source, evidence, and candidate references.
- Separate QA disposition from authorization.
- Prevent unresolved blocker or critical findings from merging.
- Require approval by the configured content, accessibility, and release owners when applicable.

## Security controls

- Use least-privilege workflow permissions.
- Do not place secrets, access tokens, credentials, personal data, or restricted source content in issues or repository files.
- Use protected environments for publishing jobs.
- Do not execute code from untrusted pull requests with privileged secrets.
- Pin external actions to reviewed versions or commit identifiers under the organization’s supply-chain policy.
- Preserve build artifacts and provenance for controlled releases.

## Browser-only operation

The process can be run through GitHub’s web interface: issue forms for intake, web-created branches for record changes, pull requests for review, Actions for validation, and Releases for approved packages. Local Git tooling is optional.
