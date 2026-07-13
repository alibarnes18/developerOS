# Contributing to Forge

Forge is currently in solo-founder MVP development (v0.1 → v1.0). Until v1.0 ships, the project isn't yet seeking external contributors, but this document exists from day one so the workflow is already in the shape it needs to be in once the project opens up (Phase 3 in PRD.md §4).

License: **Apache 2.0** — see `LICENSE`.

---

## 1. Branching Strategy

- `main` — always deployable. Every commit on `main` is something that could be shown or shipped.
- `feature/<short-description>` — one branch per feature or fix, branched from `main`.
- No long-lived `develop` branch — with a single active developer through v1.0, an extra permanent branch is unnecessary process overhead. This will be revisited when Phase 2 (team) begins.

## 2. Commit Message Format

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

**Examples:**
```
feat(tasks): add priority field to task creation form
fix(rls): correct workspace isolation policy on notes table
docs(architecture): document AIProvider interface
```

Scope should match the affected package/app where possible: `web`, `cli`, `ai-provider`, `db`, `core`.

## 3. Pull Request Process

Even solo, PRs are used (not direct pushes to `main`) — this builds the habit and commit history that Phase 3 contributors will follow, and gives CI a checkpoint before anything lands.

1. Branch from `main`, implement, push.
2. Open a PR with:
   - What changed and why (link to the relevant ROADMAP.md milestone or TODO.md item)
   - Screenshot/GIF for any UI change
3. CI must pass: lint, typecheck, tests (see ARCHITECTURE.md §7).
4. Merge via squash — one clean commit per feature on `main`.

## 4. Issue Management

- Issues are used for anything not immediately obvious from ROADMAP.md — bugs, ideas that don't fit the current milestone, questions.
- Labels: `bug`, `enhancement`, `docs`, `good-first-issue` (reserved for post-v1.0, once external contributors are welcome).
- Every issue that becomes work references the ROADMAP.md milestone it belongs to, or is explicitly tagged `backlog` if it's deferred (v2+, per PRD.md §6).

## 5. Release Process

- Releases are tagged `vX.Y.Z` following the milestones in ROADMAP.md (`v0.1.0`, `v0.2.0`, ... `v1.0.0`).
- Each tag gets a corresponding CHANGELOG.md entry before release.
- `v1.0.0` is the first release considered "public" — README, docs, and issue templates should all be contributor-ready by then (see ROADMAP.md's v1.0 "done when" criteria).

## 6. Code Standards

- TypeScript strict mode across all packages.
- No direct database queries outside `packages/db`; no direct AI provider SDK calls outside `packages/ai-provider` (see ARCHITECTURE.md §2 — this is enforced in review, not just convention).
- Every new table must ship with RLS policies in the same PR that creates it (see DATABASE.md §3) — a PR adding a table without RLS should be rejected in review, not fixed later.

## 7. Code of Conduct

Standard [Contributor Covenant](https://www.contributor-covenant.org/) expectations apply once the project opens to outside contributors in Phase 3 — be respectful, assume good faith, keep technical disagreement about the code, not the person.

---
*Next document: DEVELOPER_GUIDE.md — the owner's personal day-to-day guide, in Turkish.*
