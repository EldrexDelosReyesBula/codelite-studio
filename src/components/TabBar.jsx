import React from 'react';
import { FileCode, Code2, Palette, FileJson, FileText, X, Plus } from 'lucide-react';

export default function TabBar({
  openFiles,
  activeFile,
  onSelectTab,
  onCloseTab,
  onNewFile
}) {
  const getTabIcon = (fileName) => {
    if (!fileName) return <FileText size={14} color="var(--text-muted)" />;
    if (fileName.endsWith('.py')) return <FileCode size={14} color="#4EC9B0" />;
    if (fileName.endsWith('.html')) return <Code2 size={14} color="#CE9178" />;
    if (fileName.endsWith('.css')) return <Palette size={14} color="#569CD6" />;
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return <FileJson size={14} color="#DCDCAA" />;
    return <FileText size={14} color="var(--text-muted)" />;
  };

  return (
    <div className="tab-bar-container">
      {openFiles && openFiles.map((file) => {
        const isActive = activeFile?.path === file.path;
        const displayName = file.displayName || file.name.split('/').pop() || file.name;

        return (
          <div
            key={file.path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(file)}
          >
            {getTabIcon(displayName)}
            <span>{displayName}</span>

            {openFiles.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.path);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  opacity: 0.7
                }}
                title="Close Tab"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      {onNewFile && (
        <button
          className="add-tab-btn"
          onClick={onNewFile}
          title="New File in Workspace"
        >
          <Plus size={15} />
        </button>
      )}
    </div>
  );
}
