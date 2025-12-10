import { Language, ToolType } from "../types";

export const translations = {
  en: {
    dashboard: "Dashboard",
    scanner: "AI Scanner",
    envVars: "Environment Vars",
    totalEnvs: "Total Environments",
    distribution: "Distribution",
    aiInsights: "Gemini Assistant Insights",
    noTools: "No tools detected yet. Go to 'AI Scanner' to import.",
    macCommands: "Mac Terminal Commands",
    winCommands: "Win CMD / PowerShell",
    pastePlaceholder: "Paste output here...\nExample:\nopenjdk 17.0.2\nbrew list",
    scanBtn: "Analyze Logs",
    scanning: "Scanning with Gemini...",
    scanError: "AI found no valid tools.",
    installNew: "Install New Version",
    manage: "Manage",
    uninstall: "Uninstall",
    setGlobal: "Set as Global",
    currentGlobal: "✓ Global Env",
    version: "Version",
    path: "Path",
    source: "Source",
    selectVersion: "Select Version to Install",
    availableVersions: "Available Versions",
    envVarManager: {
      title: "Global Environment Variables",
      key: "Variable Name",
      value: "Value",
      add: "Add Variable",
      edit: "Edit",
      delete: "Delete",
      macHint: "Commands for ~/.zshrc or ~/.bash_profile",
      winHint: "Commands for System/User Environment Variables",
      copyCmd: "Copy Command"
    },
    pythonManager: {
      packages: "Packages",
      mirrors: "Mirrors",
      currentMirror: "Current Mirror",
      setMirror: "Set Mirror",
      scanPackages: "Scan Pip Packages",
      pastePip: "Paste 'pip list' output here...",
      pkgName: "Package Name",
      pkgVersion: "Version",
      uninstall: "Uninstall",
      builtIn: "Built-in / Core",
      thirdParty: "3rd Party"
    },
    mirrors: {
      official: "Official (Slow in CN)",
      tuna: "Tsinghua University",
      aliyun: "Aliyun",
      douban: "Douban"
    },
    toolNames: {
      [ToolType.JAVA]: "Java / JDK",
      [ToolType.PYTHON]: "Python",
      [ToolType.GO]: "Go Lang",
      [ToolType.NODE]: "Node.js",
      [ToolType.UNKNOWN]: "Unknown"
    },
    commandModal: {
      run: "Run Command",
      running: "Executing...",
      copy: "Copy",
      close: "Close",
      output: "Execution Output",
      errorHint: "Note: Interactive commands (like sudo) may fail in this console. Use a terminal."
    }
  },
  zh: {
    dashboard: "仪表盘",
    scanner: "AI 扫描器",
    envVars: "环境变量管理",
    totalEnvs: "环境总数",
    distribution: "环境分布",
    aiInsights: "Gemini 智能分析",
    noTools: "暂无环境数据，请前往 'AI 扫描器' 导入。",
    macCommands: "Mac 终端常用命令",
    winCommands: "Windows 命令",
    pastePlaceholder: "在此粘贴终端输出...\n例如:\nopenjdk 17.0.2\nbrew list",
    scanBtn: "开始智能分析",
    scanning: "Gemini 分析中...",
    scanError: "未检测到有效环境。",
    installNew: "安装新版本",
    manage: "管理",
    uninstall: "卸载",
    setGlobal: "设为全局环境",
    currentGlobal: "✓ 全局环境",
    version: "版本",
    path: "路径",
    source: "来源",
    selectVersion: "选择要安装的版本",
    availableVersions: "可用版本列表",
    envVarManager: {
      title: "全局环境变量",
      key: "变量名",
      value: "变量值",
      add: "添加变量",
      edit: "编辑",
      delete: "删除",
      macHint: "生成适用于 ~/.zshrc 或 ~/.bash_profile 的命令",
      winHint: "生成适用于 Windows 系统/用户环境变量的命令",
      copyCmd: "复制命令"
    },
    pythonManager: {
      packages: "已装包管理",
      mirrors: "镜像源管理",
      currentMirror: "当前镜像",
      setMirror: "切换镜像",
      scanPackages: "扫描 Pip 包",
      pastePip: "请粘贴 'pip list' 的输出内容...",
      pkgName: "包名",
      pkgVersion: "版本",
      uninstall: "卸载",
      builtIn: "内置 / 核心",
      thirdParty: "第三方库"
    },
    mirrors: {
      official: "官方源 (国内较慢)",
      tuna: "清华大学源",
      aliyun: "阿里云源",
      douban: "豆瓣源"
    },
    toolNames: {
      [ToolType.JAVA]: "Java / JDK",
      [ToolType.PYTHON]: "Python",
      [ToolType.GO]: "Go 语言",
      [ToolType.NODE]: "Node.js",
      [ToolType.UNKNOWN]: "未知"
    },
    commandModal: {
      run: "执行命令",
      running: "执行中...",
      copy: "复制",
      close: "关闭",
      output: "执行结果",
      errorHint: "注意：涉及 sudo 或交互式输入的命令可能会失败，请使用系统终端。"
    }
  }
};