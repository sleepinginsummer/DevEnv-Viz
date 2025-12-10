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
```bash
# 1. Install dependencies
npm install

# 2. Start local web server (Browser Mode)
npm run dev

# 3. Start Electron Desktop App (Development Mode)
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
```bash
# 1. 安装依赖
npm install

# 2. 启动本地 Web 服务 (浏览器模式)
npm run dev

# 3. 启动 Electron 桌面应用 (开发模式)
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
