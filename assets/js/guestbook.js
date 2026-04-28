// ============================================================
// Guestbook · v3.1 · Danmaku + Hero strip + Emoji
// ============================================================
const SUPABASE_URL      = 'https://znflconpkvndaoqkicuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZmxjb25wa3ZuZGFvcWtpY3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjMxOTMsImV4cCI6MjA5Mjg5OTE5M30.Wj9Xpu6BjLSEaonUQqDYNj5_dqy-LsXlLK4w4N0IGmQ';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DOM =====
const form         = document.getElementById('gbForm');
const nicknameEl   = document.getElementById('gbNickname');
const contentEl    = document.getElementById('gbContent');
const hintEl       = document.getElementById('gbHint');
const stageEl      = document.getElementById('gbStage');
const heroEl       = document.getElementById('heroDanmaku');
const adminEl      = document.getElementById('gbAdmin');
const logoutBtn    = document.getElementById('gbLogout');
const triggerBtn   = document.getElementById('gbAdminTrigger');
const emojiBtn     = document.getElementById('gbEmojiBtn');
const emojiPanel   = document.getElementById('gbEmojiPanel');

// ===== 状态 =====
let isAdmin = false;
let lastSubmitTime = 0;
let adminClickCount = 0;
let allMessages = [];

// ===== 工具 =====
function showHint(msg, type = 'info') {
  hintEl.textContent = msg;
  hintEl.className = `gb-hint gb-hint--${type}`;
  if (type !== 'info') {
    setTimeout(() => { hintEl.textContent = ''; hintEl.className = 'gb-hint'; }, 3000);
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// DanmakuEngine — 轨道调度 + DOM 复用
// ============================================================
class DanmakuEngine {
  /**
   * @param {HTMLElement} stage   容器
   * @param {object}      opts
   *   - lanes:   轨道数 (默认 5)
   *   - laneH:   轨道高度 px (默认 48)
   *   - speed:   px/s (默认 80)
   *   - max:     同屏最多条数 (默认 15)
   *   - variants: 弹幕底色 class 数组（仅主舞台用）
   *   - showDel: 管理员模式时是否显示删除按钮
   */
  constructor(stage, opts = {}) {
    this.stage    = stage;
    this.lanes    = opts.lanes ?? 5;
    this.laneH    = opts.laneH ?? 48;
    this.speed    = opts.speed ?? 80;
    this.max      = opts.max ?? 15;
    this.variants = opts.variants ?? ['', 'acid', 'blush'];
    this.showDel  = !!opts.showDel;
    this.onDelete = opts.onDelete;
    this.queue    = [];
    this.laneFreeAt = new Array(this.lanes).fill(0);
    this.activeCount = 0;
    this.cursor   = 0;       // 顺序播放索引
    this.running  = false;
    this.paused   = false;

    // 鼠标悬停暂停
    if (opts.pausable !== false) {
      stage.addEventListener('mouseenter', () => stage.classList.add('paused'));
      stage.addEventListener('mouseleave', () => stage.classList.remove('paused'));
    }
  }

  setMessages(list) {
    this.messages = list.slice();
    this.cursor = 0;
    if (list.length > 0) this.stage.classList.add('has-msg');
    else this.stage.classList.remove('has-msg');
    if (!this.running) this.start();
  }

  pushFront(msg) {
    if (!this.messages) this.messages = [];
    this.messages.unshift(msg);
    this.queue.unshift(msg);
    this.stage.classList.add('has-msg');
  }

  setAdmin(on) {
    this.stage.classList.toggle('admin', on);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      this.step();
      setTimeout(tick, 600);     // 每 600ms 尝试发射一条
    };
    tick();
  }

  stop() { this.running = false; }

  step() {
    if (!this.messages || this.messages.length === 0) return;
    if (this.activeCount >= this.max) return;

    const now = performance.now();
    const lane = this.findFreeLane(now);
    if (lane < 0) return;

    // 取下一条（队列优先，否则按顺序循环）
    let msg;
    if (this.queue.length) {
      msg = this.queue.shift();
    } else {
      msg = this.messages[this.cursor % this.messages.length];
      this.cursor++;
    }

    this.fire(msg, lane, now);
  }

  findFreeLane(now) {
    let best = -1, bestT = Infinity;
    for (let i = 0; i < this.lanes; i++) {
      if (this.laneFreeAt[i] < now && this.laneFreeAt[i] < bestT) {
        best = i; bestT = this.laneFreeAt[i];
      }
    }
    return best;
  }

  fire(msg, lane, now) {
    const stageW = this.stage.clientWidth || window.innerWidth;
    const variant = this.variants[Math.floor(Math.random() * this.variants.length)];

    const el = document.createElement('div');
    el.className = 'danmaku' + (variant ? ' ' + variant : '');
    el.style.top = (lane * this.laneH + (this.laneH - 36) / 2) + 'px';
    el.dataset.id = msg.id;

    const delBtn = this.showDel
      ? `<button class="del" type="button" aria-label="删除" data-id="${msg.id}">✕</button>`
      : '';
    el.innerHTML =
      `<span class="nick">${escapeHtml(msg.nickname)}</span>` +
      `<span class="body">${escapeHtml(msg.content)}</span>` +
      delBtn;

    this.stage.appendChild(el);
    this.activeCount++;

    // 测量宽度后计算时长
    const w = el.offsetWidth;
    const distance = stageW + w;
    const speed = this.speed * (0.85 + Math.random() * 0.3);   // ±15% 随机
    const durMs = (distance / speed) * 1000;
    el.style.animationDuration = durMs + 'ms';

    // 占用轨道（弹幕本身穿过 + 200ms 安全间隔）
    this.laneFreeAt[lane] = now + (w / speed) * 1000 + 200;

    // 删除按钮
    if (this.showDel && this.onDelete) {
      const btn = el.querySelector('.del');
      if (btn) btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDelete(msg.id, el);
      });
    }

    // 动画结束后清理
    el.addEventListener('animationend', () => {
      el.remove();
      this.activeCount--;
    });
  }

  removeById(id) {
    this.stage.querySelectorAll(`.danmaku[data-id="${id}"]`).forEach(el => {
      el.remove();
      this.activeCount = Math.max(0, this.activeCount - 1);
    });
    if (this.messages) this.messages = this.messages.filter(m => m.id !== id);
  }
}

// ============================================================
// 引擎实例
// ============================================================
const mainEngine = stageEl ? new DanmakuEngine(stageEl, {
  lanes: 5, laneH: 56, speed: 85, max: 15,
  variants: ['', 'acid', 'blush'],
  showDel: false,
  onDelete: async (id, el) => {
    if (!isAdmin) return;
    if (!confirm('确认删除这条留言？')) return;
    const { error } = await sb.from('messages').delete().eq('id', id);
    if (error) { alert('删除失败：' + error.message); return; }
    mainEngine.removeById(id);
    if (heroEngine) heroEngine.removeById(id);
  }
}) : null;

const heroEngine = heroEl ? new DanmakuEngine(heroEl, {
  lanes: 2, laneH: 20, speed: 60, max: 4,
  variants: [''],
  showDel: false,
  pausable: false
}) : null;

// ============================================================
// 加载留言
// ============================================================
async function loadMessages() {
  const { data, error } = await sb
    .from('messages')
    .select('id, nickname, content, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.error('guestbook load error:', error);
    return;
  }
  allMessages = data || [];
  if (mainEngine) mainEngine.setMessages(allMessages);
  if (heroEngine) {
    const recent = allMessages.slice(0, 20).sort(() => Math.random() - 0.5);
    heroEngine.setMessages(recent);
  }
}

// ============================================================
// 提交留言
// ============================================================
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
    const { data, error } = await sb
      .from('messages')
      .insert({ nickname, content })
      .select()
      .single();
    if (error) { showHint('发送失败：' + error.message, 'error'); return; }

    showHint('留言成功 🎉', 'success');
    lastSubmitTime = Date.now();
    nicknameEl.value = '';
    contentEl.value = '';
    if (data && mainEngine) mainEngine.pushFront(data);
  });
}

// ============================================================
// 管理员登录 / 登出
// ============================================================
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

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await sb.auth.signOut();
    isAdmin = false;
    adminEl.style.display = 'none';
    if (mainEngine) mainEngine.setAdmin(false);
  });
}

async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    isAdmin = true;
    if (adminEl) adminEl.style.display = 'flex';
    if (mainEngine) mainEngine.setAdmin(true);
  }
  sb.auth.onAuthStateChange((_event, session) => {
    isAdmin = !!session;
    if (adminEl) adminEl.style.display = session ? 'flex' : 'none';
    if (mainEngine) mainEngine.setAdmin(!!session);
  });
}

// ============================================================
// Emoji 选择器
// ============================================================
function insertAtCursor(textarea, str) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end   = textarea.selectionEnd   ?? textarea.value.length;
  const value = textarea.value;
  textarea.value = value.slice(0, start) + str + value.slice(end);
  const pos = start + str.length;
  textarea.setSelectionRange(pos, pos);
  textarea.focus();
}

if (emojiBtn && emojiPanel) {
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = emojiPanel.hasAttribute('hidden');
    emojiPanel.toggleAttribute('hidden');
    emojiBtn.classList.toggle('open', willOpen);
  });
  emojiPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('.gb-emoji');
    if (!btn) return;
    insertAtCursor(contentEl, btn.textContent);
  });
  document.addEventListener('click', (e) => {
    if (emojiPanel.hasAttribute('hidden')) return;
    if (e.target === emojiBtn || emojiBtn.contains(e.target)) return;
    if (emojiPanel.contains(e.target)) return;
    emojiPanel.setAttribute('hidden', '');
    emojiBtn.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !emojiPanel.hasAttribute('hidden')) {
      emojiPanel.setAttribute('hidden', '');
      emojiBtn.classList.remove('open');
    }
  });
}

// ============================================================
// 启动
// ============================================================
checkAuth();
loadMessages();
