import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      salesforce_objects: {
        Row: {
          id: string;
          api_name: string;
          label: string | null;
          object_type: string;
          is_custom: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salesforce_objects']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      salesforce_fields: {
        Row: {
          id: string;
          object_id: string;
          api_name: string;
          label: string | null;
          field_type: string;
          is_custom: boolean;
          is_required: boolean;
          formula: string | null;
          default_value: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salesforce_fields']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      salesforce_triggers: {
        Row: {
          id: string;
          object_id: string;
          api_name: string;
          apex_code: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salesforce_triggers']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      salesforce_flows: {
        Row: {
          id: string;
          api_name: string;
          label: string | null;
          flow_type: string;
          is_active: boolean;
          version_number: number;
          xml_metadata: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salesforce_flows']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      field_metadata_dependencies: {
        Row: {
          id: string;
          field_id: string;
          trigger_id: string | null;
          flow_id: string | null;
          validation_id: string | null;
          dependency_type: string;
          context: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['field_metadata_dependencies']['Row'], 'id' | 'created_at'>;
      };
    };
  };
};
