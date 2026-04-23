// Sample data modeling the MTAC API entities exactly.
// workspace -> projects -> tasks; workspace -> members (with roleId)

const MEMBERS = [
  { _id: "u_01", name: "Elena Navarro", email: "elena@mtac.io", roleId: "r_owner",  initials: "EN", hue: 220 },
  { _id: "u_02", name: "Kai Tanaka",    email: "kai@mtac.io",   roleId: "r_admin",  initials: "KT", hue: 280 },
  { _id: "u_03", name: "Priya Shah",    email: "priya@mtac.io", roleId: "r_member", initials: "PS", hue: 340 },
  { _id: "u_04", name: "Omar Diallo",   email: "omar@mtac.io",  roleId: "r_member", initials: "OD", hue: 30  },
  { _id: "u_05", name: "Mara Huang",    email: "mara@mtac.io",  roleId: "r_member", initials: "MH", hue: 160 },
  { _id: "u_06", name: "Felix Werner",  email: "felix@mtac.io", roleId: "r_viewer", initials: "FW", hue: 80  },
  { _id: "u_07", name: "Zara Ahmed",    email: "zara@mtac.io",  roleId: "r_member", initials: "ZA", hue: 200 },
];

const ME = MEMBERS[0]; // the logged-in user is Elena

const PERMISSIONS = [
  { group: "Workspace", items: [
    { key: "VIEW_WORKSPACE",     label: "View workspace details" },
    { key: "UPDATE_WORKSPACE",   label: "Update workspace settings" },
    { key: "DELETE_WORKSPACE",   label: "Delete workspace" },
  ]},
  { group: "Members", items: [
    { key: "VIEW_MEMBERS",       label: "List all members" },
    { key: "ADD_MEMBER",         label: "Invite new members" },
    { key: "REMOVE_MEMBER",      label: "Remove members" },
    { key: "UPDATE_MEMBER_ROLE", label: "Change a member's role" },
  ]},
  { group: "Roles", items: [
    { key: "ASSIGN_ROLE",        label: "Assign role when adding members" },
    { key: "CHANGE_ROLE",        label: "Modify role permissions" },
  ]},
  { group: "Projects", items: [
    { key: "CREATE_PROJECT",     label: "Create projects" },
    { key: "VIEW_PROJECT",       label: "View project details" },
    { key: "UPDATE_PROJECT",     label: "Update projects" },
    { key: "DELETE_PROJECT",     label: "Delete projects" },
  ]},
  { group: "Tasks", items: [
    { key: "CREATE_TASK",        label: "Create tasks" },
    { key: "VIEW_TASK",          label: "View task details" },
    { key: "UPDATE_TASK",        label: "Update tasks" },
    { key: "DELETE_TASK",        label: "Delete tasks" },
    { key: "ASSIGN_TASK",        label: "Assign tasks to members" },
  ]},
];

const ALL_PERMS = PERMISSIONS.flatMap(g => g.items.map(i => i.key));

const ROLES = [
  { _id: "r_owner",  name: "Owner",  system: true,  perms: ALL_PERMS, count: 1 },
  { _id: "r_admin",  name: "Admin",  system: false, perms: ALL_PERMS.filter(p => p !== "DELETE_WORKSPACE"), count: 1 },
  { _id: "r_member", name: "Member", system: false, perms: [
    "VIEW_WORKSPACE", "VIEW_MEMBERS",
    "CREATE_PROJECT", "VIEW_PROJECT", "UPDATE_PROJECT",
    "CREATE_TASK", "VIEW_TASK", "UPDATE_TASK", "ASSIGN_TASK"
  ], count: 4 },
  { _id: "r_viewer", name: "Viewer", system: false, perms: [
    "VIEW_WORKSPACE", "VIEW_MEMBERS", "VIEW_PROJECT", "VIEW_TASK"
  ], count: 1 },
];

const WORKSPACES = [
  { _id: "w_01", name: "Acme Product", slug: "acme", projectCount: 6, taskCount: 84, memberCount: 7 },
  { _id: "w_02", name: "Side Studio",  slug: "studio", projectCount: 2, taskCount: 12, memberCount: 2 },
];

const PROJECTS = [
  { _id: "p_01", workspaceId: "w_01", name: "Q4 Launch",         key: "LAU", color: "indigo",  taskCount: 24, done: 9,  updated: "2h" },
  { _id: "p_02", workspaceId: "w_01", name: "Design System 2.0", key: "DS",  color: "violet",  taskCount: 18, done: 4,  updated: "5h" },
  { _id: "p_03", workspaceId: "w_01", name: "Mobile App v3",     key: "MOB", color: "emerald", taskCount: 31, done: 14, updated: "1d" },
  { _id: "p_04", workspaceId: "w_01", name: "Pricing Page",      key: "PR",  color: "amber",   taskCount: 7,  done: 2,  updated: "3d" },
  { _id: "p_05", workspaceId: "w_01", name: "Onboarding Revamp", key: "ONB", color: "rose",    taskCount: 14, done: 11, updated: "1w" },
  { _id: "p_06", workspaceId: "w_01", name: "API Gateway",       key: "API", color: "cyan",    taskCount: 19, done: 6,  updated: "4h" },
];

// Tasks for project p_01 (Q4 Launch) — fully modeled
const TASKS = [
  // todo
  { _id: "t_01", projectId: "p_01", key: "LAU-21", title: "Finalize launch-day homepage copy", description: "Review with marketing and pick the final variant. Focus on the value prop in the hero.", status: "todo", assigned_to: "u_03", priority: "high",   labels: ["copy", "homepage"], due: "Nov 14", comments: 3 },
  { _id: "t_02", projectId: "p_01", key: "LAU-22", title: "Audit analytics events for new pricing flow", description: "", status: "todo", assigned_to: "u_04", priority: "med",    labels: ["analytics"], due: "Nov 15", comments: 0 },
  { _id: "t_03", projectId: "p_01", key: "LAU-23", title: "Replace hero illustration with product screenshot", description: "", status: "todo", assigned_to: "u_05", priority: "low",    labels: ["design"], due: null, comments: 1 },
  { _id: "t_04", projectId: "p_01", key: "LAU-24", title: "Security review for public beta endpoints", description: "", status: "todo", assigned_to: null,   priority: "urgent", labels: ["security", "api"], due: "Nov 11", comments: 5 },

  // in_progress
  { _id: "t_05", projectId: "p_01", key: "LAU-17", title: "Wire up launch email sequence in Customer.io", description: "Three emails: welcome, day-3 tip, day-7 upsell. Uses new merge tags.", status: "in_progress", assigned_to: "u_02", priority: "high", labels: ["email", "growth"], due: "Nov 13", comments: 7 },
  { _id: "t_06", projectId: "p_01", key: "LAU-18", title: "Migrate billing provider webhooks to v2", description: "", status: "in_progress", assigned_to: "u_04", priority: "urgent", labels: ["backend"], due: "Nov 12", comments: 12 },
  { _id: "t_07", projectId: "p_01", key: "LAU-19", title: "Responsive pass on pricing comparison table", description: "", status: "in_progress", assigned_to: "u_05", priority: "med",    labels: ["design", "pricing"], due: "Nov 14", comments: 2 },

  // done
  { _id: "t_08", projectId: "p_01", key: "LAU-12", title: "Lock down Q4 launch date with CEO + marketing", description: "", status: "done", assigned_to: "u_01", priority: "high",   labels: ["planning"], due: null, comments: 4 },
  { _id: "t_09", projectId: "p_01", key: "LAU-13", title: "Draft press release v1",                          description: "", status: "done", assigned_to: "u_03", priority: "med",    labels: ["copy"],     due: null, comments: 2 },
  { _id: "t_10", projectId: "p_01", key: "LAU-14", title: "Provision staging environment for beta users",   description: "", status: "done", assigned_to: "u_04", priority: "med",    labels: ["ops"],      due: null, comments: 1 },
  { _id: "t_11", projectId: "p_01", key: "LAU-15", title: "Trademark check on 'MTAC Flow'",                  description: "", status: "done", assigned_to: "u_01", priority: "low",    labels: ["legal"],    due: null, comments: 0 },
  { _id: "t_12", projectId: "p_01", key: "LAU-16", title: "Kickoff retro with design + eng",                description: "", status: "done", assigned_to: "u_02", priority: "low",    labels: ["meta"],     due: null, comments: 3 },
];

const ACTIVITY = [
  { id: "a1", actor: "u_02", verb: "moved",   target: "LAU-18",  to: "In Progress",  time: "12m" },
  { id: "a2", actor: "u_03", verb: "commented on", target: "LAU-21", time: "38m" },
  { id: "a3", actor: "u_04", verb: "opened",   target: "LAU-24",                     time: "1h" },
  { id: "a4", actor: "u_01", verb: "merged", target: "#1284",                        time: "2h", isPr: true },
  { id: "a5", actor: "u_05", verb: "assigned", target: "LAU-23", to: "Mara Huang",   time: "3h" },
  { id: "a6", actor: "u_02", verb: "completed", target: "LAU-16",                    time: "5h" },
  { id: "a7", actor: "u_04", verb: "created", target: "LAU-24",                      time: "5h" },
];

const PROJECT_COLORS = {
  indigo:  { bg: "#eef2ff", fg: "#4f46e5" },
  violet:  { bg: "#f3e8ff", fg: "#7c3aed" },
  emerald: { bg: "#d1fae5", fg: "#059669" },
  amber:   { bg: "#fef3c7", fg: "#b45309" },
  rose:    { bg: "#ffe4e6", fg: "#be123c" },
  cyan:    { bg: "#cffafe", fg: "#0891b2" },
};

// Helper: lookup
const lookupMember = (id) => MEMBERS.find(m => m._id === id);
const lookupRole = (id) => ROLES.find(r => r._id === id);
const lookupProject = (id) => PROJECTS.find(p => p._id === id);

Object.assign(window, {
  MEMBERS, ME, PERMISSIONS, ALL_PERMS, ROLES, WORKSPACES, PROJECTS, TASKS, ACTIVITY,
  PROJECT_COLORS, lookupMember, lookupRole, lookupProject,
});
