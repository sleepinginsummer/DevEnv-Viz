# DevEnv Viz - Environment Manager

<div align="center">

A visualized development environment manager for macOS and Windows.  
Parse terminal logs locally, manage versions, and generate system commands.

[**English**](#english) | [**中文文档**](#chinese)

</div>

---

<a name="english"></a>
## 🇬🇧 English Documentation

### 1. Environment Requirements
*   **Node.js**: v18.0.0 or higher
*   **OS**: macOS or Windows
*   **Package Manager**: npm or yarn

### 2. Development

**Web Preview Mode (Mock Data)**:  
Runs in browser with pre-loaded mock data so you can view the UI logic.
```bash
npm run dev
```

**Desktop App Mode (Real Data)**:  
Runs as Electron app. Starts with empty data and allows real system scanning.
```bash
npm run electron:dev
```

### 3. Build & Package
Package the application into an executable (`.dmg`, `.app`, `.exe`).

```bash
# Build for your current OS (Auto-detect)
npm run dist

# Build specifically for macOS
npm run dist:mac

# Build specifically for Windows
npm run dist:win
```

**Output:**  
After building, find your installers in the `dist/` folder.

---

<a name="chinese"></a>
## 🇨🇳 中文文档

### 1. 环境要求
*   **Node.js**: v18.0.0 或更高版本
*   **操作系统**: macOS 或 Windows
*   **包管理器**: npm 或 yarn

### 2. 开发指南

**Web 预览模式 (Mock 数据)**:  
在浏览器中运行，默认加载模拟测试数据，方便开发和查看 UI 效果。
```bash
npm run dev
```

**桌面应用模式 (真实数据)**:  
作为 Electron 应用运行。启动时数据为空，支持扫描真实的本机系统环境。
```bash
npm run electron:dev
```

### 3. 打包与发布
将项目打包为可执行的桌面应用文件 (`.dmg`, `.app`, `.exe`)。

```bash
# 根据当前系统自动打包
npm run dist

# 专门打包 macOS 版本
npm run dist:mac

# 专门打包 Windows 版本
npm run dist:win
```

**输出目录:**  
打包完成后，安装包将生成在 `dist/` 目录下。

---

## 🔧 Tech Stack
*   **Core**: React 19, TypeScript, Vite
*   **Desktop**: Electron, Electron Builder
*   **UI**: TailwindCSS, Recharts