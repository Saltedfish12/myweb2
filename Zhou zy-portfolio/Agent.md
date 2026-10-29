# Agent.md｜AI 编程助手维护指南

> 本文件面向后续接手本项目的 AI 编程助手（以及人类开发者）。
> **开始修改前，请先完整阅读本文件，并实际读取相关源码，不要仅凭文件名或本文档猜测实现。**

---

## 0. 一句话项目介绍

这是一个名为「林墨 Lin Mo」的个人作品集单页网站，使用 **HTML + CSS + 原生 JavaScript + 手写 SVG** 构建，无框架、无构建步骤、无后端，可直接双击 `index.html` 或部署到任意静态托管平台。

视觉方向：**编辑杂志感 + 新粗野主义点缀 + 三色碰撞（米白 / 酸绿 / 钴蓝 / 橙红）**。修改时请守住这套气质，不要替换成通用 SaaS 模板风。

---

## 1. 项目速览

| 项目 | 信息 |
| --- | --- |
| 页面入口 | `index.html` |
| 样式入口 | `css/styles.css` |
| 脚本入口 | `js/main.js` |
| 主视觉 | `assets/images/avatar-linmo.svg` |
| 项目封面 | `assets/images/projects/*.svg` |
| 产品文档 | `docs/PRD.md` |
| 技术文档 | `docs/TECH_DESIGN.md` |
| 运行方式 | `file://` 直接打开，或任意静态服务器 |
| 依赖 | **无** |
| 构建 | **无** |
| 后端 | **无** |
| 语言 | 简体中文 + 英文视觉点缀 |

### 页面章节

1. Header（固定导航 + 移动菜单）
2. Hero `#home`
3. 技能跑马灯
4. About `#about`
5. Work `#work`（4 个项目 + 筛选 + 弹窗）
6. Contact `#contact`
7. Footer + 项目详情 `<dialog>`

---

## 2. 不可破坏的硬性约束（MUST）

1. **不得引入框架或运行时依赖**：不要加入 React、Vue、jQuery、GSAP、Tailwind、Bootstrap、Lenis 等。除非用户明确要求，否则保持零依赖。
2. **不得引入构建步骤**：不要创建 `package.json`、Vite/Webpack 配置或需要编译的源码。项目必须保持「打开即运行」。
3. **必须保留 `file://` 可用性**：
   - 不要把 `js/main.js` 改成 ES Module；
   - 不要用 `fetch()` 加载本地 JSON/HTML；
   - 不要依赖开发服务器注入的全局变量。
4. **不得删除无障碍能力**：键盘操作、焦点管理、`aria-*`、减少动态偏好必须保留。
5. **不得直接重写整个文件**：先读取相关文件，优先做局部编辑；修改后必须回归测试。
6. **不得把演示内容写成真实事实**：当前姓名、经历、项目数据、社交链接均为示例。若用户要求上线，先提醒替换。
7. **不得使用 `innerHTML` 拼接任何外部/用户输入**。项目详情继续使用 `<template>` + `cloneNode(true)`。
8. **保持响应式**：任何新增组件必须至少验证 1440px 与 390px 两个宽度，不出现横向滚动。
9. **保持 `prefers-reduced-motion` 降级**：新增动画必须加入降级逻辑或受全局规则覆盖。
10. **中文文案风格**：简洁、具体、有温度，避免空泛的「赋能 / 闭环 / 生态」式表达。

---

## 3. 文件结构说明

```text
linmo-portfolio/
├── index.html                  # 页面结构、文案、项目卡、4 个项目详情模板
├── README.md                   # 人类可读的快速开始
├── Agent.md                    # 本文件
├── css/
│   └── styles.css              # 全站样式（按 17 个编号区块组织）
├── js/
│   └── main.js                 # 全站交互（IIFE + 初始化函数）
├── assets/
│   └── images/
│       ├── favicon.svg
│       ├── avatar-linmo.svg
│       └── projects/
│           ├── neon-transit.svg
│           ├── mori-note.svg
│           ├── echo-type.svg
│           └── common-ground.svg
├── docs/
│   ├── PRD.md
│   └── TECH_DESIGN.md
└── preview/                    # 预览截图，非运行依赖
```

### 关键选择器地图

| 选择器 | 用途 |
| --- | --- |
| `#site-header` | 固定页头，滚动后加 `.is-scrolled` |
| `#mobile-menu` | 全屏移动菜单，`.is-open` 控制 |
| `.menu-toggle` | 打开菜单按钮 |
| `.mobile-menu__close` | 关闭菜单按钮 |
| `.reveal` | 滚动显现元素，JS 添加 `.is-visible` |
| `[data-nav]` | 桌面导航中的章节链接 |
| `.filter[data-filter]` | 作品分类按钮 |
| `.project-card[data-category]` | 项目卡片分类 |
| `[data-project]` | 打开项目详情按钮 |
| `#project-dialog` | 原生详情弹窗 |
| `#dialog-content` | 弹窗内容容器 |
| `template#detail-*` | 每个项目的详情模板 |
| `[data-copy-email]` | 复制邮箱按钮 |
| `#filter-status` | 筛选结果屏幕阅读器播报 |
| `#local-time` | 页脚上海时间 |

---

## 4. 内容在哪里改

### 4.1 个人身份信息

| 内容 | 位置 |
| --- | --- |
| 页面标题 / SEO 描述 | `index.html` `<head>` |
| 品牌名「林墨 / LIN MO」 | 页头 `.brand`、移动菜单、Hero 肖像说明、页脚 |
| Hero 主张与介绍 | `.hero__title`、`.hero__copy` |
| 档期状态 | `.hero__kicker`、`.contact__status`、移动菜单底部 |
| 邮箱 | 所有 `hello@linmo.design` 与 `data-copy-email` |
| 社交链接 | `.contact__links`、`.mobile-menu__socials` |
| 个人数据 | `.hero__meta`、`.stats`（`data-count` 属性决定计数目标） |
| 经历 | `.timeline` |
| 结构化数据 | `<script type="application/ld+json">` |

> 修改邮箱时，务必同时更新：可见文本、`mailto:` 链接、`data-copy-email`、移动菜单、页脚/技术文档中的示例（如需）。

### 4.2 修改统计数字

数字在 HTML 中保留最终值，并由 JS 从 0 动画到 `data-count`：

```html
<span data-count="32">32</span>
```

只改 `data-count` 与可见文本即可。`∞` 不参与计数。

### 4.3 新增项目（标准流程）

1. **准备封面**：放入 `assets/images/projects/`，建议 1600×1100，SVG 或 WebP。
2. **复制一张卡片**：在 `#project-grid` 内复制 `<article class="project-card">`。
   - 7 列宽卡加 `project-card--wide`；窄卡不加。
   - 更新 `data-category`：`product` / `brand` / `lab`。
   - 更新按钮的 `data-project="唯一ID"`、`aria-label`。
   - 更新 `<img src>`、编号、标题、描述、标签。
3. **复制一份模板**：在页面底部复制 `<template id="detail-xxx">`，ID 与 `data-project` 保持一致。
   - 第一个 `<h2>` 必须保留 `id="dialog-title"`；
   - 顶部编号、标题、简介、封面、facts、问题/方法/结果全部更新。
4. **更新筛选计数**：`.filter` 中的 `<sup>` 与作品总数；若增加分类，补按钮和 `data-filter`。
5. **测试**：筛选、打开/关闭弹窗、Esc、移动端单列、控制台无错误。

> 不需要改 JS。`initProjectDialog()` 会根据 `data-project` 自动查找 `detail-${id}` 模板。

---

## 5. 代码编写规范

### 5.1 HTML

- 使用 2 空格缩进、双引号。
- 语义优先：章节用 `<section>`，导航用 `<nav>`，独立内容用 `<article>`。
- 页面只能有一个 `<h1>`；章节用 `<h2>`；卡片内可用 `<h3>`。
- 所有图片：
  - 内容图片写描述性 `alt`；
  - 纯装饰封面写 `alt=""`；
  - 声明 `width` / `height`；
  - 非首屏加 `loading="lazy"`。
- 所有按钮必须写 `type="button"`。
- 交互元素优先使用 `<a>` / `<button>`，禁止用 `<div onclick>`。
- 项目卡按钮内部只使用 `<span>` 等行内容器，避免块级元素嵌套导致 HTML 非法。
- 装饰元素加 `aria-hidden="true"`。
- 外链加 `target="_blank" rel="noopener noreferrer"`。
- 新增文案时保持行宽与段落节奏，不要写超长单段。

### 5.2 CSS

- **先 Token，后组件**。颜色、字体、圆角、容器宽度优先用 `:root` 变量。
- 类名遵循 BEM-ish：`.block`、`.block__element`、`.block--modifier`。
- 状态类统一 `is-*`：`.is-active`、`.is-open`、`.is-visible`、`.is-scrolled`、`.is-copied`。
- 新增样式必须放入 `styles.css` 对应的编号区块，不要随意追加到文件末尾。
- 响应式规则放在第 16 区块，遵循从大到小断点顺序。
- 动画优先 `transform` / `opacity`；不要动画 `width` / `height` / `top`（进度条宽度除外）。
- 必须提供 `:focus-visible` 可见样式。
- 避免 `!important`，当前仅用于 utility / 降级场景。
- 覆盖样式时注意媒体查询中的选择器顺序；`.about-card` 等基础规则在断点内可能覆盖修饰符的 `grid-column`。
- 新增交互必须检查 `@media (prefers-reduced-motion: reduce)` 是否覆盖。
- 移动端点击目标尽量 ≥ 40×40px。

### 5.3 JavaScript

- 继续使用单个 IIFE，`"use strict"`。
- 新功能写成 `initXxx()` 函数，并在 `init()` 中调用。
- 使用 `const` / `let`，不使用 `var`。
- 使用 `textContent` / `classList` / `setAttribute` 操作 DOM。
- 查询优先使用 `data-*` 属性，不用易变的样式类做业务选择器。
- 事件监听使用具名函数或清晰箭头函数；滚动/指针监听加 `{ passive: true }`。
- 高频事件使用 `requestAnimationFrame` 节流。
- 每个功能自行做能力检测并优雅降级。
- 不写 `console.log` 交付代码。
- 不引入全局变量；除 IIFE 外不污染 `window`。
- 复制、弹窗等异步操作必须 try/catch 并给用户反馈。

### 5.4 SVG

- 使用 `viewBox` 与语义化 `role` / `aria-label`。
- 手写时保持结构分组注释（背景 / 人物 / 标题 / 装饰）。
- 避免外部图片引用、远程字体、脚本。
- 颜色尽量与站点 Token 一致（硬编码十六进制需与 `:root` 保持同步）。
- 如果图形文字必须完全一致，交付前将 `<text>` 转为路径。

---

## 6. 无障碍底线

任何改动都必须满足：

- Tab 可以到达所有可操作元素，且焦点顺序合理。
- 移动菜单打开时：
  - `aria-expanded="true"`；
  - 背景滚动锁定；
  - `header` / `main` / `footer` 添加 `inert`；
  - 焦点在菜单内循环；
  - Esc 关闭并把焦点还给触发按钮。
- 项目弹窗：
  - 使用原生 `<dialog>`；
  - 有 `aria-labelledby`；
  - 关闭后焦点回到触发卡片；
  - 背景不可滚动。
- 筛选按钮：
  - 每个按钮有 `aria-pressed`；
  - 结果通过 `#filter-status` 播报。
- 图片替代文本正确，装饰图不进朗读。
- 所有动画在减少动态偏好下停止或瞬间完成。
- 颜色改动后检查对比度；正文与背景至少 4.5:1。

---

## 7. 本地运行方法

### 方式 A：直接打开

双击 `index.html`，或拖入浏览器。项目不依赖服务器。

### 方式 B：静态服务器（推荐回归测试）

在项目根目录执行其一：

```powershell
python -m http.server 8080
```

```powershell
npx serve . -l 8080
```

然后打开：

```text
http://localhost:8080/
```

### 停止服务器

- Python：`Ctrl + C`
- npx serve：`Ctrl + C`

---

## 8. 修改后必须执行的回归清单

| 检查项 | 桌面 1440px | 手机 390px |
| --- | --- | --- |
| 页面无横向滚动 | ✅ | ✅ |
| Header / 菜单正常 | ✅ | ✅ |
| 锚点跳转不被页头遮挡 | ✅ | ✅ |
| 4 张项目卡完整显示 | ✅ | ✅ |
| 分类筛选结果正确 | ✅ | ✅ |
| 每个项目弹窗可打开/关闭 | ✅ | ✅ |
| Esc 关闭弹窗 | ✅ | ✅ |
| 复制邮箱按钮反馈 | ✅ | ✅ |
| 图片无 404 | ✅ | ✅ |
| 控制台无报错 | ✅ | ✅ |
| 减少动态偏好下可用 | ✅ | ✅ |

### 快速技术检查

- DevTools Console 无红色错误。
- Network 无 404。
- `document.documentElement.scrollWidth === window.innerWidth`。
- 禁用 JavaScript 后，首屏文案与项目仍可阅读（弹窗与菜单增强功能会失效）。
- Windows 缩放 125% / 150% 下无破版。
- Safari 中测试 `dialog` 与 `100svh` 表现。

---

## 9. Definition of Done

一次修改只有在以下条件全部满足时才算完成：

- [ ] 页面在 1440px 与 390px 下无溢出、无遮挡。
- [ ] 相关交互在鼠标和键盘下都可用。
- [ ] 新文案/资源已替换，无残留意例占位文本。
- [ ] 没有引入新依赖、构建步骤或后端。
- [ ] 控制台无错误。
- [ ] 现有动画/降级没有被破坏。
- [ ] 同步更新文档（若结构、内容或交互有变化）。
- [ ] `PRD.md` / `TECH_DESIGN.md` 中相关描述没有过期。

---

## 10. 常见修改速查

| 想做什么 | 改哪里 |
| --- | --- |
| 换姓名 / 角色 | `index.html` 品牌、Hero、头像说明、页脚、JSON-LD |
| 换主色 | `styles.css` `:root` Token（并检查 SVG 封面） |
| 换头像 | 替换 `assets/images/avatar-linmo.svg` 或改 `<img src>` |
| 新增项目 | 项目卡 + `<template>` + 筛选计数 |
| 删除项目 | 删除卡片 + 对应模板 + 更新计数 |
| 改邮箱 | 可见文本、`mailto:`、`data-copy-email`、移动菜单 |
| 改档期 | Hero kicker、联系区 status、移动菜单底部 |
| 增加章节 | `<section>` + 导航 + `initActiveNav()` 的 sections 数组 |
| 关闭某动效 | 优先通过 `prefers-reduced-motion`，不要直接删除可访问性代码 |
| 改断点 | `styles.css` 第 16 区块，保持从大到小顺序 |
| 改筛选分类 | `data-category`、`.filter[data-filter]`、`labels` 对象、计数 |

---

## 11. 已知占位与风险（接手时先确认）

1. **人物设定为虚构示例**：林墨、5 年经验、32 个项目、12 个品牌、所有项目指标均为演示内容。
2. **邮箱为示例域名**：`hello@linmo.design`，需替换为真实邮箱。
3. **社交链接指向平台首页**：GitHub / 小红书 / LinkedIn 均非真实个人主页。
4. **项目案例为概念案例**：Neon Transit、Mori Note、Echo Type、Common Ground 及其数据不代表真实客户项目。
5. **无真实简历文件**：如需提供下载，需新增 PDF 并更新 CTA。
6. **无自动化测试**：回归依赖手工检查清单。
7. **SVG 文字依赖系统字体**：不同操作系统上封面排版略有差异。

---

## 12. 给下一位 Agent 的工作原则

1. **先读**：读取 `index.html` 的相关区块、`styles.css` 的对应区块、`main.js` 的对应函数，再动手。
2. **小步改**：一次只解决一个明确问题，避免顺手重构。
3. **保持风格**：大标题、酸绿高亮、粗边框、编号系统、留白，是这个项目的识别度，不要弱化。
4. **不牺牲可用性**：视觉再酷，也必须键盘可用、移动端可读、减少动态可降级。
5. **明确交付**：改完说明「改了什么、验证了什么、还剩什么」。不要声称未测试的功能已验证。

---

*最后更新：2026-10-28 · v1.0*
