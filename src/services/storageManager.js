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
      console.error('IndexedDB could not be opened; project data cannot be persisted.', err);
      dbPromise = null;
      throw err;
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
    throw err;
  }
}

export async function getProjects() {
  try {
    const db = await getDB();
    if (db) {
      const projList = await db.getAll('projects');
      memoryProjects = projList;
      return projList;
    }
  } catch (err) {
    console.warn('getProjects error:', err);
    throw err;
  }
  return memoryProjects;
}

export async function getProjectFiles(projectId) {
  try {
    const db = await getDB();
    if (db) {
      const allFiles = await db.getAll('files');
      const projectFiles = allFiles
        .filter(file => file.projectId === projectId)
        .map(file => ({
          ...file,
          name: file.path.startsWith(`${projectId}/`)
            ? file.path.slice(projectId.length + 1)
            : file.name
        }));
      memoryFiles = memoryFiles.filter(file => file.projectId !== projectId).concat(projectFiles);
      return projectFiles;
    }
  } catch (err) {
    console.warn('getProjectFiles error:', err);
    throw err;
  }
  return memoryFiles.filter(f => f.projectId === projectId);
}

export async function saveFile(path, content, projectId) {
  const fileName = path.startsWith(`${projectId}/`)
    ? path.slice(projectId.length + 1)
    : path.split('/').pop();
  const fileObj = {
    path,
    projectId,
    name: fileName,
    type: 'file',
    content,
    lastModified: Date.now()
  };

  try {
    const db = await getDB();
    if (db) {
      await db.put('files', fileObj);
    }
  } catch (err) {
    console.error(`Unable to persist file "${path}".`, err);
    throw err;
  }

  const idx = memoryFiles.findIndex(f => f.path === path);
  if (idx >= 0) memoryFiles[idx] = fileObj;
  else memoryFiles.push(fileObj);

  return fileObj;
}

export async function deleteFile(path) {
  try {
    const db = await getDB();
    if (db) {
      await db.delete('files', path);
    }
  } catch (err) {
    console.error(`Unable to delete file "${path}".`, err);
    throw err;
  }
  memoryFiles = memoryFiles.filter(f => f.path !== path);
}

export async function renameFile(oldPath, newPath, projectId) {
  const name = newPath.startsWith(`${projectId}/`)
    ? newPath.slice(projectId.length + 1)
    : newPath.split('/').pop();
  let existingContent = memoryFiles.find(f => f.path === oldPath)?.content || '';

  try {
    const db = await getDB();
    if (db) {
      const transaction = db.transaction('files', 'readwrite');
      const existing = await transaction.store.get(oldPath);
      if (!existing) throw new Error(`Cannot rename missing file "${oldPath}".`);
      if (await transaction.store.get(newPath)) {
        throw new Error(`A file named "${name}" already exists.`);
      }
      const updatedFile = {
        ...existing,
        path: newPath,
        name,
        lastModified: Date.now()
      };
      await transaction.store.delete(oldPath);
      await transaction.store.put(updatedFile);
      await transaction.done;
      memoryFiles = memoryFiles.filter(f => f.path !== oldPath);
      memoryFiles.push(updatedFile);
      return updatedFile;
    }
  } catch (err) {
    console.error(`Unable to rename file "${oldPath}".`, err);
    throw err;
  }

  const updatedFile = {
    path: newPath,
    projectId,
    name,
    type: 'file',
    content: existingContent,
    lastModified: Date.now()
  };
  memoryFiles = memoryFiles.filter(f => f.path !== oldPath);
  memoryFiles.push(updatedFile);
  return updatedFile;
}

export async function createNewProject(name, type, importedFiles) {
  const projectId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const project = {
    id: projectId,
    name,
    type,
    lastOpened: Date.now()
  };

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

  initialFiles = (importedFiles ?? initialFiles).map(file => ({
    ...file,
    path: `${projectId}/${file.name}`,
    projectId,
    type: 'file'
  }));

  try {
    const db = await getDB();
    if (db) {
      const transaction = db.transaction(['projects', 'files'], 'readwrite');
      await transaction.objectStore('projects').put(project);
      for (const file of initialFiles) await transaction.objectStore('files').put(file);
      await transaction.done;
    }
  } catch (err) {
    console.error(`Unable to create project "${name}".`, err);
    throw err;
  }

  memoryProjects.push(project);
  memoryFiles.push(...initialFiles);
  localStorage.removeItem('codelite_storage_wiped');

  return { project, files: initialFiles };
}

export async function renameProject(projectId, newName) {
  try {
    const db = await getDB();
    if (db) {
      const p = await db.get('projects', projectId);
      if (p) {
        p.name = newName;
        await db.put('projects', p);
        const memoryProject = memoryProjects.find(project => project.id === projectId);
        if (memoryProject) memoryProject.name = newName;
        return p;
      }
    }
  } catch (err) {
    console.error(`Unable to rename project "${projectId}".`, err);
    throw err;
  }

  const project = memoryProjects.find(item => item.id === projectId);
  if (project) project.name = newName;
  return project;
}

export async function deleteProject(projectId) {
  let remainingProjects = memoryProjects.length;
  try {
    const db = await getDB();
    if (db) {
      const transaction = db.transaction(['projects', 'files'], 'readwrite');
      const projectsStore = transaction.objectStore('projects');
      await projectsStore.delete(projectId);
      const files = await transaction.objectStore('files').index('projectId').getAllKeys(projectId);
      for (const path of files) await transaction.objectStore('files').delete(path);
      remainingProjects = await projectsStore.count();
      await transaction.done;
    }
  } catch (err) {
    console.error(`Unable to delete project "${projectId}".`, err);
    throw err;
  }

  memoryProjects = memoryProjects.filter(project => project.id !== projectId);
  memoryFiles = memoryFiles.filter(file => file.projectId !== projectId);
  if (remainingProjects === 0) localStorage.setItem('codelite_storage_wiped', 'true');
}

export async function deleteAllProjects() {
  try {
    const db = await getDB();
    if (db) {
      const transaction = db.transaction(['projects', 'files'], 'readwrite');
      await transaction.objectStore('projects').clear();
      await transaction.objectStore('files').clear();
      await transaction.done;
    }
  } catch (err) {
    console.error('Unable to delete all projects.', err);
    throw err;
  }

  memoryProjects = [];
  memoryFiles = [];
  localStorage.setItem('codelite_storage_wiped', 'true');
}

// Extract uploaded ZIP archive into new project workspace
export async function importZipFile(file) {
  const zipName = file.name.replace(/\.zip$/i, '');
  const zip = await JSZip.loadAsync(file);
  const entries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
  const firstSegments = entries.map(([path]) => path.replace(/\\/g, '/').split('/')[0]);
  const rootFolder = firstSegments.length > 0 &&
    firstSegments.every(segment => segment === firstSegments[0]) &&
    entries.every(([path]) => path.replace(/\\/g, '/').split('/').length > 1)
    ? firstSegments[0]
    : null;
  const importedFiles = [];

  for (const [archivePath, entry] of entries) {
    const normalizedPath = archivePath.replace(/\\/g, '/');
    const segments = normalizedPath.split('/').filter(Boolean);
    if (segments.some(segment => segment === '..') || normalizedPath.startsWith('/')) {
      throw new Error(`The ZIP archive contains an unsafe path: "${archivePath}".`);
    }

    const pathSegments = rootFolder && segments[0] === rootFolder ? segments.slice(1) : segments;
    if (pathSegments.length === 0 || pathSegments.includes('node_modules')) continue;
    const name = pathSegments.join('/');
    if (/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|pdf|exe|dll)$/i.test(name)) continue;
    importedFiles.push({ name, content: await entry.async('string') });
  }

  if (importedFiles.length === 0) {
    throw new Error('The ZIP archive does not contain any supported project files.');
  }

  const projectType = importedFiles.some(entry => entry.name.endsWith('.py')) ? 'python' : 'web';
  return createNewProject(zipName, projectType, importedFiles);
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
