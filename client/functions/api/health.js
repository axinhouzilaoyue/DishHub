import { json } from './_utils.js';

export async function onRequestGet() {
  return json({
    status: 'ok',
    service: 'dishhub-api',
    runtime: 'cloudflare-pages-functions',
    timestamp: new Date().toISOString(),
  });
}

