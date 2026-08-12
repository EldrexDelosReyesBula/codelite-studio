# Changelog

All notable changes to **CodeLite Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-12

### Added
- **Initial Release of CodeLite Studio IDE:** High-performance, offline-first Web & Python WASM Cloud/Browser IDE.
- **Python 3.11 WASM Engine:** In-browser Python 3.11 execution powered by Pyodide with NumPy calculations and inline Matplotlib graphical plot rendering.
- **Web Live Application Preview:** HTML5, CSS3, and JS ES6+ live preview with real-time console interceptor.
- **Flexible Draggable Web Preview Resizer:** Draggable split handle between Editor and Web Preview for customizable 20% to 80% split width.
- **Global Project Code & File Search:** Real-time search across file names and line-by-line code contents (`Ctrl+P`) with direct line-level navigation.
- **Full Project & File Storage Control:** Complete offline IndexedDB project storage with permanent project deletion and workspace wipe capabilities.
- **Project & File Renaming:** Live project renaming across HeaderNav, Dashboard, and File Explorer, and file renaming in file tree rows.
- **Custom Confirmation Modal (`ConfirmModal`):** Styled warning/danger dialogs for project deletion and workspace resets.
- **Collapsible Console Status Bar:** Console drawer collapses to a 28px bottom status bar when idle, auto-expanding on code execution to maximize vertical code editing space.
- **Collapsible Touch Symbol Toolbar:** Quick symbol keys (`{`, `}`, `(`, `)`, `;`, `def`, `=>`) above the mobile keyboard with a collapse toggle.
- **Instant TabBar File Creation:** `+` button directly on the editor tab bar to create files instantly.
- **Client-Side ZIP Archive Import & Export:** Import project folders from `.zip` archives or export any workspace into a `.zip` package.
