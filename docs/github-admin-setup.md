# GitHub administration checklist

Use this checklist when a connected tool cannot change repository-level settings.

## Current deployment status

- Repository visibility: **Public — complete**
- Pages source: **GitHub Actions — complete**
- Public site retrieval: **Complete** at <https://travis-true.github.io/L-D-OS/>
- Validation and Pages workflows: **Passing**
- Intake labels: **Automation-managed — live verification complete on Issue #4**
- `main` protection and the `v0.2.0` prerelease: **Owner action still required**

## Repository visibility and Issues

1. Open **Settings → General**.
2. Under **Features**, confirm **Issues** is enabled.
3. Under **Danger Zone → Change repository visibility**, select **Change visibility → Make public** and confirm `travis-true/L-D-OS`.

Repository visibility is complete. Confirm Issues remains enabled before running the intake automation.

## GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Run **Actions → Deploy GitHub Pages → Run workflow** if the initial push did not deploy automatically.
4. Verify <https://travis-true.github.io/L-D-OS/> and the `github-pages` environment.

## Labels

The controlled source is `data/github-labels.json`. The **Prepare intake triage** workflow creates missing labels and repairs controlled descriptions or colors when it runs on `main`.

Optional: create the repository Actions variable `LDOS_INTAKE_OWNER` under **Settings → Secrets and variables → Actions → Variables**. Set its value to the GitHub username that should receive new intakes. Leave it unset to preserve current assignment.

If automated label creation fails, confirm the workflow has `issues: write` permission and that **Settings → Actions → General → Workflow permissions** allows the repository `GITHUB_TOKEN` to use the permissions declared in the workflow.

## Protect `main`

Create a branch ruleset under **Settings → Rules → Rulesets → New branch ruleset**:

- Name: `Protect main`
- Enforcement: Active
- Target branch: `main`
- Require a pull request before merging
- Require at least one approval
- Require status checks to pass
- Required check: `validate`
- Block force pushes
- Block deletions

The `validate` check must run successfully once before GitHub allows it to be selected as a required check.

## Prerelease

1. Open **Releases → Draft a new release**.
2. Create tag `v0.2.0` from `main`.
3. Title: `L&D Operating System v0.2.0 — pilot candidate`.
4. Use the `CHANGELOG.md` v0.2.0 section as the release summary.
5. Attach the validated source archive.
6. Select **Set as a pre-release**, then publish.
