# v3.0 · 留言板功能设计与实施文档

> 版本：v3.0-guestbook
> 状态：**待实施**
> 目标：在首页新增第 6 屏「留言板」，访客可留言，站长可删除

---

## 一、功能需求

| 需求 | 说明 |
|---|---|
| **访客留言** | 填写昵称 + 留言内容，点击提交 |
| **留言展示** | 实时展示所有留言，按时间倒序 |
| **管理员删除** | 站长登录后可看到每条留言的删除按钮 |
| **防垃圾** | 限频（同 IP 60 秒一条）+ 字数限制（最多 200 字）|
| **静态兼容** | 纯静态站，后端用 Supabase（无需自建服务器）|

---

## 二、技术方案

```
前端（纯 HTML/JS）
      ↕ fetch API
Supabase（PostgreSQL + Auth + RLS）
```

- **数据库**：Supabase Postgres，`messages` 表
- **读取**：公开，任何人可 SELECT
- **写入**：公开，任何人可 INSERT（限频由前端 + DB 约束双保险）
- **删除**：仅 authenticated 用户（你本人）可 DELETE
- **管理员登录**：Supabase Auth Magic Link（发邮件点链接即登录，无需密码）

---

## 三、Supabase 配置步骤

### 3.1 创建项目

1. 打开 https://supabase.com → New Project
2. 项目名：`haozi-guestbook`（随意）
3. 密码记下来（不常用但要保存）
4. 地区选 `Northeast Asia (Tokyo)` 或 `Singapore`（延迟低）
5. 创建完成后进入 Dashboard

### 3.2 获取密钥

Dashboard → **Settings → API**，记录两个值：
- `Project URL`：形如 `https://xxxx.supabase.co`
- `anon public key`：形如 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> ⚠️ `anon key` 可以暴露在前端代码里（它是公开密钥，靠 RLS 保护安全）

### 3.3 建表（SQL Editor 里执行）

Dashboard → **SQL Editor** → 新建查询，粘贴以下 SQL 执行：

```sql
-- 创建留言表
CREATE TABLE messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname   text NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 30),
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 200),
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_hash    text  -- 用于限频，不存明文 IP
);

-- 按时间倒序索引
CREATE INDEX messages_created_at_idx ON messages (created_at DESC);

-- 开启 Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 策略 1：任何人可读
CREATE POLICY "public can read"
  ON messages FOR SELECT
  USING (true);

-- 策略 2：任何人可写（INSERT）
CREATE POLICY "public can insert"
  ON messages FOR INSERT
  WITH CHECK (true);

-- 策略 3：仅登录用户可删除（你本人）
CREATE POLICY "admin can delete"
  ON messages FOR DELETE
  USING (auth.role() = 'authenticated');
```

### 3.4 配置 Auth（允许 Magic Link）

Dashboard → **Authentication → Providers**：
- Email 保持开启（默认）
- 关闭「Confirm email」（可选，方便调试）

Dashboard → **Authentication → URL Configuration**：
- `Site URL` 填你的网站地址：`https://personal-website-iota-lac-51.vercel.app`
- `Redirect URLs` 也填同一个地址

### 3.5 限频函数（可选但推荐）

```sql
-- 创建限频检查函数：同一 ip_hash 60 秒内只能发 1 条
CREATE OR REPLACE FUNCTION check_rate_limit(p_ip_hash text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM messages
    WHERE ip_hash = p_ip_hash
      AND created_at > now() - interval '60 seconds'
  );
$$;
```

---

## 四、前端实现

### 4.1 HTML 结构（新增第 6 屏）

在 `index.html` 的 `<!-- 屏 5 CONTACT -->` 之后插入：

```html
<!-- ===== 屏 6 · GUESTBOOK ===== -->
<section class="snap" id="guestbook">
  <div class="snap-inner guestbook-inner">

    <div class="section-tag">06 · Guestbook</div>
    <h2 class="section-title">给我<em>留个言</em>。</h2>
    <p class="section-sub">路过的朋友，写点什么吧。</p>

    <!-- 留言表单 -->
    <form class="gb-form" id="gbForm">
      <div class="gb-form-row">
        <input
          class="gb-input"
          id="gbNickname"
          type="text"
          placeholder="你的昵称（必填）"
          maxlength="30"
          required
        />
        <button class="gb-submit btn btn-primary" type="submit">
          发送 <span class="arrow">→</span>
        </button>
      </div>
      <textarea
        class="gb-textarea"
        id="gbContent"
        placeholder="留下你想说的话（最多 200 字）"
        maxlength="200"
        required
      ></textarea>
      <div class="gb-hint" id="gbHint"></div>
    </form>

    <!-- 留言列表 -->
    <div class="gb-list" id="gbList">
      <div class="gb-loading">加载中...</div>
    </div>

    <!-- 管理员区（仅登录后可见） -->
    <div class="gb-admin" id="gbAdmin" style="display:none">
      <button class="btn btn-ghost gb-logout" id="gbLogout">退出管理</button>
    </div>
    <div class="gb-admin-login" id="gbAdminLogin">
      <button class="gb-admin-trigger" id="gbAdminTrigger">· · ·</button>
    </div>

  </div>
</section>
```

### 4.2 JS 模块（`assets/js/guestbook.js`）

```javascript
// assets/js/guestbook.js
// ===== 配置：替换为你自己的 Supabase 信息 =====
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// ===== 初始化 Supabase 客户端（CDN 引入，无需 npm）=====
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DOM 引用 =====
const form       = document.getElementById('gbForm');
const nicknameEl = document.getElementById('gbNickname');
const contentEl  = document.getElementById('gbContent');
const hintEl     = document.getElementById('gbHint');
const listEl     = document.getElementById('gbList');
const adminEl    = document.getElementById('gbAdmin');
const adminLoginEl = document.getElementById('gbAdminLogin');
const logoutBtn  = document.getElementById('gbLogout');
const triggerBtn = document.getElementById('gbAdminTrigger');

// ===== 状态 =====
let isAdmin = false;
let lastSubmitTime = 0;

// ===== 工具 =====
function showHint(msg, type = 'info') {
  hintEl.textContent = msg;
  hintEl.className = `gb-hint gb-hint--${type}`;
  if (type === 'success' || type === 'error') {
    setTimeout(() => { hintEl.textContent = ''; hintEl.className = 'gb-hint'; }, 3000);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ===== 渲染留言 =====
function renderMessages(messages) {
  if (!messages.length) {
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

  // 绑定删除按钮
  if (isAdmin) {
    listEl.querySelectorAll('.gb-del-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
    });
  }
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== 加载留言 =====
async function loadMessages() {
  listEl.innerHTML = '<div class="gb-loading">加载中...</div>';
  const { data, error } = await sb
    .from('messages')
    .select('id, nickname, content, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { listEl.innerHTML = '<p class="gb-empty">加载失败，刷新试试</p>'; return; }
  renderMessages(data);
}

// ===== 提交留言 =====
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

// ===== 删除留言（仅管理员）=====
async function deleteMessage(id) {
  if (!confirm('确认删除这条留言？')) return;
  const { error } = await sb.from('messages').delete().eq('id', id);
  if (error) { alert('删除失败：' + error.message); return; }
  loadMessages();
}

// ===== 管理员登录（Magic Link）=====
let adminClickCount = 0;
triggerBtn.addEventListener('click', async () => {
  adminClickCount++;
  if (adminClickCount < 3) return; // 连点 3 次才触发
  adminClickCount = 0;
  const email = prompt('输入管理员邮箱，将发送登录链接：');
  if (!email) return;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  if (error) { alert('发送失败：' + error.message); return; }
  alert('✅ 登录链接已发送，请查收邮件（检查垃圾箱）');
});

// ===== 管理员退出 =====
logoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  isAdmin = false;
  adminEl.style.display = 'none';
  loadMessages();
});

// ===== 检查登录态 =====
async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    isAdmin = true;
    adminEl.style.display = 'flex';
  }
  // 监听 Auth 状态变化（处理 Magic Link 回调）
  sb.auth.onAuthStateChange((_event, session) => {
    isAdmin = !!session;
    adminEl.style.display = session ? 'flex' : 'none';
    loadMessages();
  });
}

// ===== 启动 =====
checkAuth();
loadMessages();
```

### 4.3 在 `index.html` 引入

在 `</body>` 前添加：
```html
<script type="module" src="assets/js/guestbook.js"></script>
```

同时在进度轨 `.progress-rail` 里加第 6 个点：
```html
<button class="rail-dot" data-target="guestbook" aria-label="留言板"></button>
```

---

## 五、CSS 样式（追加到 `v2-home.css` 末尾）

```css
/* ===== Guestbook ===== */
.guestbook-inner {
  display: flex; flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  padding: calc(72px + var(--s-5)) var(--pad-x) var(--s-5);
  max-width: 720px;
}

/* 表单 */
.gb-form { width: 100%; display: flex; flex-direction: column; gap: var(--s-2); }
.gb-form-row { display: flex; gap: var(--s-2); }

.gb-input, .gb-textarea {
  width: 100%;
  padding: 14px 18px;
  background: var(--white);
  border: 1.5px solid var(--ink-30);
  border-radius: var(--r-md);
  font-family: var(--f-body); font-size: var(--fs-body);
  color: var(--ink);
  transition: border-color .2s var(--ease-io);
  outline: none;
  resize: none;
}
.gb-input:focus, .gb-textarea:focus { border-color: var(--electric); }
.gb-textarea { min-height: 100px; }
.gb-submit { flex-shrink: 0; white-space: nowrap; }

.gb-hint { font-size: var(--fs-small); min-height: 20px; }
.gb-hint--error { color: #E74C3C; }
.gb-hint--success { color: #22C55E; }
.gb-hint--info { color: var(--ink-60); }

/* 留言列表 */
.gb-list {
  width: 100%;
  display: flex; flex-direction: column; gap: var(--s-2);
  max-height: 380px; overflow-y: auto;
  padding-right: 4px;
}
.gb-list::-webkit-scrollbar { width: 4px; }
.gb-list::-webkit-scrollbar-track { background: transparent; }
.gb-list::-webkit-scrollbar-thumb { background: var(--ink-30); border-radius: 2px; }

.gb-msg {
  background: var(--white);
  border: 1px solid var(--ink-10);
  border-radius: var(--r-md);
  padding: var(--s-3);
  transition: border-color .2s var(--ease-io);
}
.gb-msg:hover { border-color: var(--ink-30); }

.gb-msg-header {
  display: flex; align-items: center; gap: var(--s-2);
  margin-bottom: var(--s-1);
}
.gb-msg-nick {
  font-weight: 700; font-size: var(--fs-small);
}
.gb-msg-date {
  font-family: var(--f-mono); font-size: var(--fs-meta);
  color: var(--ink-60); letter-spacing: 0.06em;
  margin-left: auto;
}
.gb-msg-content {
  font-size: var(--fs-small); line-height: 1.7;
  color: var(--ink-60);
  white-space: pre-wrap; word-break: break-word;
}

/* 删除按钮（管理员可见）*/
.gb-del-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px;
  border-radius: 50%;
  font-size: 11px; color: var(--ink-60);
  background: transparent;
  transition: all .18s var(--ease-io);
  cursor: pointer; border: none;
  flex-shrink: 0;
}
.gb-del-btn:hover { background: #E74C3C; color: var(--white); }

.gb-empty, .gb-loading {
  font-size: var(--fs-small); color: var(--ink-60);
  text-align: center; padding: var(--s-4);
}

/* 管理员区 */
.gb-admin { align-items: center; gap: var(--s-2); }
.gb-admin-login { margin-top: var(--s-3); }
.gb-admin-trigger {
  font-family: var(--f-mono); font-size: var(--fs-meta);
  color: var(--ink-30); letter-spacing: 0.2em;
  cursor: pointer; border: none; background: none;
  transition: color .2s;
}
.gb-admin-trigger:hover { color: var(--ink-60); }
```

---

## 六、完整实施步骤（按顺序执行）

### Step 1 · Supabase 配置
1. 注册 / 登录 https://supabase.com
2. 新建项目，记录 `Project URL` 和 `anon key`
3. 在 SQL Editor 执行第三节的建表 SQL
4. （可选）执行限频函数 SQL
5. 在 Auth → URL Configuration 填写网站地址

### Step 2 · 填写密钥
打开 `assets/js/guestbook.js`，替换：
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';   // ← 替换
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                 // ← 替换
```

### Step 3 · 修改 HTML
- `index.html`：新增 `#guestbook` 第 6 屏（见 4.1）
- `index.html`：进度轨 `.progress-rail` 加第 6 个点
- `index.html`：`</body>` 前引入 `guestbook.js` 模块

### Step 4 · 追加 CSS
将第五节 CSS 追加到 `assets/css/v2-home.css` 末尾。

### Step 5 · 本地测试
用 `vercel dev` 或直接打开 `index.html` 测试：
- [ ] 访客留言能正常提交
- [ ] 留言列表能正常显示
- [ ] 60 秒限频生效
- [ ] `· · ·` 连点 3 次 → 弹出邮箱输入框
- [ ] 邮件收到后点击链接回到网站 → 出现删除按钮
- [ ] 删除功能正常

### Step 6 · 部署
```bash
git add -A
git commit -m "feat: add guestbook with Supabase backend"
git push origin main    # Vercel 自动部署
```

---

## 七、管理员删除操作手册

### 如何登录管理后台

1. 打开网站首页，滚动到留言板（第 6 屏）
2. 找到底部的 `· · ·` 字样（不显眼，访客不会注意）
3. **快速连点 3 次**
4. 弹出输入框，填入你的邮箱（`704494844@qq.com`）
5. 去邮箱点击登录链接（有效期 1 小时）
6. 回到网站，每条留言右上角出现 `✕` 按钮
7. 点击 `✕` → 确认 → 留言删除

### 如何退出

留言板底部出现「退出管理」按钮，点击即可。

### 注意事项

- 登录状态在当前标签页有效，关闭浏览器后失效
- Magic Link 邮件 1 小时内有效
- 删除操作不可恢复

---

## 八、安全性说明

| 风险 | 防护措施 |
|---|---|
| 任意人删留言 | Supabase RLS：DELETE 只允许 `auth.role() = 'authenticated'` |
| 垃圾留言轰炸 | 前端 60 秒限频 + 数据库字段长度限制 |
| XSS 注入 | 所有展示内容经 `escapeHtml()` 处理 |
| anon key 泄露 | anon key 本身是公开密钥，靠 RLS 保护，暴露无害 |
| 管理员入口暴露 | `· · ·` 入口无任何标识，依赖连点隐藏触发 |

---

## 九、后续可扩展方向

- **Emoji 反应**：每条留言加 👍 / ❤️ / ✨ 反应按钮
- **头像**：昵称旁显示 DiceBear API 自动生成的随机像素头像
- **置顶**：管理员可将某条留言置顶显示
- **实时更新**：用 Supabase Realtime 订阅，新留言自动出现（无需刷新）
