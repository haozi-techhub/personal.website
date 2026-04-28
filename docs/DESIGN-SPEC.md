# Haozi 个人主页 · 设计规范文档

> **基于已实施代码提取，可直接作为 AI 协作上下文**
> 版本：v2.0 · 最后更新：2026-04-28
> Token 源文件：`assets/css/v2-tokens.css`
> 通用组件源：`assets/css/v2-page.css`
> 首页样式源：`assets/css/v2-home.css`

---

## 一、设计语言

**关键词：** Editorial（编辑杂志）· Acid（酸性配色）· Squircle（软方块）· Confident（克制自信）

整体气质：大字展示排版 × 电光蓝+酸性黄绿 × 米白底纸感，类似设计师作品集。  
禁止：纯白背景、锐角矩形容器、过多彩色同时铺底。

---

## 二、色彩系统

### 2.1 CSS Token（来自 `v2-tokens.css`）

```css
:root {
  /* 主色 */
  --ink:        #0E1116;          /* 主文字、深色块、导航底 */
  --ink-60:     rgba(14,17,22,.60); /* 次级文字 */
  --ink-30:     rgba(14,17,22,.30); /* 占位线、描边 */
  --ink-10:     rgba(14,17,22,.10); /* 分割线 */
  --ink-05:     rgba(14,17,22,.05); /* 网格底纹 */
  --paper:      #F4F1EA;           /* 全局底色（米白） */
  --paper-2:    #ECE7DB;           /* 次级容器底 */
  --electric:   #2A37FF;           /* 主行动色（电光蓝） */
  --electric-d: #1A24C9;           /* 电光蓝深色态 */
  --acid:       #D7FF3A;           /* 高亮/激活/徽章（酸性黄绿） */
  --blush:      #FF6F61;           /* 摄影板块强调（珊瑚红） */
  --mist:       #E6E2D6;           /* 次级容器、Mist 卡片底 */
  --white:      #FFFFFF;           /* 纯白（少量） */
}
```

### 2.2 非 Token 颜色（仅特定组件使用）

| HEX | 用途 |
|---|---|
| `#E74C3C` | 朱砂红，Yink 项目徽章/印章/红色 badge |
| `#1A1A1A` | Yink 卡片深黑底（`accent-cinnabar`）|
| `#22C55E` | Logo 状态绿点（在线指示）|

### 2.3 用色比例建议

- Paper 底 60% / Ink 文字 20% / Electric 12% / Acid 6% / 其他 2%
- `--acid` **禁止**单独作正文颜色（只做背景/装饰）
- `--electric` + `--acid` 禁止同时大面积铺底

---

## 三、字体系统

### 3.1 字体族 Token

```css
--f-display: 'Fraunces', 'Times New Roman', 'Songti SC', serif;
--f-body:    'Inter', -apple-system, 'PingFang SC', sans-serif;
--f-mono:    'JetBrains Mono', 'SF Mono', Menlo, monospace;
```

| 角色 | 字体 | 用途 |
|---|---|---|
| **Display** | Fraunces（可变，Black/Italic） | 页面大标题、Hero 展示 |
| **Body** | Inter（400/500/600/700）| 正文、按钮、描述 |
| **Mono** | JetBrains Mono（400/700）| 标签、序号、路径、元信息 |
| **中文兜底** | PingFang SC | 所有中文内容 |

**加载方式：** Google Fonts CDN，所有页面 `<head>` 内引入。

### 3.2 字阶 Token（响应式 clamp）

```css
--fs-hero:  clamp(64px, 10vw, 144px);   /* 首屏超大展示字 */
--fs-h1:    clamp(40px, 5.5vw, 72px);   /* 章节主标题 */
--fs-h2:    clamp(28px, 3.2vw, 44px);   /* 子章节标题 */
--fs-h3:    clamp(20px, 1.6vw, 26px);   /* 卡片标题 */
--fs-body:  16px;                        /* 正文 */
--fs-small: 14px;                        /* 辅助文字 */
--fs-meta:  12px;                        /* 标签、序号（uppercase）*/
```

### 3.3 排版规则

- Display 标题必须 `font-weight: 900`，通常配合 `font-style: italic`
- `<em>` 在标题中：斜体 + `color: var(--electric)`
- 所有 Mono 标签：`text-transform: uppercase; letter-spacing: 0.12~0.18em`
- 中英混排开启 `font-feature-settings: "palt" 1, "kern" 1`

---

## 四、间距系统

```css
--s-1:  8px;   /* 最小内间距 */
--s-2:  16px;  /* 行内元素间距 */
--s-3:  24px;  /* 小模块间距 */
--s-4:  40px;  /* 中等模块间距 */
--s-5:  64px;  /* 大区块间距 */
--s-6:  96px;  /* 章节间距 */
--s-7:  128px; /* 页面级间距 */
```

**规则：** 所有间距使用上述 Token，禁止任意像素值。

---

## 五、圆角系统

```css
--r-sm:   12px;   /* 小标签、小徽章 */
--r-md:   24px;   /* 卡片、下拉菜单 */
--r-lg:   40px;   /* 大容器、大卡片 */
--r-xl:   96px;   /* Hero blob、大圆形装饰 */
--r-pill: 999px;  /* 胶囊按钮、Tab、导航栏 */
```

**原则：** 全站无锐角矩形，默认使用软方块（squircle）风格。

---

## 六、阴影系统

```css
--sh-sm: 0 4px 12px rgba(14, 17, 22, .06);   /* 轻投影 */
--sh-md: 0 12px 32px rgba(14, 17, 22, .10);  /* 卡片悬浮 */
--sh-lg: 0 24px 64px rgba(14, 17, 22, .14);  /* 模态/强调 */
```

---

## 七、缓动曲线

```css
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);      /* 滑出（最常用）*/
--ease-io:   cubic-bezier(0.4, 0, 0.2, 1);         /* 进出（Material）*/
--ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);   /* 弹性回弹 */
```

---

## 八、布局系统

```css
--container: 1280px;                   /* 最大内容宽 */
--pad-x:     clamp(24px, 5vw, 72px);  /* 水平内边距（响应式）*/
```

- 内容区：`max-width: var(--container); margin: 0 auto; padding: 0 var(--pad-x)`
- 首页：5 屏 `scroll-snap-type: y mandatory`，每屏 `min-height: 100vh`
- 子页：传统滚动，`padding-top: calc(72px + var(--s-5))`（导航高度偏移）

---

## 九、导航组件（Nav）

### 结构
```
[Haozi. ●]   [Home · Photos · Projects · Agents · Self-media ▼]   [Resume →]
```

### 规格
- 高度：`72px`，`position: fixed; top: 0`，`z-index: 100`
- 背景：`color-mix(in srgb, var(--paper) 80%, transparent)` + `backdrop-filter: blur(20px)`
- 底边：`1px solid var(--ink-10)`

### Logo
- 字体：`var(--f-display)`，`font-size: 26px`，`font-weight: 900; font-style: italic`
- 字母 `o` 为 `color: var(--electric)`（蓝色高亮）
- 右上角绿点：`8px × 8px`，`#22C55E`，`border-radius: 50%`，带脉冲动画

### 胶囊导航（`.nav-pill`）
- 背景：`var(--ink)`（深黑），`border-radius: var(--r-pill)`，`padding: 4px`
- 普通项：`color: rgba(244,241,234,.65)`，hover → `rgba(255,255,255,.06)` 底 + 亮色字
- **激活项**（当前页）：`background: var(--acid); color: var(--ink)`

### Resume CTA 按钮（`.nav-cta`）
- 背景：`var(--electric)`，`color: var(--white)`，`border-radius: var(--r-pill)`
- hover：`::before` 伪元素从左滑入 `var(--ink)` 覆层，文字变 `var(--acid)`，上移 1px

### Self-media 下拉菜单（`.nav-dropdown-menu`）
- 触发：hover / focus-within
- 背景：`var(--paper)`，`border: 1.5px solid var(--ink)`，`border-radius: var(--r-md)`
- 进入动画：`translateY(-8px) scale(0.96)` → `translateY(0) scale(1)`
- 菜单项 hover：`background: var(--acid); transform: translateX(4px)`

---

## 十、按钮组件（`.btn`）

| 类名 | 底色 | 文字 | hover 效果 |
|---|---|---|---|
| `.btn-primary` | `--electric` | `--white` | 底变 `--ink`，字变 `--acid`，上移 2px |
| `.btn-ghost` | 透明 + `--ink` 描边 | `--ink` | 底变 `--acid`，上移 2px |
| `.btn-acid` | `--acid` | `--ink` | 底变 `--ink`，字变 `--acid`，上移 2px |

- 通用：`padding: 14px 24px; border-radius: var(--r-pill); font-weight: 600`
- `.arrow` 子元素：hover 时 `translateX(4px)`

---

## 十一、自定义光标

仅在桌面（`hover: hover and pointer: fine`）生效：

| 元素 | 尺寸 | 样式 |
|---|---|---|
| `.cursor-dot` | 8px × 8px | `background: var(--paper)`，`mix-blend-mode: difference` |
| `.cursor-ring`（默认） | 36px × 36px | 1.5px `var(--paper)` 边框，`mix-blend-mode: difference` |
| `.cursor-ring.hovering` | 56px × 56px | `background: var(--acid)` 实心 |
| `.cursor-ring.viewing` | 72px × 72px | `background: var(--electric)`，显示 `VIEW →` 文字 |

触发 `.hovering`：所有 `a, button`  
触发 `.viewing`：带 `data-cursor="view"` 的元素（如项目封面）

---

## 十二、动效规范

### 入场动画（`.data-reveal`）
```css
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .7s var(--ease-out), transform .7s var(--ease-out);
}
[data-reveal].in { opacity: 1; transform: translateY(0); }
```
由 `IntersectionObserver` 触发，阈值 0.15。

### 卡片 Tilt（`data-tilt`）
- 鼠标移入：JS 计算鼠标位置，`transform: perspective(900px) rotateX(...) rotateY(...)`
- 高光层：`::after` 伪元素，`background: radial-gradient` 跟随鼠标
- 移出：`rotateX(0) rotateY(0)`，过渡 `0.5s`

### 全局过渡时长原则
- 微交互（hover）：`0.2~0.25s`
- 组件进出：`0.3~0.4s`
- 页面入场：`0.5~0.7s`
- 所有动效尊重 `prefers-reduced-motion: reduce`（降为 0.01ms）

---

## 十三、全局背景纹理

所有页面 `body::before` 有一层半透明网格：
```css
background-image:
  linear-gradient(to right, var(--ink-05) 1px, transparent 1px),
  linear-gradient(to bottom, var(--ink-05) 1px, transparent 1px);
background-size: 48px 48px;
mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 100%);
```
- 网格色：`--ink-05`（5% 深色）
- 仅在视口中心可见，边缘透明渐隐
- `pointer-events: none; z-index: 0`，内容 `z-index: 1`

---

## 十四、Page Hero（子页标题区）

```
— BREADCRUMB
超大展示标题
      （可含 <em> 电光蓝斜体）
副文案（lede）
```

- `.crumb`：`var(--f-mono)`，`font-size: var(--fs-meta)`，左侧 32px 横线装饰，`color: var(--ink-60)`
- `h1`：`var(--f-display)`，`font-weight: 900`，`font-size: clamp(56px, 9vw, 144px)`，`letter-spacing: -0.05em`
- `.lede`：`font-size: clamp(17px, 1.4vw, 22px)`，`color: var(--ink-60)`，`max-width: 720px`
- 右上角可放 `.sticker`（酸性黄绿贴纸）或 `.sticker.spin`（旋转圆形）

---

## 十五、页脚（`.page-footer`）

- 布局：flex，两端对齐
- 字体：`var(--f-mono)`，`var(--fs-meta)`，`uppercase`，`color: var(--ink-60)`
- 左：版权文字 `© 2025 Haozi · Designed & built by myself · v2.0`
- 右：`← 返回主页` 文字链接（或 `.back-btn` 胶囊按钮）
- `.back-btn` hover：背景变 `--electric`，`translateX(-4px)`

---

## 十六、项目卡片变体（`.project-card`）

用于首页 Projects 预览格（4 格网格）：

| 类名 | 背景 | 文字 | 标签 |
|---|---|---|---|
| 无修饰 | `var(--paper)` | `var(--ink)` | 默认 |
| `.accent-blue` | `var(--electric)` | `var(--white)` | `rgba(255,255,255,.15)` |
| `.accent-mist` | `var(--mist)` | `var(--ink)` | 默认 |
| `.accent-cinnabar` | `#1A1A1A` | `var(--white)` | `rgba(231,76,60,.25)` 粉色字 |
| `.ghost` | 透明 + 虚线描边 | `var(--ink-60)` | — |

- 通用：`border-radius: var(--r-lg)`，`padding: var(--s-4)`，hover 上浮 4px + `--ink` 描边
- `.ghost` hover：虚线变实线 `--electric`，文字变 `--electric`

---

## 十七、projects.html 项目行（`.project-row`）

编辑杂志风，大图 + 文字两栏：

```
[封面视觉区 .project-visual]  [信息区 .project-info]
```

- 默认：封面左，信息右
- `.reverse`：信息左，封面右
- `.project-visual`：`border-radius: var(--r-lg)`，`overflow: hidden`，`aspect-ratio: 4/3`，`position: relative`
- `.project-badge`：左上角徽章，`--r-sm`，`background: var(--acid)/var(--electric)/red`
- 项目序号 `.section-band`：全宽灰带，`var(--f-mono)`，分隔不同产品线

---

## 十八、响应式断点

| 断点 | 适配内容 |
|---|---|
| `≤ 900px` | 导航胶囊隐藏，仅显示 Logo + Resume CTA |
| `≤ 768px` | 项目行变单列，Photo mosaic 双列 |
| `≤ 600px` | Photo mosaic 双列，所有 span 收缩为 2 列 |

---

## 十九、View Transitions

全站开启浏览器原生页面过渡：
```css
@view-transition { navigation: auto; }
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: .5s;
}
```

---

## 二十、可访问性要求

- 正文对比度 ≥ 4.5:1（`--ink` on `--paper` = 14.8:1 ✓）
- `--acid` 禁止单独用于文字（对比度不足）
- 所有装饰性元素加 `aria-hidden="true"`
- 自定义光标不影响 `cursor: pointer` 的可访问语义
- 所有动效受 `prefers-reduced-motion` 控制
- snap 滚动支持键盘 ↑↓ / PageUp/Down
