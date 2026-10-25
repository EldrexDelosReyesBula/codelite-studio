import React, { useState } from 'react';
import { AlertTriangle, X } from './icons';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  isDanger = true
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.message || 'The operation could not be completed.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color={isDanger ? 'var(--accent-red)' : 'var(--accent-yellow)'} />
            <span>{title}</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isConfirming} aria-label="Close confirmation dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
            {message}
          </p>
          {error && <p role="alert" style={{ color: 'var(--accent-red)', marginTop: 12 }}>{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="icon-btn" type="button" onClick={onClose} disabled={isConfirming} style={{ border: '1px solid var(--border-light)', padding: '0 12px' }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={isConfirming}
            style={isDanger ? {
              background: 'linear-gradient(180deg, #d73a49 0%, #b31d28 100%)',
              borderColor: 'rgba(255,255,255,0.2)',
              boxShadow: '0 2px 6px rgba(215, 58, 73, 0.4)'
            } : {}}
          >
            {isConfirming ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
