# Haozi 个人主页 · 项目总结文档

> **写给下一个协作 AI 看的参考手册**
> 最后更新：2026-04-28（v3.1 同步更新）
> 当前版本：**v3.1**（已上线）

---

## 一、项目基本信息

| 字段 | 内容 |
|---|---|
| **项目名** | Haozi 个人主页（haozi.io） |
| **负责人** | 任文浩（Haozi） |
| **当前版本** | v3.1（已完整实施并部署）|
| **技术栈** | 纯静态 HTML + CSS + 原生 JS（无框架，无构建工具） |
| **托管** | Vercel（主）+ GitHub Pages（备） |
| **Vercel 项目** | `personal-website`（https://personal-website-iota-lac-51.vercel.app） |
| **GitHub 仓库** | https://github.com/haozi-techhub/personal.website |
| **主分支** | `main`（已与 `feat/v2.0-redesign` 合并） |
| **旧版存档** | git tag `v1.0-pre-redesign` |

---

## 二、版本历史与里程碑

| 版本 / Tag | 内容 |
|---|---|
| `v1.0-pre-redesign` | v1.0 原始版本存档（可回滚基线） |
| `v2.0-m2` | 首页 snap 滚动 + 招牌交互完成 |
| `v2.0-m3` | 全部子页（photos / projects / agents / resume）改版完成 |
| `v3.0` | Guestbook 留言板上线（Supabase + Magic Link 管理员删除）|
| `v3.1` | 留言板弹幕化（DanmakuEngine 5 轨道）+ Emoji 表情选择器 |
| **当前 HEAD** | Hero 头像点击跳 resume；城市更新为杭州；身份改为旅行博主 |

---

## 三、页面结构

### 3.1 文件清单

```
/
├── index.html          首页（6 屏 snap 全屏滚动）
├── photos.html         摄影集（12 个分类马赛克网格）
├── projects.html       项目页（2 个 section：游戏 + AI 产品）
├── agents.html         AI Agents 展示页（3 个在线 Agent）
├── resume.html         简历页（编辑杂志风）
├── about game.html     《裂缝》游戏介绍页
├── assets/
│   ├── css/
│   │   ├── v2-tokens.css     全站设计 Token（色彩/字阶/间距/圆角）
│   │   ├── v2-home.css       首页专属样式
│   │   ├── v2-page.css       子页通用样式（导航 + 页脚 + 容器）
│   │   └── (其余 *.css)      v1 遗留样式（部分页面仍引用）
│   ├── js/
│   │   ├── v2-home.js        首页 JS（snap 进度、reveal 动画、tilt、光标）
│   │   ├── v2-shared.js      子页共用 JS（reveal、tilt、导航下拉）
│   │   ├── guestbook.js      留言板 v3.1（Supabase + DanmakuEngine + Emoji）
│   │   └── (其余 *.js)       v1 遗留脚本
│   └── photos/
│       └── yink-hero.png     Yink 项目封面大图（黑白汉服廊道摄影）
├── photos/
│   ├── hero/portrait-hero.png  个人头像
│   └── *.html                  12 个摄影分类子页
├── docs/v2.0/                  v2.0 设计文档（见第六节）
├── docs/v3.0/                  v3.x 留言板设计文档（见第六节）
├── .archive/                   v1 备份文件（*.v1.html，不部署）
└── vercel.json                 Vercel 配置（outputDirectory: "."）
```

---

## 四、各页功能详述

### 4.1 首页 `index.html`

**结构：6 屏全页 snap 滚动（scroll-snap）**

| 屏 | ID | 内容 |
|---|---|---|
| 屏 1 | `#hero` | 大字 Hello! + 个人头像（点击跳 resume.html）+ 自我介绍 block |
| 屏 2 | `#photos` | 摄影预览（6 张图 mosaic）→ 链接 photos.html |
| 屏 3 | `#projects` | 项目卡片网格（4 格：裂缝/Yink/Agents/占位）|
| 屏 4 | `#agents` | 3 个 AI Agent 卡片 |
| 屏 5 | `#resume` | 联系区（大字 CTA + 邮件 + 社媒图标 + 页脚）|
| 屏 6 | `#guestbook` | 留言弹幕舞台 + 提交表单 + Emoji 选择器 |

**交互特性：**
- 右侧进度轨（`.progress-rail`）6 个点，点击跳屏
- `data-reveal` 滚入动画（IntersectionObserver）
- `data-tilt` 卡片 3D 倾斜效果（鼠标悬浮）
- 导航栏固定顶部，含下拉菜单「Self-media」
- 移动端自动关闭 mandatory snap，改 proximity

**项目格卡片链接：**
- 《裂缝》FRACTURE → `https://haozi-techhub.github.io/fracture.io/`（新标签直接进游戏）
- 影客 YINK → `https://yink-web.vercel.app/`（新标签）
- My Agents → `agents.html`
- 占位格 → `projects.html`

---

### 4.2 摄影页 `photos.html`

- 顶部 Filter 胶囊：全部 / 人文 / 风光 / 食物 / 黑白
- **12 个分类**：Architecture / Autumn / B&W / Food / Landscape / Life / Night / Portrait / Street / Travel / Xinjiang / Suipai·随拍
- 马赛克网格布局（CSS Grid，`span-wide/tall/hero/square`）
- 每张卡片 hover 显示分类名 + 描述，点击进入子页
- 图片全部外链 Pexels CDN（`images.pexels.com`），无本地图片文件（除 portrait-hero.png）
- 已移除「Coming Soon」占位格
- 已移除右下角浮动「返回主页」按钮

---

### 4.3 项目页 `projects.html`

**SECTION · 01 游戏作品**
- 《裂缝》FRACTURE：黑紫星空 SVG 封面，按钮链接游戏 + GitHub

**SECTION · 02 AI 产品**
- 影客 YINK：黑白汉服大图封面（`assets/photos/yink-hero.png`）+ 朱砂红印章覆层
  - 悬停效果：grayscale 100% → 60%，轻微放大
  - 标签：AI 换装 / 汉服租赁 / 城市发现 / 社区 / Next.js
  - 按钮：「访问 Yink →」+ 「AI 试穿 ›」

**底部：** Coming Soon block（更多创意还在路上）

---

### 4.4 Agents 页 `agents.html`

3 个在线 Coze AI Agent：
- 小红书文案助手
- 图像描述助手
- 英语陪伴助手

---

### 4.5 简历页 `resume.html`

- 编辑杂志风（参考 VYBE 设计）
- 包含：基本信息、教育背景、工作经历、技能、项目经历、语言、兴趣爱好
- 页脚有返回主页链接
- 地址：中国，杭州

---

### 4.6 留言板 `#guestbook`（v3.1 新增）

**后端：** Supabase（`znflconpkvndaoqkicuo.supabase.co`），表 `messages`（id / nickname / content / created_at）

**功能：**
- 访客填昵称 + 留言（最多 200 字），60s 限速
- 留言以**弹幕**形式从右向左飞过，5 轨道，胶囊卡片样式
- 悬停舞台 → 全部弹幕暂停
- 输入框旁 `😊` 按钮 → 展开 5×4 emoji 面板，点击插入光标位置
- 管理员登录：底部 `· · ·` 连点 3 次 → 邮箱 Magic Link → 登录后弹幕上出现 `✕` 可删除
- `prefers-reduced-motion`：弹幕降级为静态列表

**安全：** RLS 策略（公开读/写，仅 authenticated 可删除）

**管理文档：** `docs/v3.0/04-supabase-admin-guide.md`

---

## 五、设计规范摘要

### 5.1 色彩 Token（`v2-tokens.css`）

| Token | HEX | 用途 |
|---|---|---|
| `--ink` | `#0E1116` | 主文字、深色块 |
| `--paper` | `#F4F1EA` | 全局米白底 |
| `--electric` | `#2A37FF` | 电光蓝，主行动色 |
| `--acid` | `#D7FF3A` | 酸性黄绿，高亮/徽章 |
| `--blush` | `#FF6F61` | 珊瑚红，摄影强调 |
| `--mist` | `#E6E2D6` | 次级容器底 |
| `--white` | `#FFFFFF` | 纯白（少量） |

额外颜色（非 token，projects 页内联）：
- 朱砂红 `#E74C3C`：Yink 卡片徽章/印章

### 5.2 字体

| 角色 | 字体 | 来源 |
|---|---|---|
| Display | **Fraunces**（可变，Black Italic） | Google Fonts |
| Body | **Inter**（400/500/600/700） | Google Fonts |
| Mono | **JetBrains Mono**（400/700） | Google Fonts |
| 中文兜底 | PingFang SC / 系统 | 系统 |

### 5.3 圆角 Token

| Token | 值 | 用途 |
|---|---|---|
| `--r-sm` | 12px | 小标签 |
| `--r-md` | 24px | 卡片 |
| `--r-lg` | 40px | 大容器 |
| `--r-xl` | 96px | Hero blob |
| `--r-pill` | 999px | 胶囊按钮/Tab |

### 5.4 导航结构

```
[Haozi. ●]  [Home · Photos · Projects · Agents · Self-media ▼]  [Resume →]
```

- `Self-media` 下拉：小红书 / 抖音 / 人人都是产品经理 / 少数派 / 微信公众号
- 当前页对应的 nav 项加 `.active`
- 子页右下角 footer 有 `← 返回主页` 文字链接

---

## 六、设计文档索引

### docs/v2.0/

| 文件 | 内容 |
|---|---|
| `README.md` | 项目目标与约束原则 |
| `01-design-system.md` | 完整视觉规范：色彩/字体/栅格/组件/装饰元素/可访问性 |
| `02-information-architecture.md` | 信息架构、导航逻辑 |
| `03-homepage-blueprint.md` | 首页每屏结构与文案位 |
| `04-page-blueprints.md` | 子页布局蓝图 |
| `05-interaction-motion.md` | 动效规范 |
| `06-implementation-plan.md` | 里程碑计划、风险点、不做的事 |
| `07-asset-checklist.md` | 素材清单 |
| `08-signature-interactions.md` | 招牌交互：磁吸光标、砸落、tilt、彩蛋 |
| `10-yink-project-card.md` | Yink 影客项目卡片设计文档 |

### docs/v3.0/

| 文件 | 内容 |
|---|---|
| `01-guestbook.md` | 留言板 v3.0 完整设计与实施文档（Supabase 方案）|
| `02-guestbook-danmaku.md` | v3.1 弹幕化方案总体设计 |
| `03-danmaku-scope-B.md` | **选定方案 B**：留言板主场 + 表情面板详细规格 |
| `04-supabase-admin-guide.md` | **⭐ Supabase 后台管理手册**（日常运营必读）|

---

## 七、外部依赖

| 依赖 | 用途 | 引入方式 |
|---|---|---|
| Google Fonts（Fraunces + Inter + JetBrains Mono） | 字体 | CDN `<link>` |
| Font Awesome 5.15.4 | 图标（游标/Github/Play等） | CDN `<link>` |
| Pexels CDN | 摄影分类封面图 | 直接 `<img src="">` 外链 |
| Supabase JS v2 | 留言板后端客户端 | ESM CDN（jsDelivr）|

**无 npm / 无构建工具 / 无框架依赖。**

---

## 八、部署说明

### 当前部署流程

```bash
# 改完代码后：
git add -A
git commit -m "描述"
git push origin main       # 触发 Vercel 自动部署（已绑定 GitHub）
# 或手动：
vercel --prod --yes
```

### Vercel 配置（`vercel.json`）

```json
{ "outputDirectory": "." }
```

直接将项目根目录作为静态输出，无需构建步骤。

### 注意事项

- `.gitignore` 已排除 `public/` 和 `.vercel/`（构建产物，不入仓）
- `.archive/` 目录存放 v1 备份文件，Vercel 会部署但不影响功能
- `CNAME` 文件内容为 `haozi.io`（GitHub Pages 自定义域名遗留）

---

## 九、个人信息 & 链接（勿硬编码泄露）

| 字段 | 值 |
|---|---|
| 邮箱 | 704494844@qq.com |
| 电话 | +86 17732585067 |
| 小红书 | https://www.xiaohongshu.com/user/profile/61a64f71000000001000fbcc |
| 抖音 | https://www.douyin.com/user/self?from_tab_name=main |
| 人人都是产品经理 | https://www.woshipm.com/u/1577356 |
| 少数派 | https://sspai.com/u/d1ozl25x/updates |
| 游戏 FRACTURE | https://haozi-techhub.github.io/fracture.io/ |
| 游戏 GitHub | https://github.com/haozi-techhub/fracture.io |
| Yink 影客 | https://yink-web.vercel.app/ |
| Yink AI 试穿 | https://yink-web.vercel.app/try-on |

---

## 十、个人信息更新记录

| 字段 | 旧值 | 新值（当前）|
|---|---|---|
| Based in | Beijing | **Hangzhou** |
| 身份描述 | 设计师 | **旅行博主** |
| 简历城市 | 中国，北京 | **中国，杭州** |

---

## 十一、后续迭代 Backlog（未做）

| 优先级 | 功能 |
|---|---|
| 中 | 留言板 Supabase Realtime 订阅（新留言自动进弹幕流，无需刷新）|
| 中 | GitHub Actions 心跳（防止 Supabase 免费项目 7 天自动暂停）|
| 低 | `resume.html` Token 化（目前仍用 v1 CSS 混搭）|
| 低 | 暗色模式（Token 已预留 `--ink`/`--paper` 互换）|
| 低 | 摄影数据 JSON 外置（目前 HTML 硬编码）|
| 低 | 项目/Agent 数据 JSON 外置 |
| 低 | 留言胶囊底色扩展（3~4 种随机）|
| 低 | 新留言邮件通知（Supabase Edge Function）|
