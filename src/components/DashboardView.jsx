import React, { useState, useMemo } from 'react';
import { 
  FileCode, 
  Code2, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Clock, 
  Upload,
  Search,
  ChevronRight,
  Edit2
} from 'lucide-react';

function timeAgo(ts) {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardView({
  projects,
  onOpenProject,
  onOpenNewProjectModal,
  onOpenZipImport,
  onRenameProject,
  onDeleteProject,
  onDeleteAllProjects
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const pythonProjects = filtered.filter(p => p.type === 'python');
  const webProjects    = filtered.filter(p => p.type === 'web');

  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-main)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,122,204,0.12) 0%, rgba(0,0,0,0) 70%)',
        borderBottom: '0.5px solid var(--border-light)',
        padding: '24px 28px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/assets/codelite-studio-logo-transparent.png" alt="CodeLite Studio"
              style={{ width: 42, height: 42, objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
                CodeLite Studio
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {projects.length > 0
                  ? `${projects.length} project workspace${projects.length !== 1 ? 's' : ''} available`
                  : 'Developer Workspace — Create or import a project to get started.'}
              </p>
            </div>
          </div>

          {/* Delete All / Wipe Workspace Button */}
          {projects.length > 0 && onDeleteAllProjects && (
            <button
              onClick={onDeleteAllProjects}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)',
                color: 'var(--accent-red)', borderRadius: 8, padding: '0 12px', height: 32,
                fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
              title="Permanently remove all projects and files"
            >
              <Trash2 size={13} />
              Remove All Projects
            </button>
          )}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="btn-primary" onClick={onOpenNewProjectModal} style={{ gap: 6 }}>
            <Plus size={15} />
            New Project
          </button>
          <button
            onClick={onOpenZipImport}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
              borderRadius: 8, padding: '0 14px', height: 34, cursor: 'pointer',
              fontSize: 13, color: 'var(--text-primary)', fontWeight: 500
            }}
          >
            <Upload size={14} color="var(--accent-yellow)" />
            Import ZIP
          </button>
        </div>
      </div>

      {/* ── Project list ── */}
      <div style={{ padding: '20px 28px', flex: 1 }}>

        {/* Search bar */}
        {projects.length > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
            borderRadius: 10, padding: '0 12px', marginBottom: 20, height: 38
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects by name or language..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', fontSize: 13, color: 'var(--text-bright)'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
            <FolderOpen size={56} color="var(--border-light)" style={{ marginBottom: 16, opacity: 0.4 }} />
            <h2 style={{ color: 'var(--text-bright)', marginBottom: 8, fontSize: 18, fontWeight: 700 }}>
              No Active Projects
            </h2>
            <p style={{ marginBottom: 24, fontSize: 14, maxWidth: 420, margin: '0 auto 24px' }}>
              Your workspace is completely empty. Create a new Python script or Web project to get started.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={onOpenNewProjectModal}>
                <Plus size={15} /> Create New Project
              </button>
              <button
                onClick={onOpenZipImport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '0 16px', height: 36, cursor: 'pointer',
                  fontSize: 13, color: 'var(--text-bright)', fontWeight: 500
                }}
              >
                <Upload size={14} color="var(--accent-yellow)" /> Import ZIP Project
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Search size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No projects match "<strong>{search}</strong>"</p>
          </div>
        ) : (
          <>
            {pythonProjects.length > 0 && (
              <Section title="Python Projects" icon={<FileCode size={15} color="#4EC9B0" />} count={pythonProjects.length}>
                {pythonProjects.map(p => (
                  <ProjectCard key={p.id} project={p}
                    isHovered={hoveredId === p.id}
                    onHover={setHoveredId}
                    onOpen={onOpenProject}
                    onRename={onRenameProject}
                    onDelete={onDeleteProject}
                  />
                ))}
              </Section>
            )}

            {webProjects.length > 0 && (
              <Section title="Web Projects" icon={<Code2 size={15} color="#CE9178" />} count={webProjects.length}>
                {webProjects.map(p => (
                  <ProjectCard key={p.id} project={p}
                    isHovered={hoveredId === p.id}
                    onHover={setHoveredId}
                    onOpen={onOpenProject}
                    onRename={onRenameProject}
                    onDelete={onDeleteProject}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, count, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {title}
        </span>
        <span style={{ fontSize: 11, background: 'var(--bg-sidebar)', color: 'var(--text-muted)', padding: '1px 7px', borderRadius: 10 }}>
          {count}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 14
      }}>
        {children}
      </div>
    </section>
  );
}

function ProjectCard({ project, isHovered, onHover, onOpen, onRename, onDelete }) {
  const isPython = project.type === 'python';
  const accent   = isPython ? '#4EC9B0' : '#CE9178';
  const bg       = isPython ? 'rgba(78,201,176,0.1)' : 'rgba(206,145,120,0.1)';

  return (
    <div
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: isHovered ? 'var(--bg-sidebar)' : 'var(--bg-darkest)',
        border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border-light)'}`,
        borderRadius: 14,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: isHovered ? '0 4px 20px rgba(0,122,204,0.14)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {isPython ? <FileCode size={19} color={accent} /> : <Code2 size={19} color={accent} />}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {onRename && (
              <button
                onClick={e => { e.stopPropagation(); onRename(project); }}
                title="Rename project"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  opacity: isHovered ? 0.7 : 0, transition: 'opacity 0.2s', padding: 4
                }}
              >
                <Edit2 size={14} color="var(--text-muted)" />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete(project.id); }}
              title="Delete project permanently"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                opacity: isHovered ? 0.7 : 0, transition: 'opacity 0.2s', padding: 4
              }}
            >
              <Trash2 size={14} color="var(--accent-red)" />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', margin: '0 0 6px' }}>
          {project.name}
        </h3>

        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
          color: accent, background: bg, padding: '2px 8px', borderRadius: 4
        }}>
          {isPython ? 'Python 3.11' : 'Web App'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          <Clock size={11} />
          {timeAgo(project.lastOpened)}
        </div>
        <button
          className="btn-primary"
          style={{ height: 28, fontSize: 11, padding: '0 12px', gap: 4 }}
          onClick={() => onOpen(project)}
        >
          Open Workspace <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
