-- Intern MS — sample data seed
-- =============================================================================
-- IMPORTANT: Auth users cannot be inserted here safely.
-- profiles rows are created by the handle_new_user trigger when you create
-- users in Supabase Auth.
--
-- Manual steps before running this seed:
-- 1. Run migrations/0001_init.sql
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
