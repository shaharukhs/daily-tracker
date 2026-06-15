---
name: commit-and-push
description: Commit and push changes in the daily-tracker repo using Shahrukh Shikalgar's personal git identity (shaharukhs@gmail.com). Use whenever the user asks to commit and/or push.
---

# Commit and Push

Commit and push changes in this repository using the project's required git identity.

## Identity (always)

- **Name:** `Shahrukh Shikalgar`
- **Email:** `shaharukhs@gmail.com`

Use only the identity above for git here — no other account or email. Apply the identity
**per-repo only** — never touch global git config.

## Push authentication (already set up — repo-local)

This repo pushes to GitHub account **shaharukhs**, independent of whichever `gh` account is
globally active. This is achieved with a **repo-local** credential helper — no global change,
no account switching, other repos unaffected:

```bash
git config --local credential.https://github.com.helper \
  '!f() { if [ "$1" = "get" ]; then echo username=shaharukhs; echo "password=$(gh auth token --user shaharukhs)"; fi; }; f'
```

So `git push` "just works" as shaharukhs. If it ever stops authenticating, confirm both
accounts are present (`gh auth status`) and that `gh auth token --user shaharukhs` returns a
token. Do NOT use `gh auth git-credential` (it only serves the active account) and do NOT run
global `gh auth setup-git`.

## Steps

1. **Confirm scope.** Run `git status` and `git diff --stat` (or `git diff` for detail) so you
   know exactly what will be committed. If nothing is staged, stage the relevant changes
   (`git add -A`, or specific paths the user named). Don't commit unrelated work.

2. **First-time repo setup (only if not yet a git repo).** If `git rev-parse --is-inside-work-tree`
   fails: `git init`, then set the identity locally so future commits use it:
   ```bash
   git config user.name "Shahrukh Shikalgar"
   git config user.email "shaharukhs@gmail.com"
   ```
   Verify a `.gitignore` exists (this repo has one) so `node_modules`, `.env`, `.next`, `dist`,
   and build output are not committed.

3. **Branch.** Don't commit directly to the default branch. If on `main`/`master`, create a
   topic branch first (e.g. `git checkout -b <short-feature-name>`).

4. **Commit** with the required identity. Even if local config is set, pass `-c` flags so the
   identity is guaranteed:
   ```bash
   git -c user.name="Shahrukh Shikalgar" -c user.email="shaharukhs@gmail.com" \
     commit -m "<concise summary>" -m "<optional body>"
   ```
   Keep the message focused; describe what changed and why. **Do not add a `Co-Authored-By`
   trailer** (no Claude co-author line) — the user has opted out for this repo.

5. **Push** only when the user asked to push. Set upstream on first push of a branch:
   ```bash
   git push -u origin HEAD
   ```
   If there is no remote, tell the user and ask for the remote URL instead of guessing.

## Notes

- Confirm before any force-push, history rewrite, or pushing to the default branch.
- After pushing, report the branch name and, if a remote exists, suggest opening a PR
  (`gh pr create`) — but only create one if the user asks.
