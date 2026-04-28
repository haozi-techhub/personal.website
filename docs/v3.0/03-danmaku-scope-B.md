# v3.1 · 弹幕 + 表情 · 方案 B（留言板主场 + Hero 生活感）

> 版本：v3.1-danmaku
> 状态：**待实施**
> 前置依赖：v3.0 留言板已上线
> 选定范围：**留言板（第 6 屏）主视觉 + 首页 Hero（第 1 屏）底部薄带**

---

## 一、范围与原则

### 1.1 出现位置

| 场景 | 形态 | 功能 |
|---|---|---|
| **第 6 屏 `#guestbook`** | 大舞台（高 288px），5 轨道，胶囊卡片 | 留言板主视觉，可悬停暂停、管理员可删除 |
| **第 1 屏 `#hero`** | 底部薄带（高 40px），2 轨道，透明度 0.5 | 被动装饰，"有人来过"的氛围信号 |
| 其他所有页面 | 不出现 | 保持作品展示纯净 |

### 1.2 核心原则（不干扰作品）

- Hero 薄带**只滑行不交互**：没有 hover、没有 click、没有删除按钮
- Hero 薄带 **`pointer-events: none`**：鼠标穿透，不影响下方元素
- Hero 薄带 **`z-index` 低于所有内容**：字、头像、CTA 都在其上
- 移动端 Hero 薄带**完全隐藏**：小屏空间宝贵，只保留留言板完整弹幕
- `prefers-reduced-motion`：两处都降级为静态列表/隐藏

---

## 二、留言板弹幕（主舞台）

### 2.1 DOM 结构

替换原 `<div class="gb-list">`：

```html
<div class="danmaku-stage" id="gbStage" role="log" aria-live="polite" aria-label="留言弹幕">
  <div class="danmaku-empty" id="gbEmpty">还没有留言，来第一个吧 ✨</div>
</div>
```

### 2.2 视觉样式

```
┌──────────────────────────────────────────────┐
│           ← 【昵称】内容 ✨                   │  轨道 1
│                     ← 【昵称】好看 ❤️         │  轨道 2
│    ← 【昵称】路过 👍                          │  轨道 3
│                            ← 【昵称】文字     │  轨道 4
│  ← 【昵称】表白 💯                            │  轨道 5
└──────────────────────────────────────────────┘
高 288px · 圆角 40px · 米白 2 色底 · 深色细边
```

- 舞台：`background: var(--paper-2); border: 1.5px solid var(--ink-10); border-radius: var(--r-lg);`
- 弹幕胶囊：`--r-pill` 圆角，`3px 3px 0 var(--ink)` 硬边阴影，两种底色轮换（白 / 酸绿）
- 昵称：`var(--electric)` 蓝色粗体
- 内容：`var(--fs-small)` 14px

### 2.3 轨道算法

- 5 条水平轨道，每条高 48px
- 新弹幕发射前：扫描所有轨道，选"下次空闲时间最早"的那条
- 发射后：`laneState[i] = now + (子弹宽度 / 速度) + 200ms 安全间隔`
- 若所有轨道都占用 → 进入等待队列，下一个 tick 再尝试

### 2.4 动画

```css
.danmaku {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  animation: danmaku-fly linear forwards;
  /* animation-duration 由 JS 根据「(舞台宽 + 弹幕宽) / 速度」动态设置 */
}
@keyframes danmaku-fly {
  to { transform: translateX(calc(-100% - var(--stage-w, 100vw))); }
}
.danmaku-stage:hover .danmaku { animation-play-state: paused; }
.danmaku-stage.admin .danmaku .del { display: inline-flex; }
```

### 2.5 交互

| 行为 | 效果 |
|---|---|
| 鼠标移入舞台 | 所有弹幕暂停；离开恢复 |
| 管理员登录后 | 弹幕右端显示 `✕` 按钮，点击 → `confirm` → 删除并从 DOM 移除 |
| 用户发送新留言 | 发送成功后立即 `enginePushFront(myMsg)`，下一个 tick 飞过 |
| 留言列表播放完 | 洗牌后循环（无限）|

---

## 三、Hero 薄弹幕带（配角）

### 3.1 DOM 结构

在 `#hero` 的 `.snap-inner` 末尾追加：

```html
<div class="hero-danmaku" id="heroDanmaku" aria-hidden="true"></div>
```

### 3.2 视觉样式

```css
.hero-danmaku {
  position: absolute;
  left: 0; right: 0; bottom: 24px;
  height: 40px;
  overflow: hidden;
  pointer-events: none;            /* 鼠标穿透 */
  opacity: 0.55;                    /* 半透明，不抢戏 */
  z-index: 1;                        /* 低于 hero 内容 */
  mask-image: linear-gradient(to right,
    transparent 0, black 10%, black 90%, transparent 100%);
}
.hero-danmaku .danmaku {
  top: 6px; height: 28px;
  padding: 4px 12px;
  font-size: var(--fs-meta);
  background: var(--white);
  border: 1px solid var(--ink-30);
  box-shadow: none;
  border-radius: var(--r-pill);
}
@media (max-width: 900px) { .hero-danmaku { display: none; } }
```

- 仅 2 条轨道
- 速度更慢：60 px/s
- 同屏最多 4 条
- 左右两边遮罩淡入淡出（`mask-image`），避免硬边

### 3.3 数据来源

- 和留言板共用同一批数据（从 `messages` 表读取）
- 但**只取最近 20 条**，随机播放
- **不订阅新留言**（避免 Hero 意外闪动），只在页面加载时拉一次

### 3.4 无数据时

如果 `messages` 表为空，`.hero-danmaku` 保持空白，不显示任何占位文字（默默不出现）。

---

## 四、Emoji 表情选择器

### 4.1 DOM

```html
<form class="gb-form" id="gbForm">
  <div class="gb-form-row">
    <input class="gb-input" id="gbNickname" placeholder="你的昵称（必填）" maxlength="30" required />
    <button type="button" class="gb-emoji-btn" id="gbEmojiBtn" aria-label="选择表情">😊</button>
    <button class="gb-submit btn btn-primary" type="submit">发送 <span class="arrow">→</span></button>
  </div>
  <div class="gb-textarea-wrap">
    <textarea class="gb-textarea" id="gbContent" placeholder="留下你想说的话（最多 200 字）" maxlength="200" required></textarea>
    <div class="gb-emoji-panel" id="gbEmojiPanel" hidden>
      <button type="button" class="gb-emoji">✨</button>
      <button type="button" class="gb-emoji">❤️</button>
      <!-- ... 共 20 个 ... -->
    </div>
  </div>
  <div class="gb-hint" id="gbHint"></div>
</form>
```

### 4.2 Emoji 列表（5 × 4 = 20 个）

```
✨ ❤️ 👍 🎉 🔥
😊 😂 🥰 😎 🤔
💡 💯 👀 ✍️ 🌸
☕ 🍀 ⭐ 🚀 💬
```

### 4.3 样式

```css
.gb-emoji-btn {
  flex-shrink: 0;
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--white);
  border: 1.5px solid var(--ink-30);
  font-size: 22px;
  transition: all .2s var(--ease-io);
  cursor: pointer;
}
.gb-emoji-btn:hover { background: var(--acid); transform: scale(1.06); }

.gb-textarea-wrap { position: relative; }
.gb-emoji-panel {
  position: absolute;
  top: 100%; left: 0;
  margin-top: 8px;
  background: var(--white);
  border: 1.5px solid var(--ink);
  border-radius: var(--r-md);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 40px);
  gap: 4px;
  box-shadow: var(--sh-md);
  z-index: 10;
}
.gb-emoji-panel[hidden] { display: none; }
.gb-emoji {
  width: 40px; height: 40px;
  border-radius: var(--r-sm);
  background: none; border: none;
  font-size: 20px;
  transition: background .15s;
  cursor: pointer;
}
.gb-emoji:hover { background: var(--acid); }
```

### 4.4 行为

- **点击 `😊` 按钮** → 切换面板显示/隐藏
- **点击某个 emoji** → 插入到 `<textarea>` 光标位置，面板保持打开（方便连选）
- **ESC / 点面板外** → 关闭
- **插入逻辑**：用 `textarea.selectionStart/End` 保留光标位置，插入后光标后移

---

## 五、文件改动清单

| 文件 | 改动 |
|---|---|
| `index.html` | ① 第 6 屏：`.gb-list` → `.danmaku-stage`<br>② 第 6 屏：form 内加 `.gb-emoji-btn` 和 `.gb-emoji-panel`<br>③ 第 1 屏 `.snap-inner` 末尾加 `.hero-danmaku` |
| `assets/css/v2-home.css` | 追加：`.danmaku-stage`、`.danmaku`、`.hero-danmaku`、`.gb-emoji-*` 全套样式；删除原 `.gb-list` / `.gb-msg` |
| `assets/js/guestbook.js` | ① 新增 `DanmakuEngine` 类（轨道调度 + DOM 复用）<br>② `loadMessages()` 改为灌入两个引擎（主舞台 + hero）<br>③ 新增 emoji 插入逻辑<br>④ 提交成功后 `mainEngine.pushFront(myMsg)` |

**无 Supabase 改动**（表结构不变）。

---

## 六、实施顺序

1. HTML 结构调整（index.html 两处）
2. CSS 样式追加（v2-home.css）
3. JS 改写 `guestbook.js`（保留原提交/删除/登录逻辑，新增引擎）
4. 本地打开测试：弹幕流畅？表情插入正常？Hero 薄带不抢戏？
5. `git push origin main` → 自动部署

---

## 七、验收清单

- [ ] 第 6 屏：弹幕 5 轨从右向左滑过，不重叠
- [ ] 第 6 屏：鼠标移入舞台 → 全部暂停；移出 → 继续
- [ ] 第 6 屏：留言成功后自己的弹幕在 3 秒内出现
- [ ] 第 6 屏：管理员登录后弹幕上有 ✕，可删除
- [ ] 第 1 屏：Hero 底部有一条淡淡的弹幕带
- [ ] 第 1 屏：弹幕不影响大字 Hello!、头像、自我介绍的交互
- [ ] 第 1 屏：移动端 Hero 薄带隐藏
- [ ] Emoji 按钮点击展开面板，选择后插入 textarea
- [ ] 其他页面（photos/projects/agents/resume）完全不受影响
- [ ] `prefers-reduced-motion`：弹幕降级为静态列表，Hero 薄带隐藏

---

## 八、性能约束

| 项 | 指标 |
|---|---|
| 同时 DOM 节点 | 主舞台 ≤ 15 条，Hero 薄带 ≤ 4 条 |
| 动画属性 | 仅 `transform`（合成层，GPU 加速）|
| 离开视口 | 主舞台用 IntersectionObserver 检测，未进入时暂停 tick（省电）|
| 刷新频率 | `requestAnimationFrame` 取代 `setInterval` |
| 内存 | 弹幕 DOM 滑出后立刻 `.remove()`，不留累积 |

---

## 九、后续可扩展

- 留言胶囊底色 3~4 种随机（`--acid` / `--white` / `--blush` / `--electric-tint`）
- 点击弹幕 → 弹出该条全文 + 点赞 ❤️（需要扩表）
- Supabase Realtime 订阅，新留言实时进入弹幕流
