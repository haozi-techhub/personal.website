# 08 · 招牌级交互设计

> 这一份是 v2.0 的**「炫」清单**——访客在前 30 秒会记住的交互瞬间。
> 全部用原生 Web API（CSS / WAAPI / IntersectionObserver / View Transitions），不引第三方动效库。
> 每条都标注：**触发场景 → 视觉效果 → 实现技术 → 降级方案**。

---

## 一、首屏 · 进入仪式（Hero Reveal）

### S1 字符级入场（"Hello!" 砸落）
- **触发**：页面加载完成
- **效果**：`Hello!` 每个字符独立从 -120px 砸下，带 1.4 缓动回弹；每个字落地时下方 `--acid` 高亮块从 0% 宽度刷到 100%（像马克笔涂过去）
- **实现**：把字符拆成 `<span>`，CSS Web Animations API + `staggered delay 60ms`
- **降级**：整体 fade-in

### S2 艺术照「拆封」
- **触发**：与 S1 同时
- **效果**：照片容器从一个 `--electric` 实心方块「揭开」（`clip-path` 从 `inset(0 100% 0 0)` 推到 `inset(0)`），揭开过程像撕开包装；揭开后边框高光扫一道
- **实现**：`clip-path` 关键帧 + 后续一个高光 `linear-gradient` 的 `background-position` 平移
- **降级**：直接显示

### S3 副标题打字机
- **触发**：S1 完成后 200ms
- **效果**：「AIPM · 设计师 · ENFJ」逐字打出，光标闪烁
- **实现**：JS 控制 `textContent`，CSS `::after` 闪烁
- **降级**：一次性显示

### S4 鼠标进入照片 → 名片翻转
- **触发**：hover 艺术照
- **效果**：照片做 3D 卡片倾斜（跟随鼠标），背面是手写签名 + 一句话；离开缓慢回正
- **实现**：`perspective` + `rotateX/Y`（`mousemove` 计算偏移），`transform-style: preserve-3d`
- **降级**：仅放大 1.03

---

## 二、磁吸光标（Magnetic Cursor）

> v2.0 标志性细节，全站生效。

### M1 自定义光标
- 默认：12px `--ink` 实心圆 + 周围 28px 描边圆（lerp 跟随，慢一拍）
- hover 链接 / 按钮：内圆扩大到 56px，文字变白，**真实光标隐藏**
- hover 图片：变成 `VIEW ↗` 文字标签
- hover sticker：变成「✦」放大成漩涡

### M2 按钮磁吸
- 鼠标进入按钮 80px 范围：按钮**主动**朝鼠标方向偏移最多 8px（吸附感）
- 离开后弹簧回位（spring 0.6）
- 实现：`mousemove` 计算距离 → `transform: translate()` + `cubic-bezier(0.34, 1.56, 0.64, 1)`

### M3 文字 hover「单字弹起」
- hover 大标题：每个字符按距鼠标距离独立 `translateY(-6px)`，形成波浪
- 实现：字符 span + `mousemove` 距离衰减计算

### 降级
- 触摸设备：完全禁用，显示系统默认光标
- `prefers-reduced-motion`：禁用磁吸，保留 hover 颜色变化

---

## 三、Snap 切屏 · 转场叙事

### T1 章节大字「滚动反差」
- **触发**：每屏切换瞬间
- **效果**：屏标题（如 "PHOTOGRAPHS"）作为 200pt 半透明大字从屏底**水平横扫**进入，定位在屏左下；同时上一屏的大字从顶部滑出
- **实现**：CSS `translateX` + `IntersectionObserver` 触发；上下屏共享一个 sticky 文字层
- **降级**：直接显示

### T2 颜色块「接力」
- 每屏有一个主色块（屏 1 蓝、屏 2 珊瑚、屏 3 蓝、屏 4 酸性、屏 5 黑），切屏时**色块连续变形**（用同一个 absolute 定位的 div + `clip-path` morph），形成「色块在屏间流动」的错觉
- 这是 v2.0 最贵的细节，做出来就赢了
- **实现**：单个 fixed 元素 + `clip-path` 的 polygon 关键帧驱动；监听当前 active section 切换 keyframe
- **降级**：色块固定显示

### T3 进度环
- 右侧 5 个 dot 升级为：**当前点是一个画着进度的圆环**（描边色 `--acid`），随屏内停留时间转动一圈（10s）
- 转完一圈 = 暗示「可以下一屏了」
- **实现**：SVG `stroke-dasharray` 动画

---

## 四、卡片 · 物理感交互

### C1 倾斜跟随（Tilt）
- 所有 Soft Card / Project Card：鼠标在卡内移动时做轻 3D 倾斜（最多 ±6°）
- 卡内有「光斑」高光跟随鼠标（径向 gradient 跟 mousemove）
- **实现**：`perspective: 1000px` + `rotateX/Y` + `radial-gradient` 位置绑定 `--mx --my` CSS 变量
- **降级**：仅 hover 上浮

### C2 卡片「揭起一角」
- hover 时卡片右上角像翻起一页纸（`clip-path` + 阴影渐变模拟卷边）
- 翻起的内角露出彩色（`--acid`）
- **实现**：伪元素 + `clip-path` polygon
- **降级**：纯 hover 阴影

### C3 Ghost 卡呼吸
- 「+ 下个项目位」虚线持续缓慢呼吸（dashoffset 流动 + scale 1↔1.02，6s 循环）
- hover 时虚线立刻凝固为实线 `--electric`，「+」旋转 90°，文字切换为「即将上线 →」

---

## 五、滚动叙事（Scroll-driven Narrative）

> 仅子页（非 snap 的页面）使用，避免与 snap 冲突。

### N1 视差分层
- 每个子页 hero 分 3 层（背景 grid / 中间标题 / 前景 sticker），滚动速度 0.4× / 1× / 1.4×
- **实现**：`scroll-timeline` + `animation-timeline`（现代浏览器） → 老浏览器降级用 `transform` + IntersectionObserver

### N2 滚动驱动文字「填充」
- 项目页大标题，随滚动从描边字 → 实心字（`background-clip: text` 的 gradient 位置随 scroll 变化）
- **实现**：CSS `animation-timeline: scroll()`
- **降级**：进入视口后一次性填充

### N3 项目卡「拼贴出场」
- 每个项目卡进入视口时：图、标题、标签、按钮**分别从 4 个方向**碎片化飞入并拼合，共 700ms
- **实现**：每个子元素独立 keyframe + 错峰 80ms

### N4 摄影瀑布流「相机快门」
- photos.html 进入：图片以 50ms 间隔依次「闪光后显形」（白色快门盖 → 透明）
- **实现**：每张图前置一个白色 overlay，IntersectionObserver 触发 fade

---

## 六、点击 · 微反馈

| 场景 | 效果 |
|------|------|
| 主按钮点击 | 涟漪从点击点扩散（acid 色，500ms）|
| 复制邮箱 | 邮箱文字短暂被「✓ Copied」替换，下方浮出 toast |
| 下载简历 | 按钮变成进度条 → 完成后变 ✓，2s 后还原 |
| Sticker 点击 | 抖动 + 弹出小气泡说明（如点星星弹「2025 NEW」）|
| 翻页 / 跳转 | 整屏白色横幕从右扫过覆盖再揭开（page transition），用 **View Transitions API** |

---

## 七、彩蛋（Easter Eggs）

### E1 Konami code
- 输入 ↑↑↓↓←→←→BA：背景切换为参考图 1 风格的"酸性派对模式"，所有 sticker 开始转动，触发隐藏页 `about-game.html`

### E2 长按 Logo
- 长按 Haozi logo 2 秒：logo 爆炸成像素，重组为「设计师 / Designer」字样

### E3 闲置 60 秒
- 用户停止操作 60s：屏幕角落出现一只猫 sticker 走过，叼走一个装饰元素再放回

### E4 小红书风预告
- 在屏 5 footer 自媒体图标 hover 时，浮出该平台**最新 1 条内容**的极简卡片预览（数据可手维护 JSON）

---

## 八、移动端 · 触摸专属

| 手势 | 行为 |
|------|------|
| 长按卡片 | 触发 haptic（`navigator.vibrate(10)`）+ 卡片放大预览 |
| 双指捏合艺术照 | 缩放查看细节 |
| 边缘滑动 | 在子页触发返回首页对应 section（hash 跳转）|
| 摇一摇 | 触发 E1 派对模式（`devicemotion`）|

---

## 九、性能与降级总表

| 浏览器特性 | 检测 | 降级 |
|-----------|------|------|
| `scroll-timeline` | `CSS.supports('animation-timeline: scroll()')` | IntersectionObserver |
| View Transitions | `document.startViewTransition` | 普通跳转 |
| `clip-path` polygon | 默认支持 | 直接显示无变形 |
| `prefers-reduced-motion` | media query | 全部动效禁用，仅保留颜色变化 |
| 触摸设备 | `(hover: none)` | 禁用磁吸光标和 tilt |
| 低端设备 | `navigator.hardwareConcurrency < 4` | 自动关闭 T2 色块流动、N1 视差 |

---

## 十、招牌交互优先级（实施排序）

> 按「ROI = 视觉冲击 / 实现成本」排序，**M2 阶段至少完成 ★★★ 项**。

| 优先级 | 项目 | 复杂度 |
|--------|------|--------|
| ★★★ | S1 Hello! 砸落 + S2 拆封 | 中 |
| ★★★ | M1 自定义光标 + M2 磁吸 | 中 |
| ★★★ | C1 卡片 tilt + 高光跟随 | 中 |
| ★★★ | T3 进度环 | 低 |
| ★★ | T2 颜色块接力（招牌） | 高 |
| ★★ | C2 揭起一角 | 中 |
| ★★ | N3 项目卡拼贴出场 | 中 |
| ★ | E1/E2/E3 彩蛋 | 低 |
| ★ | N2 滚动文字填充 | 低 |
| ★ | E4 自媒体 hover 预览 | 高（要维护数据） |

**M2 必做**：S1, S2, M1, M2, C1, T3, 全部基础 hover/reveal
**M3 必做**：T2, C2, N1, N3
**M3+**：彩蛋系列
