# Simple Node.js Website

A clean, modern, and lightweight website built with Node.js.

## 🌟 Highlights
- **Zero External Dependencies**: Built using Node.js's native `http`, `fs`, `path`, and `os` modules. No heavy `node_modules` required to run!
- **REST API Endpoints**:
  - `GET /api/info` - Real-time Node.js diagnostics (version, platform, uptime, memory).
  - `GET /api/messages` - Retrieve message board items.
  - `POST /api/messages` - Add a new message.
  - `DELETE /api/messages/:id` - Delete a message.
- **Modern Responsive Frontend**:
  - Clean card design with CSS custom properties.
  - Dark / Light mode toggle with persistent local storage.
  - Real-time diagnostic dashboard and interactive message board.

## 🚀 How to Run

1. Open your terminal in this folder (`d:\Nodejs`).
2. Run the start command:
   ```bash
   node server.js
   ```
   Or via npm:
   ```bash
   npm start
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
