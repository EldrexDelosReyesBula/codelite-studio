import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Play, FilePlus, Folder, Download, Columns, Upload, X,
  FileCode, Code2, Palette, FileJson, FileText, CornerDownLeft
} from 'lucide-react';

function getFileIcon(name) {
  if (!name) return <FileText size={14} color="var(--text-muted)" />;
  if (name.endsWith('.py'))   return <FileCode size={14} color="#4EC9B0" />;
  if (name.endsWith('.html')) return <Code2    size={14} color="#CE9178" />;
  if (name.endsWith('.css'))  return <Palette  size={14} color="#569CD6" />;
  if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileJson size={14} color="#DCDCAA" />;
  return <FileText size={14} color="var(--text-muted)" />;
}

export default function CommandPalette({
  isOpen,
  onClose,
  files = [],
  onSelectFile,
  onRun,
  onNewProject,
  onToggleSidebar,
  onToggleSplitView,
  onOpenZipImport,
  onExportZip
}) {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'code' | 'commands'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const IDE_COMMANDS = useMemo(() => [
    { id: 'cmd-run',         type: 'command', label: 'Run Code Execution',       icon: <Play size={15} color="#4EC9B0" />,         action: onRun,            kbd: 'F5' },
    { id: 'cmd-sidebar',     type: 'command', label: 'Toggle File Explorer',     icon: <Folder size={15} color="#4FC1FF" />,       action: onToggleSidebar,  kbd: 'Ctrl+B' },
    { id: 'cmd-preview',     type: 'command', label: 'Toggle Live Web Preview',  icon: <Columns size={15} color="#CE9178" />,      action: onToggleSplitView,kbd: 'Ctrl+\\' },
    { id: 'cmd-new-project', type: 'command', label: 'Create New Project',       icon: <FilePlus size={15} color="#4FC1FF" />,     action: onNewProject,     kbd: '' },
    { id: 'cmd-zip-import',  type: 'command', label: 'Import ZIP Project',       icon: <Upload size={15} color="#DCDCAA" />,       action: onOpenZipImport,  kbd: '' },
    { id: 'cmd-export-zip',  type: 'command', label: 'Export Project to ZIP',    icon: <Download size={15} color="#C586C0" />,     action: onExportZip,      kbd: '' },
  ], [onRun, onToggleSidebar, onToggleSplitView, onNewProject, onOpenZipImport, onExportZip]);

  /* ── Perform Global Project Search across File Names & Content ── */
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        fileMatches: files,
        contentMatches: [],
        commandMatches: IDE_COMMANDS
      };
    }

    // 1. File Name Matches
    const fileMatches = files.filter(f => f.name.toLowerCase().includes(q));

    // 2. Code Content Line Matches
    const contentMatches = [];
    files.forEach(file => {
      if (!file.content) return;
      const lines = file.content.split('\n');
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(q)) {
          contentMatches.push({
            file,
            lineNum: idx + 1,
            lineText: lineText.trim()
          });
        }
      });
    });

    // 3. Command Matches
    const commandMatches = IDE_COMMANDS.filter(c => c.label.toLowerCase().includes(q));

    return { fileMatches, contentMatches, commandMatches };
  }, [query, files, IDE_COMMANDS]);

  if (!isOpen) return null;

  const handleSelectCodeMatch = (file) => {
    onSelectFile?.(file);
    onClose();
    setQuery('');
  };

  const handleRunCommand = (action) => {
    action?.();
    onClose();
    setQuery('');
  };

  const { fileMatches, contentMatches, commandMatches } = searchResults;
  const totalResults = fileMatches.length + contentMatches.length + commandMatches.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>

        {/* ── Search Input ── */}
        <div className="command-input-wrapper">
          <Search size={18} color="var(--accent-light)" />
          <input
            type="text"
            className="command-input"
            placeholder="Search code text, file names, or IDE commands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* ── Filter Mode Buttons ── */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '0.5px solid var(--border-light)', background: 'var(--bg-darkest)' }}>
          <button
            className={`frame-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All Results ({totalResults})
          </button>
          <button
            className={`frame-btn ${filterMode === 'code' ? 'active' : ''}`}
            onClick={() => setFilterMode('code')}
          >
            Code &amp; Files ({fileMatches.length + contentMatches.length})
          </button>
          <button
            className={`frame-btn ${filterMode === 'commands' ? 'active' : ''}`}
            onClick={() => setFilterMode('commands')}
          >
            Commands ({commandMatches.length})
          </button>
        </div>

        {/* ── Results List ── */}
        <div className="command-list" style={{ maxHeight: 360 }}>

          {totalResults === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No code, files, or commands match "{query}"
            </div>
          )}

          {/* Code Line Content Results */}
          {(filterMode === 'all' || filterMode === 'code') && contentMatches.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--accent-light)', padding: '6px 10px 4px' }}>
                Code Content Matches ({contentMatches.length})
              </div>
              {contentMatches.slice(0, 8).map((match, idx) => (
                <div
                  key={idx}
                  className="command-item"
                  onClick={() => handleSelectCodeMatch(match.file)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-bright)' }}>
                    {getFileIcon(match.file.name)}
                    <span>{match.file.name}</span>
                    <span style={{ fontSize: 10, background: 'var(--bg-active)', color: 'var(--accent-light)', padding: '1px 5px', borderRadius: 4 }}>
                      Line {match.lineNum}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.lineText}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Project File Matches */}
          {(filterMode === 'all' || filterMode === 'code') && fileMatches.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--accent-green)', padding: '6px 10px 4px' }}>
                Project Files ({fileMatches.length})
              </div>
              {fileMatches.map((file) => (
                <div
                  key={file.path}
                  className="command-item"
                  onClick={() => handleSelectCodeMatch(file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getFileIcon(file.name)}
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-bright)' }}>{file.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open File <CornerDownLeft size={11} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* IDE Command Matches */}
          {(filterMode === 'all' || filterMode === 'commands') && commandMatches.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 10px 4px' }}>
                IDE Commands ({commandMatches.length})
              </div>
              {commandMatches.map(cmd => (
                <div key={cmd.id} className="command-item" onClick={() => handleRunCommand(cmd.action)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  {cmd.kbd && <span className="kbd-shortcut">{cmd.kbd}</span>}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
