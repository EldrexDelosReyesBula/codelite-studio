# CodeLite Studio ⚡

> High-performance, offline-first Web & Python WASM IDE built for modern browsers and mobile devices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)
![Pyodide](https://img.shields.io/badge/Python-3.11_WASM-3776AB.svg?logo=python)
![Monaco](https://img.shields.io/badge/Editor-Monaco-007ACC.svg?logo=visualstudiocode)

CodeLite Studio is a client-side Web IDE designed for developers. It enables fast Python 3.11 WASM execution, Matplotlib data visualization, live web application previewing with a flexible resizable split view, full offline IndexedDB project storage, project & file renaming, global code search, and ZIP archive import/export.

---

## 🌟 Key Features

- 🐍 **In-Browser Python 3.11 WASM Engine:**
  - Execute Python code directly in your browser powered by Pyodide.
  - Native support for `numpy` calculations and `matplotlib` graphical plot rendering rendered inline in the execution console.

- 🌐 **Live Web Application Preview:**
  - Build HTML5, CSS3, and JavaScript ES6+ web apps with instant live preview.
  - **Flexible Resizable Split View:** Drag the central split resizer handle to adjust the Editor and Web Preview ratio dynamically (20% to 80%).

- 🔍 **Global Project Code & File Search:**
  - Real-time search across file names and line-by-line code contents (`Ctrl+P`).
  - Click any search result to open the file and jump directly to that exact line of code.

- 💾 **Full Workspace & Storage Management:**
  - **Offline First:** All projects and files persist locally in IndexedDB using `idb`.
  - **Zero Leftover Cleanup:** Permanently delete single projects or wipe the entire workspace with custom confirmation dialogs.
  - **Project & File Renaming:** Double-click or click edit icons across the Header, Dashboard, or File Explorer to rename projects and files live.
  - **ZIP Import & Export:** Import project folders from `.zip` archives or export any project workspace into a zip package with one click.

- 📱 **Mobile & Desktop Optimized UX:**
  - **Collapsible Console Status Bar:** The console collapses into a minimal 28px bottom status bar when idle, giving over **80% vertical height** to the code editor.
  - **Collapsible Touch Symbol Bar:** Quick symbol keys (`{`, `}`, `(`, `)`, `;`, `def`, `=>`) above the mobile keyboard with an easy collapse toggle.
  - **Instant Tab Creation:** Click `+` right on the tab bar to create files instantly.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Core UI** | React 18 & Vite 6 | Fast modular UI component tree & build tooling |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code editing engine with syntax highlighting |
| **Python WASM** | Pyodide 0.25 | Python 3.11 runtime with NumPy & Matplotlib |
| **Icons** | Lucide React | Clean HIG & developer iconography |
| **Storage** | IndexedDB (`idb`) | Browser database persistent workspace storage |
| **Archiving** | JSZip & FileSaver | ZIP archive extraction and generation |

---

## 📁 Repository Structure

```text
codelite-studio/
├── public/
│   ├── assets/              # App icons, logos, and favicons
│   └── manifest.json        # PWA Web Manifest configuration
├── src/
│   ├── components/
│   │   ├── CheatSheetModal.jsx   # Developer code snippets library
│   │   ├── CommandPalette.jsx    # Global project search & IDE command launcher
│   │   ├── ConfirmModal.jsx      # Styled confirmation dialog for deletions
│   │   ├── ConsoleDrawer.jsx     # Collapsible execution console & plot renderer
│   │   ├── DashboardView.jsx     # Main workspace dashboard & project cards
│   │   ├── DocumentationView.jsx # API & syntax reference guide
│   │   ├── EditorArea.jsx        # Monaco Editor integration & settings
│   │   ├── FileExplorer.jsx      # Sidebar file/folder tree & CRUD controls
│   │   ├── HeaderNav.jsx         # App navigation header & active project badge
│   │   ├── NewProjectModal.jsx   # Project creation dialog
│   │   ├── RenameModal.jsx       # Project & file rename dialog
│   │   ├── TabBar.jsx            # Open file tabs with quick + file creator
│   │   ├── TouchBar.jsx          # Mobile touch symbol bar
│   │   ├── WebPreview.jsx        # Fluid responsive iframe live web preview
│   │   └── ZipImportModal.jsx    # ZIP archive import dialog
│   ├── services/
│   │   ├── pythonRunner.js       # Pyodide WASM setup & Matplotlib plot hook
│   │   └── storageManager.js     # IndexedDB CRUD & project persistence
│   ├── styles/
│   │   └── theme.css             # Design tokens & responsive CSS rules
│   ├── App.jsx                   # Main layout state container
│   └── main.jsx                  # React application entry point
├── index.html                    # Root HTML document & Pyodide CDN tag
├── package.json                  # Dependencies and scripts
└── vite.config.js                # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EldrexDelosReyesBula/codelite-studio.git
   cd codelite-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `F5` | Run Python script / Refresh Web Preview |
| `Ctrl+B` / `Cmd+B` | Toggle File Explorer Sidebar |
| `Ctrl+\` / `Cmd+\` | Toggle Live Web Preview (Web Projects) |
| `Ctrl+P` / `Cmd+P` | Global Project Code & File Search |
| `Ctrl+/` / `Cmd+/` | Toggle Line Comment in Editor |
| `F11` | Toggle Zen / Focus Mode |

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
