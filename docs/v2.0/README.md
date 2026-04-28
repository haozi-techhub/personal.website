# Haozi 个人主页 · v2.0 重设计

> 状态：**设计阶段**（仅文档，未执行代码改动）
> 分支：`feat/v2.0-redesign`
> 存档点：tag `v1.0-pre-redesign`

## 一、本次迭代目标

把站点从「展示型个人主页」升级为**「设计师作品集 + 内容枢纽」**，让访问者在首屏 5 秒内感知到三件事：

1. 这是一位**有审美**的设计师 / AIPM
2. 内容是**结构化、可探索**的（摄影、项目、Agent、简历）
3. 视觉是**当代的、有个性的**，不是模板站

## 二、文档导航

| 文档 | 内容 |
|------|------|
| [`01-design-system.md`](./01-design-system.md) | 视觉规范：色彩、字体、栅格、组件、装饰元素 |
| [`02-information-architecture.md`](./02-information-architecture.md) | 信息架构、导航逻辑、自媒体处理方案 |
| [`03-homepage-blueprint.md`](./03-homepage-blueprint.md) | 首页全屏滚动（snap）每一页的结构与文案位 |
| [`04-page-blueprints.md`](./04-page-blueprints.md) | 子页（摄影 / 项目 / Agent / 简历）布局 |
| [`05-interaction-motion.md`](./05-interaction-motion.md) | 滚动、过渡、悬浮、装饰元素的运动规范 |
| [`06-implementation-plan.md`](./06-implementation-plan.md) | 实施阶段、文件改动清单、风险点 |
| [`07-asset-checklist.md`](./07-asset-checklist.md) | 需要你提供的素材（艺术照、项目图等）清单 |
| [`08-signature-interactions.md`](./08-signature-interactions.md) | **招牌级交互**：磁吸光标、字符砸落、色块接力、卡片 tilt、彩蛋 |

## 三、参考图风格提取

从你给的 5 张参考图中我提取到这些**共同基因**，会注入 v2.0：

- **大胆的展示级排版**（display typography）：超大字号 + 紧字距 + 衬线/无衬线混排
- **电光蓝 + 酸性黄绿**作为主色对，搭配米白底色
- **有机软方块（squircle / blob）**作为内容容器，弱化卡片感
- **贴纸式装饰**：圆形徽章、手绘箭头、便签、Polaroid
- **多层叠加构图**：图、字、形状互相穿插，不是规整网格
- **专业感来自克制**：装饰多但留白也多，不是堆料

## 四、约束与原则

1. **冗余位**：每个 section 预留 ≥1 个空位用于未来新项目（设计上以「+」占位卡或灰色幽灵卡呈现）
2. **不破坏现有路由**：`projects.html` / `photos.html` / `resume.html` / `agents.html` 仍可独立访问
3. **首页是入口**：首页 snap 滚动是「目录预览」，每屏底部有「进入完整页 →」CTA
4. **自媒体**：保留导航栏下拉，不进入 snap 流（详见 IA 文档）
5. **可逐步落地**：v2.0 拆成 3 个里程碑（M1 设计系统、M2 首页、M3 子页改版）
