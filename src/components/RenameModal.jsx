import React, { useState, useEffect } from 'react';
import { X, Edit2, Check } from 'lucide-react';

export default function RenameModal({
  isOpen,
  onClose,
  initialName = '',
  title = 'Rename',
  label = 'New Name',
  onRename
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) {
      onClose();
      return;
    }
    onRename(trimmed);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={16} color="var(--accent-light)" />
            <span>{title}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '6px' }}>
                {label}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
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
          </div>

          <div className="modal-footer">
            <button className="icon-btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" disabled={!name.trim()}>
              Save <Check size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
