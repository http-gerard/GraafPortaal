-- Schakel RLS in (als dat nog niet gebeurd is) en sta alle ingelogde gebruikers (jij dus) toe om te lezen en schrijven.

-- 1. team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON team_members;
CREATE POLICY "Allow full access" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON clients;
CREATE POLICY "Allow full access" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON projects;
CREATE POLICY "Allow full access" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. project_team
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON project_team;
CREATE POLICY "Allow full access" ON project_team FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON tasks;
CREATE POLICY "Allow full access" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON tickets;
CREATE POLICY "Allow full access" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON invoices;
CREATE POLICY "Allow full access" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON meetings;
CREATE POLICY "Allow full access" ON meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access" ON quotes;
CREATE POLICY "Allow full access" ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);
