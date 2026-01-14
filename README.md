# n8n-nodes-okrapdf

Extract tables and text from PDFs using [OkraPDF](https://okrapdf.com).

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `@okrapdf/n8n-nodes-okrapdf` and confirm

### Manual Installation

```bash
cd ~/.n8n/nodes
pnpm install @okrapdf/n8n-nodes-okrapdf
```

## Credentials

You need an OkraPDF API key:

1. Sign up at [okrapdf.com](https://okrapdf.com)
2. Go to **Settings → API Keys**
3. Create a new key (starts with `okra_`)
4. In n8n, create new **OkraPDF API** credentials with your key

## Operations

### Document

- **Extract (Sync)** - Submit PDF and wait for results (up to 60s). Best for small PDFs.
- **Extract (Async)** - Submit PDF and get job ID for polling. Best for large PDFs.

### Job

- **Get Status** - Check job progress
- **Get Results** - Download extracted tables and text
- **List** - List all your extraction jobs

## Example Workflow

### Extract Tables from PDF URL

1. Add **OkraPDF** node
2. Select **Document → Extract (Sync)**
3. Enter PDF URL
4. Output includes extracted tables in markdown format

### Process Large PDF

1. **OkraPDF** node: Extract (Async) → returns `job_id`
2. **Wait** node: 30 seconds
3. **OkraPDF** node: Job → Get Results with `job_id`

## Support

- Documentation: [okrapdf.com/docs](https://okrapdf.com/docs)
- Issues: [GitHub Issues](https://github.com/okrapdf/n8n-nodes-okrapdf/issues)

## License

MIT
