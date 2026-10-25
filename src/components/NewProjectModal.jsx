import React, { useState } from 'react';
import { X, Plus, FileCode, Code2 } from './icons';

export default function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('python'); // 'python' or 'web'
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setIsCreating(true);
    setError('');
    try {
      await onCreateProject(projectName.trim(), projectType);
      setProjectName('');
      onClose();
    } catch (err) {
      setError(err?.message || 'The project could not be created.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Create new project" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--accent-light)" />
            <span>Create New Project</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isCreating} aria-label="Close new project dialog">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="new-project-name" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '6px' }}>
                Project Name
              </label>
              <input
                id="new-project-name"
                type="text"
                name="projectName"
                placeholder="My Awesome App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
                disabled={isCreating}
                required
                style={{
                  width: '100%',
                  background: 'var(--bg-darkest)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'var(--text-bright)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div role="group" aria-labelledby="project-type-label">
                <div id="project-type-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '8px' }}>
                Project Type
                </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  disabled={isCreating}
                  aria-pressed={projectType === 'python'}
                  onClick={() => setProjectType('python')}
                  style={{
                    background: projectType === 'python' ? 'var(--bg-active)' : 'var(--bg-darkest)',
                    border: projectType === 'python' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}
                >
                  <FileCode size={24} color="#4EC9B0" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bright)' }}>Python 3.11</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WASM & Matplotlib</span>
                </button>

                <button
                  type="button"
                  disabled={isCreating}
                  aria-pressed={projectType === 'web'}
                  onClick={() => setProjectType('web')}
                  style={{
                    background: projectType === 'web' ? 'var(--bg-active)' : 'var(--bg-darkest)',
                    border: projectType === 'web' ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}
                >
                  <Code2 size={24} color="#CE9178" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bright)' }}>Web App</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HTML, CSS & JS Live</span>
                </button>
              </div>
              {error && <p role="alert" style={{ color: 'var(--accent-red)', padding: '8px 0' }}>{error}</p>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="icon-btn" type="button" onClick={onClose} disabled={isCreating}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={!projectName.trim() || isCreating}>
              {isCreating ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
