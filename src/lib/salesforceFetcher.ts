import * as jsforce from 'jsforce';
import { parseStringPromise } from 'xml2js';

interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export class SalesforceFetcher {
  private conn: jsforce.Connection;

  constructor(config: SalesforceConfig) {
    this.conn = new jsforce.Connection({
      instanceUrl: config.instanceUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  async authenticate(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conn.login(username, password, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async fetchObjects(): Promise<Record<string, any>[]> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.list(
        [
          { type: 'CustomObject' },
          { type: 'StandardObject' },
        ],
        (err, fileProperties) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileProperties || []);
          }
        }
      );
    });
  }

  async fetchObjectDetails(objectName: string): Promise<any> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.read('CustomObject', objectName, (err, details) => {
        if (err) {
          reject(err);
        } else {
          resolve(details);
        }
      });
    });
  }

  async fetchFields(objectName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.conn.describe(objectName, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.fields);
        }
      });
    });
  }

  async fetchTriggers(): Promise<Record<string, any>[]> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.list([{ type: 'ApexTrigger' }], (err, fileProperties) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileProperties || []);
        }
      });
    });
  }

  async fetchTriggerCode(triggerName: string): Promise<string> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.read('ApexTrigger', triggerName, (err, details) => {
        if (err) {
          reject(err);
        } else {
          resolve(details.body || '');
        }
      });
    });
  }

  async fetchFlows(): Promise<Record<string, any>[]> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.list([{ type: 'Flow' }], (err, fileProperties) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileProperties || []);
        }
      });
    });
  }

  async fetchFlowXml(flowName: string): Promise<string> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.read('Flow', flowName, (err, details) => {
        if (err) {
          reject(err);
        } else {
          resolve(details.definition || '');
        }
      });
    });
  }

  async fetchValidationRules(objectName: string): Promise<Record<string, any>[]> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.list([{ type: 'ValidationRule', folder: objectName }], (err, fileProperties) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileProperties || []);
        }
      });
    });
  }

  async fetchComponentDependencies(componentId: string): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT MetadataComponentName, MetadataComponentType
        FROM MetadataComponentDependency
        WHERE RefMetadataComponentId = '${componentId}'
      `;
      this.conn.tooling.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.records || []);
        }
      });
    });
  }

  async fetchPermissionSets(): Promise<Record<string, any>[]> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.list([{ type: 'PermissionSet' }], (err, fileProperties) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileProperties || []);
        }
      });
    });
  }

  async fetchPermissionSetDetails(permissionSetName: string): Promise<any> {
    const metadata = this.conn.metadata;
    return new Promise((resolve, reject) => {
      metadata.read('PermissionSet', permissionSetName, (err, details) => {
        if (err) {
          reject(err);
        } else {
          resolve(details);
        }
      });
    });
  }
}

export async function parseFlowXml(xmlString: string): Promise<any> {
  return parseStringPromise(xmlString);
}

export function extractFieldReferencesFromCode(apexCode: string): string[] {
  const fieldPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*\.)?([a-zA-Z_][a-zA-Z0-9_]*__c|[a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  const fields = new Set<string>();
  let match;

  while ((match = fieldPattern.exec(apexCode)) !== null) {
    if (match[1]) {
      fields.add(match[2]);
    } else {
      fields.add(match[2]);
    }
  }

  return Array.from(fields);
}
