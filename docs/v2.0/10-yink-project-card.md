# 10 · Yink 影客 · Projects 页卡片设计文档

## 1. 项目基本信息

| 字段 | 内容 |
|---|---|
| **项目名** | YINK 影客 |
| **副标题** | 宣纸之上，遇见千年衣冠 |
| **定位** | AI 汉服虚拟换装 × 实体租赁 × 城市发现平台 |
| **核心功能** | AI 试穿换装 / 汉服租赁 / 城市地图探索 / 用户社区 |
| **技术栈** | Next.js 16 · shadcn/ui · Framer Motion |
| **状态** | v2.5 · 迭代中 |
| **线上地址** | https://yink-web.vercel.app/ |

## 2. 展示目标

把 Yink 作为 `projects.html` 的第 **02** 号项目，列在游戏《裂缝》之后，单独新增一个 section：**AI 产品**。

删除或替换现有「更多作品即将到来」的 coming-block 占位块，改为真实项目卡片 + 一个新的 coming-block。

## 3. 设计决策

### 3.1 版式

- 采用 `.project-row.reverse`（视觉在右、文字在左），与 01 号项目（视觉在左）形成 **左右交替的节奏感**。
- 数字编号：**02**（延续现有计数体系）。

### 3.2 色彩与 SVG 封面

Yink 的品牌色为：
- **宣纸米白** (`#F9F5EC`) — 底色
- **朱砂红** (`#C0392B` / `#E74C3C`) — 主题色，对应「影客」的影视感与传统
- **墨色** (`#1A1A1A`) — 笔墨感文字/线条
- **淡蓝灰** (`#B8C5D6`) — 背景晕染

SVG 封面设计思路（纯 SVG，无外部图片）：
1. 背景：宣纸纹理感（浅米色渐变 + 细线网格模拟纸纹）
2. 主体：一件汉服轮廓剪影（简化几何线条，优雅但不复杂）
3. 装饰：AI 数字光点（小圆点散布，暗示 AI 技术层）
4. 印章：右下角一枚朱砂方形印章，文字「影」
5. 墨晕：左侧一大片半透明墨色椭圆（泼墨感）
6. 标识：顶部 `YINK · 影客` 文字排布

### 3.3 徽章（project-badge）

```
🎋 AI · 汉服
```
背景色改为 **朱砂红** (`#E74C3C`)，文字白色，边框墨色——区别于 01 号的 acid 绿，避免撞色。

需在 `<style>` 里追加 `.project-badge.red` 变体：
```css
.project-badge.red { background: #E74C3C; color: #fff; }
```

### 3.4 标签 (tags)

```
AI 换装 · 汉服租赁 · 城市发现 · 社区 · Next.js
```

### 3.5 按钮

- 主按钮：「访问 Yink →」→ `https://yink-web.vercel.app/` (target=_blank)
- 副按钮（ghost）：「AI 试穿 ›」→ `https://yink-web.vercel.app/try-on` (target=_blank)

### 3.6 项目描述（两段）

```
YINK 影客是一个 AI 汉服虚拟换装与文化体验平台——上传一张照片，30 秒内看见穿越千年衣冠后的自己；喜欢的款式可直接预约租赁，送货上门。

平台融合 AI 妆造建议、城市汉服打卡地图与内容社区，从「试穿」到「出门」，覆盖一件汉服从屏幕到身边的完整旅程。
```

### 3.7 Tagline

```
"上传一张照片，30 秒，看见另一个自己。"
```

## 4. Section 结构

在现有 `SECTION · 01 游戏作品` 之后，插入：

```
SECTION · 02  AI 产品
  └─ [article.project-row.reverse] Yink 影客
```

然后新增更新后的 coming-block（移至最底部保留，内容改为「更多创意还在路上…」）。

## 5. 执行清单

- [ ] `projects.html` — 在 `<style>` 里加 `.project-badge.red`
- [ ] `projects.html` — 在 `SECTION · 01` 之后插入 `SECTION · 02` 分隔带（`section-band`）
- [ ] `projects.html` — 插入 `project-row.reverse` 文章块（含 SVG 封面 + 文字 + 按钮）
- [ ] `projects.html` — coming-block 文案微调（保留，移到 Yink 卡片之后）
- [ ] 整体不破坏现有《裂缝》卡片

## 6. 注意事项

- 不引入任何外部图片，SVG 自绘保持与《裂缝》卡片一致的技术方案
- 版本标注：page-hero 的 lede 文案可更新为提及「AI 产品」
- footer 版权行保持原样
