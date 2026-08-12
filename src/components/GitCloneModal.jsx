import React, { useState } from 'react';
import { X, GitBranch, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { cloneGitRepo } from '../services/gitService';

export default function GitCloneModal({ isOpen, onClose, onRepoCloned }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClone = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsCloning(true);
    setErrorMsg('');
    setProgressMsg('Initializing clone request...');
    setProgressPercent(10);

    try {
      const { project, files } = await cloneGitRepo(repoUrl.trim(), (msg, percent) => {
        setProgressMsg(msg);
        setProgressPercent(percent);
      });

      setIsCloning(false);
      onRepoCloned(project, files);
      onClose();
    } catch (err) {
      setIsCloning(false);
      setErrorMsg(`Git Clone failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={18} color="var(--accent-light)" />
            <span>Clone Git Repository</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isCloning}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleClone}>
          <div className="modal-body">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Paste any public GitHub or GitLab repository URL to clone files directly into your pocket IDE.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '6px' }}>
                Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isCloning}
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

            {isCloning && (
              <div style={{ background: 'var(--bg-darkest)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-light)', marginBottom: '8px' }}>
                  <Loader size={14} className="spin" />
                  <span>{progressMsg}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(241, 76, 76, 0.15)', border: '1px solid var(--accent-red)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: '#F87171' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="icon-btn" type="button" onClick={onClose} disabled={isCloning}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={isCloning || !repoUrl.trim()}>
              {isCloning ? 'Cloning...' : 'Clone Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
