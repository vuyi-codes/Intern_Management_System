-- Intern MS — sample data seed
-- =============================================================================
-- IMPORTANT: Auth users cannot be inserted here safely.
-- profiles rows are created by the handle_new_user trigger when you create
-- users in Supabase Auth.
--
-- Manual steps before running this seed:
-- 1. Run migrations/0001_init.sql (and later 0002 / 0003 when applying those)
-- 2. In Supabase Dashboard → Authentication → Users → Add user, create:
--      admin@inkdot.com          (password of your choice)
--      jordan.peters@inkdot.com
--      aisha.naidoo@inkdot.com
--      nomsa.khumalo@inkdot.com
--      thabo.molefe@inkdot.com
--      lerato.dlamini@inkdot.com
--      zanele.botha@inkdot.com
--      ethan.jacobs@inkdot.com
-- 3. Then run this entire file in the SQL Editor.
-- =============================================================================

-- Promote roles + fill profile fields (trigger already created rows as interns)
update public.profiles
set
  role = 'admin',
  full_name = 'Admin User',
  phone = '+27 82 555 0101',
  title = 'Programme Administrator',
  department = 'Operations'
where email = 'admin@inkdot.com';

update public.profiles
set
  role = 'supervisor',
  full_name = 'Jordan Peters',
  phone = '+27 82 555 0111',
  title = 'Senior Engineering Mentor',
  department = 'Product Engineering',
  capacity = 6,
  supervisor_status = 'Active',
  supervisor_start_date = '2024-03-01'
where email = 'jordan.peters@inkdot.com';

update public.profiles
set
  role = 'supervisor',
  full_name = 'Aisha Naidoo',
  phone = '+27 82 555 0112',
  title = 'Frontend Lead Mentor',
  department = 'Product Engineering',
  capacity = 5,
  supervisor_status = 'Active',
  supervisor_start_date = '2024-06-15'
where email = 'aisha.naidoo@inkdot.com';

update public.profiles
set
  full_name = 'Nomsa Khumalo',
  phone = '+27 82 555 0142',
  title = 'Software Engineering Intern',
  department = 'Product Engineering'
where email = 'nomsa.khumalo@inkdot.com';

update public.profiles
set
  full_name = 'Thabo Molefe',
  phone = '+27 82 555 0143',
  title = 'Frontend Intern',
  department = 'Product Engineering'
where email = 'thabo.molefe@inkdot.com';

update public.profiles
set
  full_name = 'Lerato Dlamini',
  phone = '+27 82 555 0144',
  title = 'Backend Intern',
  department = 'Product Engineering'
where email = 'lerato.dlamini@inkdot.com';

update public.profiles
set
  full_name = 'Zanele Botha',
  phone = '+27 82 555 0145',
  title = 'Backend Intern',
  department = 'Product Engineering'
where email = 'zanele.botha@inkdot.com';

update public.profiles
set
  full_name = 'Ethan Jacobs',
  phone = '+27 82 555 0146',
  title = 'Frontend Intern',
  department = 'Product Engineering'
where email = 'ethan.jacobs@inkdot.com';

-- Programmes (idempotent by name + cohort)
insert into public.programmes (name, cohort, description, lead_supervisor_id, start_date, end_date, capacity, status)
select
  v.name,
  v.cohort,
  v.description,
  s.id,
  v.start_date::date,
  v.end_date::date,
  v.capacity,
  v.status
from (
  values
    (
      'Software Engineering',
      'Winter 2026',
      'Full-stack engineering track covering APIs, databases, and delivery.',
      'jordan.peters@inkdot.com',
      '2026-01-12',
      '2026-07-12',
      12,
      'Active'
    ),
    (
      'Frontend Development',
      'Winter 2026',
      'UI engineering with React, accessibility, and design systems.',
      'aisha.naidoo@inkdot.com',
      '2026-01-20',
      '2026-07-20',
      10,
      'Active'
    ),
    (
      'Backend Development',
      'Winter 2026',
      'Services, auth, data modelling, and API design.',
      'jordan.peters@inkdot.com',
      '2026-02-03',
      '2026-08-03',
      8,
      'Active'
    )
) as v(name, cohort, description, lead_email, start_date, end_date, capacity, status)
join public.profiles s on s.email = v.lead_email
where not exists (
  select 1 from public.programmes p
  where p.name = v.name and p.cohort = v.cohort
);

-- Supervisor ↔ programme links
insert into public.supervisor_programmes (supervisor_id, programme_id)
select s.id, p.id
from public.profiles s
join public.programmes p on true
where (s.email, p.name) in (
  ('jordan.peters@inkdot.com', 'Software Engineering'),
  ('jordan.peters@inkdot.com', 'Frontend Development'),
  ('jordan.peters@inkdot.com', 'Backend Development'),
  ('aisha.naidoo@inkdot.com', 'Frontend Development')
)
on conflict do nothing;

-- Intern placements (id = profile id)
insert into public.interns (id, programme_id, supervisor_id, start_date, end_date, progress, status)
select
  pr.id,
  pg.id,
  sup.id,
  v.start_date::date,
  v.end_date::date,
  v.progress,
  v.status
from (
  values
    ('nomsa.khumalo@inkdot.com', 'Software Engineering', 'jordan.peters@inkdot.com', '2026-01-12', '2026-07-12', 68, 'Active'),
    ('thabo.molefe@inkdot.com', 'Frontend Development', 'aisha.naidoo@inkdot.com', '2026-01-20', '2026-07-20', 54, 'Active'),
    ('lerato.dlamini@inkdot.com', 'Backend Development', 'jordan.peters@inkdot.com', '2026-02-03', '2026-08-03', 22, 'Onboarding'),
    ('zanele.botha@inkdot.com', 'Backend Development', 'jordan.peters@inkdot.com', '2026-03-09', '2026-09-09', 44, 'Active'),
    ('ethan.jacobs@inkdot.com', 'Frontend Development', 'jordan.peters@inkdot.com', '2026-04-06', '2026-10-06', 39, 'Active')
) as v(email, programme_name, supervisor_email, start_date, end_date, progress, status)
join public.profiles pr on pr.email = v.email
join public.programmes pg on pg.name = v.programme_name and pg.cohort = 'Winter 2026'
join public.profiles sup on sup.email = v.supervisor_email
on conflict (id) do update set
  programme_id = excluded.programme_id,
  supervisor_id = excluded.supervisor_id,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  progress = excluded.progress,
  status = excluded.status;

-- Sample tasks (skip if title+intern already exists)
insert into public.tasks (title, description, intern_id, assigned_by, due_date, priority, status)
select
  v.title,
  v.description,
  i.id,
  a.id,
  v.due_date::date,
  v.priority,
  v.status
from (
  values
    (
      'Build intern overview page',
      'Finish layout, stats cards, and activity feed for the intern dashboard.',
      'nomsa.khumalo@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-02',
      'High',
      'In progress'
    ),
    (
      'API auth middleware',
      'Secure route handlers and document usage for the backend module.',
      'lerato.dlamini@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-02',
      'High',
      'Review'
    ),
    (
      'Login form validation',
      'Improve client and server validation messaging on login.',
      'ethan.jacobs@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-07',
      'Low',
      'Review'
    ),
    (
      'Database seed script',
      'Add seed data for programmes, interns, and sample tasks.',
      'zanele.botha@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-03-30',
      'High',
      'Overdue'
    )
) as v(title, description, intern_email, assigner_email, due_date, priority, status)
join public.profiles ip on ip.email = v.intern_email
join public.interns i on i.id = ip.id
join public.profiles a on a.email = v.assigner_email
where not exists (
  select 1 from public.tasks t
  where t.intern_id = i.id and t.title = v.title
);

-- Sample daily logs
insert into public.daily_logs (intern_id, log_date, hours, summary, blockers, tomorrow, status, mentor_note)
select
  i.id,
  v.log_date::date,
  v.hours,
  v.summary,
  v.blockers,
  v.tomorrow,
  v.status,
  v.mentor_note
from (
  values
    (
      'nomsa.khumalo@inkdot.com',
      '2026-04-03',
      7.5,
      'Finished overview stats cards and started wiring the activity feed.',
      'Need final copy for empty activity states.',
      'Complete activity feed and open a PR for review.',
      'Submitted',
      ''
    ),
    (
      'lerato.dlamini@inkdot.com',
      '2026-04-02',
      6.5,
      'Documented auth middleware usage and prepared the review package.',
      'None.',
      'Respond to mentor feedback on the middleware PR.',
      'Reviewed',
      'Clear write-up. Add one sequence diagram next time.'
    ),
    (
      'zanele.botha@inkdot.com',
      '2026-04-02',
      7.0,
      'Extended seed fixtures for programmes and sample tasks.',
      'Seed script still fails on duplicate emails in local resets.',
      'Fix duplicate-key handling and cover with a test.',
      'Flagged',
      'Flagged until the seed reset issue is resolved.'
    )
) as v(email, log_date, hours, summary, blockers, tomorrow, status, mentor_note)
join public.profiles p on p.email = v.email
join public.interns i on i.id = p.id
where not exists (
  select 1 from public.daily_logs d
  where d.intern_id = i.id and d.log_date = v.log_date::date and d.summary = v.summary
);

-- Sample reviews
insert into public.reviews (
  title, summary, intern_id, reviewer_id, type, submitted_at, due_date, status, outcome, feedback
)
select
  v.title,
  v.summary,
  i.id,
  r.id,
  v.type,
  v.submitted_at::date,
  v.due_date::date,
  v.status,
  v.outcome,
  v.feedback
from (
  values
    (
      'API auth middleware',
      'Route protection and usage notes submitted for mentor review.',
      'lerato.dlamini@inkdot.com',
      'jordan.peters@inkdot.com',
      'Task',
      '2026-04-01',
      '2026-04-03',
      'Pending',
      'Pending',
      ''
    ),
    (
      'Mid-programme checkpoint',
      'Written feedback on frontend module progress and goals.',
      'nomsa.khumalo@inkdot.com',
      'jordan.peters@inkdot.com',
      'Mid-programme',
      '2026-03-28',
      '2026-04-05',
      'Pending',
      'Pending',
      ''
    ),
    (
      'Onboarding checklist',
      'First-week setup reflection and checklist evidence.',
      'lerato.dlamini@inkdot.com',
      'jordan.peters@inkdot.com',
      'Daily log',
      '2026-03-30',
      '2026-04-01',
      'Completed',
      'Approved',
      'Clear checklist. Keep the same structure for next week.'
    )
) as v(title, summary, intern_email, reviewer_email, type, submitted_at, due_date, status, outcome, feedback)
join public.profiles ip on ip.email = v.intern_email
join public.interns i on i.id = ip.id
join public.profiles r on r.email = v.reviewer_email
where not exists (
  select 1 from public.reviews rv
  where rv.intern_id = i.id and rv.title = v.title
);

-- Programme modules for Nomsa
insert into public.programme_modules (intern_id, title, description, progress, status, due_date)
select
  i.id,
  v.title,
  v.description,
  v.progress,
  v.status,
  v.due_date::date
from (
  values
    ('Onboarding & tooling', 'Environment setup, repo access, and first-week checklist.', 100, 'Completed', '2026-01-26'),
    ('Frontend foundations', 'Layout systems, forms, and shared UI primitives.', 100, 'Completed', '2026-02-20'),
    ('Dashboard delivery', 'Intern overview, charts, and responsive task boards.', 72, 'In progress', '2026-04-10'),
    ('API integration', 'Connect dashboard views to programme and task endpoints.', 35, 'In progress', '2026-05-08'),
    ('Testing & quality', 'Component tests, accessibility checks, and QA walkthrough.', 0, 'Upcoming', '2026-06-05'),
    ('Final showcase', 'Demo prep, reflection notes, and programme close-out.', 0, 'Upcoming', '2026-07-10')
) as v(title, description, progress, status, due_date)
join public.profiles p on p.email = 'nomsa.khumalo@inkdot.com'
join public.interns i on i.id = p.id
where not exists (
  select 1 from public.programme_modules m
  where m.intern_id = i.id and m.title = v.title
);

-- Extended intern profile for Nomsa
insert into public.intern_profiles (
  user_id, bio, skills, location, university, linkedin, github, emergency_name, emergency_phone
)
select
  p.id,
  'Software engineering intern focused on product dashboards, accessible UI, and clean component systems.',
  array['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Git', 'Figma'],
  'Johannesburg, South Africa',
  'University of the Witwatersrand',
  'https://linkedin.com/in/nomsa-khumalo',
  'https://github.com/nomsa-khumalo',
  'Thandi Khumalo',
  '+27 82 555 0190'
from public.profiles p
where p.email = 'nomsa.khumalo@inkdot.com'
on conflict (user_id) do update set
  bio = excluded.bio,
  skills = excluded.skills,
  location = excluded.location,
  university = excluded.university,
  linkedin = excluded.linkedin,
  github = excluded.github,
  emergency_name = excluded.emergency_name,
  emergency_phone = excluded.emergency_phone;

-- Default settings rows for seeded users
insert into public.user_settings (user_id)
select p.id
from public.profiles p
where p.email in (
  'admin@inkdot.com',
  'jordan.peters@inkdot.com',
  'aisha.naidoo@inkdot.com',
  'nomsa.khumalo@inkdot.com',
  'thabo.molefe@inkdot.com',
  'lerato.dlamini@inkdot.com',
  'zanele.botha@inkdot.com',
  'ethan.jacobs@inkdot.com'
)
on conflict (user_id) do nothing;

-- Sample notifications (requires 0003_messaging_notifications_avatars.sql)
insert into public.notifications (user_id, title, detail, href, icon_key, unread, created_at)
select p.id, v.title, v.detail, v.href, v.icon_key, v.unread, now() - v.age
from public.profiles p
join (
  values
    ('thabo.molefe@inkdot.com', 'Task due today', 'Build intern overview page is due at 17:00.', '/intern/tasks', 'task', true, interval '10 minutes'),
    ('thabo.molefe@inkdot.com', 'Daily log reminder', 'Submit your log before end of day.', '/intern/daily-log', 'log', true, interval '1 hour'),
    ('thabo.molefe@inkdot.com', 'Feedback received', 'Jordan Peters left comments on your last task.', '/intern/tasks', 'review', false, interval '1 day'),
    ('jordan.peters@inkdot.com', 'Log awaiting review', 'Thabo submitted a daily log for review.', '/supervisor/logs', 'log', true, interval '20 minutes'),
    ('jordan.peters@inkdot.com', 'Task marked complete', 'An intern finished a task.', '/supervisor/tasks', 'task', true, interval '2 hours'),
    ('jordan.peters@inkdot.com', 'Review due', 'Mid-programme review is due tomorrow.', '/supervisor/reviews', 'review', false, interval '1 day'),
    ('admin@inkdot.com', 'New enrolments', 'Applicants are waiting for approval.', '/admin/interns', 'bell', true, interval '30 minutes'),
    ('admin@inkdot.com', 'Programme checkpoint', 'Frontend Q4 intake kickoff is today.', '/admin/programmes', 'review', true, interval '3 hours'),
    ('admin@inkdot.com', 'Report ready', 'Summary can be exported from Reports.', '/admin/reports', 'task', false, interval '1 day')
) as v(email, title, detail, href, icon_key, unread, age)
  on p.email = v.email
where not exists (
  select 1
  from public.notifications n
  where n.user_id = p.id
    and n.title = v.title
);

-- =============================================================================
-- Extended demo data (safe to re-run; uses the same auth users as above)
-- =============================================================================

-- Extra programme
insert into public.programmes (name, cohort, description, lead_supervisor_id, start_date, end_date, capacity, status)
select
  v.name,
  v.cohort,
  v.description,
  s.id,
  v.start_date::date,
  v.end_date::date,
  v.capacity,
  v.status
from (
  values
    (
      'Quality Assurance',
      'Winter 2026',
      'Testing strategy, automation, and release quality gates.',
      'aisha.naidoo@inkdot.com',
      '2026-02-17',
      '2026-08-17',
      6,
      'Active'
    ),
    (
      'Software Engineering',
      'Summer 2026',
      'Next cohort intake for the full-stack engineering track.',
      'jordan.peters@inkdot.com',
      '2026-08-03',
      '2027-02-03',
      14,
      'Upcoming'
    )
) as v(name, cohort, description, lead_email, start_date, end_date, capacity, status)
join public.profiles s on s.email = v.lead_email
where not exists (
  select 1 from public.programmes p
  where p.name = v.name and p.cohort = v.cohort
);

insert into public.supervisor_programmes (supervisor_id, programme_id)
select s.id, p.id
from public.profiles s
join public.programmes p on true
where (s.email, p.name, p.cohort) in (
  ('aisha.naidoo@inkdot.com', 'Quality Assurance', 'Winter 2026'),
  ('jordan.peters@inkdot.com', 'Quality Assurance', 'Winter 2026'),
  ('jordan.peters@inkdot.com', 'Software Engineering', 'Summer 2026'),
  ('aisha.naidoo@inkdot.com', 'Software Engineering', 'Winter 2026')
)
on conflict do nothing;

-- More tasks across the cohort
insert into public.tasks (title, description, intern_id, assigned_by, due_date, priority, status)
select
  v.title,
  v.description,
  i.id,
  a.id,
  v.due_date::date,
  v.priority,
  v.status
from (
  values
    (
      'Wire activity feed API',
      'Connect the overview activity list to live programme events.',
      'nomsa.khumalo@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-11',
      'Medium',
      'In progress'
    ),
    (
      'Accessibility pass on dashboard',
      'Keyboard navigation, contrast, and aria labels for overview cards.',
      'nomsa.khumalo@inkdot.com',
      'aisha.naidoo@inkdot.com',
      '2026-04-18',
      'High',
      'In progress'
    ),
    (
      'Design system button variants',
      'Document outline, ghost, and destructive variants with examples.',
      'thabo.molefe@inkdot.com',
      'aisha.naidoo@inkdot.com',
      '2026-04-09',
      'Medium',
      'Done'
    ),
    (
      'Responsive nav polish',
      'Fix mobile drawer focus trap and collapsed sidebar labels.',
      'thabo.molefe@inkdot.com',
      'aisha.naidoo@inkdot.com',
      '2026-04-14',
      'High',
      'In progress'
    ),
    (
      'Role-based route guards',
      'Cover admin, supervisor, and intern redirects with tests.',
      'lerato.dlamini@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-12',
      'High',
      'In progress'
    ),
    (
      'Postgres RLS smoke tests',
      'Write SQL checks for intern vs supervisor visibility on tasks.',
      'zanele.botha@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-08',
      'Medium',
      'Review'
    ),
    (
      'Seed reset idempotency',
      'Ensure re-running seed.sql does not create duplicate tasks or logs.',
      'zanele.botha@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-16',
      'High',
      'In progress'
    ),
    (
      'Empty-state illustrations',
      'Add quiet empty states for tasks, logs, and reviews lists.',
      'ethan.jacobs@inkdot.com',
      'aisha.naidoo@inkdot.com',
      '2026-04-10',
      'Low',
      'Done'
    ),
    (
      'Form error summary component',
      'Shared alert that lists field-level validation errors.',
      'ethan.jacobs@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-04-15',
      'Medium',
      'In progress'
    ),
    (
      'Mentor review queue filters',
      'Add status and due-date filters on the supervisor reviews page.',
      'nomsa.khumalo@inkdot.com',
      'jordan.peters@inkdot.com',
      '2026-03-25',
      'Medium',
      'Overdue'
    )
) as v(title, description, intern_email, assigner_email, due_date, priority, status)
join public.profiles ip on ip.email = v.intern_email
join public.interns i on i.id = ip.id
join public.profiles a on a.email = v.assigner_email
where not exists (
  select 1 from public.tasks t
  where t.intern_id = i.id and t.title = v.title
);

-- More daily logs
insert into public.daily_logs (intern_id, log_date, hours, summary, blockers, tomorrow, status, mentor_note)
select
  i.id,
  v.log_date::date,
  v.hours,
  v.summary,
  v.blockers,
  v.tomorrow,
  v.status,
  v.mentor_note
from (
  values
    (
      'nomsa.khumalo@inkdot.com',
      '2026-04-02',
      8.0,
      'Polished overview cards and aligned spacing with the design tokens.',
      'Waiting on final chart colour palette.',
      'Start activity feed wiring.',
      'Reviewed',
      'Nice attention to spacing. Keep cards scannable.'
    ),
    (
      'nomsa.khumalo@inkdot.com',
      '2026-04-01',
      6.0,
      'Pair session on dashboard data shapes with Jordan.',
      'None.',
      'Implement stats card loading skeletons.',
      'Reviewed',
      'Good notes from the pairing session.'
    ),
    (
      'thabo.molefe@inkdot.com',
      '2026-04-03',
      7.0,
      'Finished button variant docs and started mobile nav focus work.',
      'Need confirmation on ghost-button hover contrast.',
      'Finish focus trap and record a short loom.',
      'Submitted',
      ''
    ),
    (
      'thabo.molefe@inkdot.com',
      '2026-04-01',
      6.5,
      'Built the design-system story stubs for outline and destructive buttons.',
      'Storybook build is slow locally.',
      'Document variants and open PR.',
      'Reviewed',
      'Clear stubs. Add keyboard examples next.'
    ),
    (
      'ethan.jacobs@inkdot.com',
      '2026-04-03',
      5.5,
      'Shipped empty-state components for tasks and logs.',
      'None.',
      'Start form error summary component.',
      'Submitted',
      ''
    ),
    (
      'ethan.jacobs@inkdot.com',
      '2026-04-02',
      7.0,
      'Improved login validation copy and tested edge cases.',
      'Need product wording for expired-session errors.',
      'Hand login validation to review.',
      'Reviewed',
      'Copy is clearer. Keep messages short.'
    ),
    (
      'lerato.dlamini@inkdot.com',
      '2026-04-03',
      7.5,
      'Added route-guard tests for admin and intern redirects.',
      'One flaky test around cookie timing.',
      'Stabilize the flaky test and extend supervisor cases.',
      'Submitted',
      ''
    ),
    (
      'zanele.botha@inkdot.com',
      '2026-04-03',
      6.0,
      'Drafted RLS smoke checks for task visibility.',
      'Need a clean local DB snapshot for repeatable runs.',
      'Automate the checks in a script.',
      'Submitted',
      ''
    )
) as v(email, log_date, hours, summary, blockers, tomorrow, status, mentor_note)
join public.profiles p on p.email = v.email
join public.interns i on i.id = p.id
where not exists (
  select 1 from public.daily_logs d
  where d.intern_id = i.id and d.log_date = v.log_date::date and d.summary = v.summary
);

-- More reviews
insert into public.reviews (
  title, summary, intern_id, reviewer_id, type, submitted_at, due_date, status, outcome, feedback
)
select
  v.title,
  v.summary,
  i.id,
  r.id,
  v.type,
  v.submitted_at::date,
  v.due_date::date,
  v.status,
  v.outcome,
  v.feedback
from (
  values
    (
      'Design system button variants',
      'Variant docs and examples ready for mentor sign-off.',
      'thabo.molefe@inkdot.com',
      'aisha.naidoo@inkdot.com',
      'Task',
      '2026-04-02',
      '2026-04-04',
      'Completed',
      'Approved',
      'Solid documentation. Add one do/don’t example for destructive actions.'
    ),
    (
      'Login form validation',
      'Client and server validation messaging improvements.',
      'ethan.jacobs@inkdot.com',
      'jordan.peters@inkdot.com',
      'Task',
      '2026-04-03',
      '2026-04-05',
      'In progress',
      'Pending',
      ''
    ),
    (
      'Weekly reflection',
      'Frontend module focus and goals for the next sprint.',
      'thabo.molefe@inkdot.com',
      'aisha.naidoo@inkdot.com',
      'Daily log',
      '2026-04-01',
      '2026-04-03',
      'Completed',
      'Approved',
      'Clear goals. Keep calling out accessibility risks early.'
    ),
    (
      'Backend foundations check-in',
      'Progress on auth middleware and route guards.',
      'lerato.dlamini@inkdot.com',
      'jordan.peters@inkdot.com',
      'Mid-programme',
      '2026-04-02',
      '2026-04-08',
      'Pending',
      'Pending',
      ''
    ),
    (
      'Database seed script',
      'Seed fixtures and duplicate-key handling review.',
      'zanele.botha@inkdot.com',
      'jordan.peters@inkdot.com',
      'Task',
      '2026-04-01',
      '2026-04-04',
      'In progress',
      'Pending',
      ''
    )
) as v(title, summary, intern_email, reviewer_email, type, submitted_at, due_date, status, outcome, feedback)
join public.profiles ip on ip.email = v.intern_email
join public.interns i on i.id = ip.id
join public.profiles r on r.email = v.reviewer_email
where not exists (
  select 1 from public.reviews rv
  where rv.intern_id = i.id and rv.title = v.title
);

-- Programme modules for remaining interns
insert into public.programme_modules (intern_id, title, description, progress, status, due_date)
select
  i.id,
  v.title,
  v.description,
  v.progress,
  v.status,
  v.due_date::date
from (
  values
    ('thabo.molefe@inkdot.com', 'Onboarding & tooling', 'Repo access, design tokens, and Storybook setup.', 100, 'Completed', '2026-01-31'),
    ('thabo.molefe@inkdot.com', 'Component foundations', 'Buttons, forms, and layout primitives.', 90, 'In progress', '2026-03-15'),
    ('thabo.molefe@inkdot.com', 'Responsive UI systems', 'Mobile nav, drawers, and focus management.', 55, 'In progress', '2026-04-20'),
    ('thabo.molefe@inkdot.com', 'Design QA', 'Visual regression and accessibility checks.', 10, 'Upcoming', '2026-05-25'),
    ('lerato.dlamini@inkdot.com', 'Onboarding & tooling', 'Local stack, migrations, and first API route.', 100, 'Completed', '2026-02-14'),
    ('lerato.dlamini@inkdot.com', 'Auth & access control', 'Middleware, sessions, and role checks.', 70, 'In progress', '2026-04-15'),
    ('lerato.dlamini@inkdot.com', 'API design', 'Resource modelling and error contracts.', 25, 'In progress', '2026-05-20'),
    ('lerato.dlamini@inkdot.com', 'Observability basics', 'Logging, tracing, and health checks.', 0, 'Upcoming', '2026-06-30'),
    ('zanele.botha@inkdot.com', 'Onboarding & tooling', 'Database access and seed workflow.', 100, 'Completed', '2026-03-20'),
    ('zanele.botha@inkdot.com', 'Data modelling', 'Schema design, constraints, and indexes.', 60, 'In progress', '2026-04-25'),
    ('zanele.botha@inkdot.com', 'RLS & security', 'Policies, helper functions, and smoke tests.', 40, 'In progress', '2026-05-18'),
    ('zanele.botha@inkdot.com', 'Delivery hardening', 'Idempotent seeds and migration reviews.', 15, 'Upcoming', '2026-06-22'),
    ('ethan.jacobs@inkdot.com', 'Onboarding & tooling', 'Frontend repo, linting, and first PR.', 100, 'Completed', '2026-04-13'),
    ('ethan.jacobs@inkdot.com', 'Forms & validation', 'Client/server validation patterns.', 65, 'In progress', '2026-04-28'),
    ('ethan.jacobs@inkdot.com', 'Empty & error states', 'Quiet UI for missing and failed data.', 80, 'In progress', '2026-05-12'),
    ('ethan.jacobs@inkdot.com', 'UI polish sprint', 'Motion, density, and responsive polish.', 5, 'Upcoming', '2026-06-16')
) as v(email, title, description, progress, status, due_date)
join public.profiles p on p.email = v.email
join public.interns i on i.id = p.id
where not exists (
  select 1 from public.programme_modules m
  where m.intern_id = i.id and m.title = v.title
);

-- Intern profile cards for the rest of the cohort
insert into public.intern_profiles (
  user_id, bio, skills, location, university, linkedin, github, emergency_name, emergency_phone
)
select
  p.id,
  v.bio,
  v.skills,
  v.location,
  v.university,
  v.linkedin,
  v.github,
  v.emergency_name,
  v.emergency_phone
from (
  values
    (
      'thabo.molefe@inkdot.com',
      'Frontend intern focused on design systems, accessibility, and polished product UI.',
      array['React', 'TypeScript', 'CSS', 'Storybook', 'Figma', 'A11y'],
      'Pretoria, South Africa',
      'University of Pretoria',
      'https://linkedin.com/in/thabo-molefe',
      'https://github.com/thabo-molefe',
      'Lindi Molefe',
      '+27 82 555 0191'
    ),
    (
      'lerato.dlamini@inkdot.com',
      'Backend intern building auth, APIs, and reliable service boundaries.',
      array['Node.js', 'PostgreSQL', 'Supabase', 'TypeScript', 'REST', 'Testing'],
      'Durban, South Africa',
      'University of KwaZulu-Natal',
      'https://linkedin.com/in/lerato-dlamini',
      'https://github.com/lerato-dlamini',
      'Sipho Dlamini',
      '+27 82 555 0192'
    ),
    (
      'zanele.botha@inkdot.com',
      'Backend intern interested in data modelling, RLS, and seed/migration quality.',
      array['SQL', 'PostgreSQL', 'Supabase', 'TypeScript', 'Git', 'Testing'],
      'Cape Town, South Africa',
      'University of Cape Town',
      'https://linkedin.com/in/zanele-botha',
      'https://github.com/zanele-botha',
      'Anika Botha',
      '+27 82 555 0193'
    ),
    (
      'ethan.jacobs@inkdot.com',
      'Frontend intern working on forms, validation UX, and calm empty states.',
      array['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zod', 'Git'],
      'Johannesburg, South Africa',
      'University of Johannesburg',
      'https://linkedin.com/in/ethan-jacobs',
      'https://github.com/ethan-jacobs',
      'Maya Jacobs',
      '+27 82 555 0194'
    )
) as v(email, bio, skills, location, university, linkedin, github, emergency_name, emergency_phone)
join public.profiles p on p.email = v.email
on conflict (user_id) do update set
  bio = excluded.bio,
  skills = excluded.skills,
  location = excluded.location,
  university = excluded.university,
  linkedin = excluded.linkedin,
  github = excluded.github,
  emergency_name = excluded.emergency_name,
  emergency_phone = excluded.emergency_phone;

-- Extra notifications
insert into public.notifications (user_id, title, detail, href, icon_key, unread, created_at)
select p.id, v.title, v.detail, v.href, v.icon_key, v.unread, now() - v.age
from public.profiles p
join (
  values
    ('nomsa.khumalo@inkdot.com', 'New task assigned', 'Accessibility pass on dashboard is due 18 Apr.', '/intern/tasks', 'task', true, interval '15 minutes'),
    ('nomsa.khumalo@inkdot.com', 'Review pending', 'Mid-programme checkpoint still needs mentor feedback.', '/intern/reviews', 'review', true, interval '5 hours'),
    ('lerato.dlamini@inkdot.com', 'Task moved to review', 'API auth middleware is waiting on Jordan.', '/intern/tasks', 'task', true, interval '45 minutes'),
    ('lerato.dlamini@inkdot.com', 'Log reviewed', 'Jordan approved your onboarding checklist notes.', '/intern/daily-log', 'log', false, interval '2 days'),
    ('zanele.botha@inkdot.com', 'Overdue reminder', 'Database seed script is past its due date.', '/intern/tasks', 'task', true, interval '25 minutes'),
    ('zanele.botha@inkdot.com', 'Mentor note', 'Flagged log needs duplicate-key handling update.', '/intern/daily-log', 'log', true, interval '8 hours'),
    ('ethan.jacobs@inkdot.com', 'Task completed', 'Empty-state illustrations marked done.', '/intern/tasks', 'task', false, interval '6 hours'),
    ('ethan.jacobs@inkdot.com', 'New assignment', 'Form error summary component is ready to start.', '/intern/tasks', 'task', true, interval '2 hours'),
    ('aisha.naidoo@inkdot.com', 'Review completed', 'You approved Thabo’s button variant docs.', '/supervisor/reviews', 'review', false, interval '4 hours'),
    ('aisha.naidoo@inkdot.com', 'Log submitted', 'Thabo submitted today’s daily log.', '/supervisor/logs', 'log', true, interval '35 minutes'),
    ('aisha.naidoo@inkdot.com', 'Programme update', 'Quality Assurance Winter 2026 is now active.', '/supervisor', 'bell', true, interval '1 day'),
    ('jordan.peters@inkdot.com', 'Capacity notice', 'Backend Development is approaching mentor load limits.', '/supervisor', 'bell', true, interval '3 hours'),
    ('admin@inkdot.com', 'Upcoming cohort', 'Software Engineering Summer 2026 was added to programmes.', '/admin/programmes', 'bell', true, interval '50 minutes'),
    ('admin@inkdot.com', 'QA track live', 'Quality Assurance Winter 2026 is ready for enrolment.', '/admin/programmes', 'review', true, interval '2 hours')
) as v(email, title, detail, href, icon_key, unread, age)
  on p.email = v.email
where not exists (
  select 1
  from public.notifications n
  where n.user_id = p.id
    and n.title = v.title
);

-- Sample mentor ↔ intern DMs (requires messaging migration)
do $$
declare
  pair record;
  conv_id uuid;
  sender_id uuid;
  other_id uuid;
  msg record;
begin
  for pair in
    select *
    from (
      values
        (
          'jordan.peters@inkdot.com',
          'nomsa.khumalo@inkdot.com',
          array[
            'How is the overview page coming along?',
            'Stats cards are in. Starting the activity feed next.',
            'Great — ping me when you open the PR.'
          ],
          array[true, false, true]
        ),
        (
          'aisha.naidoo@inkdot.com',
          'thabo.molefe@inkdot.com',
          array[
            'Can you document the ghost button hover state?',
            'Yes — I will add it to the variants page today.',
            'Perfect. Also check contrast on dark backgrounds.'
          ],
          array[true, false, true]
        ),
        (
          'jordan.peters@inkdot.com',
          'lerato.dlamini@inkdot.com',
          array[
            'Please include a sequence diagram in the auth middleware write-up.',
            'Will do before I send it back to review.'
          ],
          array[true, false]
        )
    ) as x(supervisor_email, intern_email, bodies, from_supervisor)
  loop
    select id into sender_id from public.profiles where email = pair.supervisor_email;
    select id into other_id from public.profiles where email = pair.intern_email;
    if sender_id is null or other_id is null then
      continue;
    end if;

    select cp1.conversation_id
    into conv_id
    from public.conversation_participants cp1
    join public.conversation_participants cp2
      on cp1.conversation_id = cp2.conversation_id
    where cp1.user_id = sender_id
      and cp2.user_id = other_id
    limit 1;

    if conv_id is null then
      insert into public.conversations default values
      returning id into conv_id;

      insert into public.conversation_participants (conversation_id, user_id)
      values
        (conv_id, sender_id),
        (conv_id, other_id);
    end if;

    for msg in
      select *
      from unnest(pair.bodies, pair.from_supervisor)
        with ordinality as u(body, from_supervisor, ord)
    loop
      if not exists (
        select 1
        from public.messages m
        where m.conversation_id = conv_id
          and m.body = msg.body
      ) then
        insert into public.messages (conversation_id, sender_id, body, created_at)
        values (
          conv_id,
          case when msg.from_supervisor then sender_id else other_id end,
          msg.body,
          now() - make_interval(
            hours => greatest(array_length(pair.bodies, 1) - msg.ord::int, 0)
          )
        );
      end if;
    end loop;
  end loop;
exception
  when undefined_table then
    raise notice 'Skipping message seed; messaging tables are not applied yet.';
end $$;
