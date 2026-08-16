-- ============================================================
-- EPMS Seed / Test Data
-- Target: PostgreSQL (epms_db)
-- Password for ALL seeded users: Test@1234
-- (BCrypt hash below, strength 10, matches Spring Security default)
--
-- Covers: users, projects, project_members, tasks,
--         comments, notifications, task_documents, audit_logs
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. USERS
-- Your existing users (id 3-7) are left untouched.
-- ------------------------------------------------------------
INSERT INTO users (email, password, full_name, role, department, designation, is_active, created_at, updated_at)
VALUES
('sarah.chen@taskflow.com',   '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Sarah Chen',       'PROJECT_MANAGER', 'Engineering', 'Senior PM',        true,  NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days'),
('mike.torres@taskflow.com',  '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Mike Torres',      'EMPLOYEE',        'Engineering', 'Backend Developer',true,  NOW() - INTERVAL '85 days', NOW() - INTERVAL '5 days'),
('priya.nair@taskflow.com',   '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Priya Nair',       'EMPLOYEE',        'Engineering', 'Frontend Developer',true,  NOW() - INTERVAL '80 days', NOW() - INTERVAL '2 days'),
('david.kim@taskflow.com',    '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'David Kim',        'EMPLOYEE',        'QA',          'QA Engineer',      true,  NOW() - INTERVAL '75 days', NOW() - INTERVAL '1 days'),
('lena.wolf@taskflow.com',    '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Lena Wolf',        'PROJECT_MANAGER', 'Design',      'Design Lead',      true,  NOW() - INTERVAL '70 days', NOW() - INTERVAL '20 days'),
('omar.saleh@taskflow.com',   '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Omar Saleh',       'EMPLOYEE',        'Design',      'UI/UX Designer',   true,  NOW() - INTERVAL '65 days', NOW() - INTERVAL '3 days'),
('retired.user@taskflow.com', '$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Retired User',     'EMPLOYEE',        'Engineering', 'Ex-Developer',     false, NOW() - INTERVAL '200 days', NOW() - INTERVAL '60 days'),
('pending.disable@taskflow.com','$2b$10$josqgm72u/3UjOKtoMcJaOhwS9QsiTdyUcGh/57H5mvoFDm9dlbt2', 'Pending Disable', 'EMPLOYEE',      'QA',          'QA Trainee',       false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 2. PROJECTS
-- created_by references the PM/Admin who created the project
-- (no separate manager column in your schema).
-- Status values must match: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
-- ------------------------------------------------------------
INSERT INTO projects (name, description, status, start_date, end_date, created_by, created_at, updated_at)
VALUES
('Customer Portal Revamp',
 'Rebuild the customer-facing portal with a new design system and faster load times.',
 'ACTIVE', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '30 days',
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 days'),

('Internal Analytics Dashboard',
 'Build an internal dashboard for tracking team velocity and sprint burndown.',
 'ACTIVE', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days',
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 days'),

('Mobile App Redesign',
 'Full UI/UX overhaul of the mobile app based on Q1 user research findings.',
 'ON_HOLD', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '10 days',
 (SELECT id FROM users WHERE email = 'lena.wolf@taskflow.com'),
 NOW() - INTERVAL '60 days', NOW() - INTERVAL '15 days'),

('Legacy API Migration',
 'Migrate legacy SOAP endpoints to REST and decommission the old gateway.',
 'COMPLETED', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE - INTERVAL '10 days',
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 NOW() - INTERVAL '120 days', NOW() - INTERVAL '10 days'),

('Q3 Marketing Site',
 'Landing pages and campaign tracking for the Q3 product launch.',
 'PLANNING', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '65 days',
 (SELECT id FROM users WHERE email = 'lena.wolf@taskflow.com'),
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. PROJECT MEMBERS (many-to-many with a per-project role)
-- role must be one of: PROJECT_LEAD, MEMBER, OBSERVER
-- unique constraint on (project_id, user_id)
-- ------------------------------------------------------------
INSERT INTO project_members (project_id, user_id, role, joined_at)
SELECT p.id, u.id, m.member_role, NOW() - m.age
FROM (VALUES
  ('Customer Portal Revamp', 'mike.torres@taskflow.com',  'PROJECT_LEAD', INTERVAL '45 days'),
  ('Customer Portal Revamp', 'priya.nair@taskflow.com',   'MEMBER',       INTERVAL '44 days'),
  ('Customer Portal Revamp', 'david.kim@taskflow.com',    'OBSERVER',     INTERVAL '40 days'),
  ('Internal Analytics Dashboard', 'mike.torres@taskflow.com', 'PROJECT_LEAD', INTERVAL '20 days'),
  ('Internal Analytics Dashboard', 'alice@taskflow.com',       'MEMBER',       INTERVAL '18 days'),
  ('Mobile App Redesign', 'omar.saleh@taskflow.com', 'PROJECT_LEAD', INTERVAL '60 days'),
  ('Mobile App Redesign', 'priya.nair@taskflow.com', 'MEMBER',       INTERVAL '58 days'),
  ('Legacy API Migration', 'mike.torres@taskflow.com',    'MEMBER', INTERVAL '120 days'),
  ('Legacy API Migration', 'peterparker@taskflow.com',    'PROJECT_LEAD', INTERVAL '120 days'),
  ('Q3 Marketing Site', 'omar.saleh@taskflow.com', 'PROJECT_LEAD', INTERVAL '3 days')
) AS m(project_name, user_email, member_role, age)
JOIN projects p ON p.name = m.project_name
JOIN users u ON u.email = m.user_email
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. TASKS
-- Status values must match: TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED
-- Priority values must match: MINOR, MEDIUM, MAJOR, CRITICAL
-- No progress/completed_at columns exist, so they're omitted.
-- assigned_to and assigned_to_id both exist as separate FKs to users -
-- populated identically here; worth checking why your entity has both.
-- Covers: overdue task, due-within-24h task, a DONE task, BLOCKED task,
-- and a spread across every priority.
-- ------------------------------------------------------------
INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, assigned_to_id, created_by, due_date, estimated_hours, actual_hours, created_at, updated_at)
VALUES
('Design new checkout flow',
 'Create wireframes and high-fidelity mockups for the redesigned checkout process.',
 'IN_PROGRESS', 'MAJOR',
 (SELECT id FROM projects WHERE name = 'Customer Portal Revamp'),
 (SELECT id FROM users WHERE email = 'priya.nair@taskflow.com'),
 (SELECT id FROM users WHERE email = 'priya.nair@taskflow.com'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 CURRENT_DATE + INTERVAL '5 days', 16, 6,
 NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 days'),

('Fix cart total rounding bug',
 'Cart totals show rounding errors when discounts are applied. Reproduce and fix.',
 'TODO', 'CRITICAL',
 (SELECT id FROM projects WHERE name = 'Customer Portal Revamp'),
 (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
 (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 CURRENT_DATE - INTERVAL '2 days', 4, 0,
 NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

('Set up CI pipeline for dashboard',
 'Configure GitHub Actions to run tests and deploy on merge to main.',
 'REVIEW', 'MEDIUM',
 (SELECT id FROM projects WHERE name = 'Internal Analytics Dashboard'),
 (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
 (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 CURRENT_DATE + INTERVAL '18 hours', 8, 7,
 NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 days'),

('Write API docs for v2 endpoints',
 'Document all v2 REST endpoints in the internal wiki with example payloads.',
 'DONE', 'MINOR',
 (SELECT id FROM projects WHERE name = 'Legacy API Migration'),
 (SELECT id FROM users WHERE email = 'peterparker@taskflow.com'),
 (SELECT id FROM users WHERE email = 'peterparker@taskflow.com'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 CURRENT_DATE - INTERVAL '15 days', 6, 5,
 NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'),

('User research synthesis',
 'Compile findings from Q1 usability testing sessions into an actionable report.',
 'BLOCKED', 'MEDIUM',
 (SELECT id FROM projects WHERE name = 'Mobile App Redesign'),
 (SELECT id FROM users WHERE email = 'omar.saleh@taskflow.com'),
 (SELECT id FROM users WHERE email = 'omar.saleh@taskflow.com'),
 (SELECT id FROM users WHERE email = 'lena.wolf@taskflow.com'),
 CURRENT_DATE + INTERVAL '3 days', 12, 3,
 NOW() - INTERVAL '12 days', NOW() - INTERVAL '4 days'),

('QA regression pass - Analytics Dashboard',
 'Full regression test pass before Analytics Dashboard release candidate.',
 'TODO', 'MAJOR',
 (SELECT id FROM projects WHERE name = 'Internal Analytics Dashboard'),
 (SELECT id FROM users WHERE email = 'alice@taskflow.com'),
 (SELECT id FROM users WHERE email = 'alice@taskflow.com'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 CURRENT_DATE + INTERVAL '10 days', 10, 0,
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Landing page hero section',
 'Build the hero section for the Q3 marketing landing page per new brand guidelines.',
 'TODO', 'MINOR',
 (SELECT id FROM projects WHERE name = 'Q3 Marketing Site'),
 (SELECT id FROM users WHERE email = 'omar.saleh@taskflow.com'),
 (SELECT id FROM users WHERE email = 'omar.saleh@taskflow.com'),
 (SELECT id FROM users WHERE email = 'lena.wolf@taskflow.com'),
 CURRENT_DATE + INTERVAL '20 days', 5, 0,
 NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 5. COMMENTS
-- Supports threaded replies via parent_id (one reply seeded below).
-- ------------------------------------------------------------
INSERT INTO comments (task_id, user_id, content, created_at, updated_at)
SELECT t.id, u.id, c.content, NOW() - c.age, NOW() - c.age
FROM (VALUES
  ('Fix cart total rounding bug', 'sarah.chen@taskflow.com', 'This is blocking the release, please prioritize today.', INTERVAL '1 days'),
  ('Fix cart total rounding bug', 'mike.torres@taskflow.com', 'Found the root cause - it''s in the discount calc, working on a fix now.', INTERVAL '5 hours'),
  ('Design new checkout flow', 'priya.nair@taskflow.com', 'First draft of wireframes uploaded, feedback welcome.', INTERVAL '3 days'),
  ('Set up CI pipeline for dashboard', 'sarah.chen@taskflow.com', 'Looks great, just add a step for lint checks before merge.', INTERVAL '2 days'),
  ('User research synthesis', 'omar.saleh@taskflow.com', 'Blocked waiting on transcripts from the research team.', INTERVAL '4 days')
) AS c(task_title, user_email, content, age)
JOIN tasks t ON t.title = c.task_title
JOIN users u ON u.email = c.user_email;

-- Threaded reply to Sarah's "prioritize today" comment
INSERT INTO comments (task_id, user_id, content, parent_id, created_at, updated_at)
SELECT t.id,
       (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
       'On it - will have a fix up for review within the hour.',
       (SELECT c.id FROM comments c
          JOIN tasks t2 ON t2.id = c.task_id
          WHERE t2.title = 'Fix cart total rounding bug'
          AND c.content LIKE 'This is blocking the release%'
          LIMIT 1),
       NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'
FROM tasks t WHERE t.title = 'Fix cart total rounding bug';

-- ------------------------------------------------------------
-- 6. NOTIFICATIONS
-- type must be one of: TASK_ASSIGNED, TASK_UPDATED, TASK_COMPLETED,
-- PROJECT_CREATED, PROJECT_UPDATED, PROJECT_COMPLETED, MEMBER_ADDED, MEMBER_REMOVED
-- (no due-soon type exists yet - see note above)
-- ------------------------------------------------------------
INSERT INTO notifications (user_id, task_id, type, message, is_read, created_at)
SELECT u.id, t.id, n.type, n.message, n.is_read, NOW() - n.age
FROM (VALUES
  ('mike.torres@taskflow.com',  'Fix cart total rounding bug',              'TASK_ASSIGNED',  'You were assigned to "Fix cart total rounding bug"', false, INTERVAL '6 days'),
  ('mike.torres@taskflow.com',  'Fix cart total rounding bug',              'TASK_UPDATED',    '"Fix cart total rounding bug" is overdue', false, INTERVAL '2 days'),
  ('priya.nair@taskflow.com',   'Design new checkout flow',                 'TASK_ASSIGNED',  'You were assigned to "Design new checkout flow"', true,  INTERVAL '10 days'),
  ('sarah.chen@taskflow.com',   'Write API docs for v2 endpoints',          'TASK_COMPLETED', 'Peter Parker marked "Write API docs for v2 endpoints" as complete', true, INTERVAL '15 days'),
  ('alice@taskflow.com',        'QA regression pass - Analytics Dashboard', 'TASK_ASSIGNED',  'You were assigned to "QA regression pass - Analytics Dashboard"', false, INTERVAL '2 days'),
  ('mike.torres@taskflow.com',  'Set up CI pipeline for dashboard',         'TASK_UPDATED',    '"Set up CI pipeline for dashboard" is due within 24 hours', false, INTERVAL '3 hours')
) AS n(user_email, task_title, type, message, is_read, age)
JOIN users u ON u.email = n.user_email
JOIN tasks t ON t.title = n.task_title;

-- Project-level notifications (task_id left NULL)
INSERT INTO notifications (user_id, task_id, type, message, is_read, created_at)
SELECT u.id, NULL, n.type, n.message, n.is_read, NOW() - n.age
FROM (VALUES
  ('mike.torres@taskflow.com',  'MEMBER_ADDED',    'You were added to "Customer Portal Revamp"', true, INTERVAL '45 days'),
  ('priya.nair@taskflow.com',   'PROJECT_UPDATED', '"Mobile App Redesign" status changed to ON_HOLD', false, INTERVAL '15 days')
) AS n(user_email, type, message, is_read, age)
JOIN users u ON u.email = n.user_email;

-- ------------------------------------------------------------
-- 7. TASK DOCUMENTS
-- Placeholder file paths only - no actual files are created.
-- ------------------------------------------------------------
INSERT INTO task_documents (task_id, file_name, file_path, file_type, file_size, uploaded_by, uploaded_at, created_at)
SELECT t.id, d.file_name, d.file_path, d.file_type, d.file_size, u.id, NOW() - d.age, NOW() - d.age
FROM (VALUES
  ('Design new checkout flow', 'checkout-wireframes-v1.pdf', '/uploads/tasks/checkout-wireframes-v1.pdf', 'application/pdf', 2458112, 'priya.nair@taskflow.com', INTERVAL '3 days'),
  ('User research synthesis',  'usability-session-notes.png', '/uploads/tasks/usability-session-notes.png', 'image/png', 892340, 'omar.saleh@taskflow.com', INTERVAL '4 days'),
  ('Write API docs for v2 endpoints', 'api-v2-spec.pdf', '/uploads/tasks/api-v2-spec.pdf', 'application/pdf', 1204551, 'peterparker@taskflow.com', INTERVAL '16 days')
) AS d(task_title, file_name, file_path, file_type, file_size, uploader_email, age)
JOIN tasks t ON t.title = d.task_title
JOIN users u ON u.email = d.uploader_email;

-- ------------------------------------------------------------
-- 8. AUDIT LOGS
-- entity_id is bigint - resolved to the real row id per entity_type.
-- changes is jsonb - included on the UPDATE example.
-- ------------------------------------------------------------
INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details, performed_at)
VALUES
('CREATE', 'PROJECT',
 (SELECT id FROM projects WHERE name = 'Customer Portal Revamp'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 'Created project "Customer Portal Revamp"',
 NOW() - INTERVAL '45 days'),

('ASSIGN', 'TASK',
 (SELECT id FROM tasks WHERE title = 'Fix cart total rounding bug'),
 (SELECT id FROM users WHERE email = 'sarah.chen@taskflow.com'),
 'Assigned task to Mike Torres',
 NOW() - INTERVAL '6 days'),

('DEACTIVATE', 'USER',
 (SELECT id FROM users WHERE email = 'retired.user@taskflow.com'),
 (SELECT id FROM users WHERE email = 'john@example.com'),
 'Deactivated inactive account',
 NOW() - INTERVAL '60 days'),

('COMPLETE', 'TASK',
 (SELECT id FROM tasks WHERE title = 'Write API docs for v2 endpoints'),
 (SELECT id FROM users WHERE email = 'peterparker@taskflow.com'),
 'Marked task as completed',
 NOW() - INTERVAL '15 days');

INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details, changes, performed_at)
VALUES
('UPDATE', 'TASK',
 (SELECT id FROM tasks WHERE title = 'Set up CI pipeline for dashboard'),
 (SELECT id FROM users WHERE email = 'mike.torres@taskflow.com'),
 'Updated task status',
 '{"status": {"old": "IN_PROGRESS", "new": "REVIEW"}}'::jsonb,
 NOW() - INTERVAL '1 days');

COMMIT;

-- ============================================================
-- Quick sanity checks:
-- ============================================================
-- SELECT role, count(*) FROM users GROUP BY role;
-- SELECT status, count(*) FROM projects GROUP BY status;
-- SELECT status, count(*) FROM tasks GROUP BY status;
-- SELECT * FROM tasks WHERE due_date < CURRENT_DATE AND status != 'DONE';   -- overdue tasks
-- SELECT * FROM tasks WHERE due_date <= CURRENT_DATE + INTERVAL '1 days' AND status != 'DONE'; -- due-soon