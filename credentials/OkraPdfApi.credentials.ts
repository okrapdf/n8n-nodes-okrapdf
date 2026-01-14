import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class OkraPdfApi implements ICredentialType {
  name = 'okraPdfApi';
  displayName = 'OkraPDF API';
  documentationUrl = 'https://okrapdf.com/docs/api';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      required: true,
      typeOptions: {
        password: true,
      },
      description: 'Your OkraPDF API key (starts with okra_). Get it from Settings → API Keys.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://app.okrapdf.com',
      description: 'OkraPDF API base URL. Change only for self-hosted deployments.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials?.baseUrl}}',
      url: '/api/v1/jobs',
      method: 'GET',
      qs: {
        limit: 1,
      },
    },
  };
}
