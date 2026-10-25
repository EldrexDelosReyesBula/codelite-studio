import React, { useState, useEffect } from 'react';
import { X, Edit2, Check } from './icons';

export default function RenameModal({
  isOpen,
  onClose,
  initialName = '',
  title = 'Rename',
  label = 'New Name',
  onRename
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
    setError('');
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) {
      onClose();
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onRename(trimmed);
      onClose();
    } catch (err) {
      setError(err?.message || 'The item could not be renamed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={16} color="var(--accent-light)" />
            <span>{title}</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isSaving} aria-label="Close rename dialog">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="rename-item" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '6px' }}>
                {label}
              </label>
              <input
                id="rename-item"
                type="text"
                name="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                aria-invalid={Boolean(error)}
                style={{
                  width: '100%',
                  background: 'var(--bg-darkest)',
                  border: '1px solid var(--accent)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: 'var(--text-bright)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            {error && <p role="alert" style={{ color: 'var(--accent-red)', fontSize: 12 }}>{error}</p>}
          </div>

          <div className="modal-footer">
            <button className="icon-btn" type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={!name.trim() || isSaving}>
              {isSaving ? 'Saving…' : <>Save <Check size={14} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
