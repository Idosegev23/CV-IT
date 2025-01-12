-- Drop existing table if exists
DROP TABLE IF EXISTS agencies;

-- Create agencies table
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_person TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  specialties TEXT[],
  regions TEXT[],
  email_format JSONB DEFAULT '{
    "subject_template": "",
    "body_template": "",
    "include_analysis": false,
    "analysis_format": {
      "include_full_name": true,
      "include_city": true,
      "include_phone": true,
      "include_email": true,
      "include_last_position": true,
      "include_experience_years": true,
      "include_relevant_positions": true,
      "include_search_area": true
    },
    "custom_fields": {}
  }'::jsonb
);

-- Add indexes
CREATE INDEX agencies_name_idx ON agencies(name);
CREATE INDEX agencies_email_idx ON agencies(email);
CREATE INDEX agencies_is_active_idx ON agencies(is_active);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON agencies
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON agencies
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON agencies
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON agencies
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Function to get active agencies
create or replace function public.get_active_agencies()
returns setof agencies
language sql
security definer
as $$
  select *
  from public.agencies
  where is_active = true
  order by name asc;
$$; 