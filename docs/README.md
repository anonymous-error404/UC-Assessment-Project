# Internal Issue Tracker – Project Summary

## 1. Overview

This project is a simple internal **Issue Management Web Application** for a consulting company.

Employees can log issues related to projects, assign them to teammates, and track their status. Managers can view all issues across projects, filter them, and monitor progress through a dashboard.

The goal is to build a clean, reliable tool that works well for a small team (~15 people across 4 projects).

---

## 2. Tech Stack

### Backend

* Node.js + Express
* Sequelize ORM
* PostgreSQL
* JWT Authentication

### Frontend

* React + Vite
* Axios for API calls
* TailwindCSS or simple CSS

---

## 3. User Roles

### Employee

* Login
* Create issues
* View issues
* Add comments
* View assigned issues

### Manager

* All employee permissions
* View all issues
* Update issue status
* Delete issues
* Dashboard with statistics

---

## 4. Core Features

### Issue Creation

Form fields:

* Title
* Description
* Project (dropdown)
* Priority (Low / Medium / High / Critical)
* Assignee (dropdown)
* Status (Open / In Progress / Resolved / Closed)

All fields validated.

---

### Dashboard

* Show all issues in a table
* Filters:

  * Project
  * Priority
  * Status
  * Assignee
* Search by title/description
* Show counts per status

---

### Issue Detail View

* Full issue information
* Comments with timestamp
* Change status
* Assign user

---

## 5. Database Models

### Users

```
id
name
email
passwordHash
role (manager | employee)
createdAt
updatedAt
```

### Projects

```
id
name
description
managerId
createdAt
updatedAt
```

### Issues

```
id
title
description
priority
status
projectId
createdBy
assignedTo
createdAt
updatedAt
```

### IssueComments

```
id
issueId
employeeId
comment
createdAt
```

---

## 6. API Endpoints

### Auth

```
POST /auth/register
POST /auth/login
```

### Issues

```
GET    /issues
POST   /issues
GET    /issues/:id
PUT    /issues/:id
DELETE /issues/:id
POST   /issues/:id/comment
GET    /issues/stats/status
```

Filters example:

```
/issues?projectId=&priority=&status=&assignedTo=
```

### Projects

```
GET /projects
POST /projects
```

### Users

```
GET /users   (for assignee dropdown)
```

---

## 7. Frontend Pages Needed

1. **Login Page**
2. **Dashboard Page** – issue table with filters
3. **Create Issue Page** – issue form
4. **Issue Detail Page** – issue info + comments

Optional Bonus Pages:

* Charts page
* Kanban board
* CSV export

---

## 8. Example Issue JSON

```json
{
  "title": "Login bug on Chrome",
  "description": "User cannot login after refresh",
  "projectId": "uuid",
  "priority": "High",
  "assignedTo": "uuid"
}
```

---

## 9. UI Notes

* Use colored badges for priority/status
* Keep layout responsive
* Simple clean table layout
* Modal for creating issues

---

## 10. Future Improvements

* Real-time updates (WebSockets)
* CSV export
* Charts (issues by project/priority)
* Dark mode
* Drag-and-drop Kanban board

---

## 11. Development Plan

### Backend First

* Auth
* Models
* Issue CRUD
* Dashboard filters

### Frontend Parallel Work

* Login page
* Dashboard UI with mock data
* Issue form UI
* Issue detail UI

When backend APIs are ready, replace mock data with real API calls.

---

## 12. Notes for Team

* Use consistent naming
* Test APIs with Postman first
* Use environment variables
* Keep commits small and meaningful

---

**Project Owner:** Manas Gurav
**Purpose:** Full-stack technical assessment – Internal Issue Tracker
