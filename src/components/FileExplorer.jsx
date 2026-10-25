import React, { useState, useMemo } from 'react';
import { 
  FileCode, Code2, Palette, FileJson, FileText,
  Trash2, Download, Upload, FilePlus, FolderPlus,
  ChevronLeft, Search, Folder, FolderOpen,
  ChevronRight, ChevronDown, Edit2
} from './icons';

/* ── Helpers ── */

function getFileIcon(name) {
  if (!name) return <FileText size={14} color="var(--text-muted)" />;
  if (name.endsWith('.py'))   return <FileCode size={14} color="#4EC9B0" />;
  if (name.endsWith('.html')) return <Code2    size={14} color="#CE9178" />;
  if (name.endsWith('.css'))  return <Palette  size={14} color="#569CD6" />;
  if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileJson size={14} color="#DCDCAA" />;
  if (name.endsWith('.json')) return <FileText size={14} color="#CBCB41" />;
  if (name.endsWith('.md'))   return <FileText size={14} color="#9CDCFE" />;
  return <FileText size={14} color="var(--text-muted)" />;
}

function buildTree(files) {
  const root = { folders: {}, files: [] };

  for (const file of files) {
    const parts = file.name.split('/').filter(Boolean);
    if (parts.length === 1) {
      root.files.push(file);
    } else {
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i];
        if (!node.folders[folder]) {
          node.folders[folder] = { folders: {}, files: [] };
        }
        node = node.folders[folder];
      }
      node.files.push({ ...file, displayName: parts[parts.length - 1] });
    }
  }
  return root;
}

/* ── Sub-components ── */

function FolderNode({ name, node, depth = 0, activeFile, onSelectFile, onRenameFile, onDeleteFile, allFilesCount }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        className="explorer-folder-row"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 'calc(100% - 8px)',
          display: 'flex', alignItems: 'center', gap: 6,
          height: 30, paddingLeft: 8 + depth * 12, paddingRight: 8,
          border: 0, background: 'transparent', textAlign: 'left',
          cursor: 'pointer', borderRadius: 6, margin: '1px 4px',
          color: 'var(--text-muted)',
          transition: 'background 0.1s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ flexShrink: 0 }}>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {open
          ? <FolderOpen size={14} color="#DCDCAA" />
          : <Folder    size={14} color="#DCDCAA" />
        }
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2px', flex: 1 }}>{name}</span>
      </button>

      {open && (
        <div>
          {Object.entries(node.folders).sort(([a], [b]) => a.localeCompare(b)).map(([fName, fNode]) => (
            <FolderNode
              key={fName} name={fName} node={fNode}
              depth={depth + 1}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              allFilesCount={allFilesCount}
            />
          ))}
          {node.files.map(file => (
            <FileRow
              key={file.path} file={file} depth={depth + 1}
              isActive={activeFile?.path === file.path}
              onSelect={onSelectFile}
              onRename={onRenameFile}
              onDelete={onDeleteFile}
              showDelete={allFilesCount > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file, depth, isActive, onSelect, onRename, onDelete, showDelete }) {
  const [hov, setHov] = useState(false);
  const displayName = file.displayName || file.name;
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const showControls = hov || isTouchDevice;

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button
        type="button"
        className={`tree-item explorer-file-row ${isActive ? 'selected' : ''}`}
        aria-pressed={isActive}
        onClick={() => onSelect(file)}
        style={{
          paddingLeft: 8 + depth * 12,
          paddingRight: showControls ? 64 : 8,
          touchAction: 'manipulation',
          width: '100%',
          border: 0,
          textAlign: 'left',
          background: isActive ? 'var(--bg-active)' : 'transparent'
        }}
      >
        {getFileIcon(displayName)}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
          {displayName}
        </span>
      </button>

      {showControls && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0, position: 'absolute', right: 8 }}>
          {onRename && (
            <button
              type="button"
              className="icon-btn explorer-file-action"
              style={{ width: 22, height: 22, padding: 0, opacity: 0.9, touchAction: 'manipulation' }}
              onClick={() => onRename(file)}
              title="Rename file"
              aria-label={`Rename ${displayName}`}
            >
              <Edit2 size={11} color="var(--text-muted)" />
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              className="icon-btn explorer-file-action"
              style={{ width: 22, height: 22, padding: 0, opacity: 0.9, touchAction: 'manipulation' }}
              onClick={() => {
                if (confirm(`Delete "${displayName}"? This cannot be undone.`)) {
                  onDelete(file.path);
                }
              }}
              title="Delete file"
              aria-label={`Delete ${displayName}`}
            >
              <Trash2 size={11} color="var(--accent-red)" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main FileExplorer ── */

export default function FileExplorer({
  currentProject,
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onRenameProject,
  onDeleteFile,
  onExportZip,
  onOpenZipImport,
  isCollapsed,
  onClose
}) {
  const [showNewInput,   setShowNewInput]   = useState(false);
  const [newMode,        setNewMode]        = useState('file');
  const [newName,        setNewName]        = useState('');
  const [fileSearch,     setFileSearch]     = useState('');
  const [folderPrefix,   setFolderPrefix]   = useState('');

  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return files;
    return files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));
  }, [files, fileSearch]);

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  const handleCreate = (e) => {
    e.preventDefault();
    let name = newName.trim();
    if (!name) return;

    if (newMode === 'folder') {
      name = name.replace(/\/$/, '') + '/.gitkeep';
    } else if (folderPrefix) {
      name = folderPrefix + '/' + name;
    }

    onCreateFile(name);
    setNewName('');
    setShowNewInput(false);
    setFolderPrefix('');
  };

  const openNewFile = (prefix = '') => {
    setNewMode('file');
    setFolderPrefix(prefix);
    setShowNewInput(true);
  };

  const openNewFolder = () => {
    setNewMode('folder');
    setFolderPrefix('');
    setShowNewInput(true);
  };

  if (isCollapsed) return null;

  const hasFolders = Object.keys(tree.folders).length > 0;

  return (
    <aside className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', flex: 1 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--text-bright)', fontSize: 12 }}>
            {currentProject?.name || 'Explorer'}
          </span>
          {currentProject && onRenameProject && (
            <button
              type="button"
              className="icon-btn explorer-project-rename"
              style={{ width: 20, height: 20, padding: 0 }}
              onClick={() => onRenameProject(currentProject)}
              title="Rename active project"
              aria-label="Rename active project"
            >
              <Edit2 size={11} color="var(--text-muted)" />
            </button>
          )}
        </div>

        <div className="explorer-header-actions" style={{ display: 'flex', gap: 2 }}>
          <button
            type="button"
            className="icon-btn explorer-header-action"
            style={{ width: 26, height: 26 }}
            onClick={() => openNewFile()}
            title="New file"
            aria-label="New file"
          >
            <FilePlus size={14} />
          </button>
          <button
            type="button"
            className="icon-btn explorer-header-action"
            style={{ width: 26, height: 26 }}
            onClick={openNewFolder}
            title="New folder"
            aria-label="New folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            className="icon-btn explorer-header-action"
            style={{ width: 26, height: 26 }}
            onClick={onClose}
            title="Hide sidebar (Ctrl+B)"
            aria-label="Hide file explorer"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      {files.length > 2 && (
        <div className="explorer-search" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          margin: '5px 8px',
          background: 'var(--bg-darkest)', border: '1px solid var(--border-light)',
          borderRadius: 8, padding: '4px 8px', height: 30
        }}>
          <Search size={12} color="var(--text-muted)" />
          <input
            type="text"
            aria-label="Filter files"
            value={fileSearch}
            onChange={e => setFileSearch(e.target.value)}
            placeholder="Filter files…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', fontSize: 12, color: 'var(--text-bright)'
            }}
          />
          {fileSearch && (
            <button
              type="button"
              className="explorer-filter-clear"
              onClick={() => setFileSearch('')}
              aria-label="Clear file filter"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
            >×</button>
          )}
        </div>
      )}

      {/* ── New file/folder input ── */}
      {showNewInput && (
        <form onSubmit={handleCreate} style={{ padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {newMode === 'folder'
              ? <FolderPlus size={13} color="#DCDCAA" />
              : <FilePlus   size={13} color="var(--accent-light)" />
            }
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {newMode === 'folder' ? 'New folder name' : folderPrefix ? `New file in ${folderPrefix}/` : 'New file name'}
            </span>
          </div>
          <input
            type="text"
            placeholder={
              newMode === 'folder'
                ? 'e.g. src or utils'
                : currentProject?.type === 'python'
                  ? 'e.g. helper.py'
                  : 'e.g. script.js'
            }
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            style={{
              width: '100%', background: 'var(--bg-darkest)',
              border: '1px solid var(--accent)', color: 'var(--text-bright)',
              padding: '6px 8px', borderRadius: 6, fontSize: 12, outline: 'none'
            }}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Enter to create · Esc to cancel
          </div>
        </form>
      )}

      {/* ── File/folder tree ── */}
      <div className="file-tree">
        {filteredFiles.length === 0 && fileSearch ? (
          <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No files match "{fileSearch}"
          </div>
        ) : (
          <>
            {Object.entries(tree.folders).sort(([a],[b]) => a.localeCompare(b)).map(([fName, fNode]) => (
              <FolderNode
                key={fName} name={fName} node={fNode}
                depth={0}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                onRenameFile={onRenameFile}
                onDeleteFile={onDeleteFile}
                allFilesCount={files.length}
              />
            ))}

            {tree.files.map(file => (
              <FileRow
                key={file.path} file={file} depth={0}
                isActive={activeFile?.path === file.path}
                onSelect={onSelectFile}
                onRename={onRenameFile}
                onDelete={onDeleteFile}
                showDelete={files.length > 1}
              />
            ))}

            {files.length === 0 && (
              <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                <FilePlus size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                <div>No files yet.</div>
                <div style={{ marginTop: 4 }}>Click <strong>＋</strong> to add a file.</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '8px 8px 6px', borderTop: '0.5px solid var(--border-light)', display: 'flex', gap: 4 }}>
        <button
          type="button"
          className="explorer-footer-action"
          onClick={onOpenZipImport}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'var(--bg-darkest)', border: '1px solid var(--border-light)',
            borderRadius: 7, padding: '6px 0', cursor: 'pointer',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500
          }}
          title="Import ZIP archive"
        >
          <Upload size={12} /> Import
        </button>
        <button
          type="button"
          className="explorer-footer-action"
          onClick={onExportZip}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'var(--bg-darkest)', border: '1px solid var(--border-light)',
            borderRadius: 7, padding: '6px 0', cursor: 'pointer',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500
          }}
          title="Export ZIP archive"
        >
          <Download size={12} /> Save ZIP
        </button>
      </div>

      <div style={{ padding: '3px 12px 8px', fontSize: 10, color: 'var(--text-subtle)' }}>
        {files.length} file{files.length !== 1 ? 's' : ''}{hasFolders ? ' in folders' : ''}
      </div>
    </aside>
  );
}
