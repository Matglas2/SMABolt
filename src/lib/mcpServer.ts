import { MetadataParser } from './metadataParser';

const parser = new MetadataParser();

export const tools: any[] = [
  {
    name: 'find_field_usage',
    description: 'Find all places where a field is used (triggers, flows, validations, etc)',
    inputSchema: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          description: 'API name of the field to analyze',
        },
        object_name: {
          type: 'string',
          description: 'API name of the object containing the field',
        },
      },
      required: ['field_name', 'object_name'],
    },
  },
  {
    name: 'find_flows_using_field',
    description: 'Find all flows that reference a specific field',
    inputSchema: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          description: 'API name of the field',
        },
      },
      required: ['field_name'],
    },
  },
  {
    name: 'find_triggers_using_field',
    description: 'Find all triggers that reference a specific field',
    inputSchema: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          description: 'API name of the field',
        },
      },
      required: ['field_name'],
    },
  },
  {
    name: 'get_flow_details',
    description: 'Get detailed information about a specific flow',
    inputSchema: {
      type: 'object',
      properties: {
        flow_name: {
          type: 'string',
          description: 'API name of the flow',
        },
      },
      required: ['flow_name'],
    },
  },
  {
    name: 'get_object_details',
    description: 'Get all fields and metadata for a specific object',
    inputSchema: {
      type: 'object',
      properties: {
        object_name: {
          type: 'string',
          description: 'API name of the object',
        },
      },
      required: ['object_name'],
    },
  },
  {
    name: 'search_fields_by_pattern',
    description: 'Search for fields matching a pattern or naming convention',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Search pattern or field name fragment',
        },
      },
      required: ['pattern'],
    },
  },
];

export async function callTool(name: string, args: any): Promise<string> {
  try {
    let result: string;

    switch (name) {
      case 'find_field_usage': {
        const { field_name, object_name } = args as { field_name: string; object_name: string };
        const objectData = await parser.getObjectByName(object_name);
        if (!objectData) {
          result = `Object "${object_name}" not found`;
        } else {
          const fieldData = await parser.getFieldByName(objectData.id, field_name);
          if (!fieldData) {
            result = `Field "${field_name}" not found on object "${object_name}"`;
          } else {
            const dependencies = await parser.getFieldDependencies(fieldData.id);
            result = JSON.stringify(dependencies, null, 2);
          }
        }
        break;
      }

      case 'find_flows_using_field': {
        const { field_name } = args as { field_name: string };
        const supabase = (await import('./supabaseClient')).supabase;
        const { data } = await supabase
          .from('field_metadata_dependencies')
          .select('flow:salesforce_flows(api_name, label), field:salesforce_fields(api_name)')
          .not('flow_id', 'is', null);

        result = data ? JSON.stringify(data, null, 2) : 'No flows found';
        break;
      }

      case 'find_triggers_using_field': {
        const { field_name } = args as { field_name: string };
        const supabase = (await import('./supabaseClient')).supabase;
        const { data } = await supabase
          .from('field_metadata_dependencies')
          .select('trigger:salesforce_triggers(api_name), field:salesforce_fields(api_name)')
          .not('trigger_id', 'is', null);

        result = data ? JSON.stringify(data, null, 2) : 'No triggers found';
        break;
      }

      case 'get_flow_details': {
        const { flow_name } = args as { flow_name: string };
        const supabase = (await import('./supabaseClient')).supabase;
        const { data } = await supabase.from('salesforce_flows').select('*').eq('api_name', flow_name).maybeSingle();

        result = data ? JSON.stringify(data, null, 2) : 'Flow not found';
        break;
      }

      case 'get_object_details': {
        const { object_name } = args as { object_name: string };
        const supabase = (await import('./supabaseClient')).supabase;
        const { data: objectData } = await supabase
          .from('salesforce_objects')
          .select('*, fields:salesforce_fields(*)')
          .eq('api_name', object_name)
          .maybeSingle();

        result = objectData ? JSON.stringify(objectData, null, 2) : 'Object not found';
        break;
      }

      case 'search_fields_by_pattern': {
        const { pattern } = args as { pattern: string };
        const supabase = (await import('./supabaseClient')).supabase;
        const { data } = await supabase
          .from('salesforce_fields')
          .select('*')
          .ilike('api_name', `%${pattern}%`);

        result = data && data.length > 0 ? JSON.stringify(data, null, 2) : 'No fields found';
        break;
      }

      default:
        result = 'Unknown tool';
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error: ${errorMessage}`;
  }
}
