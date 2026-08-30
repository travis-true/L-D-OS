# GitHub administration checklist

Use this checklist when a connected tool cannot change repository-level settings.

## Repository visibility and Issues

1. Open **Settings → General**.
2. Under **Features**, confirm **Issues** is enabled.
3. Under **Danger Zone → Change repository visibility**, select **Change visibility → Make public** and confirm `travis-true/L-D-OS`.

## GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Run **Actions → Deploy GitHub Pages → Run workflow** if the initial push did not deploy automatically.
4. Verify <https://travis-true.github.io/L-D-OS/> and the `github-pages` environment.

## Labels

Create these labels under **Issues → Labels**:

| Label | Suggested color | Purpose |
| --- | --- | --- |
| `intake` | `075985` | Guided intake request |
| `state:submitted` | `0F766E` | Awaiting governed triage |
| `type:undetermined` | `64748B` | Solution not selected |
| `type:live-training` | `0369A1` | Facilitated session request |
| `type:self-paced` | `7C3AED` | Self-paced request |
| `type:performance-support` | `0E7490` | Job aid or point-of-need request |
| `type:assessment-evaluation` | `B45309` | Assessment or evaluation request |
| `type:communication-change` | `BE123C` | Communication or change enablement |
| `type:blended-program` | `4338CA` | Multi-component program |
| `change-control` | `9F1239` | Controlled system change |

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
