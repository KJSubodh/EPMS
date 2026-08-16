# EPMS — Employee Project Management System

A full-stack project and task management system built with **Spring Boot** and **React**, featuring role-based access control, real-time notifications, threaded comments, file attachments, and multi-format reporting.

---

## Overview

EPMS allows organizations to manage projects, assign and track tasks, collaborate through comments, and generate reports — all gated behind a three-tier role system (Admin, Project Manager, Employee). It was built as an independent, self-directed project to apply production-style backend patterns (layered architecture, method-level security, async processing) alongside a modern React frontend.

---

## Features

### Authentication & Authorization
- User registration and login with stateless **JWT authentication**
- Three roles — **ADMIN**, **PROJECT_MANAGER**, **EMPLOYEE** — enforced via Spring Security method-level authorization (`@PreAuthorize`)
- BCrypt password hashing
- Role-specific dashboards and protected frontend routes

### Project & Task Management
- Full CRUD for projects and tasks
- Project team membership with per-member roles (`PROJECT_LEAD`, `MEMBER`, `OBSERVER`)
- Task status workflow (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BLOCKED`) and priority levels (`MINOR`, `MEDIUM`, `MAJOR`, `CRITICAL`)
- Kanban-style board positioning for tasks
- Role-aware visibility — employees see their own work, managers and admins see everything they're responsible for

### Collaboration
- Threaded comments on tasks (supports nested replies)
- File attachments on tasks
- In-app notification center covering task assignment, updates, completion, and project lifecycle events
- Async email notifications (SMTP via `JavaMailSender`, Thymeleaf templates, retry on failure) so email delivery never blocks the request thread

### Reporting
- Generate reports in **PDF** (iText), **Excel** (Apache POI), and **CSV**
- Streaming CSV export for large datasets

### Search & Audit
- Backend search across users, projects, and tasks
- Full audit log of key actions (create, assign, update, deactivate) with structured before/after change tracking (JSONB)

---

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.x
- Spring Security (JWT, method-level `@PreAuthorize`)
- Spring Data JPA / Hibernate
- PostgreSQL
- Apache POI (Excel), iText (PDF)
- Lombok

**Frontend**
- React 18 (Hooks)
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS

**Tooling**
- Maven
- Postman (API testing)
- Git / GitHub

---

## Architecture

The backend follows a layered architecture:

```
Controller → Service → Repository → Database
```

with DTOs for request/response boundaries, centralized exception handling, and JWT validation via a security filter chain.

### Database Schema

Eight core tables:

| Table              | Purpose                                                      |
|---------------------|---------------------------------------------------------------|
| `users`             | Accounts, roles, department/designation, active status        |
| `projects`          | Project metadata, status, ownership (`created_by`)             |
| `project_members`   | Many-to-many project ↔ user, with a per-project role           |
| `tasks`             | Task details, status, priority, assignment, project linkage    |
| `comments`          | Task discussion, with self-referencing `parent_id` for threads |
| `notifications`     | In-app notifications per user, optionally linked to a task     |
| `task_documents`    | File attachment metadata for tasks                             |
| `audit_logs`        | Action history with JSONB change tracking                      |

Key relationships:
- `Project 1 —* Task`
- `Project *—* User` (via `project_members`, with role)
- `Task 1—* Comment` (self-referencing for threads)
- `Task 1—* TaskDocument`
- `User 1—* Notification`

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- PostgreSQL 14+
- Maven

### Backend Setup

```bash
cd epms-backend

# Configure your database and mail settings
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edit `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/epms_db
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

jwt.secret=your-secret-key
jwt.expiration=86400000

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-app@gmail.com
spring.mail.password=your-app-password
```

Run the backend:

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### Frontend Setup

```bash
cd epms-frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:8080/api
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

| Method | Endpoint                          | Description                        |
|--------|------------------------------------|-------------------------------------|
| POST   | `/api/auth/register`               | Register a new user                 |
| POST   | `/api/auth/login`                  | Authenticate and receive a JWT      |
| GET    | `/api/projects`                    | List projects                       |
| POST   | `/api/projects`                    | Create a project                    |
| PUT    | `/api/projects/{id}`               | Update a project                    |
| DELETE | `/api/projects/{id}`               | Delete a project                    |
| POST   | `/api/projects/{id}/members`       | Assign a user to a project          |
| GET    | `/api/tasks`                       | List tasks (scoped by role)         |
| POST   | `/api/tasks`                       | Create a task                       |
| PATCH  | `/api/tasks/{id}/status`           | Update task status                  |
| GET    | `/api/tasks/{id}/comments`         | Get comments for a task             |
| POST   | `/api/tasks/{id}/comments`         | Add a comment (or reply)            |
| POST   | `/api/tasks/{id}/documents`        | Upload a file attachment            |
| GET    | `/api/notifications`               | Get current user's notifications    |
| GET    | `/api/reports`                     | Generate a report (PDF/Excel/CSV)   |
| GET    | `/api/search?query=`               | Search across users/projects/tasks  |

> Full endpoint list and request/response schemas are available in the Postman collection (`/docs/postman`).

---

## Roadmap

- [ ] Async report generation with email-on-ready notification
- [ ] Full-text/fuzzy search (Elasticsearch)
- [ ] Redis caching for dashboard aggregates
- [ ] Docker Compose setup for one-command local environment
- [ ] Integration tests with Testcontainers
- [ ] "Due within 24 hours" notification type

---

## License

This project is available for personal and educational use.

## Author

**K J Subodh**
[LinkedIn](https://www.linkedin.com/in/kj-subodh-a8a32926a/) · [GitHub](https://github.com/KJSubodh)