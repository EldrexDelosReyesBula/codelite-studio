# Changelog

All notable changes to **CodeLite Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-08-13

### Added
- **Mobile-first responsive refinements:** critical header controls remain visible on smaller screens, including Run, menu access, and project switching.
- **Touch-friendly action UX:** edit and delete actions no longer rely on hover-only behavior, making project and file management usable on phones.
- **Auto-save on leave:** pending edits now flush automatically when the app is hidden, refreshed, or closed to prevent losing work.
- **Non-blocking Python execution:** Python runs via a dedicated worker so the app stays responsive instead of freezing while scripts execute.
- **Error and warning highlighting:** execution console now visually distinguishes errors, warnings, and successful output.
- **Fluid UI motion polish:** subtle transitions and easing improve perceived responsiveness without heavy animation cost.
- **Monaco editor performance tuning:** large-file editing is lighter, with reduced suggestion churn and better compatibility on mobile devices.
- **Pyodide background pre-loading:** Python engine now loads silently on app startup, eliminating the multi-second delay on first code run.
- **Improved SEO and discoverability:** added structured metadata, Open Graph tags, Twitter cards, and sitemap for better Google indexing and social previews.
- **Web dev intellisense:** HTML, CSS, and JavaScript now get proper autocomplete suggestions including tags, attributes, properties, and keywords.

### Fixed
- **Pyodide plot backend crash:** fixed the canvas-related Matplotlib crash by switching to a safe backend and guarding `tight_layout()`.
- **Worker compatibility bug:** replaced unsupported `importScripts()` usage in module workers with a compatible browser-safe execution path.
- **Responsive layout regressions:** fixed small-screen header collapse and control hiding issues.
- **Console resizing usability:** terminal drawer can be dragged more reliably on touch and pointer devices.

### Improved
- **Autocomplete support:** added lightweight Python keyword and common library suggestions in the editor to improve coding flow.
- **Execution reliability:** clearer logs for warnings, failures, and completion states keep debugging easier on the go.
- **Service worker caching:** Pyodide WASM files now use cache-first strategy for instant startup on return visits.

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
