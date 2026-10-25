import React, { useState } from 'react';
import { X, Upload, FileArchive, CheckCircle, AlertCircle } from './icons';
import { importZipFile } from '../services/storageManager';

export default function ZipImportModal({ isOpen, onClose, onProjectImported }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg('');

    try {
      const { project, files } = await importZipFile(selectedFile);
      await onProjectImported(project, files);
      onClose();
    } catch (err) {
      setErrorMsg(`ZIP Extraction Failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isUploading) onClose();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Import ZIP project" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileArchive size={18} color="var(--accent-yellow)" />
            <span>Import ZIP Project Package</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isUploading} aria-label="Close ZIP import dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Upload a zipped project folder (.zip) from your device to open and run it offline in CodeForge Mobile.
          </p>

          <label
            className="zip-upload-label"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              border: '2px dashed var(--border-light)',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'var(--bg-darkest)',
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            <Upload size={32} color="var(--accent-light)" style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
              {selectedFile ? selectedFile.name : 'Click to select or drop a .zip file'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supports Python, HTML/CSS/JS, and JSON project zip archives
            </span>
            <input
              className="visually-hidden"
              type="file"
              name="projectArchive"
              accept=".zip"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>

          {errorMsg && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(241, 76, 76, 0.15)', border: '1px solid var(--accent-red)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: '#F87171' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="icon-btn" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Extracting...' : 'Import Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
