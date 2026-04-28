# Supabase 留言后台管理手册

> 所有你可能用到的后台操作，都在这里。
> Dashboard：https://supabase.com/dashboard/project/znflconpkvndaoqkicuo
> 项目名：haozi-guestbook

---

## 一、登录 Dashboard

1. 浏览器打开 https://supabase.com/dashboard
2. 用 GitHub 账号登录（和创建项目时一致）
3. 点击项目卡片 `haozi-guestbook` 进入

左侧导航栏是所有管理入口：

| 图标 | 名称 | 用途 |
|---|---|---|
| 🏠 Home | 总览 | 项目健康度、请求量 |
| 📊 **Table Editor** | **表编辑器** ⭐ | **看/删/改留言最常用** |
| 🗄️ Database | 数据库 | 高级 SQL、索引、备份 |
| 🔑 Authentication | 身份认证 | 管理登录用户（你自己）|
| ⚙️ SQL Editor | SQL 编辑器 | 批量操作、复杂查询 |
| 📈 Reports | 用量报告 | 免费额度监控 |
| 🔧 Settings | 设置 | API 密钥、暂停项目 |

---

## 二、日常：查看与删除留言（最常用 ⭐）

### 2.1 查看所有留言

1. 左侧点 **Table Editor**
2. 选择 `messages` 表
3. 默认展示所有留言，可按列排序
4. 想按时间倒序：点 `created_at` 列头箭头

### 2.2 删除单条留言（3 种方式）

**方式 A · 网页入口（推荐给日常）**
- 直接在你的网站首页，滚到留言板
- 底部 `· · ·` 连点 3 次 → 邮箱登录 → 点弹幕上的 ✕

**方式 B · Supabase Table Editor（推荐给批量）**
1. Table Editor → `messages` 表
2. 找到要删的行（可用右上角搜索框按昵称/内容筛选）
3. 行首复选框勾选 → 右上角 **Delete** 按钮 → 确认

**方式 C · SQL 命令（最快，知道 id 时用）**
1. 左侧 **SQL Editor** → New query
2. 粘贴：
   ```sql
   DELETE FROM messages WHERE id = '粘贴-uuid-这里';
   ```
3. 点 **Run**

### 2.3 批量删除

**删除某个昵称的所有留言：**
```sql
DELETE FROM messages WHERE nickname = '垃圾昵称';
```

**删除今天之前的所有留言：**
```sql
DELETE FROM messages WHERE created_at < current_date;
```

**删除含特定关键词的留言：**
```sql
DELETE FROM messages WHERE content ILIKE '%敏感词%';
```

**清空整张表（慎用！）：**
```sql
TRUNCATE messages;
```

---

## 三、查询与筛选

### 3.1 常用查询

**最近 24 小时的留言：**
```sql
SELECT nickname, content, created_at
FROM messages
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

**留言总数：**
```sql
SELECT COUNT(*) FROM messages;
```

**按昵称统计（谁最活跃）：**
```sql
SELECT nickname, COUNT(*) AS total
FROM messages
GROUP BY nickname
ORDER BY total DESC
LIMIT 10;
```

**搜索含 emoji 的留言：**
```sql
SELECT * FROM messages
WHERE content ~ '[\U0001F300-\U0001FAFF]';
```

### 3.2 修改留言内容（比如纠正错字）

```sql
UPDATE messages
SET content = '新内容'
WHERE id = '指定-uuid';
```

---

## 四、备份与导出

### 4.1 导出 CSV（方便本地归档）

1. **Table Editor** → `messages` 表
2. 右上角 `···` → **Download as CSV**
3. 得到 Excel 可打开的备份文件

### 4.2 导出 SQL（完整结构 + 数据）

1. **Database → Backups**（付费计划才有自动备份）
2. 免费版可用 SQL Editor 手动：
   ```sql
   COPY messages TO STDOUT WITH CSV HEADER;
   ```

### 4.3 建议频率

- 留言数 < 100 条：不用专门备份
- 留言数 > 500 条：每月 CSV 导出一次，存到本地或云盘

---

## 五、管理员账号（Auth）

### 5.1 查看已登录用户

**Authentication → Users** 菜单，列出所有登录过的邮箱。

### 5.2 限制只有你能登录（推荐设置）

当前策略是"任何知道 `· · ·` 入口的人输入邮箱都能收到登录链接"。虽然隐蔽但不绝对安全。

**加强做法：** Authentication → Providers → Email → 开启 **Allow signups** 后在下方的 Auth Hooks 里配置只允许指定邮箱（进阶）。

**更简单的做法：** 删除其他用户，只保留你自己：
- Authentication → Users → 鼠标移到非本人账号 → `···` → Delete user

### 5.3 修改管理员邮箱

目前是 prompt 里临时输入，JS 不写死邮箱。如果要硬编码限制：

```js
// guestbook.js 里
const ADMIN_EMAIL = '704494844@qq.com';
if (email !== ADMIN_EMAIL) { alert('非管理员'); return; }
```

---

## 六、安全加固（可选）

### 6.1 加长度限制

已在建表时加了 CHECK：昵称 30 字、内容 200 字。

### 6.2 加字段：`ip_hash` 做限频

```sql
ALTER TABLE messages ADD COLUMN ip_hash text;

CREATE INDEX messages_ip_hash_idx ON messages (ip_hash);
```

前端提交时带上 `crypto.subtle.digest` 过的 IP 哈希，后端限频（需要 Edge Function，v3.2 实现）。

### 6.3 紧急关闭投稿

如果被刷屏，立刻：
```sql
DROP POLICY "public can insert" ON messages;
```
访客就无法提交了（但读取和删除不受影响）。恢复：
```sql
CREATE POLICY "public can insert" ON messages FOR INSERT WITH CHECK (true);
```

### 6.4 彻底下线留言功能

**不要删表**，只需：
1. Vercel 上从 `index.html` 注释掉 `<section id="guestbook">`
2. 留言数据保留在 Supabase，将来随时可恢复

---

## 七、监控与报警

### 7.1 免费额度（Free Plan）

| 资源 | 免费额度 | 留言场景消耗 |
|---|---|---|
| 数据库空间 | 500 MB | 1 万条留言 ≈ 5 MB，完全够用 |
| API 请求 | 无硬限制（合理使用） | 每次 load 1 次 SELECT |
| 月活认证用户 | 50,000 | 你一个人，0.00002% |
| 带宽 | 5 GB/月 | 留言小文本，每月用几 KB |
| 项目暂停 | 7 天无活动自动暂停 | ⚠️ 见下 |

### 7.2 ⚠️ 项目暂停问题

**免费项目连续 7 天无任何请求，会被自动暂停**，留言板会 404。

**解决方案二选一：**

**方案 A · 定期手动唤醒**
- 每 6 天访问一次你的网站 / Supabase Dashboard
- 登进去任意一个动作都算活跃

**方案 B · 自动心跳（推荐，免费）**

用 GitHub Actions 每 6 天自动调用一次 API：

在仓库 `.github/workflows/supabase-ping.yml` 添加：
```yaml
name: Supabase Keep-Alive
on:
  schedule:
    - cron: '0 12 */6 * *'   # 每 6 天中午 12:00 UTC
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping messages table
        run: |
          curl "https://znflconpkvndaoqkicuo.supabase.co/rest/v1/messages?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
```

然后到 GitHub 仓库 **Settings → Secrets and variables → Actions → New repository secret**：
- Name：`SUPABASE_ANON_KEY`
- Value：粘贴你的 anon key

### 7.3 用量查看

**Reports** 菜单 → 看 API 调用数、数据库大小、带宽使用。

---

## 八、完整场景速查

| 我想做... | 去哪里 |
|---|---|
| 删一条垃圾留言 | 网站 `· · ·` 登录 → ✕ 按钮 |
| 删某个人的全部留言 | SQL Editor → `DELETE WHERE nickname = '...'` |
| 清空测试数据 | SQL Editor → `TRUNCATE messages;` |
| 导出留言做备份 | Table Editor → CSV 下载 |
| 看总共多少留言 | SQL Editor → `SELECT COUNT(*) FROM messages;` |
| 临时关闭投稿 | SQL Editor → `DROP POLICY "public can insert"` |
| 重新开放投稿 | SQL Editor → `CREATE POLICY "public can insert"` |
| 检查免费额度 | Dashboard → Reports |
| 防止项目被暂停 | 配置 GitHub Actions 心跳 |
| 看谁登录过管理后台 | Authentication → Users |

---

## 九、求救方案

| 问题 | 处理 |
|---|---|
| **忘了 Supabase 密码** | 不重要，从不用。API 用的是 anon key |
| **anon key 泄露** | 公开 key，无需重新生成（RLS 保护）|
| **留言全没了** | 看 Database → Backups（免费版 7 天内可回溯）|
| **有人刷屏** | 先 `DROP POLICY insert` 止血，再批量 DELETE |
| **项目 404** | 登 Dashboard 点 Restore，3 分钟恢复 |
| **完全不想要了** | Settings → General → Delete project |

---

## 十、推荐的日常工作流

**每周一次：**
1. 打开 https://supabase.com/dashboard/project/znflconpkvndaoqkicuo
2. Table Editor → messages → 快速扫一眼新留言
3. 勾选删除不合适的几条
4. 关闭

**收到新留言通知（可选）：**
未来可配置 Supabase Edge Function → 有新 INSERT 时发邮件到 `704494844@qq.com` 提醒。v3.3 实现。

---

**备注：** 所有 SQL 操作都是立即生效且不可撤销的，建议第一次执行删除前先用 `SELECT` 版本看一眼：

```sql
-- 先看一眼会删哪些
SELECT * FROM messages WHERE nickname = '测试';

-- 确认无误后
DELETE FROM messages WHERE nickname = '测试';
```
