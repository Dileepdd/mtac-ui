# MTAC UI — Build Todo

Design reference: `design-reference/project/src/`
Stack: React 19 · TypeScript · Vite · Tailwind v4 · Shadcn/ui · TanStack Query v5 · Zustand · React Router v6 · Axios · React Hook Form · Zod

---

## Design reference facts (source of truth)

| Token | Value |
|---|---|
| Accent (primary) | `#4F46E5` indigo (default, overridable per workspace) |
| Bg / Bg-2 / Bg-sub | `#fcfcfb` / `#ffffff` / `#f6f6f5` (light) |
| Text / Text-3 | `#1a1a1a` / `#8a8a85` |
| Border | `#ebebe8` |
| Font | Geist + Geist Mono (default), IBM Plex alt |
| Sidebar | `var(--bg)` light — same theme as main content, 232px wide |
| Sidebar border | `1px solid var(--border)` right |
| Dark theme | `data-theme="dark"` on `<html>` |
| Density | `data-density` on `<html>` — compact / comfortable / spacious |
| Font variant | `data-font` on `<html>` — geist / plex / system |
| Status todo | `#8a8a85` dashed circle SVG |
| Status in_progress | `#d97706` half-filled circle SVG |
| Status done | `#059669` filled circle + checkmark SVG |
| Priority bars | 4-bar SVG — urgent `#dc2626` / high `#ea580c` / med `#ca8a04` / low `#65a30d` |
| Modal animation | `modal-in` keyframe (scale 0.98 → 1) |
| `.mono` class | Geist Mono 11.5px |
| `.kbd` class | Pill badge 18px height, bg-sub, border |

---

## Current state (already done)

- [x] Vite + TypeScript project
- [x] Tailwind v4 + Shadcn configured, path alias `@/*`
- [x] `src/index.css` — all design tokens (light/dark, density, fonts, animations, `.mono`, `.kbd`)
- [x] `src/config/colors.ts` — `applySettingsHierarchy()` with `data-theme`, `data-font`, `data-density`
- [x] `src/lib/utils.ts` — `cn()` utility
- [x] Shadcn components: button, input, label, dialog, dropdown-menu, select, textarea, avatar, badge, card, progress, scroll-area, separator, sheet, skeleton, sonner, tooltip

---

## Phase 0 — Foundation ✅
*Wire up the app skeleton. Nothing renders correctly until this is done.*

### 0.1 ✅ Types (`src/types/domain.ts`)
Mirror backend entities exactly:
```
User            { _id, name, email, hue: number, preferences }
Workspace       { _id, name, slug, created_by, settings }
WorkspaceMember { _id, user, workspace_id, role_id, joined_at }
Role            { _id, name, level, permissions: string[], workspace_id, is_system }
Project         { _id, name, key, color, workspace_id, taskCount, done, updated }
Task            { _id, key, title, description, status, priority, assigned_to,
                  project_id, workspace_id, labels: string[], due, comments,
                  created_at, updated_at }
Comment         { _id, body, author: User, task_id, created_at }
ActivityEvent   { _id, actor: string, verb: string, target: string, to?, time }
```
Enums: `TaskStatus = "todo"|"in_progress"|"done"`, `TaskPriority = "urgent"|"high"|"med"|"low"|"none"`

### 0.2 ✅ Axios client (`src/api/client.ts`)
- Instance with `baseURL: import.meta.env.VITE_API_URL`
- Request interceptor → `Authorization: Bearer <token>` from auth store
- Response interceptor → on 401: clear auth store → redirect `/login`

### 0.3 ✅ Auth store (`src/stores/authStore.ts`)
Zustand + persist to localStorage:
```
state:   { user: User | null, token: string | null }
actions: { setAuth(user, token), clearAuth() }
derived: isAuthenticated = !!token
```

### 0.4 ✅ Workspace store (`src/stores/workspaceStore.ts`)
Zustand (session only, no persist):
```
state:   { workspace: Workspace | null, userRole: Role | null }
actions: { setWorkspace(ws, role), clearWorkspace() }
effect:  on setWorkspace → applySettingsHierarchy(ws.settings, user.preferences)
```

### 0.5 ✅ CmdK store (`src/stores/cmdkStore.ts`)
```
state:   { open: boolean }
actions: { openCmdK(), closeCmdK(), toggle() }
```

### 0.6 ✅ Task modal store (`src/stores/taskModalStore.ts`)
```
state:   { task: Task | null, open: boolean }
actions: { openTask(task), closeTask() }
```

### 0.7 ✅ Query client (`src/main.tsx`)
- `QueryClient` with `staleTime: 30_000`, `retry: 1`
- Wrap app: `<QueryClientProvider>` → `<BrowserRouter>` → `<App/>` → `<Toaster/>`
- Call `applySettingsHierarchy()` with no args on mount (sets default data-theme/font/density)

### 0.8 ✅ Router (`src/router/index.tsx`)
```
/login                    → LoginPage          (public)
/register                 → RegisterPage       (public)
/forgot                   → ForgotPage         (public)
/workspaces               → WorkspaceSelectorPage (protected, no workspace required)
/w/:slug                  → AppShell (layout)
  index                   → DashboardPage
  projects                → WorkspacePage
  p/:key                  → ProjectPage
  members                 → MembersPage
  settings                → WorkspaceSettingsPage
/settings                 → UserSettingsPage   (protected, no workspace required)
```
- `<ProtectedRoute>` → redirect `/login` if `!isAuthenticated`
- `<WorkspaceRoute>` → redirect `/workspaces` if no workspace in store

---

## Phase 1 — Icons + Shared Components ✅
*Reference: `icons.jsx`, `components.jsx`*
*Port directly. These are used everywhere.*

### 1.1 ✅ Icons (`src/icons/index.tsx`)
Port `icons.jsx` as TypeScript:
- `Icon` base SVG component: `{ d?, s?, size=16, stroke=1.5, fill="none", style? }`
- `I` object — all 30+ icons (logo, search, plus, check, x, chevDown, chevRight, chevLeft, more, inbox, home, layers, board, list, filter, users, shield, settings, bell, calendar, clock, tag, link, lock, mail, eye, eyeOff, arrowRight, arrowLeft, sparkle, activity, comments, paperclip, folder, sun, moon, cmd, dragHandle, trash, copy, logout, flag)
- `StatusDot` — custom SVG per status (dashed circle / half-filled / solid+check), uses `--status-*` vars
- `PriorityBars` — 4-bar SVG, uses `--priority-*` vars

### 1.2 ✅ Avatar (`src/components/shared/Avatar.tsx`)
From `components.jsx`:
- `user: { name: string; hue?: number }`, `size?: number`
- Background: `oklch(65% 0.15 <hue>)`, white initials
- `AvatarStack`: overlapping row, `+N` badge when exceeding `max`

### 1.3 ✅ Btn (`src/components/shared/Btn.tsx`)
From `components.jsx`:
- Props: `variant: "primary"|"secondary"|"ghost"|"danger"`, `size: "sm"|"md"|"lg"`, `icon?`, `kbd?`, `disabled?`, `onClick?`
- Heights: sm=24px, md=28px, lg=34px
- Styles match design exactly (bg, border, colors from CSS vars)

### 1.4 ✅ Tag (`src/components/shared/Tag.tsx`)
Small pill: `height: 18px`, mono font, `background: var(--bg-sub)`, `border: 1px solid var(--border)`.

### 1.5 ✅ ProjectGlyph (`src/components/shared/ProjectGlyph.tsx`)
Colored square with project initial. `project: { name: string; color: string }`, `size?: number`.

### 1.6 ✅ Field + Input (`src/components/shared/Field.tsx`, `Input.tsx`)
`Field`: label + hint + error wrapper.
`Input`: wraps Shadcn Input, adds `icon?` (left slot), `rightEl?` (right slot).

### 1.7 ✅ Toggle (`src/components/shared/Toggle.tsx`)
Custom toggle switch: 32×18px, animated thumb, accent bg when on.

### 1.8 ✅ StatCard (`src/components/shared/StatCard.tsx`)
Props: `label`, `value`, `delta?` (+/-% green/red), `unit?`, `hint?`.

### 1.9 ✅ EmptyState (`src/components/shared/EmptyState.tsx`)
Props: `icon`, `title`, `body`, `action?: ReactNode`.

### 1.10 ✅ Modal + Popover (`src/components/shared/Modal.tsx`, `Popover.tsx`)
Port from `components.jsx`:
- `Modal`: fixed overlay, backdrop click closes, `modal-in` animation, `width` prop
- `Popover`: anchor-ref positioned dropdown, `width?` prop, `open`/`onClose`
- `MenuItem`: icon + children + selected state (accent bg-hover, checkmark)

---

## Phase 2 — Layout Shell ✅
*Reference: `sidebar.jsx`*

### 2.1 ✅ Sidebar (`src/components/layout/Sidebar.tsx`)
Port `sidebar.jsx` exactly:
- Width: 232px, `background: var(--bg)`, `border-right: 1px solid var(--border)`, `height: 100vh`, sticky
- **Workspace switcher** (top): logo icon + workspace name + chevron → opens `Popover` with workspace list, "Create workspace", "Workspace settings", "Sign out"
- **Search/CmdK button**: `background: var(--bg-sub)`, border, "Search or jump to…" text + `⌘K` kbd → dispatches `openCmdK()`
- **Main nav**: Inbox (count badge) / Home / My tasks — using `NavItem` sub-component
- **Favorites section**: collapsible, project list with `ProjectGlyph`
- **Projects section**: collapsible, scrollable project list + `+` add button in header
- **Bottom**: Members + Settings nav items, then user avatar + name + email
- `NavItem` active state: `background: var(--bg-hover)`, `color: var(--text)`, icon uses `var(--accent)`

### 2.2 ✅ AppShell (`src/components/layout/AppShell.tsx`)
- Flex row: `<Sidebar/>` (fixed) + `<main style={{ flex: 1, overflow: auto }}>`
- `<Outlet/>` inside main
- Mounts `<CmdK/>` and `<TaskModal/>` overlays (controlled by stores)

---

## Phase 3 — Auth Screens ✅
*Reference: `screen-auth.jsx`*

### 3.1 ✅ AuthShell (`src/features/auth/components/AuthShell.tsx`)
Port exactly:
- Left half (form): logo + form content + footer links (Privacy / Terms / Docs)
- Right half: `background: var(--bg-sub)`, dot-grid (`radial-gradient` + `mask-image`), tagline "A keyboard-first project tool for teams that ship.", 3 stats (⌘K / ~12ms / 42)
- Right half hidden on mobile

### 3.2 ✅ Login page (`src/features/auth/pages/LoginPage.tsx`)
- `POST /auth/login` endpoint hint in mono above title
- Email + password (show/hide toggle with `I.eye`/`I.eyeOff`)
- Forgot link → `/forgot`
- "Sign in" primary button → calls login API → `setAuth()` → navigate `/workspaces`
- "OR" divider + Google button (visual only for now)
- "New here? Create an account" → `/register`

### 3.3 ✅ Register page (`src/features/auth/pages/RegisterPage.tsx`)
- Full name + work email + password
- Password strength: 5-segment bar (red→amber→green), mono badges: `8+` `A` `a` `9` `#`
- POST → auto login → `/workspaces`

### 3.4 ✅ Forgot page (`src/features/auth/pages/ForgotPage.tsx`)
- Back link, email field, "Send reset link" button
- On submit: success state ("Check your email" card with green check)

---

## Phase 4 — Workspace Selector ✅
*No direct reference equivalent — simple bridge screen*

### 4.1 ✅ WorkspaceSelectorPage (`src/features/workspace/pages/WorkspaceSelectorPage.tsx`)
- Lists user's workspaces as cards (name, slug, member count, `ProjectGlyph`-style icon)
- Click → `setWorkspace()` → navigate `/w/:slug`
- "Create workspace" → inline form (just name) → POST `/api/workspace` → enter it
- Auto-redirect if user only has one workspace

---

## Phase 5 — Dashboard ✅
*Reference: `screen-dashboard.jsx`*

### 5.1 ✅ DashboardPage (`src/features/dashboard/pages/DashboardPage.tsx`)
- Sticky header: "Tuesday · Nov 10" mono + "Good morning, {name}" (18px 500) + OVERVIEW/FOCUS toggle + "New" button
- Toggle stored in local state (`"v1"` | `"v2"`)

### 5.2 ✅ Overview (`src/features/dashboard/components/Overview.tsx`)
- **StatCard row** (4-col grid): Active projects / Open tasks / Completed this week / Team members — delta % below
- **Projects grid** (2-col): `ProjectCard` with glyph + name + key + updated + progress bar (3px, accent fill). "All projects →" link
- **My tasks list**: tasks assigned to current user, not done. Columns: priority bars + status dot + key (mono 58px) + title + due + avatar. Row height 36px.
- **Right column**:
  - Activity feed: actor avatar + name + verb + target (accent mono) + time
  - This week: mini calendar items (day/date box + title + time)

### 5.3 ✅ Focus mode (`src/features/dashboard/components/FocusMode.tsx`)
- Max-width 760px centered
- "FOCUS MODE" mono label
- Count headline: "You have N things to do today."
- In-progress task card: accent border + `var(--accent-wash)` bg, "NOW · IN PROGRESS" mono, task title (18px) + key + due
- "Up next" list: priority + status + title + due, row height 44px
- AI digest stub at bottom (dashed border, sparkle icon)

---

## Phase 6 — Workspace Projects View ✅
*Reference: `screen-workspace.jsx`*

### 6.1 ✅ WorkspacePage (`src/features/workspace/pages/WorkspacePage.tsx`)
- Sticky header: "WORKSPACE / {slug}" breadcrumb (mono), workspace name (22px) + avatar stack + Settings + New project buttons
- Tabs: Projects / Members / Activity / Settings (Projects active by default)
- Toolbar: search input + Filter button + grid/list toggle (icon buttons)

### 6.2 ✅ Project grid (`src/features/workspace/components/ProjectCard.tsx`)
`auto-fill minmax(240px, 1fr)` grid:
- `ProjectGlyph` (26px) + name + key (mono)
- Progress bar (3px accent) + done/total + %
- Avatar stack + updated time

### 6.3 ✅ Project table (`src/features/workspace/components/ProjectTable.tsx`)
Grid columns: icon | Name | Key | Progress (bar + count) | Members | Updated.
Row height 40px, hover `var(--bg-hover)`.

### 6.4 ✅ CreateProjectModal (`src/features/workspace/components/CreateProjectModal.tsx`)
Name + key (auto from name, editable) + color swatch picker (PROJECT_COLORS from design data).
POST `/api/project`.

---

## Phase 7 — Project View / Kanban ✅
*Reference: `screen-project.jsx`*

### 7.1 ✅ ProjectPage (`src/features/project/pages/ProjectPage.tsx`)
- Sticky header: breadcrumb + glyph + name + key (mono) + avatar stack + Board/List toggle + "New task (C)" button
- Toolbar: search + Filter + assignee filter chips (ALL circle + member avatars with opacity when filtered) + CARDS/COMPACT board variant toggle

### 7.2 ✅ KanbanBoard (`src/features/project/components/KanbanBoard.tsx`)
- Horizontal scroll, `min-height: calc(100vh - 180px)`, `align-items: flex-start`
- Column: `flex: 0 0 300px`, `background: var(--bg-sub)`, rounded border
- Column header: status dot + label + count + `+` add button
- Drop zone: `onDragOver` → `background: var(--accent-wash)` + `onDrop` → PATCH task status

### 7.3 ✅ KanbanCard — detailed (`src/features/project/components/KanbanCard.tsx`)
Draggable. Padding 10px, `var(--bg-2)`, border. Shows:
- Row: task key (mono) + priority bars (right)
- Title (13px, 1.4 line-height)
- Labels row (Tags)
- Footer: due (calendar icon + date) + comments count + assignee avatar

### 7.4 ✅ KanbanCompactCard (`src/features/project/components/KanbanCompactCard.tsx`)
Single row `6px 10px`: priority bars + task# + title (truncated) + due + avatar. Height ~32px.

### 7.5 ✅ InlineNewTask (`src/features/project/components/InlineNewTask.tsx`)
Textarea in column, auto-focused, accent border. Enter → add task, ESC → cancel.
Footer: "ENTER to save · ESC to cancel" mono + "ADD →" button.

### 7.6 ✅ ListView (`src/features/project/components/ListView.tsx`)
Grouped by status. Each row: priority bars + status dot + key (60px mono) + title + labels + due + comments + avatar.
Row height 34px. Group header: status dot + label + count.

---

## Phase 8 — Task Modal ✅
*Reference: `task-modal.jsx`*

### 8.1 ✅ TaskModal (`src/features/tasks/components/TaskModal.tsx`)
Global overlay — rendered in AppShell, controlled by `taskModalStore`.

**Layout**: `Modal` width=780, grid `1fr 240px`.

**Header**: project glyph + "Project / TASK-KEY" (mono) + copy/link/more/close buttons.

**Main panel** (left, `padding: 20px 24px`):
- Inline-editable title: `<textarea>` 20px 500, no border, no outline, transparent bg
- Inline-editable description: `<textarea>` 13.5px, placeholder "Add a description… (supports /commands)"
- Activity section (after `borderTop`): "ACTIVITY · N" mono heading
  - Comments: avatar + name + time + body
  - System events: status dot + actor + "moved to Status" + time
- New comment: user avatar + textarea + attach button + "⌘ + ENTER" hint + Comment button

**Sidebar** (right, `var(--bg-sub)`, `padding: 16px`):
- Status: button → Popover (todo / in_progress / done) → PATCH
- Assignee: button → Popover (unassigned + members) → PATCH
- Priority: button → Popover (urgent/high/med/low/none) → PATCH
- Due: date button → PATCH
- Labels: Tag list + dashed "+ Add" button
- Meta footer (auto margin-top): CREATED · UPDATED · ID in mono 10.5px

---

## Phase 9 — Members + Roles ✅
*Reference: `screen-members.jsx`*

### 9.1 ✅ MembersPage (`src/features/members/pages/MembersPage.tsx`)
- Sticky header: "WORKSPACE / MEMBERS" breadcrumb, "Team" title + "{N} members · {N} roles" mono + "Invite people" button
- Tabs: Members / Roles & permissions (accent bottom border on active)

### 9.2 ✅ MembersTable (inline in MembersPage)
- Search input (260px) + "Filter by role" ghost button
- Table grid: `1.6fr 1.2fr 0.8fr 1fr 44px`
- Columns: Member (avatar 28px + name + YOU badge) / Email (mono) / Role / Joined (mono) / actions
- `RoleDropdown` per row: `bg-sub` pill with shield icon + role name + chevron

### 9.3 ✅ RoleDropdown (`src/features/members/components/RoleDropdown.tsx`)
Anchor-ref Popover. Disabled (opacity 0.7, cursor not-allowed) for system roles.

### 9.4 ✅ RolesPanel (`src/features/members/components/RolesPanel.tsx`)
Grid `240px 1fr`:
- Role list: shield icon (accent for system) + name + "N members · N perms" mono + SYSTEM tag
- Permission grid (right): role name + PATCH endpoint hint + Duplicate/Read-only button
  - Grouped by category (2-column grid per group)
  - Custom checkbox: 14×14px, accent bg when on, white checkmark, `cursor: not-allowed` for system roles

### 9.5 ✅ InviteModal (`src/features/members/components/InviteModal.tsx`)
`Modal` width=520:
- Header: endpoint hint mono + workspace name
- Email field + role card selector (one per non-system role, accent border when selected)
- Personal message textarea
- Footer: "Copy invite link" ghost + Cancel + Send invite

---

## Phase 10 — Settings ✅
*Reference: `screen-settings.jsx`*

### 10.1 ✅ UserSettingsPage (`src/features/settings/pages/UserSettingsPage.tsx`)
Grid `200px 1fr`. Left nav (min-height calc(100vh - 120px)):
- Profile / Password / Notifications / Keyboard / API tokens
- Active nav item: `var(--bg-hover)` bg, icon `var(--accent)`, text `var(--text)` 500

`SettingRow`: `grid 1fr 300px`, `padding: 16px 0`, `border-top: 1px solid var(--border)`.

### 10.2 ✅ ProfileSection
- Avatar: `Avatar` 48px + Upload + Remove buttons
- Full name Input → PATCH `/api/user/profile`
- Email: disabled + VERIFIED tag
- User ID: mono Input + copy button
- Save button + "✓ Saved" mono confirmation
- Danger zone: red border box (`#fecaca`/`#fef2f2`), flag icon, Delete account button

### 10.3 ✅ PasswordSection
Current + new + confirm password fields. PATCH `/api/user/password`.

### 10.4 ✅ NotifsSection
`Toggle` per item: assigned / mentions / comments / status / weekly digest.

### 10.5 ✅ KeyboardSection
Static table grouped by Global / Navigation / Task. `<kbd>` badges per shortcut.

### 10.6 ✅ ApiSection
Token list (name + prefix + last used + Revoke). "Generate new token" button.

### 10.7 ✅ WorkspaceSettingsPage (`src/features/settings/pages/WorkspaceSettingsPage.tsx`)
Accessible from sidebar workspace popover → "Workspace settings":
- General: workspace name (editable), slug (read-only)
- Appearance: accent color picker (hex input + preset swatches from `PROJECT_COLORS`), font select (Geist / IBM Plex / System), density select (Compact / Comfortable / Spacious)
- Localization: timezone, date format, language
- Danger zone: Delete workspace (owner only) — red zone same pattern as profile
- PATCH `/api/workspace/:id/settings` → re-run `applySettingsHierarchy()`

---

## Phase 11 — CmdK + Keyboard Shortcuts ✅
*Reference: `cmdk.jsx`, `app.jsx`*

### 11.1 ✅ CmdK (`src/components/overlays/CmdK.tsx`)
Port `cmdk.jsx` exactly:
- Fixed inset backdrop `rgba(15,15,15,0.35)`, click-outside closes
- Modal: width 560px, `var(--bg-2)`, border, `border-radius: var(--radius-lg)`, `modal-in` animation
- Search input: `I.search` (15px) + flex input + ESC kbd
- Results: `max-height: 420px`, scrollable, `padding: 6`
- Groups: Navigation / Actions / Projects / Tasks
- Group header: mono 10.5px uppercase, `var(--text-3)`
- Item row: height 32px, icon + label + kbd hint, `var(--bg-hover)` when active
- Footer: ↵ open · ↑↓ navigate · ESC close + "MTAC · v0.1.0" mono right

Navigation items: Go to Home (G H) / My tasks (G T) / Members (G M) / Settings (G S)
Actions: New task (C) / New project (⇧P) / Invite member (⇧I) / Toggle theme (⇧D)
Projects: from workspace store
Tasks: recent assigned tasks

### 11.2 ✅ Keyboard shortcuts hook (`src/hooks/useKeyboardShortcuts.ts`)
Global `keydown` on `window`, registered in AppShell:
- `⌘K` / `Ctrl+K` → `openCmdK()`
- `C` (not in input) → `openTask(null)` (new task)
- `?` → navigate `/settings#keyboard`
- `⇧D` → toggle theme
- `G` sequence: G→H home, G→T my tasks, G→M members, G→S settings
- ESC → close any open overlay

---

## Phase 12 — API Layer ✅
*Wire all screens to the real backend. Replace mock data with TanStack Query.*

### 12.1 Auth API (`src/api/auth.ts`)
`login` / `register` / `forgotPassword` / `getMe` / `updatePassword`

### 12.2 Workspace API (`src/api/workspace.ts`)
`listWorkspaces` / `createWorkspace` / `getWorkspace` / `updateWorkspace` / `deleteWorkspace` / `getSettings` / `updateSettings`

### 12.3 Project API (`src/api/project.ts`)
`listProjects(workspaceId)` / `createProject` / `getProject` / `updateProject` / `deleteProject`

### 12.4 Task API (`src/api/task.ts`)
`listTasks(projectId)` / `createTask` / `getTask` / `updateTask` / `deleteTask`

### 12.5 Member API (`src/api/member.ts`)
`listMembers(workspaceId)` / `addMember` / `updateMemberRole` / `removeMember`

### 12.6 Role API (`src/api/role.ts`)
`listRoles(workspaceId)` / `updateRolePermissions`

### 12.7 User API (`src/api/user.ts`)
`getProfile` / `updateProfile` / `updatePreferences`

### 12.8 Query hooks (`src/hooks/queries/`)
One file per domain. Each exports `useXxx()` and `useXxxMutation()`.
Pattern: `useQuery(['key', id], fn)` / `useMutation(fn, { onSuccess: () => queryClient.invalidateQueries(['key']) })`.

---

## Build order

```
Phase 0  →  Types · Axios · Stores · Query client · Router shell
Phase 1  →  Icons · Shared components (Avatar, Btn, Tag, Modal, Popover…)
Phase 2  →  Layout shell (Sidebar + AppShell)
Phase 3  →  Auth screens (Login / Register / Forgot)
Phase 4  →  Workspace selector
Phase 5  →  Dashboard (Overview + Focus)
Phase 6  →  Workspace projects view
Phase 7  →  Project / Kanban board
Phase 8  →  Task modal
Phase 9  →  Members + Roles
Phase 10 →  Settings (user + workspace)
Phase 11 →  CmdK + keyboard shortcuts
Phase 12 →  Wire to real API
```
