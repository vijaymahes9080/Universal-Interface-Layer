# @uil/sdk (TypeScript SDK)

The official **Universal Interface Layer (UIL)** TypeScript SDK enables developers to author sandboxed plugins in Node.js and TypeScript.

## Quickstart

```typescript
import { UILPlugin } from '@uil/sdk';

const plugin = new UILPlugin('NodeService', 'Custom Node.js execution plugin');

plugin.registerCommand(
  'fetch_status',
  'Fetches service uptime',
  ['service_url'],
  ['status', 'uptime'],
  async (inputs) => {
    return { status: 'healthy', uptime: '99.9%' };
  }
);

// Output manifest.json for registration with UIL Core
plugin.writeManifestFile('manifest.json');
```
