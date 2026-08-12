import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Folder, Play, Columns } from 'lucide-react';

const STEPS = [
  {
    title: 'CodeLite Studio IDE',
    logoImg: '/assets/codelite-studio-logo-transparent.png',
    content: 'CodeLite Studio is your high-performance browser IDE — 100% offline-capable with native Pyodide WASM runtime and web application engine.'
  },
  {
    title: 'File Explorer & Workspaces',
    icon: <Folder size={40} color="#4FC1FF" />,
    content: 'Use the File Explorer (Ctrl+B) to manage files, create nested directory structures, rename items, and export projects as ZIP archives.'
  },
  {
    title: 'Python WASM & Live Web Preview',
    icon: <Play size={40} color="#4EC9B0" />,
    content: 'Execute Python 3.11 scripts with NumPy and Matplotlib visualization directly in-browser. For Web apps, toggle side-by-side Live Preview (Ctrl+\\).'
  },
  {
    title: 'Developer Symbol Bar',
    icon: <Columns size={40} color="#CE9178" />,
    content: 'On mobile devices, use the touch symbol bar to quickly insert programming tokens (Tab, {}, (), [], ;, ", \') without leaving your code.'
  }
];

export default function OnboardingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>IDE Overview</span>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            {step.logoImg ? (
              <img src={step.logoImg} alt="CodeLite Studio" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            ) : (
              step.icon
            )}
          </div>
          <h2 style={{ fontSize: '18px', color: 'var(--text-bright)', marginBottom: '12px' }}>
            {step.title}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            {step.content}
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            className="icon-btn"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentStep ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentStep ? 'var(--accent)' : 'var(--border-light)',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          {currentStep < STEPS.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn-primary" onClick={onClose}>
              Get Started <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
