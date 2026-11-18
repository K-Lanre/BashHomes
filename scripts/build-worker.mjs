import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const client = 'dist/client';
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

const assets = {};
for (const entry of await readdir(client, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const path = join(entry.parentPath, entry.name);
  const url = '/' + relative(client, path).replaceAll('\\', '/');
  const type = mimeTypes[extname(path)] || 'application/octet-stream';
  assets[url] = [type, (await readFile(path)).toString('base64')];
}

const handler = (await readFile('server/inquiries.mjs', 'utf8')).replace('export async function', 'async function');
const worker = `
${handler}
const assets = ${JSON.stringify(assets)};
const pages = ['/', '/contact', '/features'];

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname.replace(/\\/$/, '') || '/';
    if (path === '/api/inquiries') return handleInquiry(request, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const asset = Object.hasOwn(assets, path) ? assets[path] : undefined;
    const [type, encoded] = asset || assets['/index.html'];
    return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(encoded), char => char.charCodeAt(0)), {
      status: asset || pages.includes(path) ? 200 : 404,
      headers: {
        'Content-Type': type,
        'Cache-Control': path.startsWith('/assets/') && asset ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
`;

await mkdir('dist/server', { recursive: true });
await writeFile('dist/server/index.js', worker);
