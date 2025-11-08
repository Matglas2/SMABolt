import { MetadataParser } from './metadataParser';

interface FlowElement {
  name: string;
  type: string;
  config: Record<string, any>;
}

export class FlowParser {
  async parseFlowAndExtractDependencies(
    flowId: string,
    xmlMetadata: string,
    parser: MetadataParser
  ): Promise<void> {
    try {
      const flowElements = extractElementsFromXml(xmlMetadata);

      for (const element of flowElements) {
        const fields = extractFieldsFromElement(element);

        for (const fieldRef of fields) {
          const { objectName, fieldName } = parseFieldReference(fieldRef);
          const objectData = await parser.getObjectByName(objectName);

          if (objectData) {
            const fieldData = await parser.getFieldByName(objectData.id, fieldName);

            if (fieldData) {
              await parser.recordFieldDependency(
                fieldData.id,
                'flow_element',
                undefined,
                flowId,
                undefined,
                `Element: ${element.name} (${element.type})`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing flow:', error);
    }
  }

  async parseTriggerAndExtractDependencies(
    triggerId: string,
    apexCode: string,
    parser: MetadataParser,
    objectId: string
  ): Promise<void> {
    try {
      const fields = extractFieldsFromApex(apexCode);

      for (const fieldName of fields) {
        const fieldData = await parser.getFieldByName(objectId, fieldName);

        if (fieldData) {
          await parser.recordFieldDependency(
            fieldData.id,
            'trigger_reference',
            triggerId,
            undefined,
            undefined,
            'Referenced in Apex code'
          );
        }
      }
    } catch (error) {
      console.error('Error parsing trigger:', error);
    }
  }
}

function extractElementsFromXml(xml: string): FlowElement[] {
  const elements: FlowElement[] = [];

  const elementMatches = xml.matchAll(/<elements[^>]*>([\s\S]*?)<\/elements>/g);
  for (const match of elementMatches) {
    const elementContent = match[1];
    const nameMatch = elementContent.match(/<name>(.*?)<\/name>/);
    const typeMatch = elementContent.match(/<elementType>(.*?)<\/elementType>/);

    if (nameMatch && typeMatch) {
      elements.push({
        name: nameMatch[1],
        type: typeMatch[1],
        config: parseElementConfig(elementContent),
      });
    }
  }

  return elements;
}

function parseElementConfig(elementXml: string): Record<string, any> {
  const config: Record<string, any> = {};

  const tagMatches = elementXml.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g);
  for (const match of tagMatches) {
    config[match[1]] = match[2];
  }

  return config;
}

function extractFieldsFromElement(element: FlowElement): string[] {
  const fields = new Set<string>();

  const configStr = JSON.stringify(element.config);

  const fieldReferences = configStr.matchAll(/\{!(\w+\.\w+)\}/g);
  for (const match of fieldReferences) {
    fields.add(match[1]);
  }

  const recordUpdates = configStr.matchAll(/"(\w+\.\w+)"/g);
  for (const match of recordUpdates) {
    const ref = match[1];
    if (ref.includes('.')) {
      fields.add(ref);
    }
  }

  return Array.from(fields);
}

function extractFieldsFromApex(apexCode: string): string[] {
  const fields = new Set<string>();

  const accessPattern = /\b\w+\.(\w+(?:__c)?)\b/g;
  let match;

  while ((match = accessPattern.exec(apexCode)) !== null) {
    const fieldName = match[1];
    if (!isKeyword(fieldName)) {
      fields.add(fieldName);
    }
  }

  return Array.from(fields);
}

function parseFieldReference(ref: string): { objectName: string; fieldName: string } {
  const parts = ref.split('.');
  if (parts.length === 2) {
    return { objectName: parts[0], fieldName: parts[1] };
  }
  return { objectName: '', fieldName: ref };
}

function isKeyword(word: string): boolean {
  const keywords = [
    'Id', 'Name', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp',
    'Status', 'Type', 'RecordType', 'Owner', 'OwnerId',
  ];
  return keywords.includes(word);
}
