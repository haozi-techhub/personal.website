# 05 · 交互与动效规范

## 1. 首页 Snap 滚动

### 1.1 技术
```css
html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
section.snap { scroll-snap-align: start; scroll-snap-stop: always; min-height: 100vh; }
```

### 1.2 行为约定
- 一次滚轮 / 触摸滑动 = **正好 1 屏**（mandatory + stop:always）
- 键盘 ↑↓ / PageUp/Down / Space 翻页（需 JS 监听并阻止默认 + 调 `scrollIntoView`）
- 右侧 dot 进度条点击跳转
- URL hash 同步（不入历史栈，用 `replaceState`）
- **若用户 `prefers-reduced-motion: reduce`**：禁用 snap，回退为普通滚动

### 1.3 入场动画
每个 section **首次进入视口**时，子元素错峰渐入：
- 标题：opacity 0→1, translateY 24→0, 600ms ease-out
- 卡片：staggered 80ms 间隔
- sticker：scale 0.6→1 + rotate（带回弹 cubic-bezier(0.34, 1.56, 0.64, 1)）
- 仅触发一次（用 IntersectionObserver `unobserve`）

---

## 2. 导航联动

```
section in viewport ─→ 对应 nav item 加 .active 类
.active ─→ 下方一条 SVG 手绘下划线（`--acid` 色，2.5px）
切换时下划线用 `clip-path` 从左滑入
```

---

## 3. Hover 状态

| 元素 | 默认 | Hover |
|------|------|-------|
| 主按钮 | `--electric` 底白字 | 底变 `--ink`，字变 `--acid`，180ms |
| 描边按钮 | 1.5px `--ink` | 填充 `--acid` |
| Soft Card | 默认阴影 | 上浮 -4px + `--electric` 1.5px 描边 + 阴影加深 |
| Sticker Card | 微旋转 -2° | 放大 1.04 + 微抖（rotate ±1°）|
| 图片 | — | 内部 zoom 1.05 + 灰度→彩色 |
| Ghost 卡 | 虚线 30% 黑 | 实线 `--electric` + 「+」放大 1.2 |

所有过渡：**180–240ms**，缓动 `cubic-bezier(0.4, 0, 0.2, 1)`。

---

## 4. 装饰元素动效

- 背景 sticker（星形、箭头）：缓慢 `rotate` 30s 一圈，或鼠标视差跟随（最大位移 ±12px）
- Hero 艺术照容器：鼠标进入时容器圆角微变化 + 描边色相旋转
- 滚动到屏 5 时：footer 5 个社交图标依次「弹跳」入场

---

## 5. 性能预算

- 首屏 LCP < 1.8s（艺术照需 ≤ 200KB，使用 WebP 或 AVIF）
- 全站 JS < 50KB（不引入 GSAP / fullPage，全部用原生）
- 动画用 `transform` / `opacity`，避免触发 layout
- IntersectionObserver 监听一律用 `{ rootMargin: '-20% 0px' }`

---

## 6. 减弱动效（Reduced Motion）

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-snap-type: none; }
}
```
