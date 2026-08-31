-- Drop existing tables if needed (careful in production)
-- DROP TABLE IF EXISTS meetings, tickets, invoices, tasks, projects, team_members, clients, quotes CASCADE;

-- ENUMS
CREATE TYPE priority_type AS ENUM ('Laag', 'Gemiddeld', 'Hoog');
CREATE TYPE task_status_type AS ENUM ('Te Doen', 'In Uitvoering', 'Klaar');
CREATE TYPE project_status_type AS ENUM ('Open', 'In Uitvoering', 'Klaar');
CREATE TYPE client_status_type AS ENUM ('Actief', 'Niet-actief');
CREATE TYPE invoice_status_type AS ENUM ('Betaald', 'In afwachting');
CREATE TYPE ticket_status_type AS ENUM ('Nieuw', 'Bezig', 'Opgelost');
CREATE TYPE ticket_type_enum AS ENUM ('Probleem', 'Wijziging', 'Vraag');
CREATE TYPE meeting_status_type AS ENUM ('Gepland', 'Voltooid', 'Geannuleerd');

-- 1. TEAM MEMBERS
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLIENTS
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    logo TEXT,
    status client_status_type DEFAULT 'Actief',
    address TEXT,
    contact_person_id UUID REFERENCES team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status_type DEFAULT 'Open',
    progress INTEGER DEFAULT 0,
    client_id UUID REFERENCES clients(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline DATE,
    category TEXT,
    phase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Team Mapping (Many-to-Many)
CREATE TABLE project_team (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, team_member_id)
);

-- 4. TASKS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    priority priority_type DEFAULT 'Gemiddeld',
    status task_status_type DEFAULT 'Te Doen',
    due_date DATE,
    assignee_id UUID REFERENCES team_members(id),
    type TEXT DEFAULT 'Extern',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TICKETS
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status ticket_status_type DEFAULT 'Nieuw',
    type ticket_type_enum DEFAULT 'Probleem',
    priority priority_type DEFAULT 'Gemiddeld',
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status invoice_status_type DEFAULT 'In afwachting',
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MEETINGS
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    location TEXT,
    notes TEXT,
    status meeting_status_type DEFAULT 'Gepland',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. QUOTES (Offertes)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL,
    title TEXT,
    client_id UUID REFERENCES clients(id),
    total_amount DECIMAL(10, 2),
    status TEXT DEFAULT 'Concept',
    pdf_url TEXT,
    digital_signature JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

