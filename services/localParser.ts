import { EnvTool, ToolType, PipPackage, Platform } from '../types';

// Regex patterns for different tools
const PATTERNS = {
  // Matches: "openjdk 17.0.2 2022-01-18" or "java version "1.8.0_151""
  JAVA: /(?:java|openjdk) (?:version )?"?(\d+(?:\.\d+)*(?:[._]\d+)?)/i,
  
  // Matches: "Python 3.9.12"
  PYTHON: /Python (\d+\.\d+\.\d+)/i,
  
  // Matches: "go version go1.17.6 darwin/amd64"
  GO: /go version go(\d+\.\d+(?:\.\d+)?)/i,
  
  // Matches: "v16.13.0" (Node output)
  NODE: /v(\d+\.\d+\.\d+)/,
  
  // Brew list output e.g. "python@3.9 3.9.12"
  BREW: /^([a-zA-Z0-9@\-_]+)\s+(\d+(?:\.\d+)+)/
};

export const parseEnvironmentLogs = (input: string, platform: Platform): EnvTool[] => {
  const lines = input.split('\n');
  const results: EnvTool[] = [];
  const now = new Date().toISOString();

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // JAVA DETECTION
    const javaMatch = cleanLine.match(PATTERNS.JAVA);
    if (javaMatch && !cleanLine.includes('javac')) { // Avoid javac compiler
      results.push({
        id: `java-${javaMatch[1]}-${Math.random().toString(36).substr(2, 5)}`,
        name: cleanLine.includes('openjdk') ? 'OpenJDK' : 'Java SE',
        type: ToolType.JAVA,
        version: javaMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System/Manual',
        detectedAt: now
      });
      return;
    }

    // PYTHON DETECTION
    const pyMatch = cleanLine.match(PATTERNS.PYTHON);
    if (pyMatch) {
      results.push({
        id: `python-${pyMatch[1]}-${Math.random().toString(36).substr(2, 5)}`,
        name: 'Python',
        type: ToolType.PYTHON,
        version: pyMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System/Manual',
        detectedAt: now
      });
      return;
    }

    // GO DETECTION
    const goMatch = cleanLine.match(PATTERNS.GO);
    if (goMatch) {
      results.push({
        id: `go-${goMatch[1]}`,
        name: 'Go',
        type: ToolType.GO,
        version: goMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System/Manual',
        detectedAt: now
      });
      return;
    }

    // NODE DETECTION
    const nodeMatch = cleanLine.match(PATTERNS.NODE);
    if (nodeMatch) {
      results.push({
        id: `node-${nodeMatch[1]}`,
        name: 'Node.js',
        type: ToolType.NODE,
        version: nodeMatch[1],
        path: 'System Path (Detected)',
        isSystemDefault: true,
        source: 'System/Manual',
        detectedAt: now
      });
      return;
    }

    // BREW LIST PARSING (Common for Mac)
    // Looking for lines like "openjdk 17.0.2" or "python@3.9 3.9.12"
    if (cleanLine.match(/^[a-z]/)) {
      const parts = cleanLine.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const ver = parts[1];
        
        let type = ToolType.UNKNOWN;
        if (name.includes('jdk') || name.includes('java')) type = ToolType.JAVA;
        else if (name.includes('python')) type = ToolType.PYTHON;
        else if (name.includes('go')) type = ToolType.GO;
        else if (name.includes('node')) type = ToolType.NODE;

        if (type !== ToolType.UNKNOWN) {
          results.push({
            id: `${type.toLowerCase()}-${ver}-${Math.random().toString(36).substr(2, 4)}`,
            name: name,
            type: type,
            version: ver,
            path: `/usr/local/Cellar/${name}/${ver}`,
            isSystemDefault: false,
            source: 'Homebrew',
            detectedAt: now
          });
        }
      }
    }
  });

  return results;
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