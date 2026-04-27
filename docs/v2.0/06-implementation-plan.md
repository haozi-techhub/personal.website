# 06 · 实施计划

> 总原则：**先做设计系统底座 → 再做首页 → 再翻新子页**。每个里程碑可独立 deploy / 回滚。

---

## 里程碑 M1 · 设计系统底座（预计 0.5 天）

### 目标
建立全站可复用的 token 与组件，不影响现有视觉。

### 文件改动
- 新增 `assets/css/tokens.css` — 色彩 / 字阶 / 间距 / 圆角变量
- 新增 `assets/css/typography.css` — 字体加载 + 类
- 新增 `assets/css/components.css` — 按钮 / 卡片 / 胶囊 / Ghost
- 新增 `assets/stickers/` — SVG 装饰库（约 8 个）
- 修改 `assets/css/main.css` — 引入上述文件，但 v1 旧样式暂保留兜底

### 验收
- 任意页面引入 tokens 后，能用 `var(--electric)` 等
- 8 个 sticker SVG 可在 README 预览页查看

---

## 里程碑 M2 · 首页重设计（预计 1.5 天）

### 目标
把 `index.html` 改为 5 屏 snap 滚动结构。

### 文件改动
- 重写 `index.html`（保留 v1 备份为 `index.v1.html`）
- 新增 `assets/css/home.css`
- 新增 `assets/js/snap.js` — snap 行为、键盘、hash 同步、nav 高亮
- 新增 `assets/js/reveal.js` — IntersectionObserver 入场动画
- **需要素材**：艺术照（详见 07 文档）

### 验收
- 5 屏可正常 snap 滚动
- 导航高亮联动
- 移动端单列流畅
- Lighthouse 性能 ≥ 90

---

## 里程碑 M3 · 子页翻新（预计 2 天，可分批）

### 顺序
1. `photos.html`（瀑布流升级、tab、lightbox）
2. `projects.html`（数据驱动 + ghost slot）
3. `agents.html`（卡片重做）
4. `resume.html`（皮肤替换，不动结构）
5. `about-game.html`（继承新 token，最小改动）

### 数据外置（M3 后期）
- 提取 `assets/data/projects.json`
- 提取 `assets/data/agents.json`
- 提取 `assets/data/photos.json`（含 caption / 标签 / 顺序）

### 验收
- 新增项目/作品只需改 JSON，不动 HTML
- 所有页视觉一致

---

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| Snap 在某些 Mac 触控板上跳得太快 | 加 throttle + `scroll-snap-stop: always`；测试通过后再合并 |
| 自定义字体加载慢导致 FOIT | `font-display: swap` + 预加载关键字重 |
| 艺术照素材未到位 | 先用占位灰图 + 米白底 squircle，不阻塞开发 |
| 移动端 snap 体验差 | 移动端关闭 mandatory，改 `proximity` |
| 现有页面的 background-animation.js 冲突 | M1 时审视：若与新风格不符，下线；保留为 about-game 彩蛋 |

---

## 回滚策略

- 每个里程碑独立 commit + tag（`v2.0-m1`, `v2.0-m2`, `v2.0-m3`）
- 旧版 `index.html` 备份为 `index.v1.html`
- `feat/v2.0-redesign` 分支验收完成后再合 main
- main 上保留 `v1.0-pre-redesign` tag 永久可回退

---

## 不做的事（v2.0 范围外）

- ❌ 暗色模式
- ❌ i18n 多语言切换
- ❌ 后端 / CMS
- ❌ 动效库（GSAP / Lottie）
- ❌ 自媒体内容抓取/嵌入
- ❌ 评论 / 留言系统
