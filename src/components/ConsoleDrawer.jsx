import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Terminal, Trash2, X, ChevronDown, ChevronUp, 
  CheckCircle, AlertTriangle, Info, Image 
} from 'lucide-react';

const MIN_HEIGHT = 32;
const DEFAULT_HEIGHT = 200;
const MAX_HEIGHT = 500;

export default function ConsoleDrawer({ logs, plots, onClear, isVisible, onClose, onToggleOpen }) {
  const [height, setHeight]           = useState(DEFAULT_HEIGHT);
  const [isMinimized, setIsMinimized] = useState(false);
  const logEndRef                     = useRef(null);
  const dragging                      = useRef(false);
  const dragStartY                    = useRef(0);
  const dragStartH                    = useRef(DEFAULT_HEIGHT);

  // Auto-scroll on new logs
  useEffect(() => {
    if (logEndRef.current && !isMinimized && isVisible) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, plots, isMinimized, isVisible]);

  /* ── Drag-to-resize ── */
  const onDragStart = useCallback((e) => {
    dragging.current  = true;
    dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragStartH.current = height;
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const delta = dragStartY.current - y;
      const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragStartH.current + delta));
      setHeight(newH);
      if (newH > MIN_HEIGHT + 4) setIsMinimized(false);
    };
    const onEnd = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend',  onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onEnd);
    };
  }, []);

  if (!isVisible) {
    return (
      <div
        className="drawer-collapsed-bar"
        onClick={() => onToggleOpen && onToggleOpen()}
        title="Click to open execution console"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={13} color="var(--accent-light)" />
          <span>Execution Console &amp; Output</span>
          {logs.length > 0 && (
            <span style={{ fontSize: 10, background: 'var(--bg-darkest)', padding: '1px 6px', borderRadius: 10, color: '#4FC1FF' }}>
              {logs.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expand</span>
          <ChevronUp size={12} color="var(--text-muted)" />
        </div>
      </div>
    );
  }

  const renderLogIcon = (type) => {
    if (type === 'stderr')  return <AlertTriangle size={12} color="#F14C4C" style={{ marginRight: 5, flexShrink: 0 }} />;
    if (type === 'success') return <CheckCircle   size={12} color="#4EC9B0" style={{ marginRight: 5, flexShrink: 0 }} />;
    if (type === 'info')    return <Info          size={12} color="#4FC1FF" style={{ marginRight: 5, flexShrink: 0 }} />;
    return null;
  };

  const displayHeight = isMinimized ? MIN_HEIGHT : height;

  return (
    <div
      className="output-drawer"
      style={{ height: displayHeight }}
    >
      {/* ── Drag handle ── */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          height: 4, cursor: 'row-resize',
          background: 'var(--border-light)',
          flexShrink: 0,
          transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--border-light)'}
        title="Drag to resize console"
      />

      {/* ── Header ── */}
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={14} color="var(--accent-light)" />
          <span style={{ fontWeight: 600 }}>Execution Console &amp; Output</span>
          {logs.length > 0 && (
            <span style={{
              fontSize: 10, background: 'var(--bg-darkest)',
              padding: '1px 6px', borderRadius: 10, color: 'var(--text-bright)'
            }}>
              {logs.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          <button
            className="icon-btn" style={{ width: 24, height: 24 }}
            onClick={() => {
              if (isMinimized) {
                setIsMinimized(false);
                setHeight(DEFAULT_HEIGHT);
              } else {
                setIsMinimized(true);
              }
            }}
            title={isMinimized ? 'Expand Console' : 'Minimize Console'}
          >
            {isMinimized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={onClear} title="Clear Console">
            <Trash2 size={12} />
          </button>
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={onClose} title="Hide Console">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ── Log content ── */}
      {!isMinimized && (
        <div className="console-output">
          {logs.length === 0 && plots.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', userSelect: 'text' }}>
              Console ready. Click <strong style={{ color: '#4EC9B0' }}>▶ Run</strong> to execute your code.
            </div>
          ) : (
            <>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`log-line ${log.type || 'stdout'}`}
                  style={{ display: 'flex', alignItems: 'flex-start' }}
                >
                  {renderLogIcon(log.type)}
                  <span style={{ userSelect: 'text', flex: 1, wordBreak: 'break-word' }}>{log.text}</span>
                </div>
              ))}

              {plots.map((plotUrl, idx) => (
                <div key={idx} style={{ margin: '12px 0' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'var(--accent-light)', marginBottom: 6
                  }}>
                    <Image size={12} />
                    <span>Matplotlib Figure {idx + 1}</span>
                  </div>
                  <img
                    src={plotUrl}
                    alt={`Plot ${idx + 1}`}
                    style={{
                      maxWidth: '100%', borderRadius: 8,
                      border: '1px solid var(--border-light)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
              ))}
            </>
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
