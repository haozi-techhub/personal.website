# 02 · 信息架构 & 导航

## 1. 站点地图

```
/ (index.html)  ← 首页：全屏 snap 滚动 5 屏
├── #hero        屏 1 · 个人介绍（艺术照 + Hello）
├── #photos      屏 2 · 摄影预览（3 张精选 + 进入全部）
├── #projects    屏 3 · 项目预览（卡片 + 占位）
├── #agents      屏 4 · Agent 预览
└── #resume      屏 5 · 简历入口 + 联系方式 + footer

/photos.html     摄影完整页（保留现有，按新设计系统翻新）
/projects.html   项目完整页
/agents.html     Agent 完整页
/resume.html     简历页
/about-game.html 彩蛋页（保留）
```

## 2. 导航栏（Header）

固定顶部，72px 高，米白底。

| 项 | 行为 |
|----|------|
| **Logo: Haozi** | 点击回首页顶部（snap 到 #hero） |
| **主页 / Home** | 同上 |
| **自媒体 ▾** | 鼠标悬停展开下拉，**不进入 snap 流** |
| **摄影** | 跳 `/photos.html` |
| **Projects** | 跳 `/projects.html` |
| **Agent** | 跳 `/agents.html` |
| **Resume** | 跳 `/resume.html`（右侧胶囊按钮强调） |

### 2.1 当前屏指示器
首页 snap 滚动时，导航栏对应项**高亮酸性黄绿下划线**（除「自媒体」「Resume」外）：
- 滚到 #photos → 「摄影」高亮
- 滚到 #projects → 「Projects」高亮
- 等等

实现：IntersectionObserver 监听各 section 的可见性。

### 2.2 右侧 Snap 进度条（桌面）
屏幕右侧 fixed 一列 5 个圆点，标识当前屏，可点击跳转。移动端隐藏。

---

## 3. 自媒体的处理（关键决策）

### 3.1 你的诉求
> 首页滑动内容与导航栏相匹配，**除了不展示自媒体内容**，自媒体仍需通过导航栏。

### 3.2 推荐方案：导航下拉 + 简历页底部聚合

**Why**：自媒体本质是「外链导出口」，不是「内容板块」。让它出现在 snap 流会打断节奏；但完全藏在下拉里也浪费它作为「social proof」的价值。

最终方案：
1. **导航栏自媒体下拉**（保留）：作为快速跳转入口
2. **简历页 / 首页屏 5 footer 区**：放一行小红书 / 抖音 / 少数派 / 公众号 的图标徽章，配粉丝数或最近更新日期（如果你愿意提供）。这样既不占 snap 屏，又有露出。

### 3.3 备选方案（如你坚持露出）
做一个**漂浮的「内容雷达」widget**：右下角小贴纸，hover 时展开 5 个平台图标。可视为彩蛋。

---

## 4. 移动端适配

- < 768px：snap 仍生效，但每屏布局改为单列垂直流
- 导航栏折叠为汉堡菜单，自媒体作为二级展开
- 装饰 sticker 减少 50%，避免拥挤
- Hero 艺术照尺寸：max 70vh，居中

---

## 5. URL & SEO

- 首页 hash 与 section 同步（滚动时 `history.replaceState`）
- 每个 section 加 `<h2>` 语义标题（视觉上可隐藏，给 SEO/读屏器）
- `index.html` 的 `<title>` 和 meta description 重写：
  - title: `任文浩 Haozi · AI 产品经理 / 设计师 / 摄影师`
  - desc: `AIPM、设计爱好者、摄影玩家。这里是我的作品、项目与思考。`
