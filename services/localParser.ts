import { EnvTool, ToolType, PipPackage, Platform } from '../types';

// Regex patterns for different tools
const PATTERNS = {
  // Matches: "openjdk 17.0.2 2022-01-18" or "java version "1.8.0_151""
  JAVA_SIMPLE: /(?:java|openjdk) (?:version )?"?(\d+(?:\.\d+)*(?:[._]\d+)?)/i,
  // Matches: /usr/libexec/java_home -V output: "17.0.2 (x86_64) "Oracle Corporation" - "Java SE 17.0.2" /Library/Java/..."
  JAVA_HOME_V: /^\s+(\d+(?:\.\d+)*[._-]?\w*)\s+\([^)]+\)\s+"[^"]+"\s+-\s+"[^"]+"\s+(.+)$/,
  
  // Matches: "Python 3.9.12"
  PYTHON_SIMPLE: /Python (\d+\.\d+\.\d+)/i,
  // Matches: pyenv versions output: "  3.9.13" or "* 3.10.4 (set by ...)"
  PYENV: /^[\s*]+(\d+\.\d+\.\d+)(?:\s+\(set by.*\))?/,
  
  // Matches: "go version go1.17.6 darwin/amd64"
  GO_SIMPLE: /go version go(\d+\.\d+(?:\.\d+)?)/i,
  // Matches folder names like "go1.21.4"
  GO_DIR: /go(\d+\.\d+(?:\.\d+)?)/,
  
  // Matches: "v16.13.0" (Node output)
  NODE_SIMPLE: /v(\d+\.\d+\.\d+)/,
  // Matches folder names like "v18.16.0"
  NODE_DIR: /^v(\d+\.\d+\.\d+)$/,
  
  // Brew list output e.g. "python@3.9 3.9.12"
  BREW: /^([a-zA-Z0-9@\-_]+)\s+(\d+(?:\.\d+)+)/,
  
  // Explicit Path line from Scanner: "Path: /usr/bin/java"
  PATH_LINE: /^Path:\s+(.+)$/
};

const cleanVersion = (v: string) => v.replace(/^v/, '');

const deduplicateTools = (tools: EnvTool[]): EnvTool[] => {
  const map = new Map<string, EnvTool>();
  
  tools.forEach(tool => {
    // Key by Type + Version (Major.Minor) to merge same installs
    // e.g. Java 17.0.2 and Java 17.0.2 should merge
    const key = `${tool.type}-${tool.version}`;
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      // Merge logic: prefer specific paths over "Detected"
      // Prefer "SystemDefault" true over false
      // Prefer specific sources (Brew, Pyenv) over "Manual"
      
      const merged: EnvTool = {
        ...existing,
        path: (existing.path.includes('Detected') && !tool.path.includes('Detected')) ? tool.path : existing.path,
        isSystemDefault: existing.isSystemDefault || tool.isSystemDefault,
        source: existing.source === 'System/Manual' ? tool.source : existing.source
      };
      map.set(key, merged);
    } else {
      map.set(key, tool);
    }
  });
  
  return Array.from(map.values()).sort((a, b) => a.type.localeCompare(b.type));
};

export const parseEnvironmentLogs = (input: string, platform: Platform): EnvTool[] => {
  const lines = input.split('\n');
  const rawResults: EnvTool[] = [];
  const now = new Date().toISOString();
  
  // Context tracking (e.g., if we see a "Path: ..." line, associate it with the recently found tool?)
  // Actually, our scanner outputs "Path: ..." right after the version command usually.
  // But strictly, we parse line by line. 

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // --- JAVA ---
    const javaHomeMatch = cleanLine.match(PATTERNS.JAVA_HOME_V);
    if (javaHomeMatch) {
      rawResults.push({
        id: `java-${javaHomeMatch[1]}-${Math.random()}`,
        name: 'Java JDK',
        type: ToolType.JAVA,
        version: javaHomeMatch[1],
        path: javaHomeMatch[2], // Real path from java_home
        isSystemDefault: false, // Usually list is all, not default
        source: 'System (Detected)',
        detectedAt: now
      });
      return;
    }
    const javaMatch = cleanLine.match(PATTERNS.JAVA_SIMPLE);
    if (javaMatch && !cleanLine.includes('javac') && !cleanLine.includes('Path:')) {
      rawResults.push({
        id: `java-simple-${javaMatch[1]}`,
        name: cleanLine.includes('openjdk') ? 'OpenJDK' : 'Java SE',
        type: ToolType.JAVA,
        version: javaMatch[1],
        path: 'System Path (Detected)', 
        isSystemDefault: true, // Output from 'java -version' usually implies active
        source: 'System',
        detectedAt: now
      });
      return;
    }

    // --- PYTHON ---
    const pyenvMatch = cleanLine.match(PATTERNS.PYENV);
    if (pyenvMatch) {
      const isActive = line.includes('*');
      rawResults.push({
        id: `pyenv-${pyenvMatch[1]}`,
        name: 'Python (PyEnv)',
        type: ToolType.PYTHON,
        version: pyenvMatch[1],
        path: isActive ? 'Active PyEnv Shim' : '~/.pyenv/versions/' + pyenvMatch[1],
        isSystemDefault: isActive,
        source: 'PyEnv',
        detectedAt: now
      });
      return;
    }
    const pyMatch = cleanLine.match(PATTERNS.PYTHON_SIMPLE);
    if (pyMatch) {
      rawResults.push({
        id: `py-${pyMatch[1]}`,
        name: 'Python',
        type: ToolType.PYTHON,
        version: pyMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System',
        detectedAt: now
      });
      return;
    }

    // --- GO ---
    const goDirMatch = cleanLine.match(PATTERNS.GO_DIR);
    if (goDirMatch && !line.includes('go version')) {
        // likely a folder listing
        rawResults.push({
        id: `go-dir-${goDirMatch[1]}`,
        name: 'Go SDK',
        type: ToolType.GO,
        version: goDirMatch[1],
        path: `~/sdk/go${goDirMatch[1]}`,
        isSystemDefault: false,
        source: 'SDK Manager',
        detectedAt: now
      });
      return;
    }
    const goMatch = cleanLine.match(PATTERNS.GO_SIMPLE);
    if (goMatch) {
      rawResults.push({
        id: `go-${goMatch[1]}`,
        name: 'Go',
        type: ToolType.GO,
        version: goMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System',
        detectedAt: now
      });
      return;
    }

    // --- NODE ---
    const nodeDirMatch = cleanLine.match(PATTERNS.NODE_DIR);
    if (nodeDirMatch) {
        // NVM folder listing
        rawResults.push({
            id: `node-nvm-${nodeDirMatch[1]}`,
            name: 'Node.js (NVM)',
            type: ToolType.NODE,
            version: nodeDirMatch[1],
            path: `~/.nvm/versions/node/v${nodeDirMatch[1]}`,
            isSystemDefault: false,
            source: 'NVM',
            detectedAt: now
        });
        return;
    }
    const nodeMatch = cleanLine.match(PATTERNS.NODE_SIMPLE);
    if (nodeMatch && !line.includes('Path:')) {
      rawResults.push({
        id: `node-${nodeMatch[1]}`,
        name: 'Node.js',
        type: ToolType.NODE,
        version: nodeMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System',
        detectedAt: now
      });
      return;
    }

    // --- EXPLICIT PATH INJECTION ---
    const pathMatch = cleanLine.match(PATTERNS.PATH_LINE);
    if (pathMatch && rawResults.length > 0) {
      // Assign this path to the most recently added tool if it matches generic path
      const lastTool = rawResults[rawResults.length - 1];
      if (lastTool.path === 'System Path (Detected)') {
        lastTool.path = pathMatch[1].trim();
      }
    }
  });

  return deduplicateTools(rawResults);
};

export const parsePipPackages = (input: string): PipPackage[] => {
  const lines = input.split('\n');
  const packages: PipPackage[] = [];
  
  // Standard Libs (Mock list for detection)
  const builtIns = new Set(['pip', 'setuptools', 'wheel', 'distribute']);

  lines.forEach(line => {
    const cleanLine = line.trim();
    // Skip header lines or empty lines
    if (!cleanLine || cleanLine.startsWith('Package') || cleanLine.startsWith('----')) return;

    // Split by whitespace: "numpy    1.21.5"
    const parts = cleanLine.split(/\s+/);
    if (parts.length >= 2) {
      const name = parts[0];
      const version = parts[1];
      
      packages.push({
        name,
        version,
        isBuiltIn: builtIns.has(name)
      });
    }
  });

  return packages;
};