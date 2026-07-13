# Forge — API Contract

**Status:** Draft v0.1
**Implementation:** Next.js API Routes / Server Actions (`apps/web/app/api`) — no separate backend service in MVP (see ARCHITECTURE.md §7).

All endpoints are scoped by the authenticated session; `workspaceId` is required on every request that touches workspace data and is validated server-side against `workspace_members` before any query runs.

---

## 1. Conventions

- Base path: `/api/v1`
- Auth: Supabase session cookie, validated in middleware
- All request/response bodies: JSON
- Errors follow a consistent shape:
```typescript
{ error: { code: string; message: string } }
```
- Timestamps: ISO 8601 strings

---

## 2. Workspaces

```
GET    /api/v1/workspaces              → Workspace[]           (all workspaces the user belongs to)
POST   /api/v1/workspaces              → Workspace              (create)
GET    /api/v1/workspaces/:id          → Workspace
PATCH  /api/v1/workspaces/:id          → Workspace
```

```typescript
interface Workspace {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  createdAt: string;
}
```

## 3. Projects

```
GET    /api/v1/workspaces/:workspaceId/projects        → Project[]
POST   /api/v1/workspaces/:workspaceId/projects        → Project
PATCH  /api/v1/projects/:id                            → Project
```

```typescript
interface Project {
  id: string;
  workspaceId: string;
  name: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
}
```

## 4. Tasks

```
GET    /api/v1/workspaces/:workspaceId/tasks           → Task[]     (supports ?status=, ?projectId=, ?priority=)
POST   /api/v1/workspaces/:workspaceId/tasks           → Task
PATCH  /api/v1/tasks/:id                               → Task
DELETE /api/v1/tasks/:id                               → 204
```

```typescript
interface Task {
  id: string;
  workspaceId: string;
  projectId: string | null;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  githubIssueRef: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## 5. Notes

```
GET    /api/v1/workspaces/:workspaceId/notes           → Note[]     (supports ?search=)
POST   /api/v1/workspaces/:workspaceId/notes           → Note
PATCH  /api/v1/notes/:id                                → Note
DELETE /api/v1/notes/:id                                → 204
```

```typescript
interface Note {
  id: string;
  workspaceId: string;
  taskId: string | null;
  title: string;
  content: string; // markdown
  createdAt: string;
  updatedAt: string;
}
```

## 6. Dashboard

```
GET /api/v1/workspaces/:workspaceId/dashboard  → DashboardSummary
GET /api/v1/dashboard/cross-workspace          → CrossWorkspaceSummary
```

```typescript
interface DashboardSummary {
  openTaskCount: number;
  overdueTaskCount: number;
  tasksByPriority: Record<"low" | "medium" | "high", number>;
  recentNotes: Note[];
  recentActivity: ActivityEvent[];
}

interface CrossWorkspaceSummary {
  workspaces: { workspaceId: string; name: string; overdueCount: number }[];
}
```

## 7. AI Chat (v0.4)

```
POST /api/v1/workspaces/:workspaceId/ai/chat        → ChatOutput
POST /api/v1/workspaces/:workspaceId/ai/prioritize  → TaskSuggestion[]
POST /api/v1/ai/summarize                           → { summary: string }
```

The route handler builds a `WorkspaceContext` (open tasks + recent notes, see ARCHITECTURE.md §5) server-side and passes it to whichever `AIProvider` is configured — the client never sees or chooses the provider.

```typescript
interface ChatOutput {
  reply: string;
  usedContext: { taskIds: string[]; noteIds: string[] };
}

interface TaskSuggestion {
  taskId: string;
  reason: string;
}
```

## 8. GitHub Integration (v0.5)

```
POST   /api/v1/workspaces/:workspaceId/github/link     → GithubLink   (link a repo)
GET    /api/v1/workspaces/:workspaceId/github/issues   → GithubIssue[] (read-only, polled)
POST   /api/v1/github/issues/:issueId/convert-to-task  → Task
```

Read-only per ARCHITECTURE.md §8 — no write-back to GitHub in MVP.

---

## 9. Not in MVP

No endpoints for: billing, team invitations, automation/workflow triggers. Adding these later should not require changing the shape of the endpoints above — they're additive, not something these contracts need to anticipate structurally.

---
*Next document: UI_GUIDELINES.md — the design system these endpoints will be rendered through.*
