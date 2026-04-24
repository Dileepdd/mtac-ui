# MTAC-UI Bug Tracker

Legend: ✅ Fixed · 🔵 Backend TODO · ⏳ Pending

---

## CRITICAL — Core Features Broken

| # | Bug | Status | Files Changed |
|---|-----|--------|---------------|
| BUG-001 | Sidebar project navigation passed `p.key` (e.g. "ABC") to API instead of `p._id` (ObjectId). Backend validates ObjectId and throws 400 → project page showed no tasks. Favorites section had the same bug. | ✅ Fixed | `Sidebar.tsx` |
| BUG-002 | Workspace switcher menu items (Create workspace, Workspace settings, Sign out) never fired `onClick`. Root cause: Popover attached a `mousedown` outside-click listener; clicking a MenuItem fired `mousedown` (outside anchor) → Popover unmounted before `click` fired → navigation never happened. | ✅ Fixed | `Popover.tsx` |

---

## HIGH — Significant UX Breakage

| # | Bug | Status | Files Changed |
|---|-----|--------|---------------|
| BUG-003 | Task creation ignored selected status — backend `createTask` hardcoded `status: "todo"`. Added `status` param to backend schema/service/controller, API type, NewTaskForm, and inline Kanban column add. | ✅ Fixed | `task.validation.ts`, `task.service.ts`, `task.controller.ts`, `task.ts` (api), `TaskModal.tsx`, `ProjectPage.tsx` |
| BUG-004 | `timeSince` returned "just now" for anything under 1 hour — no minutes display. | ✅ Fixed | `TaskModal.tsx` |
| BUG-005 | Refresh token not used on the frontend. Access token expired after 60 min → 401 → force logout. Backend `POST /auth/refresh` existed but was never called. Now: on 401, silently refresh and retry the original request; concurrent 401s are queued. | ✅ Fixed | `client.ts`, `authStore.ts`, `LoginPage.tsx` |

---

## MEDIUM — Noticeable Gaps

| # | Bug | Status | Files Changed |
|---|-----|--------|---------------|
| BUG-006 | Inbox sidebar item did nothing (empty `onClick`). | ✅ Fixed | `Sidebar.tsx` |
| BUG-007 | "My Tasks" sidebar item navigated to dashboard. | ✅ Fixed | `Sidebar.tsx` |
| BUG-008 | New task popup had no description field — only title/project/status. | ✅ Fixed | `TaskModal.tsx` |
| BUG-009 | Opening "New task" from within a project still asked user to choose project. Now pre-selects and disables the current project. | ✅ Fixed | `taskModalStore.ts`, `TaskModal.tsx`, `ProjectPage.tsx` |
| BUG-010 | Task description not visible in Kanban card view. Now shows first 2 lines. | ✅ Fixed | `KanbanCard.tsx` |
| BUG-011 | No UI to rename a project. Backend `PATCH /workspace/:wsId/project/:projectId` existed. Now: click the project title to inline-edit, Enter/Save/Cancel. | ✅ Fixed | `ProjectPage.tsx` |
| BUG-012 | Project creator name and created date not displayed. Backend now populates `created_by` with user name. | ✅ Fixed | `project.service.ts` (backend), `project.ts` (api type), `ProjectPage.tsx` |
| BUG-019 | Task detail panel did not show who created the task. `created_by` now shown in the meta footer. | ✅ Fixed | `TaskModal.tsx` |

---

| BUG-022 | "Create workspace" in sidebar appeared to refresh the page. `WorkspaceSelectorPage` auto-redirected back to the current workspace when only 1 workspace existed (`list.length === 1`). Fix: sidebar passes `{ state: { create: true } }` via router; selector page skips the auto-redirect and opens the create form immediately. | ✅ Fixed | `Sidebar.tsx`, `WorkspaceSelectorPage.tsx` |

## LOW / FUTURE WORK

| # | Bug | Status | Notes |
|---|-----|--------|-------|
| BUG-013 | Activity tab shows "coming soon" toast. Backend model/service exist but no GET endpoint is wired. | 🔵 Backend TODO | Add `GET /workspace/:id/activity` route |
| BUG-014 | Assignee picker in task detail shows "coming soon". | ⏳ Pending | Needs member picker dropdown using `listMembersApi` |
| BUG-015 | Due date picker shows "coming soon". | ⏳ Pending | Simple `<input type="date">` + update call |
| BUG-016 | Labels editor shows "coming soon". | ⏳ Pending | Tag input with create/remove |
| BUG-017 | Filter button + three-dots (⋯) in ProjectPage toolbar are placeholders. | ⏳ Pending | Toast added for now |
| BUG-018 | Members and Settings tabs in WorkspacePage navigate away instead of rendering inline. | ⏳ Pending | Design decision — tabs currently act as nav links |
| BUG-020 | Workspace owner cannot lock a project. No lock field in Project model yet. | 🔵 Backend TODO | Needs `locked` bool on Project + permission check |
| BUG-021 | Update member role API slow. `invalidateMemberCache` calls Redis synchronously on the request path; may stall if Redis is slow/unreachable. | 🔵 Backend TODO | Move cache invalidation to a background job or add timeout |

---

## Observations Fixed Alongside Listed Bugs

- **Kanban inline task creation** (`InlineNewTask`) also did not pass `status` — always created "todo" regardless of column. Fixed with BUG-003.
- **`didMount` description auto-save race**: title effect set `didMount.current = true`, causing the description effect to also fire an immediate save on first render. Fixed by merging title + description into a single debounced save call.
- **Favorites section** in Sidebar also used `p.key` instead of `p._id`. Fixed together with BUG-001.
- **`createTaskApi`** type signature was missing the `status` param. Added with BUG-003.
- **Workspace switcher sign-out** did not close the Popover before navigating — benign (page navigates away) but now resolved by the BUG-002 Popover fix.

---

## NEW ISSUES FOUND BY COPILOT ANALYSIS

### 🔴 CRITICAL ISSUES

| # | Bug | Severity | File(s) | Status |
|---|-----|----------|---------|--------|
| BUG-023 | ~~Token Refresh Response Mismatch~~ — False positive. Controller returns `{ data: { accessToken } }` and client reads `res.data.data.accessToken` — they match. | ~~🔴 Critical~~ | — | ✅ False positive |
| BUG-024 | Unhandled Promise in Activity Logging — `.catch(() => {})` silently swallowed activity errors. | 🔴 Critical | `MTAC/src/modules/task/task.service.ts` | ✅ Fixed |
| BUG-025 | ~~Comment API Response Type Mismatch~~ — False positive. `comment.ts` interface has `author_id: { hue }` and `TaskModal.tsx` accesses `c.author_id.hue` — types align. | ~~🔴 Critical~~ | — | ✅ False positive |
| BUG-026 | ~~Missing VITE_API_URL Validation~~ — False positive. `client.ts:4` already has `?? "http://localhost:3000/api"` fallback. | ~~🔴 Critical~~ | — | ✅ False positive |
| BUG-027 | Axios Config Type Safety Violation — `original._retried` not typed. | 🔴 Critical | `mtac-ui/src/api/client.ts` | ✅ Fixed |

### 🟠 HIGH SEVERITY ISSUES

| # | Bug | Severity | File(s) | Status |
|---|-----|----------|---------|--------|
| BUG-028 | No Token Validation on App Load — Expired refresh token not cleared on startup, causing flash of logged-in UI. | 🟠 High | `mtac-ui/src/main.tsx` | ✅ Fixed |
| BUG-029 | ~~Race Condition in Token Refresh~~ — False positive. `isRefreshing` flag + `waitingQueue` already correctly serializes concurrent 401s. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-030 | ~~Workspace Middleware No Type Validation~~ — False positive. `CachedMemberData` interface is applied at `redis.get<CachedMemberData>` and `if (!roleId)` guards usage. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-031 | ~~Permission Middleware Missing Null Check~~ — False positive. `req.workspace ?? {}` provides fallback; `if (!roleId)` guards before use. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-032 | ~~Auth Middleware Inconsistent Returns~~ — False positive. Both error paths use `return next(new AppError(...))` consistently. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-033 | ~~Token Refresh Response Format~~ — False positive. Same as BUG-023: controller wraps in `{ data: { accessToken } }` and client reads it correctly. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-034 | Workspace Middleware Race Condition — Multiple concurrent cache misses can all hit DB. Acceptable at current scale; not a correctness bug. | 🟠 High | `MTAC/src/middlewares/workspace.middleware.ts` | ⏳ Low priority |
| BUG-035 | ~~Missing Error Handling in Task Updates~~ — False positive. Permission check done by `checkPermission` middleware before controller runs. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-036 | ~~Comment Fetch Without Error Boundary~~ — False positive. React Query doesn't throw on error; `data: comments = []` default handles undefined. | ~~🟠 High~~ | — | ✅ False positive |
| BUG-037 | JWT Expiry Not Checked Before Use — Covered by BUG-028 fix (refresh token expiry checked on load). | 🟠 High | `mtac-ui/src/main.tsx` | ✅ Fixed |

### 🟡 MEDIUM SEVERITY ISSUES

| # | Bug | Severity | File(s) | Status |
|---|-----|----------|---------|--------|
| BUG-038 | LoginPage generic fallback error — "Invalid email or password" shown even for network errors on profile fetch. | 🟡 Medium | `mtac-ui/src/features/auth/pages/LoginPage.tsx` | ✅ Fixed |
| BUG-039 | ~~Comments Query Default Not Applied~~ — False positive. Destructuring default `= []` applies when `data` is `undefined`, which is exactly what React Query sets on error. | ~~🟡 Medium~~ | — | ✅ False positive |
| BUG-040 | Settings Hierarchy Applied Without Error Handling — `applySettingsHierarchy()` could throw (e.g. bad hex color), crashing store setup. | 🟡 Medium | `mtac-ui/src/stores/workspaceStore.ts` | ✅ Fixed |
| BUG-041 | ~~Redis SCAN Cursor Unsafe Cast~~ — False positive. Code uses `cursor = Number(nextCursor)` (not a triple-cast), which safely converts string "0" to 0. | ~~🟡 Medium~~ | — | ✅ False positive |
| BUG-042 | ~~Comment Interface Field Name Confusion~~ — False positive. Interface `author_id` is an object `{ _id, name, email, hue }` — used consistently in `TaskModal.tsx`. | ~~🟡 Medium~~ | — | ✅ False positive |

### 🔵 LOW SEVERITY ISSUES

| # | Bug | Severity | File(s) | Status |
|---|-----|----------|---------|--------|
| BUG-043 | Console.log in Production Code — Using console instead of logger utility. | 🔵 Low | `MTAC/src/config/db.ts` (7, 9) | ⏳ Pending |
| BUG-044 | Environment Variable Inconsistency — `.env` uses `3006`, `.env.example` uses `3000`. New developers copy wrong port. | 🔵 Low | `.env`, `.env.example` | ⏳ Pending |
| BUG-045 | Pagination Validation Inconsistent — `Math.max(1, ... \|\| 20)` then `Math.min(100, ...)` pattern inconsistent across controllers. | 🔵 Low | Multiple controllers | ⏳ Pending |
| BUG-046 | Dead Code in Token Update — Early return leaves unreachable code. | 🔵 Low | `mtac-ui/src/api/client.ts` (36) | ⏳ Pending |
| BUG-047 | Missing Error Context in Middleware — Generic error logging doesn't distinguish error types. | 🔵 Low | `MTAC/src/middlewares/error.middleware.ts` | ⏳ Pending |

---

## Summary of Copilot Analysis

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| API/Integration | 3 | 1 | 1 | 1 | 6 |
| Auth Flow | 1 | 3 | 2 | - | 6 |
| State Management | - | 1 | 2 | 1 | 4 |
| Type Safety | 1 | - | - | - | 1 |
| Configuration | 1 | - | - | 1 | 2 |
| Database/Cache | - | 2 | 1 | - | 3 |
| Error Handling | - | 1 | 1 | 1 | 3 |
| **TOTAL** | **5** | **10** | **5** | **5** | **25** |

### Recommended Fix Priority
1. **Phase 1 (CRITICAL):** BUG-023 to BUG-027 (~4 hours)
2. **Phase 2 (HIGH):** BUG-028 to BUG-037 (~8 hours)
3. **Phase 3 (MEDIUM):** BUG-038 to BUG-042 (~4 hours)
4. **Phase 4 (LOW):** BUG-043 to BUG-047 (~2 hours)

**Estimated Total Effort: ~18 hours**
