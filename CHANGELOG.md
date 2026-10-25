# Changelog

All notable changes to **CodeLite Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.2] - 2026-10-25

### Added
- **Code formatting:** format HTML, CSS, JavaScript, TypeScript, JSON, and Markdown on demand or after paste; formatter plugins load only when needed.
- **Build-time server-rendered SEO landing page:** production HTML now includes readable page content before client-side IDE startup, plus Open Graph, Twitter, canonical, and structured application metadata.
- **Mobile clipboard controls:** copy selected code or the full file and paste code from the device clipboard.
- **Repository hygiene:** ignore the local `skills/` directory and common generated, cache, test, and deployment artifacts.

### Fixed
- **Active HTML preview:** run the selected HTML file by its current filename and only include project CSS/JavaScript referenced from that document.
- **Editor and console resizing:** use pointer capture and cancellation, keyboard-adjustable splitter handles, and bounded resizing without transition lag.
- **Web preview assets:** resolve linked project stylesheets and scripts relative to the active HTML file.
- **Mobile text selection:** remove the global selection lock that prevented normal code selection and clipboard workflows.

### Improved
- **Navigation and editor usability:** clearer mobile editor controls, smooth editor scrolling/caret movement, and accessible splitter semantics.
- **Small-screen polish:** consistent touch targets, compact console controls, horizontal-scroll cues, and quieter editor whitespace indicators on mobile.
- **Action feedback:** copy, paste, and formatting now show clear success, informational, or error states; mobile search uses a more usable bottom-sheet layout.
- **SEO metadata:** align structured metadata with the current release and improve social preview image descriptions.

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
