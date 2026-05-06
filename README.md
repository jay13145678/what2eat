# 今天吃什么 🥢

每天纠结吃什么？让命运帮你决定。

一个帮助你快速决策的 Web 应用 — 问答推荐、随机选菜、历史记录、收藏/黑名单管理。

## 功能

- **问答推荐** — 回答几个简单问题（用餐时间、预算、辣度、荤素），帮你缩小范围
- **随机选菜** — 按分类筛选，一键随机抽取，翻牌决定
- **菜品管理** — 浏览、添加、编辑、删除菜品，支持分类筛选和搜索
- **收藏 / 黑名单** — 收藏喜欢的菜，拉黑不想吃的，影响推荐权重
- **历史记录** — 查看过往选择，方便回顾
- **PWA 支持** — 可安装到桌面，离线可用
- **动效反馈** — GSAP + Framer Motion 动画，操作反馈流畅

## 技术栈

| 层     | 技术                                                             |
| ------ | ---------------------------------------------------------------- |
| 框架   | React 19 + TypeScript 6                                         |
| 构建   | Vite 8                                                          |
| 样式   | Tailwind CSS 4                                                  |
| 状态   | Zustand (persist)                                               |
| 持久化 | IndexedDB (idb)                                                 |
| 动画   | GSAP 3.15 + Framer Motion 12                                    |
| 图标   | @phosphor-icons/react                                           |
| PWA    | vite-plugin-pwa                                                 |
| 后端   | 纯前端，数据存储于浏览器 IndexedDB                              |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview

# 代码检查
npm run lint
```

## 项目结构

```
config/               # 构建配置 (tsconfig, vite, eslint)
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.mjs
  eslint.config.js
scripts/              # 辅助脚本
  start.bat
public/               # 静态资源
src/
  components/
    layout/           # 布局组件 (Header, BottomNav, AppShell)
    picker/           # 选菜组件 (RandomTab, QuizTab, PickCard)
    settings/         # 设置页面组件
  data/               # 内置种子数据
  db/                 # IndexedDB 数据层
  hooks/              # React Hooks
  pages/              # 页面组件
  store/              # Zustand 状态管理
  types/              # TypeScript 类型定义
  utils/              # 工具函数
```
