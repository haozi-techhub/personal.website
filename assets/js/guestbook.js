// ============================================================
// Guestbook · v3.0
// ⚠️  替换下方两个值为你自己的 Supabase 项目信息
//    Dashboard → Settings → API
// ============================================================
const SUPABASE_URL     = 'https://znflconpkvndaoqkicuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZmxjb25wa3ZuZGFvcWtpY3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjMxOTMsImV4cCI6MjA5Mjg5OTE5M30.Wj9Xpu6BjLSEaonUQqDYNj5_dqy-LsXlLK4w4N0IGmQ';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DOM =====
const form         = document.getElementById('gbForm');
const nicknameEl   = document.getElementById('gbNickname');
const contentEl    = document.getElementById('gbContent');
const hintEl       = document.getElementById('gbHint');
const listEl       = document.getElementById('gbList');
const adminEl      = document.getElementById('gbAdmin');
const logoutBtn    = document.getElementById('gbLogout');
const triggerBtn   = document.getElementById('gbAdminTrigger');

// ===== 状态 =====
let isAdmin = false;
let lastSubmitTime = 0;
let adminClickCount = 0;

// ===== 工具 =====
function showHint(msg, type = 'info') {
  hintEl.textContent = msg;
  hintEl.className = `gb-hint gb-hint--${type}`;
  if (type !== 'info') {
    setTimeout(() => { hintEl.textContent = ''; hintEl.className = 'gb-hint'; }, 3000);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== 渲染留言 =====
function renderMessages(messages) {
  if (!messages || !messages.length) {
    listEl.innerHTML = '<p class="gb-empty">还没有留言，来第一个吧 ✨</p>';
    return;
  }
  listEl.innerHTML = messages.map(m => `
    <div class="gb-msg" data-id="${m.id}">
      <div class="gb-msg-header">
        <span class="gb-msg-nick">${escapeHtml(m.nickname)}</span>
        <span class="gb-msg-date">${formatDate(m.created_at)}</span>
        ${isAdmin ? `<button class="gb-del-btn" data-id="${m.id}" title="删除">✕</button>` : ''}
      </div>
      <p class="gb-msg-content">${escapeHtml(m.content)}</p>
    </div>
  `).join('');

  if (isAdmin) {
    listEl.querySelectorAll('.gb-del-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
    });
  }
}

// ===== 加载留言 =====
async function loadMessages() {
  listEl.innerHTML = '<div class="gb-loading">加载中...</div>';
  const { data, error } = await sb
    .from('messages')
    .select('id, nickname, content, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    listEl.innerHTML = '<p class="gb-empty">加载失败，请刷新重试</p>';
    console.error('guestbook load error:', error);
    return;
  }
  renderMessages(data);
}

// ===== 提交留言 =====
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime < 60000) {
      showHint(`请 ${Math.ceil((60000 - (now - lastSubmitTime)) / 1000)} 秒后再发`, 'error');
      return;
    }
    const nickname = nicknameEl.value.trim();
    const content  = contentEl.value.trim();
    if (!nickname || !content) { showHint('昵称和内容都要填哦', 'error'); return; }

    showHint('发送中...', 'info');
    const { error } = await sb.from('messages').insert({ nickname, content });
    if (error) { showHint('发送失败：' + error.message, 'error'); return; }

    showHint('留言成功 🎉', 'success');
    lastSubmitTime = Date.now();
    nicknameEl.value = '';
    contentEl.value = '';
    loadMessages();
  });
}

// ===== 删除（仅管理员）=====
async function deleteMessage(id) {
  if (!confirm('确认删除这条留言？')) return;
  const { error } = await sb.from('messages').delete().eq('id', id);
  if (error) { alert('删除失败：' + error.message); return; }
  loadMessages();
}

// ===== 管理员登录入口（连点 3 次 · · · 触发）=====
if (triggerBtn) {
  triggerBtn.addEventListener('click', async () => {
    adminClickCount++;
    if (adminClickCount < 3) return;
    adminClickCount = 0;
    const email = prompt('输入管理员邮箱，将发送登录链接：');
    if (!email) return;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
    if (error) { alert('发送失败：' + error.message); return; }
    alert('✅ 登录链接已发至邮箱，请查收（检查垃圾箱）');
  });
}

// ===== 退出管理 =====
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await sb.auth.signOut();
    isAdmin = false;
    adminEl.style.display = 'none';
    loadMessages();
  });
}

// ===== 检查登录态 =====
async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    isAdmin = true;
    if (adminEl) adminEl.style.display = 'flex';
    loadMessages();
  }
  sb.auth.onAuthStateChange((_event, session) => {
    isAdmin = !!session;
    if (adminEl) adminEl.style.display = session ? 'flex' : 'none';
    loadMessages();
  });
}

// ===== 启动 =====
checkAuth();
loadMessages();
