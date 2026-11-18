import { defineConfig, loadEnv } from 'vite';
import tailwind from '@tailwindcss/vite';
import { handleInquiry } from './server/inquiries.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'GOOGLE_APPS_SCRIPT_'), ...process.env };
  const inquiries = {
    name: 'bash-homes-inquiries',
    configureServer(server) { mount(server); },
    configurePreviewServer(server) { mount(server); },
  };

  function mount(server) {
    server.middlewares.use('/api/inquiries', async (incoming, outgoing) => {
      try {
        const method = incoming.method || 'GET';
        const request = new Request('http://' + incoming.headers.host + '/api/inquiries', {
          method,
          headers: incoming.headers,
          ...(method !== 'GET' && method !== 'HEAD' ? { body: incoming, duplex: 'half' } : {}),
        });
        const response = await handleInquiry(request, env);
        outgoing.writeHead(response.status, Object.fromEntries(response.headers));
        outgoing.end(await response.text());
      } catch {
        outgoing.writeHead(500, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ ok: false, message: 'Online inquiries are currently unavailable.' }));
      }
    });
  }

  return {
    plugins: [tailwind(), inquiries],
    esbuild: { jsx: 'automatic' },
    build: { outDir: 'dist/client' },
  };
});
