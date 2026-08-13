import React, { useState } from 'react';
import { 
  Menu,
  Play, 
  Columns, 
  Download, 
  Upload,
  Search,
  ChevronDown,
  Edit2,
  FolderOpen,
  LayoutDashboard
} from 'lucide-react';

export default function HeaderNav({
  projects,
  currentProject,
  onSelectProject,
  onRenameProject,
  onToggleSidebar,
  onRun,
  isRunning,
  splitView,
  onToggleSplitView,
  onOpenZipImport,
  onOpenCommandPalette,
  onExportZip,
  onGoToDashboard
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);

  const isPython = currentProject?.type === 'python';

  return (
    <header className="header-nav">

      {/* ── LEFT ── */}
      <div className="nav-actions" style={{ gap: 10 }}>
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          title="Show / Hide File Explorer (Ctrl+B)"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Brand Badge → Go to Dashboard */}
        <div
          className="brand-badge"
          style={{ cursor: 'pointer', gap: 6, display: 'flex', alignItems: 'center' }}
          onClick={onGoToDashboard}
          title="Back to Workspace Dashboard"
        >
          <img
            src="/assets/codelite-studio-logo-transparent.png"
            alt="CodeLite Studio"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          <span className="brand-title" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>
            CodeLite Studio
          </span>
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--border-light)', margin: '0 2px' }} />

        {/* Active Project Info Badge & Switcher */}
        <div className="project-switcher-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
          <button
            className="project-switcher-btn"
            onClick={() => setProjectPickerOpen(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--bg-darkest)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '4px 10px',
              cursor: 'pointer',
              color: 'var(--text-bright)',
              fontSize: 13,
              fontWeight: 600,
              maxWidth: 220,
              minWidth: 0,
              flex: 1
            }}
            title="Switch project workspace"
          >
            <span style={{ fontSize: 13, flexShrink: 0 }}>{isPython ? '🐍' : '🌐'}</span>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 140
            }}>
              {currentProject?.name || 'Project'}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </button>

          {/* Quick Rename Button */}
          {currentProject && onRenameProject && (
            <button
              className="icon-btn project-rename-btn"
              style={{ width: 26, height: 26 }}
              onClick={(e) => {
                e.stopPropagation();
                onRenameProject(currentProject);
              }}
              title="Rename active project"
            >
              <Edit2 size={13} color="var(--text-muted)" />
            </button>
          )}

          {/* Project Switcher Popover */}
          {projectPickerOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setProjectPickerOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 36,
                  left: 0,
                  width: 240,
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 12,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  padding: 6,
                  zIndex: 100
                }}
              >
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '6px 8px 4px'
                }}>
                  Projects ({projects.length})
                </div>

                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {projects.map(p => {
                    const isActive = p.id === currentProject?.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          setProjectPickerOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: isActive ? 'var(--bg-active)' : 'transparent',
                          transition: 'background 0.12s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          <span>{p.type === 'python' ? '🐍' : '🌐'}</span>
                          <span style={{
                            fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--text-bright)' : 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {p.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '0.5px solid var(--border-light)', margin: '6px 0 4px' }} />

                <div
                  onClick={() => {
                    setProjectPickerOpen(false);
                    onGoToDashboard();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent-light)'
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>All Projects Dashboard</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="nav-actions">
        {/* Run CTA */}
        <button
          id="run-btn"
          className={`btn-primary run-btn ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          disabled={isRunning}
          title={isPython ? 'Execute Python Script (F5)' : 'Refresh Web Preview (F5)'}
        >
          <Play size={14} fill="currentColor" />
          <span className="run-label">{isRunning ? 'Running…' : 'Run'}</span>
        </button>

        {/* Web Preview toggle */}
        {currentProject?.type === 'web' && (
          <button
            className={`header-action-btn ${splitView ? 'active' : ''}`}
            onClick={onToggleSplitView}
            title="Toggle Live Web Preview (Ctrl+\)"
          >
            <Columns size={14} />
            <span className="action-label">Preview</span>
          </button>
        )}

        {/* Desktop actions */}
        <div className="desktop-actions" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            className="header-action-btn"
            onClick={onOpenZipImport}
            title="Import project from ZIP"
          >
            <Upload size={14} />
            <span className="action-label">Import</span>
          </button>
          <button
            className="header-action-btn"
            onClick={onExportZip}
            title="Export project to ZIP"
          >
            <Download size={14} />
            <span className="action-label">Export</span>
          </button>
          <button
            className="header-action-btn"
            onClick={onOpenCommandPalette}
            title="Search IDE commands"
          >
            <Search size={14} />
            <span className="action-label">Search</span>
          </button>
        </div>

        {/* Mobile More dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="mobile-more-btn header-action-btn"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="More actions"
          >
            <Menu size={16} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>More</span>
            <ChevronDown size={12} />
          </button>

          {mobileMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <div style={{
                position: 'absolute', top: 44, right: 0,
                width: 220, background: 'var(--bg-sidebar)',
                border: '1px solid var(--border-light)',
                borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                padding: 8, zIndex: 100
              }} onClick={() => setMobileMenuOpen(false)}>

                <MenuLabel>Actions</MenuLabel>
                <MenuItem icon={<Edit2 size={15} />}       label="Rename Project"     desc="Edit project name"     onClick={() => currentProject && onRenameProject(currentProject)} />
                <MenuItem icon={<Upload size={15} />}     label="Import ZIP Archive" desc="Import zip project"    onClick={onOpenZipImport} />

                <div style={{ borderTop: '0.5px solid var(--border-light)', margin: '6px 0' }} />

                <MenuLabel>Project Workspace</MenuLabel>
                {currentProject?.type === 'web' && (
                  <MenuItem icon={<Columns size={15} />} label="Toggle Preview"     desc="Live split web view"   onClick={onToggleSplitView} />
                )}
                <MenuItem icon={<Download size={15} />}  label="Export ZIP"         desc="Save as zip archive"   onClick={onExportZip} />
                <MenuItem icon={<Search size={15} />}    label="Search Commands"    desc="IDE command palette"   onClick={onOpenCommandPalette} />
                <MenuItem icon={<FolderOpen size={15} />}label="Dashboard"          desc="View all projects"     onClick={onGoToDashboard} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 10px 2px' }}>
      {children}
    </div>
  );
}

function MenuItem({ icon, label, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 9, cursor: 'pointer',
        background: hov ? 'var(--bg-active)' : 'transparent',
        transition: 'background 0.12s'
      }}
    >
      <div style={{ color: 'var(--accent-light)', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </div>
  );
}
