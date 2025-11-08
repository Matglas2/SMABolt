import { supabase } from './supabaseClient';
import type { Database } from './supabaseClient';

type SalesforceObjectInsert = Database['public']['Tables']['salesforce_objects']['Insert'];
type SalesforceFieldInsert = Database['public']['Tables']['salesforce_fields']['Insert'];
type SalesforceTriggerInsert = Database['public']['Tables']['salesforce_triggers']['Insert'];
type SalesforceFlowInsert = Database['public']['Tables']['salesforce_flows']['Insert'];

export class MetadataParser {
  async storeObject(objectData: SalesforceObjectInsert): Promise<string> {
    const { data, error } = await supabase
      .from('salesforce_objects')
      .upsert(
        {
          api_name: objectData.api_name,
          label: objectData.label,
          object_type: objectData.object_type,
          is_custom: objectData.is_custom,
        },
        { onConflict: 'api_name' }
      )
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data?.id || '';
  }

  async storeField(fieldData: SalesforceFieldInsert): Promise<string> {
    const { data, error } = await supabase
      .from('salesforce_fields')
      .upsert(
        {
          object_id: fieldData.object_id,
          api_name: fieldData.api_name,
          label: fieldData.label,
          field_type: fieldData.field_type,
          is_custom: fieldData.is_custom,
          is_required: fieldData.is_required,
          formula: fieldData.formula,
          default_value: fieldData.default_value,
          description: fieldData.description,
        },
        { onConflict: 'object_id,api_name' }
      )
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data?.id || '';
  }

  async storeTrigger(triggerData: SalesforceTriggerInsert): Promise<string> {
    const { data, error } = await supabase
      .from('salesforce_triggers')
      .upsert(
        {
          object_id: triggerData.object_id,
          api_name: triggerData.api_name,
          apex_code: triggerData.apex_code,
          is_active: triggerData.is_active,
        },
        { onConflict: 'object_id,api_name' }
      )
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data?.id || '';
  }

  async storeFlow(flowData: SalesforceFlowInsert): Promise<string> {
    const { data, error } = await supabase
      .from('salesforce_flows')
      .upsert(
        {
          api_name: flowData.api_name,
          label: flowData.label,
          flow_type: flowData.flow_type,
          is_active: flowData.is_active,
          version_number: flowData.version_number,
          xml_metadata: flowData.xml_metadata,
        },
        { onConflict: 'api_name' }
      )
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data?.id || '';
  }

  async getObjectByName(apiName: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase
      .from('salesforce_objects')
      .select('id')
      .eq('api_name', apiName)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getFieldByName(objectId: string, fieldApiName: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase
      .from('salesforce_fields')
      .select('id')
      .eq('object_id', objectId)
      .eq('api_name', fieldApiName)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async recordFieldDependency(
    fieldId: string,
    dependencyType: string,
    triggerId?: string,
    flowId?: string,
    validationId?: string,
    context?: string
  ): Promise<void> {
    const { error } = await supabase.from('field_metadata_dependencies').insert({
      field_id: fieldId,
      trigger_id: triggerId,
      flow_id: flowId,
      validation_id: validationId,
      dependency_type: dependencyType,
      context: context,
    });

    if (error) throw error;
  }

  async updateSyncStatus(
    metadataType: string,
    status: 'idle' | 'syncing' | 'success' | 'error',
    error?: string
  ): Promise<void> {
    const { error: dbError } = await supabase.from('metadata_sync_status').upsert({
      metadata_type: metadataType,
      last_synced_at: status === 'success' ? new Date().toISOString() : undefined,
      sync_status: status,
      sync_error: error,
    });

    if (dbError) throw dbError;
  }

  async getFieldDependencies(fieldId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('field_metadata_dependencies')
      .select(
        `
        id,
        dependency_type,
        context,
        trigger:salesforce_triggers(api_name, object_id),
        flow:salesforce_flows(api_name, label),
        validation:salesforce_validations(api_name)
      `
      )
      .eq('field_id', fieldId);

    if (error) throw error;
    return data || [];
  }

  async getFieldUsageByFlow(flowId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('field_metadata_dependencies')
      .select(
        `
        field:salesforce_fields(api_name, label, object_id),
        dependency_type,
        context
      `
      )
      .eq('flow_id', flowId);

    if (error) throw error;
    return data || [];
  }

  async getFieldUsageByTrigger(triggerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('field_metadata_dependencies')
      .select(
        `
        field:salesforce_fields(api_name, label, object_id),
        dependency_type,
        context
      `
      )
      .eq('trigger_id', triggerId);

    if (error) throw error;
    return data || [];
  }
}
