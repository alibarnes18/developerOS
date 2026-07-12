# Forge — Roadmap

**Time budget:** 20+ hrs/week (focused solo development)
**Total horizon:** ~3 months (v0.1 → v1.0)
**Repo structure:** Monorepo (Turborepo / pnpm workspaces) — `apps/web`, `apps/cli` (later), `packages/ai-provider`, `packages/db`, `packages/types`
**License:** Apache 2.0

Each milestone below ends in a usable, demo-able state — not just merged code.

---

## v0.1 — Foundation + Task/Project Management
**Target:** ~3 weeks

**Goal:** Workspaces exist, auth works, and the owner can create/manage tasks and projects inside a workspace. This is the smallest version that replaces "no systematic tool" with a real daily habit.

**What ships:**
- Monorepo scaffold (Turborepo, TypeScript, shared config/lint/CI)
- Supabase project wired up: Auth, Postgres schema for `workspaces`, `projects`, `tasks`, base RLS policies
- Workspace switcher (create/switch workspace)
- Task/project CRUD: create, edit, status, priority, due date
- Minimal usable UI (no design polish yet — functional first)
- Deployed to a live URL (Vercel), usable daily by the owner from day one

**Done when:**
- Owner can create at least 2 real workspaces (e.g. Nexflow, Nakhchivan Horse Club) with real tasks in each, and switch between them without data bleeding across workspaces.
- RLS verified: workspace A cannot read workspace B's data even via direct query.

---

## v0.2 — Notes / Knowledge Base
**Target:** ~2 weeks

**Goal:** Ideas and decisions stop getting lost.

**What ships:**
- `notes` table, scoped per workspace, linked optionally to a task/project
- Rich-enough note editor (markdown-based, no need for full WYSIWYG in MVP)
- Search across notes within a workspace
- Quick-capture entry point (fastest possible path to "write this down")

**Done when:**
- Owner has stopped writing venture-related notes anywhere else for at least one full week.

---

## v0.3 — Dashboard / Reporting
**Target:** ~2 weeks

**Goal:** One glance answers "what needs attention in this workspace right now."

**What ships:**
- Per-workspace dashboard: open tasks by priority, overdue items, recent notes, recent activity feed
- Cross-workspace summary view ("what's overdue everywhere")
- Basic charts/counts (no heavy analytics needed for MVP)

**Done when:**
- Owner can answer "what should I work on right now, across all workspaces" using only the dashboard, with no need to open individual task lists first.

---

## v0.4 — AI Chat Assistant
**Target:** ~3 weeks

**Goal:** A workspace-scoped assistant that helps prioritize, summarize, and answer questions using the workspace's own tasks/notes as context.

**What ships:**
- `AIProvider` interface (adapter pattern) — implemented first for Gemini free tier
- Chat UI, scoped to active workspace by default
- Context injection: assistant can see the active workspace's open tasks and recent notes
- Core use cases: "what should I prioritize today," "summarize this project," "search my notes for X"

**Done when:**
- Owner uses the assistant for real prioritization decisions at least 3x/week without manually re-explaining workspace context each time.
- Provider swap tested: switching the `AIProvider` implementation (e.g. to Groq) requires no changes outside the adapter itself.

---

## v0.5 — GitHub Integration
**Target:** ~2 weeks

**Goal:** Code-linked workspaces show real repo activity without leaving Forge.

**What ships:**
- Per-workspace optional GitHub repo link
- Read-only sync of issues and PRs into the task view (scope intentionally limited — no bidirectional sync in MVP, per PRD §9 risk note)
- Manual "convert issue to Forge task" action

**Done when:**
- A code-linked workspace shows current open issues/PRs without manually checking GitHub.

---

## v1.0 — Polish, CLI, Portfolio-Ready
**Target:** ~2-3 weeks

**Goal:** Forge is stable daily-use software and a presentable open-source project — not "done," but ready to show and to open to contributors.

**What ships:**
- CLI quick-capture tool (`forge task add`, `forge note add`) hitting the same Supabase backend
- UI polish pass using UI_GUIDELINES.md
- Test coverage on core flows (task CRUD, workspace isolation, AI provider adapter)
- Full docs set finalized (ARCHITECTURE, DATABASE, API, CONTRIBUTING, DEVELOPER_GUIDE)
- README with screenshots, clear setup instructions, Apache 2.0 license file
- First public GitHub release (`v1.0.0` tag)

**Done when:**
- A stranger can clone the repo, follow the README, and run Forge locally without asking the owner a single question.

---

## Explicitly out of scope through v1.0
(carried over from PRD.md §6 — repeated here so roadmap decisions don't silently reintroduce them)
- Automation/workflow engine (n8n-style)
- Multi-user accounts, team roles, invitations
- Billing/SaaS plans
- Native mobile/desktop apps

---

*Next document: ARCHITECTURE.md — system layers, folder structure, and the AIProvider interface design referenced in v0.4.*
