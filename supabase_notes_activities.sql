-- 1. Project Notes
CREATE TABLE project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    is_client_facing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Project Notes
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access" ON project_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Project Activities (Geschiedenis/Tijdslijn)
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type TEXT NOT NULL, -- bijv 'status', 'feedback', 'start'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Project Activities
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access" ON project_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
