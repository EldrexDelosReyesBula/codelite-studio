import { openDB } from 'idb';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const DB_NAME = 'CodeForgeMobileDB';
const DB_VERSION = 1;

// Developer Default Projects
const DEFAULT_PYTHON_PROJECT = {
  id: 'proj-python-main',
  name: 'Python Workspace',
  type: 'python',
  lastOpened: Date.now()
};

const DEFAULT_PYTHON_FILES = [
  {
    path: 'proj-python-main/main.py',
    projectId: 'proj-python-main',
    name: 'main.py',
    type: 'file',
    content: `# CodeLite Studio — Python 3.11 WASM Engine
import sys
import math

def calculate_stats(values):
    n = len(values)
    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / n
    std_dev = math.sqrt(variance)
    return {"mean": round(mean, 2), "std_dev": round(std_dev, 2)}

dataset = [12.5, 18.2, 14.8, 22.1, 19.4, 25.0]
stats = calculate_stats(dataset)

print("Python Engine:", sys.version.split()[0])
print("Platform Target:", sys.platform)
print(f"Dataset Summary ({len(dataset)} items):", stats)
`
  },
  {
    path: 'proj-python-main/data_vis.py',
    projectId: 'proj-python-main',
    name: 'data_vis.py',
    type: 'file',
    content: `# Data Analytics & Visualization
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y_sin = np.sin(x)
y_cos = np.cos(x)

plt.figure(figsize=(7, 4.5))
plt.plot(x, y_sin, label='Signal Alpha', color='#007ACC', linewidth=2)
plt.plot(x, y_cos, label='Signal Beta', color='#4EC9B0', linewidth=2, linestyle='--')
plt.title('Performance Metrics Spectrum', fontsize=12, fontweight='bold')
plt.xlabel('Timestamp (ms)')
plt.ylabel('Amplitude')
plt.grid(True, alpha=0.25)
plt.legend()
plt.tight_layout()
plt.show()

print("Plot output rendered successfully.")
`
  }
];

const DEFAULT_WEB_PROJECT = {
  id: 'proj-web-main',
  name: 'Web Application',
  type: 'web',
  lastOpened: Date.now() - 1000
};

const DEFAULT_WEB_FILES = [
  {
    path: 'proj-web-main/index.html',
    projectId: 'proj-web-main',
    name: 'index.html',
    type: 'file',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Application</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app-container">
    <header class="app-header">
      <div class="logo">⚡ CodeLite Studio</div>
      <p>High-performance Browser IDE</p>
    </header>

    <section class="card">
      <h2>System Status</h2>
      <div id="statusBadge" class="status-badge">Initializing...</div>
      <div className="metrics">
        <button id="pingBtn" class="btn">Execute Benchmark</button>
        <p id="outputLog">Ready for input.</p>
      </div>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>
`
  },
  {
    path: 'proj-web-main/style.css',
    projectId: 'proj-web-main',
    name: 'style.css',
    type: 'file',
    content: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f1117;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e6edf3;
}

.app-container {
  width: 90%;
  max-width: 440px;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #58a6ff;
}

.app-header p {
  color: #8b949e;
  font-size: 13px;
  margin-top: 4px;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.card h2 {
  margin-top: 0;
  font-size: 18px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(56, 139, 253, 0.15);
  color: #58a6ff;
  border: 1px solid rgba(56, 139, 253, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.btn {
  width: 100%;
  background: #238636;
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn:hover {
  background: #2ea043;
}

#outputLog {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  color: #8b949e;
  margin-top: 12px;
}
`
  },
  {
    path: 'proj-web-main/script.js',
    projectId: 'proj-web-main',
    name: 'script.js',
    type: 'file',
    content: `document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('statusBadge');
  const pingBtn = document.getElementById('pingBtn');
  const outputLog = document.getElementById('outputLog');

  if (statusBadge) {
    statusBadge.textContent = 'System Online';
    statusBadge.style.color = '#3fb950';
    statusBadge.style.borderColor = '#238636';
  }

  let count = 0;
  if (pingBtn && outputLog) {
    pingBtn.addEventListener('click', () => {
      count++;
      const latency = Math.floor(Math.random() * 15) + 5;
      outputLog.textContent = \`[Run #\${count}] Execution complete in \${latency}ms\`;
      console.log(\`[CodeLite] Execution #\${count} finished in \${latency}ms\`);
    });
  }
});
`
  }
];

// Memory store fallback
let memoryProjects = [DEFAULT_PYTHON_PROJECT, DEFAULT_WEB_PROJECT];
let memoryFiles = [...DEFAULT_PYTHON_FILES, ...DEFAULT_WEB_FILES];

let dbPromise = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'path' });
          fileStore.createIndex('projectId', 'projectId', { unique: false });
        }
      }
    }).catch(err => {
      console.warn('IndexedDB opening failed, using memory store fallback:', err);
      return null;
    });
  }
  return dbPromise;
}

export async function initializeStorage() {
  try {
    const isWiped = localStorage.getItem('codelite_storage_wiped') === 'true';
    const db = await getDB();
    if (!db) return;
    const existing = await db.getAll('projects');
    if (existing.length === 0 && !isWiped) {
      await db.put('projects', DEFAULT_PYTHON_PROJECT);
      await db.put('projects', DEFAULT_WEB_PROJECT);
      
      for (const f of DEFAULT_PYTHON_FILES) {
        await db.put('files', f);
      }
      for (const f of DEFAULT_WEB_FILES) {
        await db.put('files', f);
      }
    } else if (existing.length > 0) {
      localStorage.removeItem('codelite_storage_wiped');
    }
  } catch (err) {
    console.warn('initializeStorage error:', err);
  }
}

export async function getProjects() {
  try {
    const db = await getDB();
    if (db) {
      const projList = await db.getAll('projects');
      if (projList) return projList;
    }
  } catch (err) {
    console.warn('getProjects error:', err);
  }
  return memoryProjects;
}

export async function getProjectFiles(projectId) {
  try {
    const db = await getDB();
    if (db) {
      const allFiles = await db.getAll('files');
      const filtered = allFiles.filter(f => f.projectId === projectId);
      if (filtered.length > 0) return filtered;
    }
  } catch (err) {
    console.warn('getProjectFiles error:', err);
  }
  return memoryFiles.filter(f => f.projectId === projectId);
}

export async function saveFile(path, content, projectId) {
  const fileName = path.split('/').pop();
  const fileObj = {
    path,
    projectId,
    name: fileName,
    type: 'file',
    content,
    lastModified: Date.now()
  };

  const idx = memoryFiles.findIndex(f => f.path === path);
  if (idx >= 0) {
    memoryFiles[idx] = fileObj;
  } else {
    memoryFiles.push(fileObj);
  }

  try {
    const db = await getDB();
    if (db) {
      await db.put('files', fileObj);
    }
  } catch (err) {
    console.warn('saveFile error:', err);
  }

  return fileObj;
}

export async function deleteFile(path) {
  memoryFiles = memoryFiles.filter(f => f.path !== path);
  try {
    const db = await getDB();
    if (db) {
      await db.delete('files', path);
    }
  } catch (err) {
    console.warn('deleteFile error:', err);
  }
}

export async function renameFile(oldPath, newPath, projectId) {
  const newFileName = newPath.split('/').pop();
  let existingContent = '';

  const idx = memoryFiles.findIndex(f => f.path === oldPath);
  if (idx >= 0) {
    existingContent = memoryFiles[idx].content || '';
    memoryFiles.splice(idx, 1);
  }

  const updatedFile = {
    path: newPath,
    projectId,
    name: newFileName,
    type: 'file',
    content: existingContent,
    lastModified: Date.now()
  };

  memoryFiles.push(updatedFile);

  try {
    const db = await getDB();
    if (db) {
      const existing = await db.get('files', oldPath);
      if (existing) {
        updatedFile.content = existing.content || existingContent;
      }
      await db.delete('files', oldPath);
      await db.put('files', updatedFile);
    }
  } catch (err) {
    console.warn('renameFile error:', err);
  }

  return updatedFile;
}

export async function createNewProject(name, type) {
  const projectId = `proj-${Date.now()}`;
  const project = {
    id: projectId,
    name,
    type,
    lastOpened: Date.now()
  };

  memoryProjects.push(project);
  localStorage.removeItem('codelite_storage_wiped');

  let initialFiles = [];
  if (type === 'python') {
    initialFiles = [
      {
        path: `${projectId}/main.py`,
        projectId,
        name: 'main.py',
        type: 'file',
        content: '# Write Python 3.11 code here\nprint("CodeLite Studio Project Ready")\n'
      }
    ];
  } else {
    initialFiles = [
      {
        path: `${projectId}/index.html`,
        projectId,
        name: 'index.html',
        type: 'file',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Application</title>\n  <style>body { background: #0f1117; color: #e6edf3; font-family: sans-serif; padding: 20px; }</style>\n</head>\n<body>\n  <h1>Web Application</h1>\n  <script src="script.js"></script>\n</body>\n</html>'
      },
      {
        path: `${projectId}/script.js`,
        projectId,
        name: 'script.js',
        type: 'file',
        content: 'console.log("Web Application initialized.");'
      }
    ];
  }

  for (const f of initialFiles) {
    memoryFiles.push(f);
  }

  try {
    const db = await getDB();
    if (db) {
      await db.put('projects', project);
      for (const f of initialFiles) {
        await db.put('files', f);
      }
    }
  } catch (err) {
    console.warn('createNewProject error:', err);
  }

  return { project, files: initialFiles };
}

export async function renameProject(projectId, newName) {
  const proj = memoryProjects.find(p => p.id === projectId);
  if (proj) {
    proj.name = newName;
  }

  try {
    const db = await getDB();
    if (db) {
      const p = await db.get('projects', projectId);
      if (p) {
        p.name = newName;
        await db.put('projects', p);
      }
    }
  } catch (err) {
    console.warn('renameProject error:', err);
  }

  return proj;
}

export async function deleteProject(projectId) {
  memoryProjects = memoryProjects.filter(p => p.id !== projectId);
  memoryFiles = memoryFiles.filter(f => f.projectId !== projectId);

  if (memoryProjects.length === 0) {
    localStorage.setItem('codelite_storage_wiped', 'true');
  }

  try {
    const db = await getDB();
    if (db) {
      await db.delete('projects', projectId);
      const allFiles = await db.getAll('files');
      for (const f of allFiles) {
        if (f.projectId === projectId) {
          await db.delete('files', f.path);
        }
      }
      const remainingProjects = await db.getAll('projects');
      if (remainingProjects.length === 0) {
        localStorage.setItem('codelite_storage_wiped', 'true');
      }
    }
  } catch (err) {
    console.warn('deleteProject error:', err);
  }
}

export async function deleteAllProjects() {
  memoryProjects = [];
  memoryFiles = [];
  localStorage.setItem('codelite_storage_wiped', 'true');

  try {
    const db = await getDB();
    if (db) {
      await db.clear('projects');
      await db.clear('files');
    }
  } catch (err) {
    console.warn('deleteAllProjects error:', err);
  }
}

// Extract uploaded ZIP archive into new project workspace
export async function importZipFile(file) {
  const zipName = file.name.replace(/\.zip$/i, '');
  const zip = await JSZip.loadAsync(file);

  let projectType = 'web';
  const fileNames = Object.keys(zip.files);

  if (fileNames.some(f => f.endsWith('.py'))) {
    projectType = 'python';
  }

  const { project } = await createNewProject(zipName, projectType);
  const importedFiles = [];

  for (const relativePath of fileNames) {
    const zipEntry = zip.files[relativePath];
    if (zipEntry.dir) continue;

    const fileName = relativePath.split('/').pop();
    if (!fileName || fileName.startsWith('.')) continue;

    if (/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|pdf|exe|dll)$/i.test(fileName)) {
      continue;
    }

    const content = await zipEntry.async('string');
    const filePath = `${project.id}/${relativePath}`;

    const fileObj = await saveFile(filePath, content, project.id);
    importedFiles.push(fileObj);
  }

  return { project, files: importedFiles };
}

// Open native directory using File System Access API
export async function openNativeFolder() {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API is not supported in this browser environment.');
  }

  const dirHandle = await window.showDirectoryPicker();
  const folderName = dirHandle.name;
  const { project } = await createNewProject(folderName, 'web');
  const filesRead = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const text = await file.text();
      const fileObj = await saveFile(`${project.id}/${file.name}`, text, project.id);
      filesRead.push(fileObj);
    }
  }

  return { project, files: filesRead };
}

export async function exportProjectZip(project, files) {
  const zip = new JSZip();
  const folder = zip.folder(project.name);

  files.forEach((file) => {
    folder.file(file.name, file.content || '');
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${project.name.toLowerCase().replace(/\s+/g, '_')}.zip`);
}
