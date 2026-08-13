import React, { useState, useEffect, useRef } from 'react';

// Views
import DashboardView   from './components/DashboardView';
import HeaderNav       from './components/HeaderNav';
import FileExplorer    from './components/FileExplorer';
import TabBar          from './components/TabBar';
import EditorArea      from './components/EditorArea';
import TouchBar        from './components/TouchBar';
import WebPreview      from './components/WebPreview';
import ConsoleDrawer   from './components/ConsoleDrawer';

// Modals
import CommandPalette  from './components/CommandPalette';
import ZipImportModal  from './components/ZipImportModal';
import NewProjectModal from './components/NewProjectModal';
import RenameModal     from './components/RenameModal';
import ConfirmModal    from './components/ConfirmModal';

import {
  initializeStorage,
  getProjects,
  getProjectFiles,
  saveFile,
  deleteFile,
  renameFile,
  createNewProject,
  renameProject,
  deleteProject,
  deleteAllProjects,
  exportProjectZip
} from './services/storageManager';
import { runPythonCode, preloadPyodideInBackground } from './services/pythonRunner';

export default function App() {
  // ── View: 'dashboard' | 'editor'
  const [view, setView] = useState('dashboard');

  // ── Project & file state
  const [projects,       setProjects]       = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [files,          setFiles]          = useState([]);
  const [openFiles,      setOpenFiles]      = useState([]);
  const [activeFile,     setActiveFile]     = useState(null);

  // ── UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 768);
  const [splitView,        setSplitView]         = useState(false);
  const [splitRatio,       setSplitRatio]        = useState(50); // percentage for editor
  const [consoleVisible,   setConsoleVisible]    = useState(false);
  const [logs,  setLogs]  = useState([]);
  const [plots, setPlots] = useState([]);
  const [isRunning,        setIsRunning]         = useState(false);

  // ── Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [zipImportOpen,      setZipImportOpen]      = useState(false);
  const [newProjectOpen,     setNewProjectOpen]     = useState(false);

  // ── Rename Modal state
  const [renameModalOpen,  setRenameModalOpen]  = useState(false);
  const [renameTarget,     setRenameTarget]     = useState(null); // { type: 'project'|'file', item: obj }

  // ── Confirm Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig,    setConfirmConfig]    = useState({ title: '', message: '', confirmText: '', action: null });

  const editorRef        = useRef(null);
  const autoSaveTimer    = useRef(null);
  const isDraggingSplit  = useRef(false);
  const splitContainerRef = useRef(null);
  const MAX_LOGS = 200;

  const flushPendingAutosave = async () => {
    if (!currentProject || openFiles.length === 0) return;

    await Promise.allSettled(
      openFiles.map(file => saveFile(file.path, file.content ?? '', currentProject.id))
    );
  };

  // Bootstrap
  useEffect(() => {
    (async () => {
      await initializeStorage();
      const list = await getProjects();
      setProjects(list || []);
      // Start Pyodide pre-load in background so it's ready when user runs code
      preloadPyodideInBackground();
    })();
  }, []);

  // Draggable Resizable Split Handle between Editor & Web Preview
  const handleSplitDragStart = (e) => {
    isDraggingSplit.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingSplit.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const x = clientX - rect.left;
      const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setSplitRatio(pct);
    };
    const onEnd = () => { isDraggingSplit.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend',  onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onEnd);
    };
  }, []);

  useEffect(() => {
    const persistOnLeave = () => {
      clearTimeout(autoSaveTimer.current);
      flushPendingAutosave();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        persistOnLeave();
      }
    };

    window.addEventListener('beforeunload', persistOnLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', persistOnLeave);

    return () => {
      window.removeEventListener('beforeunload', persistOnLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', persistOnLeave);
    };
  }, [currentProject, openFiles]);

  // Open project → switch to editor
  const openProject = async (project) => {
    setCurrentProject(project);
    const projFiles = await getProjectFiles(project.id);
    setFiles(projFiles);
    setOpenFiles(projFiles);
    setActiveFile(projFiles[0] ?? null);
    setSplitView(project.type === 'web');
    setConsoleVisible(false);
    setView('editor');
    if (window.innerWidth <= 768) setSidebarCollapsed(true);
  };

  const handleSelectProjectById = (id) => {
    const p = projects.find(x => x.id === id);
    if (p) openProject(p);
  };

  // Tabs
  const handleSelectFile = (file) => {
    setActiveFile(file);
    if (!openFiles.some(f => f.path === file.path)) {
      setOpenFiles(prev => [...prev, file]);
    }
  };

  const handleCloseTab = (filePath) => {
    const remaining = openFiles.filter(f => f.path !== filePath);
    setOpenFiles(remaining);
    if (activeFile?.path === filePath) {
      setActiveFile(remaining[remaining.length - 1] ?? null);
    }
  };

  // Quick New File on TabBar
  const handleQuickNewFile = async () => {
    if (!currentProject) return;
    const defaultExt = currentProject.type === 'python' ? 'py' : 'js';
    const num = files.length + 1;
    const fileName = `file_${num}.${defaultExt}`;
    await handleCreateFile(fileName);
  };

  // Code changes
  const handleCodeChange = (newContent) => {
    if (!activeFile || !currentProject) return;
    if (activeFile.content === newContent) return;

    const updated = { ...activeFile, content: newContent };
    setActiveFile(updated);
    setFiles(prev     => prev.map(f => f.path === updated.path ? updated : f));
    setOpenFiles(prev => prev.map(f => f.path === updated.path ? updated : f));

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await saveFile(updated.path, newContent, currentProject.id);
    }, 600);
  };

  // File CRUD
  const handleCreateFile = async (fileName) => {
    if (!currentProject) return;
    const newPath = `${currentProject.id}/${fileName}`;
    const displayName = fileName.split('/').pop();
    const newFile = await saveFile(newPath, '', currentProject.id);
    const fileWithName = { ...newFile, name: fileName };
    setFiles(prev => [...prev, fileWithName]);
    if (!displayName.startsWith('.gitkeep')) {
      setOpenFiles(prev => [...prev, fileWithName]);
      setActiveFile(fileWithName);
    }
  };

  const handleDeleteFile = async (filePath) => {
    await deleteFile(filePath);
    setFiles(prev => prev.filter(f => f.path !== filePath));
    handleCloseTab(filePath);
  };

  const handleOpenRenameFile = (file) => {
    setRenameTarget({ type: 'file', item: file });
    setRenameModalOpen(true);
  };

  // Project CRUD
  const handleCreateNewProject = async (name, type) => {
    const { project } = await createNewProject(name, type);
    const list = await getProjects();
    setProjects(list);
    openProject(project);
  };

  const handleOpenRenameProject = (project) => {
    setRenameTarget({ type: 'project', item: project });
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async (newName) => {
    if (!renameTarget) return;

    if (renameTarget.type === 'project') {
      const projId = renameTarget.item.id;
      await renameProject(projId, newName);
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, name: newName } : p));
      if (currentProject?.id === projId) {
        setCurrentProject(prev => prev ? { ...prev, name: newName } : null);
      }
    } else if (renameTarget.type === 'file') {
      const file = renameTarget.item;
      const pathParts = file.path.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');

      const nameParts = file.name.split('/');
      nameParts[nameParts.length - 1] = newName;
      const newDisplayName = nameParts.join('/');

      const updatedFile = await renameFile(file.path, newPath, currentProject.id);
      const fileWithDisplayName = { ...updatedFile, name: newDisplayName };

      setFiles(prev => prev.map(f => f.path === file.path ? fileWithDisplayName : f));
      setOpenFiles(prev => prev.map(f => f.path === file.path ? fileWithDisplayName : f));
      if (activeFile?.path === file.path) {
        setActiveFile(fileWithDisplayName);
      }
    }
  };

  const handleDeleteProject = (projId) => {
    const proj = projects.find(p => p.id === projId);
    setConfirmConfig({
      title: `Delete "${proj?.name || 'Project'}"?`,
      message: 'Permanently delete this project and all its files? This action cannot be undone.',
      confirmText: 'Delete Project',
      action: async () => {
        await deleteProject(projId);
        const list = await getProjects();
        setProjects(list);

        if (currentProject?.id === projId) {
          if (list.length > 0) {
            openProject(list[0]);
          } else {
            setCurrentProject(null);
            setFiles([]);
            setOpenFiles([]);
            setActiveFile(null);
            setView('dashboard');
          }
        }
      }
    });
    setConfirmModalOpen(true);
  };

  const handleDeleteAllProjects = () => {
    setConfirmConfig({
      title: 'Remove All Projects?',
      message: 'Permanently remove ALL projects from workspace? Zero projects will be left behind.',
      confirmText: 'Remove All',
      action: async () => {
        await deleteAllProjects();
        setProjects([]);
        setCurrentProject(null);
        setFiles([]);
        setOpenFiles([]);
        setActiveFile(null);
        setView('dashboard');
      }
    });
    setConfirmModalOpen(true);
  };

  // Insert snippet
  const handleInsertSnippet = (code) => {
    if (editorRef.current) {
      const sel = editorRef.current.getSelection();
      editorRef.current.executeEdits('snippet', [{
        identifier: { major: 1, minor: 1 },
        range: sel,
        text: code,
        forceMoveMarkers: true
      }]);
      editorRef.current.focus();
    }
  };

  // Run code
  const addLog = (text, type = 'stdout') => {
    const normalizedText = String(text ?? '');
    const normalizedType = /traceback|error|exception|failed/i.test(normalizedText)
      ? 'stderr'
      : /warning|warn/i.test(normalizedText)
        ? 'warning'
        : type;

    setLogs(prev => {
      const next = [...prev, { text: normalizedText, type: normalizedType }];
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
    });
  };

  const handleRunCode = async () => {
    setConsoleVisible(true);
    setLogs([]);
    setPlots([]);
    if (currentProject?.type === 'python') {
      setIsRunning(true);
      addLog('Executing Python 3.11 WASM Engine...', 'info');
      await runPythonCode(
        activeFile?.content || '',
        (t, type) => addLog(t, type),
        (t, type) => addLog(t, type),
        (url) => setPlots(prev => [...prev, url])
      );
      setIsRunning(false);
    } else {
      addLog('Web Preview refreshed.', 'success');
    }
  };

  const afterProjectLoad = async (project) => {
    const list = await getProjects();
    setProjects(list);
    if (project) openProject(project);
  };

  const handleExportZip = () => {
    if (currentProject && files.length > 0) exportProjectZip(currentProject, files);
  };

  return (
    <div className="app-container">

      {/* ── DASHBOARD ── */}
      {view === 'dashboard' && (
        <DashboardView
          projects={projects}
          onOpenProject={openProject}
          onOpenNewProjectModal={() => setNewProjectOpen(true)}
          onOpenZipImport={() => setZipImportOpen(true)}
          onRenameProject={handleOpenRenameProject}
          onDeleteProject={handleDeleteProject}
          onDeleteAllProjects={handleDeleteAllProjects}
        />
      )}

      {/* ── EDITOR ── */}
      {view === 'editor' && (
        <>
          <HeaderNav
            projects={projects}
            currentProject={currentProject}
            onSelectProject={handleSelectProjectById}
            onRenameProject={handleOpenRenameProject}
            onToggleSidebar={() => setSidebarCollapsed(v => !v)}
            onRun={handleRunCode}
            isRunning={isRunning}
            splitView={splitView}
            onToggleSplitView={() => setSplitView(v => !v)}
            onOpenZipImport={() => setZipImportOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onExportZip={handleExportZip}
            onGoToDashboard={async () => {
              await flushPendingAutosave();
              setView('dashboard');
            }}
          />

          <div className="main-layout">
            {/* Sidebar backdrop on mobile */}
            {!sidebarCollapsed && window.innerWidth <= 768 && (
              <div
                className="sidebar-backdrop"
                onClick={() => setSidebarCollapsed(true)}
              />
            )}

            <FileExplorer
              currentProject={currentProject}
              files={files}
              activeFile={activeFile}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onRenameFile={handleOpenRenameFile}
              onRenameProject={handleOpenRenameProject}
              onDeleteFile={handleDeleteFile}
              onExportZip={handleExportZip}
              onOpenZipImport={() => setZipImportOpen(true)}
              isCollapsed={sidebarCollapsed}
              onClose={() => setSidebarCollapsed(true)}
            />

            <div className="workspace-split">
              <TabBar
                openFiles={openFiles}
                activeFile={activeFile}
                onSelectTab={setActiveFile}
                onCloseTab={handleCloseTab}
                onNewFile={handleQuickNewFile}
              />

              <div
                ref={splitContainerRef}
                className={`split-container ${splitView ? 'split-mode' : ''}`}
                style={{ position: 'relative' }}
              >
                {/* Editor Container */}
                <div
                  style={{
                    flex: splitView && window.innerWidth > 768 ? 'none' : 1,
                    width: splitView && window.innerWidth > 768 ? `${splitRatio}%` : '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                  }}
                >
                  <EditorArea
                    file={activeFile}
                    onCodeChange={handleCodeChange}
                    editorRef={editorRef}
                  />
                </div>

                {/* Draggable Resizer Handle (Desktop Split View) */}
                {splitView && currentProject?.type === 'web' && window.innerWidth > 768 && (
                  <div
                    className="split-resizer"
                    onMouseDown={handleSplitDragStart}
                    onTouchStart={handleSplitDragStart}
                    title="Drag to resize split view"
                  />
                )}

                {/* Web Preview Container */}
                {currentProject?.type === 'web' && (
                  <div
                    style={{
                      flex: splitView && window.innerWidth > 768 ? 'none' : 1,
                      width: splitView && window.innerWidth > 768 ? `${100 - splitRatio}%` : '100%',
                      height: '100%',
                      display: splitView ? 'flex' : 'none',
                      minWidth: 0
                    }}
                  >
                    <WebPreview
                      files={files}
                      isVisible={splitView}
                      onConsoleLog={addLog}
                    />
                  </div>
                )}
              </div>

              <TouchBar onInsertText={handleInsertSnippet} />

              <ConsoleDrawer
                logs={logs}
                plots={plots}
                onClear={() => { setLogs([]); setPlots([]); }}
                isVisible={consoleVisible}
                onClose={() => setConsoleVisible(false)}
                onToggleOpen={() => setConsoleVisible(v => !v)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── MODALS ── */}
      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreateProject={handleCreateNewProject}
      />
      <ZipImportModal
        isOpen={zipImportOpen}
        onClose={() => setZipImportOpen(false)}
        onProjectImported={afterProjectLoad}
      />
      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={renameTarget?.type === 'project' ? 'Rename Project' : 'Rename File'}
        label={renameTarget?.type === 'project' ? 'Project Name' : 'File Name'}
        initialName={renameTarget?.type === 'project' ? (renameTarget.item?.name || '') : (renameTarget?.item?.name?.split('/').pop() || '')}
        onRename={handleConfirmRename}
      />
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onConfirm={() => confirmConfig.action && confirmConfig.action()}
      />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onRun={handleRunCode}
        onNewProject={() => setNewProjectOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
        onToggleSplitView={() => setSplitView(v => !v)}
        onOpenZipImport={() => setZipImportOpen(true)}
        onExportZip={handleExportZip}
      />
    </div>
  );
}
