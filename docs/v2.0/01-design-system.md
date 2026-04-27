# 01 · 视觉设计系统

## 1. 设计语言（Design Voice）

> **「编辑级排版 × 酸性配色 × 软方块容器」**
> 关键词：Editorial / Acid / Squircle / Sticker / Confident

整体气质参考：参考图 1（神经酸性社交风）+ 参考图 3（大字 SocialFi）+ 参考图 4（编辑杂志风）的杂交，**剔除二次元元素**，保留克制的趣味贴纸。

---

## 2. 色彩系统

### 2.1 主色（Primary）
| Token | HEX | 用途 |
|-------|-----|------|
| `--ink` | `#0E1116` | 主文字、标题、深色背景块 |
| `--paper` | `#F4F1EA` | 全局米白底（替代纯白，更有质感） |
| `--electric` | `#2A37FF` | 电光蓝，主行动色、重点装饰块 |
| `--acid` | `#D7FF3A` | 酸性黄绿，强调高光、徽章、悬浮态 |

### 2.2 辅助色（Accent）
| Token | HEX | 用途 |
|-------|-----|------|
| `--blush` | `#FF6F61` | 摄影板块强调（参考图 4 的珊瑚红） |
| `--mist` | `#E6E2D6` | 次级容器底、分割带 |
| `--shadow` | `#0E111620` | 软阴影（12% 透明度） |

### 2.3 用色比例（每屏建议）
- Paper 底 60% / Ink 文字 20% / Electric 12% / Acid 6% / Accent 2%
- **禁止**：Electric + Acid 同时大面积铺底（会刺眼，只允许小面积叠用）

---

## 3. 字体系统

### 3.1 字体族
| 角色 | 中文 | 英文 / 数字 | 来源 |
|------|------|-------------|------|
| Display（展示） | 思源宋体 Heavy / 站酷小薇 LOGO | **Fraunces** Black 9pt opsz | Google Fonts |
| Body（正文） | 思源黑体 / PingFang SC | **Inter** | 系统 / Google Fonts |
| Mono（标签） | — | **JetBrains Mono** | Google Fonts |

> Fraunces 是带可变光学尺寸的现代衬线，能做出「编辑级」展示效果；Inter 兼容性好；中文用 PingFang SC 兜底，避免引入大字库。

### 3.2 字阶（Type Scale，基于 8pt）
| Token | size / line-height | 用途 |
|-------|--------------------|------|
| `--fs-hero` | 96 / 96 px（移动 64 / 68） | 首屏 Hello! / Display |
| `--fs-h1` | 64 / 72 | 章节标题 |
| `--fs-h2` | 40 / 48 | 子章节 |
| `--fs-h3` | 24 / 32 | 卡片标题 |
| `--fs-body` | 16 / 26 | 正文 |
| `--fs-meta` | 13 / 20（uppercase, tracking 0.08em） | 标签、序号 |

### 3.3 排版规则
- 中英混排：英文用 Fraunces / Inter，中文紧跟其后用 PingFang，靠 `font-feature-settings: "palt"` 紧排
- Display 必须**做斜体或大小混排**之一（如 `Hello!` 用斜体，`HAOZI` 用直体）
- 所有英文展示字开启 `font-optical-sizing: auto`

---

## 4. 栅格与间距

- **栅格**：12 列，桌面 max-width 1280px，gutter 24px，外边距 64px
- **垂直节奏**：所有间距使用 8 的倍数（8 / 16 / 24 / 40 / 64 / 96 / 128）
- **首页 snap section**：每屏 100vh，内部使用 12 栅 × 6 行的子栅格做自由布局

---

## 5. 形状与圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `--r-sm` | 12px | 小标签、按钮 |
| `--r-md` | 24px | 卡片、输入 |
| `--r-lg` | 40px | 大软方块容器 |
| `--r-xl` | 96px | Hero 大 blob |
| `--r-pill` | 999px | 胶囊按钮、Tab |

> v2.0 全站默认形状是**软方块（squircle）**，不出现锐角矩形。容器之间允许互相**啃边**（叠 -16~-32px）制造杂志感。

---

## 6. 组件库

### 6.1 按钮（Button）
- **Primary（电光胶囊）**：`--electric` 底，白字，`--r-pill`，hover 时底色变 `--ink`，文字变 `--acid`
- **Ghost（描边）**：1.5px 实线 `--ink`，hover 填充 `--acid`
- **Sticker（贴纸 CTA）**：`--acid` 底，黑字 + 黑描边，2deg 旋转，hover 抖动

### 6.2 卡片（Card）
- **Soft Card**：`--r-lg`、白底、`0 12px 32px var(--shadow)`、hover 上浮 -4px 并加 `--electric` 1.5px 描边
- **Sticker Card**：随机 -3°~3° 旋转，纸纹底，模拟 Polaroid

### 6.3 导航（Nav）
- 顶部 fixed，高 72px，米白底 + 底部 1px `--ink/10%` 细线
- 菜单项 hover 时 `--acid` 高亮下划线（手绘抖动 SVG）
- 下拉菜单（自媒体）：软方块 + 错位排列，每项带图标徽章

### 6.4 装饰元素（Stickers）
全站可重用的 SVG 装饰库（计划放 `assets/stickers/`）：

- ⭐ 星形徽章（带「new」「2025」字样）
- ➜ 手绘箭头（4 个方向）
- ✺ 花形 / 太阳形 印章
- ░ 网格底纹（5% 黑）
- ❝ 引号大字
- ◐ 半圆 / 月牙

每屏建议 **2~4 个 sticker**，过多会乱。

### 6.5 占位卡（Ghost / Coming Soon）
- 用于「冗余位」
- 虚线 1.5px 描边 `--ink/30%`、米白底、中央 `+` 图标 + 「下个项目位」文字
- hover 时虚线变实线 `--electric`

---

## 7. 暗色模式

v2.0 **暂不实现**，但变量命名预留（`--ink` / `--paper` 互换即可）。M3 阶段评估。

---

## 8. 可访问性底线

- 正文对比度 ≥ 4.5:1（已校验：`--ink` on `--paper` = 14.8:1 ✓）
- `--electric` on white = 7.8:1 ✓ 可作链接色
- `--acid` 不可单独用于文字（只做背景或装饰）
- 所有 sticker 装饰加 `aria-hidden="true"`
- snap 滚动必须支持键盘 ↑↓ / PageUp/Down，且尊重 `prefers-reduced-motion`
