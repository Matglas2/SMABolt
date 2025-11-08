/*
  # Salesforce Metadata Analysis Schema

  1. New Tables
    - `salesforce_objects` - Stores custom and standard objects
    - `salesforce_fields` - Stores all fields across objects
    - `salesforce_field_dependencies` - Links fields to triggers, flows, validations, etc
    - `salesforce_triggers` - Stores Apex triggers with code
    - `salesforce_flows` - Stores Flow definitions
    - `salesforce_flow_elements` - Stores individual flow elements
    - `salesforce_validations` - Stores validation rules
    - `salesforce_permissions` - Stores object and field permissions
    - `metadata_sync_status` - Tracks last sync times for incremental updates

  2. Security
    - Enable RLS on all tables
    - Add policies for local application access
    
  3. Indexes
    - Add indexes on frequently queried fields for performance
*/

CREATE TABLE IF NOT EXISTS salesforce_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL UNIQUE,
  label text,
  object_type text NOT NULL,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salesforce_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES salesforce_objects(id) ON DELETE CASCADE,
  api_name text NOT NULL,
  label text,
  field_type text NOT NULL,
  is_custom boolean DEFAULT false,
  is_required boolean DEFAULT false,
  formula text,
  default_value text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(object_id, api_name)
);

CREATE TABLE IF NOT EXISTS salesforce_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES salesforce_objects(id) ON DELETE CASCADE,
  api_name text NOT NULL,
  apex_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(object_id, api_name)
);

CREATE TABLE IF NOT EXISTS salesforce_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL UNIQUE,
  label text,
  flow_type text NOT NULL,
  is_active boolean DEFAULT false,
  version_number integer DEFAULT 1,
  xml_metadata text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salesforce_flow_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES salesforce_flows(id) ON DELETE CASCADE,
  element_type text NOT NULL,
  element_name text,
  element_config jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salesforce_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES salesforce_objects(id) ON DELETE CASCADE,
  api_name text NOT NULL,
  formula text,
  error_message text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(object_id, api_name)
);

CREATE TABLE IF NOT EXISTS salesforce_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES salesforce_fields(id) ON DELETE CASCADE,
  object_id uuid REFERENCES salesforce_objects(id) ON DELETE CASCADE,
  permission_type text NOT NULL,
  permission_target text NOT NULL,
  readable boolean DEFAULT false,
  writable boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_metadata_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES salesforce_fields(id) ON DELETE CASCADE,
  trigger_id uuid REFERENCES salesforce_triggers(id) ON DELETE CASCADE,
  flow_id uuid REFERENCES salesforce_flows(id) ON DELETE CASCADE,
  validation_id uuid REFERENCES salesforce_validations(id) ON DELETE CASCADE,
  dependency_type text NOT NULL,
  context text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metadata_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_type text NOT NULL UNIQUE,
  last_synced_at timestamptz,
  sync_status text DEFAULT 'idle',
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salesforce_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_flow_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesforce_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_metadata_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow local app read"
  ON salesforce_objects FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_objects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_objects FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_objects FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_fields FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_fields FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_fields FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_fields FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_triggers FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_triggers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_triggers FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_triggers FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_flows FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_flows FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_flows FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_flows FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_flow_elements FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_flow_elements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_flow_elements FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_flow_elements FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_validations FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_validations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_validations FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_validations FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON salesforce_permissions FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON salesforce_permissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON salesforce_permissions FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON salesforce_permissions FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON field_metadata_dependencies FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON field_metadata_dependencies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON field_metadata_dependencies FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON field_metadata_dependencies FOR DELETE
  USING (true);

CREATE POLICY "Allow local app read"
  ON metadata_sync_status FOR SELECT
  USING (true);

CREATE POLICY "Allow local app write"
  ON metadata_sync_status FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow local app update"
  ON metadata_sync_status FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Allow local app delete"
  ON metadata_sync_status FOR DELETE
  USING (true);

CREATE INDEX idx_salesforce_objects_api_name ON salesforce_objects(api_name);
CREATE INDEX idx_salesforce_fields_object_id ON salesforce_fields(object_id);
CREATE INDEX idx_salesforce_fields_api_name ON salesforce_fields(api_name);
CREATE INDEX idx_salesforce_triggers_object_id ON salesforce_triggers(object_id);
CREATE INDEX idx_salesforce_flows_api_name ON salesforce_flows(api_name);
CREATE INDEX idx_salesforce_validations_object_id ON salesforce_validations(object_id);
CREATE INDEX idx_dependencies_field_id ON field_metadata_dependencies(field_id);
CREATE INDEX idx_dependencies_trigger_id ON field_metadata_dependencies(trigger_id);
CREATE INDEX idx_dependencies_flow_id ON field_metadata_dependencies(flow_id);
