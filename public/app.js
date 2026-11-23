// Simple Node.js Website Client Script

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchServerInfo();
  fetchMessages();
  setupMessageForm();

  document.getElementById('refreshStatsBtn').addEventListener('click', () => {
    fetchServerInfo();
  });
});

// --- Theme Management ---
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('node_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    themeIcon.textContent = '🌙';
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    themeIcon.textContent = '☀️';
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      themeIcon.textContent = '🌙';
      localStorage.setItem('node_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      themeIcon.textContent = '☀️';
      localStorage.setItem('node_theme', 'dark');
    }
  });
}

// --- Fetch Server Info API ---
async function fetchServerInfo() {
  const statusLabel = document.getElementById('statusLabel');
  try {
    statusLabel.textContent = 'Fetching diagnostics...';
    const res = await fetch('/api/info');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    document.getElementById('nodeVer').textContent = data.nodeVersion || 'N/A';
    document.getElementById('platform').textContent = data.platform || 'N/A';
    document.getElementById('uptime').textContent = data.uptime || 'N/A';
    document.getElementById('memory').textContent = `${data.memoryUsedMB} MB / ${data.totalMemoryMB} MB`;
    statusLabel.textContent = 'Node.js Server Online';
  } catch (err) {
    console.error('Failed to load server info:', err);
    statusLabel.textContent = 'Server Unreachable';
    document.getElementById('nodeVer').textContent = 'Offline';
  }
}

// --- Fetch & Render Messages ---
async function fetchMessages() {
  const container = document.getElementById('messagesList');
  try {
    const res = await fetch('/api/messages');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const messages = await res.json();

    if (!messages.length) {
      container.innerHTML = '<div class="loading-spinner">No messages yet. Be the first to leave one!</div>';
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="message-item" id="msg-${msg.id}">
        <div class="message-content">
          <div class="message-meta">
            <span class="message-author">${escapeHtml(msg.author)}</span>
            <span class="message-time">${escapeHtml(msg.date)}</span>
          </div>
          <div class="message-body">${escapeHtml(msg.text)}</div>
        </div>
        <button class="delete-btn" title="Delete message" onclick="deleteMessage(${msg.id})">✕</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching messages:', err);
    container.innerHTML = '<div class="loading-spinner">Could not load messages from server.</div>';
  }
}

// --- Add Message ---
function setupMessageForm() {
  const form = document.getElementById('messageForm');
  const authorInput = document.getElementById('authorInput');
  const messageInput = document.getElementById('messageInput');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = authorInput.value.trim();
    const text = messageInput.value.trim();

    if (!text) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text })
      });

      if (!res.ok) throw new Error('Failed to post message');

      messageInput.value = '';
      fetchMessages();
    } catch (err) {
      alert('Error submitting message: ' + err.message);
    }
  });
}

// --- Delete Message ---
async function deleteMessage(id) {
  try {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete message');
    fetchMessages();
  } catch (err) {
    alert('Error deleting message: ' + err.message);
  }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
