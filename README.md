# Media Toolkit

一款基于 Electron、React 和 FFmpeg 的功能强大的多媒体处理工具。

## 功能特性

- 🎬 **视频转换** - 支持 MP4、WebM、AVI、MOV、MKV 等格式互转，可选择编码器和质量预设
- 🎵 **音频提取** - 从视频中提取音频，支持 MP3、AAC、WAV、FLAC 格式
- ✂️ **视频裁剪** - 精确裁剪视频片段，保留原始质量
- 🖼️ **图片工具** - 调整图片尺寸、格式转换（支持 JPG、PNG、WebP）
- 📦 **图片压缩** - 支持 JPG/PNG/WebP 格式压缩，可调节压缩质量
- 🎞️ **GIF 制作** - 从视频创建 GIF 动图，支持自定义帧率和尺寸

## 技术栈

- **Electron 28** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Tailwind CSS** - 样式框架
- **FFmpeg** - 多媒体处理核心
- **electron-builder** - 打包工具

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建应用

```bash
# 构建所有平台
pnpm build

# 构建 macOS
pnpm build:mac

# 构建 Windows
pnpm build:win

# 构建 Linux
pnpm build:linux
```

### 生成图标

```bash
pnpm generate-icons
```

## 命令脚本

| 命令                  | 说明                |
| --------------------- | ------------------- |
| `pnpm dev`            | 启动开发模式        |
| `pnpm build`          | 构建生产版本        |
| `pnpm build:vite`     | 仅构建 Vite         |
| `pnpm build:mac`      | 构建 macOS 版本     |
| `pnpm build:win`      | 构建 Windows 版本   |
| `pnpm build:linux`    | 构建 Linux 版本     |
| `pnpm generate-icons` | 生成应用图标        |
| `pnpm lint`           | 检查代码规范        |
| `pnpm lint:fix`       | 自动修复代码规范    |
| `pnpm format`         | 格式化代码          |
| `pnpm typecheck`      | TypeScript 类型检查 |

## 项目结构

```
├── .github/
│   └── workflows/              # GitHub Actions
│       └── release.yml         # 自动发布流程
├── build/                      # 应用图标资源
│   ├── icon.svg               # 图标源文件
│   ├── icon.png               # Linux 图标
│   ├── icon.icns              # macOS 图标
│   └── icon.ico               # Windows 图标
├── electron/                   # Electron 主进程
│   ├── main.ts                # 主进程入口
│   ├── preload.ts             # 预加载脚本
│   ├── types.d.ts             # 类型声明
│   └── services/
│       └── ffmpeg.ts          # FFmpeg 服务
├── scripts/                    # 构建脚本
│   ├── generate-icons.ts      # 图标生成脚本
│   └── set-dev-icon.ts        # 开发图标设置
├── src/
│   └── renderer/              # 渲染进程
│       ├── index.html
│       └── src/
│           ├── App.tsx        # 主应用组件
│           ├── main.tsx       # 渲染进程入口
│           ├── index.css      # 全局样式
│           ├── components/    # React 组件
│           │   ├── Sidebar.tsx
│           │   ├── VideoConverter.tsx
│           │   ├── AudioExtractor.tsx
│           │   ├── VideoTrimmer.tsx
│           │   ├── ImageTools.tsx
│           │   ├── ImageCompressor.tsx
│           │   └── GifMaker.tsx
│           └── types/         # 类型定义
│               └── index.ts
├── electron-builder.yml        # 打包配置
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
├── package.json
└── LICENSE                   # MIT 许可证
```

## 功能说明

### 视频转换

支持将视频转换为不同格式，可选择：

- **编码器**：H.264 (libx264)、VP9 (libvpx-vp9) 等
- **质量预设**：低 ( CRF 28 )、中 ( CRF 23 )、高 ( CRF 18 )

### 音频提取

从视频中提取音频流，支持多种音频格式和比特率选择。

### 视频裁剪

按时间范围裁剪视频，保持原始视频质量。

### 图片工具

- **调整大小**：自定义宽度和高度，支持保持宽高比
- **格式转换**：支持 PNG、JPG、WebP 格式互转

### 图片压缩

- **质量调节**：1-100% 滑块控制
- **输出格式**：可选择 JPG、PNG 或 WebP

### GIF 制作

从视频片段创建 GIF 动图：

- 自定义起始时间和时长
- 调整帧率 (FPS)
- 设置输出宽度

## GitHub Actions 发布

每次推送 `v*` 标签时自动构建并发布：

```bash
# 创建版本标签并推送
git tag v1.0.0
git push origin v1.0.0
```

自动构建产物：

- **macOS**: .dmg、.zip (x64 + arm64)
- **Windows**: .exe (NSIS 安装包)、.exe (Portable)
- **Linux**: .AppImage、.deb

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件
