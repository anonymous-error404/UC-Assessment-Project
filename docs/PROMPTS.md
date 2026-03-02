# 📝 PROMPTS.md — AI Prompt Log

This document logs all AI prompts used during the development of the Issue Tracker application and summarizes what the AI returned.

---

## Session Overview

| # | Prompt Topic | AI Response Summary |
|---|-------------|-------------------|
| 1 | Build the Issue Tracker frontend UI | Generated full React app: LoginPage, RegisterPage, DashboardPage with stats/filters/table, IssueDetailPage with comments, ProjectsPage with CRUD, Layout with sidebar — all with a premium dark-themed design system using CSS custom properties |
| 2 | Fix build errors after initial generation | Fixed all ESLint/build errors, missing imports, and component wiring issues |
| 3 | Make it real-time with no delay | Implemented Socket.IO integration — created `socket.js` utility, wrapped Express in HTTP server, added emit calls to all controllers, created `useSocket` React hook, wired DashboardPage and IssueDetailPage to re-fetch on socket events |
| 4 | Employee should not decide the assignee | Removed assignee dropdown from CreateIssueModal for employees (frontend), added `delete req.body.assignedTo` guard in issue controller (backend) |
| 5 | Create CSV download of all issues for manager | Added `exportCSV` controller function with proper CSV escaping, `GET /issues/export/csv` route (manager-only), and CSV download API call with blob handling on frontend |
| 6 | Create dark mode / light mode toggle | Created ThemeContext with localStorage persistence, defined light theme CSS variables via `[data-theme="light"]`, added animated toggle switch with sun/moon icons to topbar in Layout |
| 7 | Add charts for issues by priority and project | Installed Chart.js + react-chartjs-2, created DashboardCharts component (Doughnut for priority, Bar for projects), added controller/routes for `/stats/priority` and `/stats/project`, integrated with real-time socket updates |
| 8 | Implement drag-and-drop Kanban board | Installed @dnd-kit, created KanbanPage with 4 status columns, draggable cards (manager-only), optimistic updates with rollback on API failure, project filter, search, real-time socket updates. Added route and sidebar nav link |
| 9 | Kanban board drag-drop not working | Rewrote KanbanPage with `rectIntersection` collision detection, separated click from drag handlers, fixed DragOverlay with `dropAnimation={null}`, reduced activation distance |
| 10 | AI chatbot + issue summary + comment summary | Installed @google/generative-ai, created ai.service.js (chat/summarizeIssue/summarizeComments using Gemini 2.5 Flash), ai.controller.js, ai.routes.js, floating AIChatbot component on all pages, ✨ AI Summary buttons on IssueDetailPage |
| 11 | Make UI responsive for phone | Added comprehensive mobile media queries across all CSS files — Layout (sidebar overlay), Dashboard (stacking toolbar, compact stats), IssueDetail (stacking comment form), Projects (single-column grid), index.css (full-width modals) |
| 12 | Write ARCHITECTURE.md and PROMPTS.md | Generated both documentation files in /docs folder |

---

## Detailed Prompt History

### Prompt 1 — Frontend UI Generation
**What I asked:**
> Build the complete frontend for the Issue Tracker. Need Login, Register, Dashboard with issue stats and table, Issue Detail with comments, Projects page. Use React with Vite. Premium dark-themed design.

**What I got:**
Complete React application with 6 pages, reusable components, CSS design system with custom properties, protected routes, auth context, Axios API client, and a premium dark-mode UI with gradients, badges, modals, and responsive layout.

---

### Prompt 2 — Build Error Fixes
**What I asked:**
> Fix all the build errors — missing imports, incorrect component references, ESLint warnings.

**What I got:**
AI identified and fixed all TypeScript/JSX errors, missing component imports, incorrect prop types, and ensured a clean build output.

---

### Prompt 3 — Real-Time Updates with Socket.IO
**What I asked:**
> I need it fast and real time, with no delay. When one user creates an issue, other users should see it instantly without refreshing.

**What I got:**
Full Socket.IO implementation: backend `socket.js` utility with `initSocket()`/`getIO()`, HTTP server wrapping Express, emit calls in all 3 controllers (issue, project, comment), frontend `useSocket` hook, and auto-refresh in Dashboard and IssueDetail pages.

---

### Prompt 4 — Remove Assignee for Employees
**What I asked:**
> The employee while creating an issue should not be able to decide the assignee, the manager decides it, so make it that way frontend backend both.

**What I got:**
Frontend: Assignee dropdown in CreateIssueModal conditionally rendered only for managers. Backend: `delete req.body.assignedTo` guard in createIssue controller when role is not manager.

---

### Prompt 5 — CSV Export for Manager
**What I asked:**
> Create a new feature for the manager which gives a csv download of all the issues.

**What I got:**
Backend `exportCSV` controller with proper CSV escaping (handles commas, quotes, newlines), `GET /issues/export/csv` route restricted to managers. Frontend API function with Blob download and auto-click anchor pattern.

---

### Prompt 6 — Dark/Light Mode Toggle
**What I asked:**
> Can you please create a dark mode / light mode toggle switch to switch in btwn dark and light modes?

**What I got:**
`ThemeContext.jsx` with `localStorage` persistence, light theme CSS variable overrides via `[data-theme="light"]`, animated toggle switch component placed in the topbar with 🌙/☀️ icons. All components auto-adapt since they use CSS custom properties.

---

### Prompt 7 — Dashboard Charts
**What I asked:**
> In frontend, create a chart showing issues by priority and issues by projects. Use suitable library, I have already created backend routes.

**What I got:**
Installed `chart.js` + `react-chartjs-2`. Created `DashboardCharts` component with a Doughnut chart (issues by priority — color-coded by severity) and a Bar chart (issues by project). Connected to dedicated `/stats/priority` and `/stats/project` API endpoints. Real-time updates via Socket.IO.

---

### Prompt 8 — Kanban Board
**What I asked:**
> Implement a Drag-and-Drop Kanban board. 4 columns: Open | In Progress | Resolved | Closed. Use dnd-kit. Managers can drag, employees view-only. Optimistic updates with rollback on API failure. Include project filter and search.

**What I got:**
Full `KanbanPage.jsx` with @dnd-kit/core, 4 droppable columns, draggable cards (disabled for employees), optimistic status update with revert on error, project dropdown filter, search by title/description, real-time socket updates, click-to-navigate to issue detail. CSS with responsive breakpoints.

---

### Prompt 9 — Kanban Drag Fix
**What I asked:**
> The kanban board has to be drag and drop, it should give me to drag an issue and drop it in the status categories.

**What I got:**
Rewrote KanbanPage with `rectIntersection` collision detection (more reliable than `closestCorners`), separated onClick (title only) from drag listeners (card body), added `dropAnimation={null}` to DragOverlay, reduced activation distance to 5px, added "🔒 View-only" message for employees.

---

### Prompt 10 — AI Features (Chatbot + Summaries)
**What I asked:**
> Implement an AI chatbot for each page which will answer any questions about issues or projects. Also AI-based issue summary generation and comment summary generation. Use Google Gemini.

**What I got:**
Backend: `ai.service.js` with 3 functions (chat loads all issues/projects as context, summarizeIssue, summarizeComments) using Gemini 2.5 Flash. `ai.controller.js` + `ai.routes.js` with 3 endpoints. Frontend: Floating `AIChatbot` widget (🤖 FAB button, chat panel with message history, auto-scroll), rendered on all pages via Layout. "✨ AI Summary" and "✨ Summarize" buttons on IssueDetailPage with inline result display.

---

### Prompt 11 — Mobile Responsiveness  
**What I asked:**
> Make this UI responsive for phone as well.

**What I got:**
Added `@media (max-width: 640px)` and `@media (max-width: 768px)` queries across all CSS files. Changes: sidebar overlay visible on mobile, hamburger menu functional, stats 2-column grid, toolbar stacks vertically, full-width filters/modals, compact cards, single-column project grid, comment form stacks.

---

### Prompt 12 — Documentation
**What I asked:**
> Write ARCHITECTURE.md and PROMPTS.md documentation. Cover stack choices, DB schema, API endpoints, component structure, and what I'd improve. Document all AI prompts used.

**What I got:**
Two comprehensive markdown files in `/docs` with full tech stack rationale, Mermaid ER diagram, all 20+ API endpoints in tables, component tree, Socket.IO and AI architecture diagrams, auth/role matrix, 10 improvement ideas, and detailed prompt-by-prompt AI usage log.
