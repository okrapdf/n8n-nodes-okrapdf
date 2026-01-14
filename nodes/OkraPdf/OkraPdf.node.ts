import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestOptions,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class OkraPdf implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OkraPDF',
    name: 'okraPdf',
    icon: 'file:okrapdf.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Extract tables and text from PDFs using OkraPDF',
    defaults: {
      name: 'OkraPDF',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'okraPdfApi',
        required: true,
      },
    ],
    properties: [
      // Resource
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Document',
            value: 'document',
            description: 'Extract data from PDF documents',
          },
          {
            name: 'Job',
            value: 'job',
            description: 'Manage extraction jobs',
          },
        ],
        default: 'document',
      },

      // Document Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['document'],
          },
        },
        options: [
          {
            name: 'Extract (Async)',
            value: 'extractAsync',
            description: 'Submit PDF for extraction, returns job ID for polling',
            action: 'Extract async',
          },
          {
            name: 'Extract (Sync)',
            value: 'extractSync',
            description: 'Extract and wait for results (up to 60s)',
            action: 'Extract sync',
          },
        ],
        default: 'extractSync',
      },

      // Job Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['job'],
          },
        },
        options: [
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get job status and progress',
            action: 'Get job status',
          },
          {
            name: 'Get Results',
            value: 'getResults',
            description: 'Get extraction results (tables, text)',
            action: 'Get job results',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all extraction jobs',
            action: 'List jobs',
          },
        ],
        default: 'getStatus',
      },

      // === Document Extract Fields ===
      {
        displayName: 'Input Type',
        name: 'inputType',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['extractAsync', 'extractSync'],
          },
        },
        options: [
          {
            name: 'URL',
            value: 'url',
            description: 'Fetch PDF from URL',
          },
          {
            name: 'Binary Data',
            value: 'binary',
            description: 'Use binary data from previous node',
          },
        ],
        default: 'url',
      },
      {
        displayName: 'PDF URL',
        name: 'pdfUrl',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['extractAsync', 'extractSync'],
            inputType: ['url'],
          },
        },
        default: '',
        required: true,
        placeholder: 'https://example.com/document.pdf',
        description: 'URL of the PDF to extract',
      },
      {
        displayName: 'Input Binary Field',
        name: 'binaryPropertyName',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['extractAsync', 'extractSync'],
            inputType: ['binary'],
          },
        },
        default: 'data',
        required: true,
        description: 'Name of the binary property containing the PDF',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['extractAsync', 'extractSync'],
          },
        },
        options: [
          {
            displayName: 'Webhook URL',
            name: 'webhookUrl',
            type: 'string',
            default: '',
            description: 'URL to receive webhook when extraction completes (async only)',
          },
          {
            displayName: 'Max Pages',
            name: 'maxPages',
            type: 'number',
            default: 0,
            description: 'Maximum pages to process (0 = unlimited)',
          },
        ],
      },

      // === Job Fields ===
      {
        displayName: 'Job ID',
        name: 'jobId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['job'],
            operation: ['getStatus', 'getResults'],
          },
        },
        default: '',
        required: true,
        placeholder: 'ocr-xxx',
        description: 'The job ID returned from extraction',
      },
      {
        displayName: 'Results Options',
        name: 'resultsOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['job'],
            operation: ['getResults'],
          },
        },
        options: [
          {
            displayName: 'Include',
            name: 'include',
            type: 'multiOptions',
            options: [
              { name: 'Tables', value: 'tables' },
              { name: 'Text', value: 'text' },
              { name: 'Entities', value: 'entities' },
            ],
            default: ['tables', 'text'],
            description: 'What to include in results',
          },
          {
            displayName: 'Pages',
            name: 'pages',
            type: 'string',
            default: '',
            placeholder: '1-5 or 1,3,5',
            description: 'Filter specific pages',
          },
        ],
      },
      {
        displayName: 'List Options',
        name: 'listOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['job'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Status Filter',
            name: 'status',
            type: 'options',
            options: [
              { name: 'All', value: '' },
              { name: 'Queued', value: 'queued' },
              { name: 'Processing', value: 'processing' },
              { name: 'Completed', value: 'completed' },
              { name: 'Failed', value: 'failed' },
            ],
            default: '',
            description: 'Filter by job status',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 50,
            description: 'Maximum jobs to return',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const credentials = await this.getCredentials('okraPdfApi');
    const baseUrl = credentials.baseUrl as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: unknown;

        // Document operations
        if (resource === 'document') {
          const inputType = this.getNodeParameter('inputType', i) as string;
          const options = this.getNodeParameter('options', i) as {
            webhookUrl?: string;
            maxPages?: number;
          };

          const body: Record<string, unknown> = {};

          if (inputType === 'url') {
            body.url = this.getNodeParameter('pdfUrl', i) as string;
          } else {
            // Binary input
            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
            const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);

            if (binaryData.id) {
              // File is stored, get it
              const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
              body.file_base64 = buffer.toString('base64');
            } else if (binaryData.data) {
              body.file_base64 = binaryData.data;
            }

            body.filename = binaryData.fileName || 'document.pdf';
          }

          if (options.webhookUrl) {
            body.webhook_url = options.webhookUrl;
          }

          if (options.maxPages && options.maxPages > 0) {
            body.options = { max_pages: options.maxPages };
          }

          const endpoint = operation === 'extractSync' ? '/api/v1/extract/sync' : '/api/v1/extract';

          const requestOptions: IHttpRequestOptions = {
            method: 'POST',
            url: `${baseUrl}${endpoint}`,
            body,
            json: true,
          };

          responseData = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'okraPdfApi',
            requestOptions,
          );
        }

        // Job operations
        if (resource === 'job') {
          if (operation === 'getStatus') {
            const jobId = this.getNodeParameter('jobId', i) as string;

            const requestOptions: IHttpRequestOptions = {
              method: 'GET',
              url: `${baseUrl}/api/v1/jobs/${jobId}`,
              json: true,
            };

            responseData = await this.helpers.httpRequestWithAuthentication.call(
              this,
              'okraPdfApi',
              requestOptions,
            );
          }

          if (operation === 'getResults') {
            const jobId = this.getNodeParameter('jobId', i) as string;
            const resultsOptions = this.getNodeParameter('resultsOptions', i) as {
              include?: string[];
              pages?: string;
            };

            const qs: Record<string, string> = {};
            if (resultsOptions.include && resultsOptions.include.length > 0) {
              qs.include = resultsOptions.include.join(',');
            }
            if (resultsOptions.pages) {
              qs.pages = resultsOptions.pages;
            }

            const requestOptions: IHttpRequestOptions = {
              method: 'GET',
              url: `${baseUrl}/api/v1/jobs/${jobId}/results`,
              qs,
              json: true,
            };

            responseData = await this.helpers.httpRequestWithAuthentication.call(
              this,
              'okraPdfApi',
              requestOptions,
            );
          }

          if (operation === 'list') {
            const listOptions = this.getNodeParameter('listOptions', i) as {
              status?: string;
              limit?: number;
            };

            const qs: Record<string, string | number> = {};
            if (listOptions.status) {
              qs.status = listOptions.status;
            }
            if (listOptions.limit) {
              qs.limit = listOptions.limit;
            }

            const requestOptions: IHttpRequestOptions = {
              method: 'GET',
              url: `${baseUrl}/api/v1/jobs`,
              qs,
              json: true,
            };

            responseData = await this.helpers.httpRequestWithAuthentication.call(
              this,
              'okraPdfApi',
              requestOptions,
            );
          }
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as IDataObject),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, {
          itemIndex: i,
        });
      }
    }

    return [returnData];
  }
}
