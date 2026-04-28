# v3.1 · 留言板弹幕化 + 表情支持

> 版本：v3.1-danmaku
> 状态：**待实施**
> 前置依赖：v3.0 留言板已上线（Supabase + messages 表）
> 目标：把静态列表改为**横向飞过的弹幕**，并支持常用 Emoji 表情

---

## 一、设计目标

1. **更有活力**：留言从右向左飞过，像 B 站弹幕，营造"有人来过"的感觉
2. **视觉即作品**：弹幕本身成为第 6 屏的核心视觉元素，不再是沉闷列表
3. **保留管理员能力**：悬停暂停、管理员可直接点击弹幕删除
4. **低门槛表达**：输入框旁加表情选择器，表达更丰富

---

## 二、交互设计

### 2.1 第 6 屏布局调整

```
┌─────────────────────────────────────────────────┐
│  06 · GUESTBOOK                                  │
│  给我留个言。                                     │
│  路过的朋友，写点什么吧。                         │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │  弹幕舞台（danmaku-stage）                 │   │
│  │     ← Hello! 路过 ✨                       │   │
│  │                 ← 好看 ❤️                   │   │
│  │     ← 真不错 👍                             │   │
│  │                        ← Designer 💡        │   │
│  │  ──────────────────────────────────────    │   │
│  │  （高度约 280px，多条轨道）                 │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  [昵称] [😊] [ 留言内容... ]        [发送 →]     │
│                                                   │
│                                          · · ·   │
└─────────────────────────────────────────────────┘
```

### 2.2 弹幕行为

| 行为 | 规则 |
|---|---|
| **入场** | 从右侧屏幕外出现，向左匀速滑行 |
| **速度** | 基础 80 px/s，每条随机 ±20% 偏差 |
| **轨道** | 5 条水平轨道，每条高 48px，新弹幕选择最空闲的一条 |
| **密度** | 最多同时显示 15 条，超出则排队等待 |
| **循环** | 所有现有留言播放完后，重新随机打乱再来一轮 |
| **悬停暂停** | 鼠标移入舞台 → 所有弹幕 `animation-play-state: paused` |
| **管理员模式** | 登录后，弹幕右上角出现 ✕，点击删除 |
| **新留言** | 用户发送后，立刻把自己的留言插入到队列头，3 秒内出现 |

### 2.3 视觉样式（每条弹幕胶囊）

```
┌───────────────────────────────┐
│ 【昵称】内容文字 ✨             │
└───────────────────────────────┘
```

- 背景：`var(--white)` 或 `var(--acid)`（随机轮换）
- 描边：`1.5px solid var(--ink)`
- 圆角：`var(--r-pill)`
- 阴影：`3px 3px 0 var(--ink)`（硬边风格，呼应 sticker）
- 内边距：`8px 16px`
- 字号：`var(--fs-small)` 14px
- 昵称用 `var(--electric)` 颜色 + 粗体
- Hover（非管理员）：放大 1.05，阴影加深

### 2.4 Emoji 选择器

**触发：** 输入框左侧放一个 `😊` 按钮（圆形，胶囊样式）

**展开：** 点击后在按钮上方弹出一个小面板，5×4 网格，共 20 个常用表情：

```
✨ ❤️ 👍 🎉 🔥
😊 😂 🥰 😎 🤔
💡 💯 👀 ✍️ 🌸
☕ 🍀 ⭐ 🚀 💬
```

**插入：** 点击表情后，将 emoji 追加到 `<textarea>` 光标位置，面板关闭。

**可选加强：** ESC 关闭、点击外部区域关闭。

---

## 三、技术实现要点

### 3.1 数据层（无需改 Supabase）

继续使用 v3.0 的 `messages` 表，字段不变。Emoji 作为 text 存储没有问题（UTF-8）。

### 3.2 渲染架构

```javascript
// 概念伪代码
class DanmakuEngine {
  constructor(stage) {
    this.stage = stage;           // 舞台 DOM
    this.lanes = 5;                // 轨道数
    this.laneState = [0,0,0,0,0]; // 每条轨道下一次空闲时间
    this.queue = [];               // 待播队列
  }
  push(message) { /* 入队 */ }
  tick() { /* 每 100ms 检查：从 queue 取一条，找空闲轨道，创建 DOM，CSS 动画滑过 */ }
  pause() { this.stage.classList.add('paused'); }
  resume() { this.stage.classList.remove('paused'); }
}
```

### 3.3 关键 CSS

```css
.danmaku-stage {
  position: relative;
  width: 100%; height: 288px;     /* 6 轨道 × 48px */
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--paper-2);
  border: 1.5px solid var(--ink-10);
}
.danmaku-stage.paused .danmaku { animation-play-state: paused; }

.danmaku {
  position: absolute;
  left: 100%;                     /* 起点在舞台右边外 */
  white-space: nowrap;
  animation: danmaku-fly linear forwards;
  /* --duration 由 JS 根据文字宽度 + 速度动态计算 */
}

@keyframes danmaku-fly {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-100% - var(--stage-width))); }
}
```

### 3.4 轨道分配算法

```javascript
findFreeLane() {
  const now = performance.now();
  // 找一条「下次空闲时间」最早的轨道
  let best = 0;
  for (let i = 1; i < this.lanes; i++) {
    if (this.laneState[i] < this.laneState[best]) best = i;
  }
  if (this.laneState[best] > now) return -1;  // 所有轨道都在用
  return best;
}
```

发射弹幕后更新该轨道 `laneState[best] = now + SAFE_GAP_MS`（避免后一条追尾）。

### 3.5 CSS 变量驱动动画时长

```javascript
const durationMs = (stageWidth + elWidth) / (speedPxPerSec) * 1000;
el.style.setProperty('--duration', durationMs + 'ms');
el.style.animationDuration = durationMs + 'ms';
```

---

## 四、实施步骤清单

### Step 1 · 修改 HTML 结构（`index.html`）

将第 6 屏内的 `<div class="gb-list">` 改为：
```html
<div class="danmaku-stage" id="gbStage">
  <div class="danmaku-empty" id="gbEmpty">还没有留言，来第一个吧 ✨</div>
</div>
```

form 内部结构调整，把 emoji 按钮加进去：
```html
<form class="gb-form" id="gbForm">
  <div class="gb-form-row">
    <input class="gb-input gb-input--nick" id="gbNickname" ... />
    <button type="button" class="gb-emoji-btn" id="gbEmojiBtn" aria-label="选择表情">😊</button>
    <button class="gb-submit btn btn-primary" type="submit">发送 <span class="arrow">→</span></button>
  </div>
  <textarea class="gb-textarea" id="gbContent" ... ></textarea>
  <div class="gb-emoji-panel" id="gbEmojiPanel" hidden>
    <!-- 20 个 emoji 按钮 -->
  </div>
  <div class="gb-hint" id="gbHint"></div>
</form>
```

### Step 2 · 新增 CSS（追加到 `v2-home.css`）

- `.danmaku-stage` 舞台样式 + `:hover` 暂停
- `.danmaku` 胶囊样式 + 关键帧动画
- `.danmaku--variant-acid` / `.danmaku--variant-white` 两种底色
- `.gb-emoji-btn` 圆形按钮
- `.gb-emoji-panel` 表情面板 + 5×4 网格
- `.danmaku-empty` 空态居中

### Step 3 · 改写 `assets/js/guestbook.js`

- 保留：Supabase 客户端、提交、删除、管理员登录
- 新增：`DanmakuEngine` 类
  - `loadMessages()` → 不再 innerHTML 列表，而是灌入引擎队列
  - 新留言 insert 成功后 → `engine.pushFront(myMessage)`
- 新增：表情面板
  - 点击按钮 → `hidden` 切换
  - 点击某个 emoji → 插入到 textarea 光标位置
  - 点击外部 / ESC → 关闭

### Step 4 · 本地 / 线上测试

- [ ] 弹幕从右向左顺畅滑过
- [ ] 多条同时不重叠（轨道算法正常）
- [ ] 悬停舞台弹幕全部暂停
- [ ] 表情按钮能插入 emoji
- [ ] 新留言立刻出现在弹幕里
- [ ] 管理员登录后弹幕上有 ✕ 可删除
- [ ] 无留言时显示空态文案
- [ ] 移动端舞台高度减为 200px，字号缩小

### Step 5 · 部署

```bash
git add -A
git commit -m "feat(v3.1): guestbook as danmaku with emoji picker"
git push origin main
```

---

## 五、性能与可访问性

| 项 | 策略 |
|---|---|
| DOM 数量 | 同屏最多 15 条，离开舞台后立刻 remove |
| 动画 | 纯 CSS `transform: translateX`（GPU 加速） |
| `prefers-reduced-motion` | 降级为**静态列表**，关闭所有滑动 |
| 移动端 | 轨道减为 3 条，字号 `--fs-meta` |
| ARIA | 舞台标注 `role="log" aria-live="polite"`，新弹幕出现时屏幕阅读器播报 |
| 键盘 | 表情面板可 Tab 聚焦，Enter 确认 |

---

## 六、降级方案（reduced-motion）

```css
@media (prefers-reduced-motion: reduce) {
  .danmaku { animation: none !important; position: static !important; }
  .danmaku-stage { height: auto; max-height: 340px; overflow-y: auto; }
  /* 弹幕以列表形式纵向堆叠 */
}
```

---

## 七、后续可扩展

- **颜色随机**：留言随机分配 acid / white / electric 背景
- **滚动速度随机**：长留言更慢，短留言更快，感觉更自然
- **点赞气泡**：点击弹幕 → 浮起 ❤️ 气泡并消失
- **Realtime 同步**：Supabase Realtime 订阅，新留言自动加入弹幕流（无需 reload）
- **NSFW 过滤**：前端简单词库 + 后端 edge function 二次审核
