# 04 · 子页设计蓝图

子页采用与首页相同的设计系统（01 文档），但**取消 snap 滚动**，是常规长滚动页。
每个子页顶部都有：导航栏 + 一个 Hero 段（80vh）+ 主内容 + 底部「下一页」CTA。

---

## 4.1 `/photos.html` — 摄影完整页

### 结构
```
HEADER
HERO  (80vh)
  ┌─ 左：标题「Photographs / 摄影」+ 介绍 50 字
  └─ 右：一张代表性大图

FILTER BAR
  [全部] [城市] [人像] [自然] [胶片]   ← 胶囊 tab，可切换

WATERFALL GRID (Masonry)
  瀑布流 3 列（桌面），列宽 320px
  每张图 hover 上浮 + 显示拍摄地/时间 caption
  最后一张永远是 ghost「+ 新作品位」

LIGHTBOX
  点击放大，左右键切换，Esc 关闭

NEXT
  ┌─────────────────────────┐
  │  下一站：项目 →          │  跳 projects.html
  └─────────────────────────┘
```

### 冗余位
- 标签 tab 默认 5 个，可扩到 8 个
- 瀑布流按时间倒序，新作品自动出现在最前

---

## 4.2 `/projects.html` — 项目完整页

### 结构
```
HEADER
HERO
  「Projects / 项目」+ "I make things, here are some of them."
  右侧贴一个大「★」sticker

PROJECTS LIST (一项一行，纵向排列)
  每项：
  ┌────────────────────────────────────────────────┐
  │ 01                            年份 · 角色       │
  │ ┌──────────────┐                                │
  │ │  封面图      │  PROJECT TITLE (display 64pt) │
  │ │  (40% 宽)    │  一段 2-3 行描述                │
  │ │              │  [Tag] [Tag] [Tag]             │
  │ │              │  [详情 →] [外链 ↗]             │
  │ └──────────────┘                                │
  └────────────────────────────────────────────────┘
  分隔线（手绘 SVG 波浪）

GHOST SLOT
  最末尾固定一个「下个项目位 +」虚线卡，hover 实线

NEXT → Agent
```

### 冗余位
- 项目卡是「编号 + 数据驱动」式，加一个新项目只需添一条数据
- 推荐把项目数据提取到 `assets/data/projects.json`（M3 阶段）

---

## 4.3 `/agents.html` — Agent 完整页

### 结构
```
HEADER
HERO
  「Agents / 智能体实验」+ 一段说明 AI 探索方向

AGENTS GRID (2 列卡片)
  每个 Agent：
  ┌────────────────────────────┐
  │ 🤖 Agent 名字              │
  │ 一句话定位                  │
  │ ── 能力清单 (3-5 条) ──     │
  │ • 能力 1                   │
  │ • 能力 2                   │
  │                            │
  │ [立即体验 →] [文档 ↗]      │
  └────────────────────────────┘

GHOST SLOT × 2 (留 2 个空位预示扩展)

NEXT → Resume
```

---

## 4.4 `/resume.html` — 简历页

> 现有 resume.html 已较完善，v2.0 主要做**视觉皮肤更换**，不动结构。

### 改动
- 替换字体到 Fraunces / Inter
- 替换色板到新 token
- 时间线节点改为软方块 + `--electric` 描边
- 标签胶囊改为新设计
- 顶部加一个「Print / Download PDF」浮动按钮
- 不引入新 section（保持简历专注）

---

## 4.5 `/about-game.html` — 彩蛋页

保持原样，仅替换全局 CSS token 即可继承新风格。
