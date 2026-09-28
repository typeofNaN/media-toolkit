# Media Toolkit

一款基于 Electron、React 和 FFmpeg 的功能强大的多媒体处理工具。

## 功能特性

- 🎬 **视频转换** - 支持 MP4、WebM、AVI、MOV、MKV 等格式互转，可选择编码器和质量预设
- 🔍 **媒体检查器** - 集中查看容器、音视频流、编码参数、拍摄设备、GPS 和实况标识
- 🗜️ **视频压缩** - 调整输出画质与分辨率，生成便于分享的 MP4 文件
- 🎵 **音频提取** - 从视频中提取音频，支持 MP3、AAC、WAV、FLAC 格式
- ✂️ **视频裁剪** - 精确裁剪视频片段，保留原始质量
- 🧩 **视频合并** - 添加多个视频片段、调整顺序并合并输出
- 🎞️ **封面与抽帧** - 从指定时间点导出封面，或按帧率批量导出画面
- 💧 **视频水印** - 叠加图片水印，可配置位置和不透明度
- 🖼️ **图片工具** - 调整图片尺寸、格式转换（支持 JPG、PNG、WebP）
- 📦 **图片压缩** - 支持 JPG/PNG/WebP 格式压缩，可调节压缩质量
- 🎞️ **GIF 制作** - 从视频创建 GIF 动图，支持自定义帧率和尺寸
- 📸 **实况照片工具** - 更换 Live Photo 封面，或从视频生成实验性 JPG + MOV 配对素材
- 🏷️ **元信息编辑** - 查看、修改或清除图片与音视频的 EXIF、IPTC、XMP、QuickTime 元信息

## 技术栈

- **Electron 28** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Tailwind CSS** - 样式框架
- **FFmpeg** - 多媒体处理核心
- **ExifTool** - 跨格式元信息读取与写入
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
│       ├── ffmpeg.ts          # FFmpeg 服务
│       └── metadata.ts        # ExifTool 元信息服务
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
│           │   ├── GifMaker.tsx
│           │   ├── LivePhotoTools.tsx
│           │   └── MetadataEditor.tsx
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

### 媒体检查器

同时调用 FFprobe 与 ExifTool，展示容器格式、音视频编码、分辨率、帧率、码率、音频参数、拍摄设备、时间、GPS 与实况照片标识。

### 视频压缩

- 质量范围调节
- 保持原分辨率，或转换为 4K、1080p、720p、480p
- 输出通用 MP4 文件

### 音频提取

从视频中提取音频流，支持多种音频格式和比特率选择。

### 视频裁剪

按时间范围裁剪视频，保持原始视频质量。

### 视频合并

支持一次选择多个视频、增删片段并调整顺序。为了获得稳定结果，建议输入片段具有相同的分辨率、帧率，并都包含音轨。

### 封面与抽帧

- 从指定秒数提取 JPG 或 PNG 封面
- 按每秒帧数批量导出序列图片
- 批量文件使用 `frame-0001` 形式编号

### 视频水印

支持 PNG、JPG、WebP 图片水印，可放置于四角或画面中心，并可调节透明度。

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

### 实况照片工具

实况照片由一张静态图片和一个配对视频组成。两个资源需要共享 Apple ContentIdentifier，静态图还包含 Apple MakerNote。

- **修改封面**：选择原实况照片主图与配对 MOV，从视频指定时间点提取新封面，并迁移原图元信息
- **生成配对素材（实验）**：截取视频片段并生成共享 ContentIdentifier 的同名 JPG + MOV，可设置片段时长和封面时间点
- 为保证跨平台兼容性，从普通视频生成时需要选择一张已有实况照片作为 MakerNote 模板；模板本身不会被修改
- 跨平台输出当前不包含苹果 still-image-time 定时轨道，因此不承诺被 iOS/macOS 识别为原生 Live Photo；原生生成后续需要接入 AVFoundation/PhotoKit

### 元信息编辑

- 读取图片、音频和视频中的 EXIF、IPTC、XMP 与 QuickTime 标签
- 编辑标题、描述、作者、版权、关键词、拍摄时间和 GPS 经纬度
- 默认保存为新文件，避免意外覆盖原始素材
- “生成隐私副本”会复制文件并清除可写元信息，适合分享前移除位置、设备和拍摄信息

## 数据与隐私

所有媒体处理都在本机完成，应用不会上传文件。元信息清理受文件格式限制：某些容器或专有 MakerNote 可能无法完全重写，发布敏感文件前建议重新读取结果进行确认。

## 实况照片兼容性说明

Apple 官方公开资料说明，实况照片的视频资源包含 QuickTime ContentIdentifier，并与静态图 Apple MakerNote 中的标识关联。本项目使用 FFmpeg 生成视频片段、使用 ExifTool 迁移与写入标识。由于 Apple 没有公开完整的第三方生成规范，本项目采用模板方式保留必要的 MakerNote；它不等同于调用 macOS/iOS 的 AVFoundation 原生采集流程。

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
