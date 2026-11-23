// Simple & Fast Node.js HTTP Server (Zero external dependencies needed!)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// In-memory demo data for interactive features
let messages = [
  { id: 1, author: 'Node.js Bot', text: 'Welcome to your brand new Node.js website!', date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 2, author: 'Developer', text: 'Clean, fast, and running with zero external dependencies.', date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
];

const server = http.createServer((req, res) => {
  // Enable CORS & JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES ---
  if (pathname === '/api/info' && req.method === 'GET') {
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      nodeVersion: process.version,
      platform: `${os.type()} ${os.release()} (${os.arch()})`,
      uptime: uptimeStr,
      memoryUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      totalMemoryMB: (os.totalmem() / 1024 / 1024).toFixed(0),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (pathname === '/api/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }

  if (pathname === '/api/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data.text || !data.text.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message text cannot be empty' }));
          return;
        }

        const newMsg = {
          id: Date.now(),
          author: (data.author && data.author.trim()) ? data.author.trim() : 'Guest',
          text: data.text.trim(),
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        messages.unshift(newMsg);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newMsg));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/messages/') && req.method === 'DELETE') {
    const id = parseInt(pathname.split('/')[3], 10);
    messages = messages.filter(m => m.id !== id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, removedId: id }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: if not found, serve 404 or index.html for SPA
      const notFoundPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(notFoundPath, (fallbackErr, content) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  🚀 Server is running on: http://localhost:${PORT}`);
  console.log(`  📂 Serving files from: ${PUBLIC_DIR}`);
  console.log(`  ⚡ Press Ctrl + C to stop`);
  console.log(`===============================================`);
});
