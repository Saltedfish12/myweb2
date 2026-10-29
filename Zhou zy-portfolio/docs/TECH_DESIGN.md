# 技术设计文档｜林墨个人作品集网站

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.0 |
| 创建日期 | 2026-10-28 |
| 对应代码 | `index.html` / `css/styles.css` / `js/main.js` |
| 运行形态 | 纯静态网页，可直接打开或部署到静态托管 |
| 维护方式 | 直接编辑源码，无编译、无依赖安装 |

---

## 1. 设计目标

### 1.1 技术目标

1. 使用 **HTML + CSS + 原生 JavaScript** 完成全部功能，不依赖框架、UI 库或构建工具。
2. 支持 **直接双击 `index.html`** 在浏览器打开，不因 `file://` 协议或 ES Module CORS 而失效。
3. 桌面、平板、手机完整适配，无横向滚动。
4. 核心内容存在于 HTML 中，JS 只负责增强体验，保证可抓取与渐进增强。
5. 保持单文件职责清晰，方便 AI 编程助手定位和修改。
6. 将动画、模态框、筛选、菜单等交互封装为独立初始化函数，避免全局污染。

### 1.2 非目标

- 不做服务端渲染（SSR）或静态站点生成（SSG）。
- 不引入 React / Vue / Tailwind / GSAP / Lenis 等运行时依赖。
- 不引入 npm 构建流程、CSS 预处理器或打包器。
- 不实现真实表单提交、数据库或登录。

---

## 2. 技术选型

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 结构 | HTML5 语义化标签 | `header` / `nav` / `main` / `section` / `article` / `footer` / `dialog` / `template` |
| 样式 | 原生 CSS3 | CSS 自定义属性、Grid、Flexbox、`clamp()`、容器留白、媒体查询、`prefers-reduced-motion` |
| 行为 | 原生 JavaScript（ES2020+） | IIFE 隔离作用域、`IntersectionObserver`、原生 `<dialog>`、Clipboard API、Web Animations API |
| 图像 | 手写 SVG | 人物肖像、4 张项目封面、favicon；支持缩放且无需位图 |
| 字体 | 系统字体栈 | 不请求网络字体，离线可用，无 FOUT |
| 运行 | 静态 HTTP 或 `file://` | 零后端、零构建 |
| 部署 | 任意静态托管 | GitHub Pages / Cloudflare Pages / Netlify / Vercel / 对象存储 |

### 2.1 为什么不用框架

- 页面属于单页展示型站点，交互复杂度低，原生能力足够。
- 消除构建步骤后，非技术用户也可以直接打开和修改；AI 助手也更容易做局部修改。
- 无第三方依赖意味着没有版本升级、安全补丁和 bundle 体积问题。
- 用原生 `<dialog>` 与 `IntersectionObserver` 足以实现高质量交互。

### 2.2 为什么 JS 不使用 ES Module

项目需要支持 `file://` 直接打开。浏览器对 `file://` 下的 ES Module 有严格 CORS 限制，因此使用单个普通脚本并通过 `defer` 加载：

```html
<script src="js/main.js" defer></script>
```

所有逻辑封装在一个 IIFE 中：

```js
(function () {
  "use strict";
  // ...
  init();
})();
```

---

## 3. 项目文件结构

```text
linmo-portfolio/
├── index.html                         # 唯一页面：结构、文案、项目模板、SVG 内联图标
├── README.md                          # 快速开始与项目说明
├── Agent.md                           # 面向 AI 编程助手的维护指南
├── css/
│   └── styles.css                     # 全站样式：Token / 布局 / 组件 / 响应式 / 动效降级
├── js/
│   └── main.js                        # 全站交互：导航 / 筛选 / 弹窗 / 复制 / 光标 / 时钟
├── assets/
│   └── images/
│       ├── favicon.svg                # 站点图标
│       ├── avatar-linmo.svg           # Hero 人物插画
│       └── projects/
│           ├── neon-transit.svg       # 项目 01 封面
│           ├── mori-note.svg          # 项目 02 封面
│           ├── echo-type.svg          # 项目 03 封面
│           └── common-ground.svg      # 项目 04 封面
├── docs/
│   ├── PRD.md                         # 产品需求文档
│   └── TECH_DESIGN.md                 # 本文档
└── preview/                           # 交付预览图（非运行依赖）
    ├── desktop-hero.png
    ├── desktop-work.png
    └── mobile-hero.png
```

### 3.1 文件职责边界

| 文件 | 应该放什么 | 不应该放什么 |
| --- | --- | --- |
| `index.html` | 页面结构、全部文案、项目卡片、项目详情模板、SEO 标签 | 大段 CSS、业务逻辑 |
| `styles.css` | 设计 Token、组件样式、媒体查询、动画 | 页面文案、项目数据 |
| `main.js` | DOM 行为、事件、状态切换、辅助功能增强 | 视觉文案、SVG 插画 |
| `assets/images/*.svg` | 视觉资源 | 可访问文本（由页面中的 `alt` 提供） |
| `docs/*.md`、`Agent.md` | 需求、架构、维护规范 | 运行时代码 |

---

## 4. 页面架构

### 4.1 文档结构

```text
body
├── a.skip-link                         # 跳到主内容
├── .noise                              # 全局颗粒质感
├── .scroll-progress                    # 顶部阅读进度
├── .cursor × 2                         # 自定义光标（桌面增强）
├── header.site-header
│   └── .desktop-nav                    # ≥ 901px 显示
├── .mobile-menu                        # ≤ 900px 全屏菜单
├── main#main
│   ├── section.hero#home
│   ├── .marquee
│   ├── section.about#about
│   ├── section.work#work
│   │   ├── .filter-bar
│   │   └── .project-grid
│   │       └── article.project-card × 4
│   └── section.contact#contact
├── footer.site-footer
├── dialog#project-dialog               # 原生模态框
├── template#detail-* × 4               # 项目详情内容
└── .toast                              # 复制邮箱反馈
```

### 4.2 关键语义

- 页面只有一个 `<h1>`（Hero 标题），章节标题使用 `<h2>`，卡片/案例标题使用 `<h3>`。
- 项目使用 `<article>`；每张卡内部使用 `<button>` 触发详情，保证键盘可聚焦。
- 项目详情使用 `<template>` 保存原始内容，避免使用 `innerHTML` 拼接不可信字符串。
- 外部链接使用 `rel="noopener noreferrer"`。
- 装饰 SVG / 装饰文字使用 `aria-hidden="true"`。

### 4.3 页面滚动与锚点

- `html { scroll-behavior: smooth; scroll-padding-top: calc(var(--header-h) + 20px); }`
- 固定页头高度 78px（移动端 68px），锚点跳转时自动预留空间。
- 各章节设置 `scroll-margin-top`，进一步保证被覆盖标题可见。

---

## 5. CSS 架构

### 5.1 分层顺序

`css/styles.css` 按固定顺序组织，修改时应保持层次：

1. **Design Tokens**：颜色、字体、间距、断点相关变量。
2. **Reset & Base**：盒模型、排版、图片、按钮、焦点。
3. **Atmosphere / Utilities**：噪音、进度条、`.container`、`.eyebrow`。
4. **Layout / Header**：响应式页头、移动菜单。
5. **Sections**：Hero / Marquee / About / Work / Contact / Footer。
6. **Components**：按钮、筛选、项目卡、弹窗、Toast。
7. **Keyframes**：命名动画。
8. **Responsive**：从大到小覆盖，断点顺序不可打乱。
9. **Reduced Motion / Print**：最终降级规则。

### 5.2 设计 Token

```css
:root {
  --paper: #f2efe6;
  --ink: #12130f;
  --acid: #d7ff5f;
  --orange: #ff5b35;
  --cobalt: #2f4bff;
  --font-sans: ...;
  --font-serif: ...;
  --font-mono: ...;
  --container: 1440px;
  --gutter: clamp(20px, 4.2vw, 68px);
  --header-h: 78px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- 颜色/字体只通过 Token 使用，避免散落硬编码。
- 阴影统一使用 `--shadow-hard`，但局部组件可覆盖。
- 流式尺寸优先 `clamp()`，减少媒体查询数量。

### 5.3 命名约定

- 块：`.project-card`、`.about-card`、`.contact__email`。
- 元素：`.project-card__media`、`.project-card__title`。
- 修饰符：`.project-card--wide`、`.about-card--acid`、`.is-active`、`.is-open`。
- 状态类统一使用 `is-*`；数据属性用于 JS 选择器（`data-project`、`data-filter`、`data-copy-email`）。
- 不依赖标签选择器做核心布局，以免影响模板内容。

### 5.4 布局策略

| 区域 | 方案 |
| --- | --- |
| 通用容器 | `max-width: 1440px` + `padding-inline: var(--gutter)` |
| Hero | CSS Grid，两栏 `minmax(0, 1.25fr) / minmax(330px, 0.75fr)` |
| About bento | 12 栏 Grid，卡片跨 7/5 列；平板降为 2 栏，手机单栏 |
| Work | 12 栏 Grid，桌面 7/5 与 5/7 错落，平板两列等宽，手机单列；封面固定高度 + `object-fit: cover` |
| Contact | 8/4 标题布局 + 1.15/0.85 主体布局 |
| 弹窗 | 固定宽度 `min(980px, calc(100vw - 48px))`，内部滚动 |

### 5.5 层级（z-index）

| 层级 | 元素 |
| --- | --- |
| 100 | 固定页头 |
| 120 | 滚动进度条 |
| 200 | 移动端全屏菜单 |
| 500 | Toast |
| 900 | 全局颗粒（`pointer-events: none`） |
| 950 | 自定义光标 |
| 1000 | 跳转主内容链接 |
| Top Layer | 原生 `<dialog>` + `::backdrop` |

> 注意：原生 `<dialog>` 打开后位于浏览器 Top Layer，不受普通 z-index 影响。

### 5.6 动效实现

- 入场：CSS `@keyframes heroLineUp`（Hero 标题） + IntersectionObserver 添加 `.is-visible`。
- 跑马灯：`@keyframes marquee` 平移两份等宽内容。
- 头像贴纸：`@keyframes badgeBob` 轻微旋转浮动。
- 项目卡：CSS transition + JS 写入 `--shift-x` / `--shift-y` 做视差。
- 弹窗：`@keyframes dialogIn`。
- 所有关键动效均有 `prefers-reduced-motion` 降级。

---

## 6. JavaScript 架构

### 6.1 模块列表

`js/main.js` 采用「一个 IIFE + 多个初始化函数」结构：

| 函数 | 职责 | 关键 API |
| --- | --- | --- |
| `initScrollUI()` | 页头滚动态、阅读进度 | `scroll`、`requestAnimationFrame` |
| `initMobileMenu()` | 全屏菜单、滚动锁定、焦点陷阱 | `inert`、`aria-expanded`、`keydown` |
| `initReveal()` | 滚动显现 | `IntersectionObserver` |
| `initActiveNav()` | 当前章节高亮 | `IntersectionObserver`、`aria-current` |
| `initCounters()` | 数字滚动计数 | `requestAnimationFrame` |
| `initProjectFilter()` | 分类筛选、状态同步、结果播报 | `hidden`、`aria-pressed`、Web Animations |
| `initProjectDialog()` | 克隆模板并打开弹窗、焦点恢复 | `<dialog>`、`showModal()`、`close` |
| `initCardTilt()` | 项目封面轻视差 | `pointermove`、CSS 变量 |
| `initCopyEmail()` | 复制邮箱与 Toast | Clipboard API、`execCommand` 降级 |
| `initClock()` | 上海时区时钟、年份 | `Intl.DateTimeFormat`、`setInterval` |
| `initCursor()` | 自定义光标 | `pointermove`、`requestAnimationFrame` |
| `init()` | 按顺序初始化所有模块 | — |

### 6.2 事件与数据流

#### 项目筛选

```text
点击 .filter
  → 读取 data-filter
  → 更新所有按钮 .is-active / aria-pressed
  → 遍历 .project-card
      → 比较 card.dataset.category
      → 匹配：card.hidden = false + 入场动画
      → 不匹配：card.hidden = true
  → 更新 #filter-status（aria-live）
```

#### 项目详情

```text
点击 [data-project="neon"]
  → 找到 <template id="detail-neon">
  → 将 template.content.cloneNode(true) 插入 #dialog-content
  → dialog.showModal()
  → body 增加 .modal-open（锁定滚动）
  → 聚焦关闭按钮
关闭（按钮 / Esc / 遮罩）
  → 移除 .modal-open
  → 清空 #dialog-content
  → 焦点返回触发卡片
```

`<template>` 方案的优点：

- 项目内容仍在 HTML 中，便于搜索和人工编辑。
- 不需要把长文案放进 JS 字符串或 JSON，减少转义错误。
- 每次打开只克隆一份，关闭即清理，避免重复 ID。
- 无需 `fetch()`，因此 `file://` 下也能正常工作。

### 6.3 状态管理

项目没有全局状态库，仅使用 DOM 状态：

| 状态 | 存储位置 |
| --- | --- |
| 当前筛选 | `.filter.is-active` 与 `aria-pressed` |
| 菜单开关 | `.mobile-menu.is-open`、`aria-expanded`、`body.menu-open` |
| 弹窗开关 | `<dialog open>`、`body.modal-open` |
| 复制成功 | `.copy-button.is-copied`，2.2s 后复位 |
| 滚动状态 | `.site-header.is-scrolled`、进度条宽度 |
| 动效禁用 | `matchMedia('(prefers-reduced-motion: reduce)')` |

### 6.4 兼容与容错

- `IntersectionObserver` 不可用时直接显示所有内容。
- `dialog.showModal` 不可用时降级为 `open` 属性展示。
- Clipboard API 不可用、非安全上下文或写入被拒绝时使用 `execCommand`。
- 复制彻底失败时提示手动复制，不静默失败。
- 系统启用减少动态时，跳过光标、视差、计数和弹窗动画。

---

## 7. 资源管理方案

### 7.1 图片策略

| 资源 | 格式 | 尺寸 | 加载策略 |
| --- | --- | --- | --- |
| 人物插画 | SVG（viewBox 900×1120） | 矢量 | 首屏 `fetchpriority="high"` |
| 项目 01 封面 | SVG（1600×1100） | 矢量 | 首屏 eager |
| 项目 02—04 封面 | SVG（1600×1100） | 矢量 | `loading="lazy"` |
| favicon | SVG | 64×64 | 浏览器默认 |
| 弹窗封面 | 复用项目 SVG | 1600×1100 | 打开弹窗时随模板插入 |

- 所有 `<img>` 声明 `width` / `height`，避免布局偏移。
- 项目封面使用 `object-fit: cover`，保证不同卡片比例下不拉伸。
- SVG 内文字已转为 `<text>`，若需完全脱离字体依赖，可在交付前转曲。
- 无外部图库、无远程字体、无第三方脚本。

### 7.2 资源路径

- 全部使用相对路径（`assets/images/...`），支持部署在子目录（如 GitHub Pages 的 `/repo-name/`）。
- 不引用绝对根路径 `/...`，避免子目录部署失效。
- 文件名全小写、短横线分隔，便于跨平台。

### 7.3 优化空间

当前 SVG 文件包含颗粒滤镜与较复杂图形。若单文件体积成为问题，可：

1. 使用 SVGO 压缩（移除元数据、合并路径）。
2. 将大尺寸封面导出为 WebP/AVIF，并使用 `<picture>`。
3. 将首屏只保留必要视觉，其余延迟加载。
4. 为 `<img>` 增加 `decoding="async"`。

---

## 8. 响应式设计

### 8.1 断点

| 断点 | 用途 |
| --- | --- |
| `max-width: 1180px` | 页头收敛、Hero 比例调整 |
| `max-width: 980px` | 主布局单栏、关于两列、数据 2×2、作品两列等宽 |
| `max-width: 900px` | 桌面导航切换为汉堡菜单 |
| `max-width: 760px` | 单列作品、筛选横向滚动、弹窗单列 |
| `max-width: 480px` | 小屏字号/间距压缩、隐藏次要英文 |

### 8.2 流式尺寸

- 标题：`clamp(2.9rem, 5.5vw, 6.2rem)` 等。
- 左右留白：`clamp(20px, 4.2vw, 68px)`。
- 区块间距：`clamp(88px, 10vw, 156px)`。
- 使用 `svh` 处理移动浏览器地址栏高度变化。

### 8.3 移动端特殊处理

- 菜单按钮目标尺寸 43×43px。
- 筛选按钮移动端最小高度 40px，支持横向滚动。
- 项目卡改为 4:3 封面 + 全宽内容。
- 弹窗宽度 `calc(100vw - 20px)`，最大高度 `calc(100svh - 20px)`，内部滚动。
- 自定义光标、卡片视差、Hero 滚动提示在移动端/触摸设备禁用。

---

## 9. 可访问性实现

| 需求 | 实现 |
| --- | --- |
| 键盘导航 | 所有交互使用原生 `<a>` / `<button>`；无 div 模拟按钮 |
| 跳转主内容 | `.skip-link` 在首次 Tab 时出现 |
| 焦点管理 | 移动菜单打开聚焦首个导航链接；弹窗打开聚焦关闭按钮；关闭后恢复触发元素 |
| 菜单语义 | `aria-expanded`、`aria-controls`、`aria-hidden`、`inert`；打开时为 header/main/footer 添加 `inert`，隔离背景内容 |
| 筛选语义 | `role="group"`、`aria-pressed`、`aria-live` 结果播报 |
| 弹窗语义 | 原生 `<dialog>`、`aria-labelledby="dialog-title"` |
| 图片 | 人物插画有描述性 `alt`；装饰性封面 `alt=""` |
| 减少动态 | `prefers-reduced-motion: reduce` 关闭动画、视差、光标 |
| 焦点样式 | 全局 `:focus-visible` 3px 橙色描边 |
| 对比度 | 主文字/背景满足 AA；酸绿高亮配深色文字 |
| 弹出遮罩 | 原生 `::backdrop`，打开时背景不可交互 |
| 滚动锁定 | 菜单/弹窗打开时 `body` 禁止滚动 |

### 9.1 已知限制

- 辅助性 mono 标签字号较小（8—10px），仅承载编号/分类等非唯一信息；关键内容均使用 12px 以上。
- 项目弹窗内容较长，移动端需内部滚动；已在弹窗内提供独立滚动区域。
- 自定义光标在混合输入设备上以 `(hover: hover) and (pointer: fine)` 判断，不保证覆盖所有边缘设备。

---

## 10. 性能设计

1. 无第三方请求，首屏仅加载 HTML、CSS、JS、头像、首张封面。
2. CSS/JS 均为单文件，减少请求数；`defer` 不阻塞解析。
3. 非首屏项目封面使用 `loading="lazy"`。
4. 图片声明尺寸，降低 CLS。
5. 动效以 `transform` / `opacity` 为主，避免布局重排。
6. 滚动处理使用 `requestAnimationFrame` 节流。
7. 事件监听使用 `{ passive: true }`（滚动、指针移动）。
8. 滚动显现只执行一次，进入视口后立即 `unobserve`。
9. 项目弹窗模板不预渲染，打开时才克隆，减少初始 DOM 体积。
10. 无网络字体，避免字体下载与 FOUT。

### 10.1 性能检查建议

- Chrome DevTools → Lighthouse（Mobile + Desktop）。
- Network 面板确认无 404、无第三方请求。
- Performance 面板检查滚动时是否出现长任务。
- 在低端 Android / iOS Safari 上验证动画帧率。

---

## 11. 本地运行与部署

### 11.1 方式 A：直接打开（最简单）

1. 打开 `linmo-portfolio` 文件夹。
2. 双击 `index.html`。
3. 浏览器地址栏显示 `file:///.../index.html`。

由于未使用 ES Module、`fetch` 或后端接口，全部功能在 `file://` 下可用。

### 11.2 方式 B：本地静态服务器（推荐测试）

在项目根目录执行：

```powershell
# Python 3
python -m http.server 8080

# 或 Node.js（已安装 npx）
npx serve . -l 8080
```

浏览器访问：

```text
http://localhost:8080/
```

> 本地服务器更接近真实部署环境，便于测试缓存、相对路径和浏览器安全策略。

### 11.3 部署

| 平台 | 步骤 |
| --- | --- |
| GitHub Pages | 推送仓库 → Settings → Pages → 选择分支根目录 |
| Cloudflare Pages | 上传/连接仓库 → Build command 留空 → Output directory 填 `/` 或项目根 |
| Netlify | 拖拽整个 `linmo-portfolio` 文件夹到部署面板 |
| Vercel | 导入仓库 → Framework 选 Other → Build 与 Output 留空 |
| 任意对象存储 | 上传全部文件，开启静态网站托管 |

**部署注意：**

- 保持目录结构不变。
- 上传 `assets/`、`css/`、`js/` 与 `index.html`。
- `docs/`、`Agent.md`、`README.md`、`preview/` 不参与运行，但建议一起保留。
- 若部署在子目录，相对路径可直接兼容，无需修改。
- 建议为自定义域名开启 HTTPS，确保 Clipboard API 可用。

---

## 12. 浏览器兼容与测试

### 12.1 目标浏览器

- Chrome / Edge 最近两个大版本。
- Firefox 最近两个大版本。
- Safari 16+（macOS / iOS）。
- Android Chrome 最近两个大版本。

### 12.2 功能依赖与降级

| 能力 | 不可用时 |
| --- | --- |
| `IntersectionObserver` | 直接显示全部 `.reveal` 内容 |
| `<dialog>.showModal()` | 使用 `open` 属性展示，Esc 监听降级 |
| Clipboard API | 使用 `execCommand('copy')` |
| `inert` | 现代浏览器均支持；旧浏览器仍可视觉遮罩 |
| Web Animations API | 跳过卡片筛选入场动画 |
| CSS `clamp()` | 现代浏览器均支持 |

### 12.3 本轮验收记录

| 项目 | 结果 |
| --- | --- |
| 测试环境 | Microsoft Edge 156（Headless CDP） |
| 桌面视口 | 1440 × 1000、1920 × 1080、1024 × 768 |
| 平板视口 | 768 × 1024 |
| 移动视口 | 390 × 844、320 × 720 |
| 横向溢出 | 全部测试宽度均无（`scrollWidth === innerWidth`） |
| 图片加载 | 5 张 SVG 全部成功（HTTP 与 `file://` 均验证） |
| 控制台异常 | 0 |
| 导航 | 桌面导航正常；移动菜单可打开/关闭，`aria-expanded` 同步；Esc 关闭后焦点返回菜单按钮 |
| 背景隔离 | 菜单打开时 header/main/footer 均添加 `inert`，关闭后移除 |
| 筛选 | 「品牌网站」筛选后仅 1 张卡片可见，`aria-pressed="true"` |
| 项目弹窗 | 打开 `Neon Transit` 成功，背景滚动锁定；Esc 关闭后焦点回到触发卡片；封面比例 16:9 |
| 响应式 | 作品卡在移动端单列 350px，平板 342px 等宽双列，桌面 7/5 错落 |
| 复制邮箱 | 剪贴板内容正确，Toast、按钮态同步更新 |
| 减少动态 | CSS 媒体查询与 JS 逻辑均已覆盖；自定义光标不启用 |
| 无 JavaScript | 核心文案与项目内容仍可阅读 |

> 建议上线前在真实 iPhone Safari 与低端 Android 上补测一次触控与滚动体验。

---

## 13. 扩展指南

### 13.1 新增一个项目

1. 在 `assets/images/projects/` 添加封面（建议 1600×1100 SVG/WebP）。
2. 在 `index.html` 的 `#project-grid` 中复制一个 `<article class="project-card">`。
3. 更新：
   - `data-category`（`product` / `brand` / `lab`）；
   - `data-project`（唯一 ID）；
   - 封面 `src`、编号、标题、描述、标签。
4. 在页面底部复制一个 `<template id="detail-项目ID">`，填入项目详情。
5. 更新筛选项的 `<sup>` 计数与作品总数（如有）。
6. 若卡片为宽卡，添加 `project-card--wide`。

### 13.2 修改配色

只改 `:root` 中的 Token：

```css
--paper: ...;
--ink: ...;
--acid: ...;
--orange: ...;
--cobalt: ...;
```

注意同步检查：
- 文字对比度；
- 深色章节上的辅助文字（`--muted-light`）；
- SVG 封面中的配色（封面为独立资源，需手动调整）。

### 13.3 修改字体

- 在 `:root` 的 `--font-sans` / `--font-serif` / `--font-mono` 中替换字体栈。
- 若引入网络字体，请自行添加 `<link>` 并承担性能与隐私成本；当前版本刻意未引入。
- 中英文混排时验证 `letter-spacing` 与斜体字形。

### 13.4 增加新章节

1. 在 `<main>` 中加入 `<section id="...">`。
2. 在桌面导航和移动菜单中加入锚点。
3. 在 `initActiveNav()` 的 `sections` 数组中补充 ID。
4. 复用 `.section`、`.container`、`.display-title` 等既有类。

### 13.5 接入真实联系表单

当前版本不包含表单。若需要：

- 使用 Formspree / Netlify Forms 等无后端服务；
- 在联系区增加 `<form>`，保留邮箱作为兜底；
- 增加提交中、成功、失败状态与 `aria-live` 提示；
- 不要在前端代码中放私钥。

---

## 14. 安全与隐私

- 无后端，无数据库，无用户输入被持久化。
- 弹窗内容来自本地 `<template>`，不使用 `innerHTML` 注入用户数据。
- 外链统一 `rel="noopener noreferrer"`。
- 不加载第三方分析、广告或社交 SDK。
- 邮箱为公开信息，建议使用专用工作邮箱并配置垃圾邮件过滤。
- 若未来接入第三方服务，需更新隐私说明并评估 GDPR/PIPL 合规要求。

---

## 15. 已知风险与技术债

| 项 | 说明 | 建议 |
| --- | --- | --- |
| 预览图为演示内容 | 人物、项目、数据均为虚构 | 上线前替换真实内容 |
| SVG 内文字依赖系统字体 | 不同系统上封面文字略有差异 | 需要绝对一致时转曲为路径 |
| 单文件 CSS 较大 | 约 3000 行，后期维护需按注释定位 | 内容继续增长时可拆分 `base.css` / `components.css` / `pages.css`，但需保持无构建 |
| 自定义光标 | 对可访问性有争议 | 当前仅在精确指针设备启用，减少动态时关闭 |
| 无自动化测试 | 手工回归 | 增加 Playwright 冒烟测试（若引入 Node 工具链） |
| 社交链接为平台首页 | 非真实个人主页 | 上线前替换或删除 |
| 无 OG 分享图 | 社交平台分享卡片缺少图片 | 增加 1200×630 PNG/JPG 分享图 |

---

## 16. 交付验收清单

- [x] 无框架依赖，`file://` 可直接打开。
- [x] 页面结构完整，内容可由 HTML 直接读取。
- [x] 桌面/移动端均无横向溢出。
- [x] 菜单、筛选、弹窗、复制邮箱可用。
- [x] 键盘焦点与焦点恢复完整。
- [x] 减少动态偏好生效。
- [x] 所有 SVG 资源加载正常。
- [x] 文档（PRD / 技术设计 / Agent.md / README）齐全。
