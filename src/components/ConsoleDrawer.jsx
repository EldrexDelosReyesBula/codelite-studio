import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Terminal, Trash2, X, ChevronDown, ChevronUp, 
  CheckCircle, AlertTriangle, Info, Image 
} from './icons';

const MIN_HEIGHT = 32;
const DEFAULT_HEIGHT = 200;
const MAX_HEIGHT = 500;

export default function ConsoleDrawer({ logs, plots, onClear, isVisible, onClose, onToggleOpen }) {
  const [height, setHeight]           = useState(DEFAULT_HEIGHT);
  const [isMinimized, setIsMinimized] = useState(false);
  const logEndRef                     = useRef(null);
  const dragging                      = useRef(false);
  const dragPointerId                 = useRef(null);
  const dragStartY                    = useRef(0);
  const dragStartH                    = useRef(DEFAULT_HEIGHT);

  // Auto-scroll on new logs
  useEffect(() => {
    if (logEndRef.current && !isMinimized && isVisible) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, plots, isMinimized, isVisible]);

  /* ── Drag-to-resize ── */
  const onDragStart = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging.current = true;
    dragPointerId.current = event.pointerId;
    dragStartY.current = event.clientY;
    dragStartH.current = height;
    document.body.classList.add('is-resizing-console');
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, [height]);

  const resizeWithKeyboard = (event) => {
    const direction = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const maxHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 96));
    setHeight(current => Math.min(maxHeight, Math.max(MIN_HEIGHT, current + direction * (event.shiftKey ? 48 : 16))));
    setIsMinimized(false);
  };

  useEffect(() => {
    const onMove = (event) => {
      if (!dragging.current || event.pointerId !== dragPointerId.current) return;
      const y = event.clientY;
      const delta = dragStartY.current - y;
      const maxHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 96));
      const newH = Math.min(maxHeight, Math.max(MIN_HEIGHT, dragStartH.current + delta));
      setHeight(newH);
      if (newH > MIN_HEIGHT + 4) setIsMinimized(false);
      event.preventDefault();
    };
    const onEnd = (event) => {
      if (event.pointerId !== dragPointerId.current) return;
      dragging.current = false;
      dragPointerId.current = null;
      document.body.classList.remove('is-resizing-console');
    };
    const onBlur = () => {
      dragging.current = false;
      dragPointerId.current = null;
      document.body.classList.remove('is-resizing-console');
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('blur', onBlur);
      document.body.classList.remove('is-resizing-console');
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        type="button"
        className="drawer-collapsed-bar"
        onClick={() => onToggleOpen && onToggleOpen()}
        title="Click to open execution console"
        aria-label="Open execution console"
        style={{ width: '100%', border: 0, textAlign: 'left', color: 'inherit' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={13} color="var(--accent-light)" />
          <span className="drawer-title-full">Execution Console &amp; Output</span>
          <span className="drawer-title-mobile">Console</span>
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
      </button>
    );
  }

  const renderLogIcon = (type) => {
    if (type === 'stderr')  return <AlertTriangle size={12} color="#F14C4C" style={{ marginRight: 5, flexShrink: 0 }} />;
    if (type === 'warning') return <AlertTriangle size={12} color="#F5C542" style={{ marginRight: 5, flexShrink: 0 }} />;
    if (type === 'success') return <CheckCircle   size={12} color="#4EC9B0" style={{ marginRight: 5, flexShrink: 0 }} />;
    if (type === 'info')    return <Info          size={12} color="#4FC1FF" style={{ marginRight: 5, flexShrink: 0 }} />;
    return null;
  };

  const displayHeight = isMinimized ? MIN_HEIGHT : height;

  return (
    <div
      className="output-drawer"
      style={{ height: displayHeight, touchAction: 'none' }}
    >
      {/* ── Drag handle ── */}
      <div
        onPointerDown={onDragStart}
        onLostPointerCapture={() => {
          dragging.current = false;
          dragPointerId.current = null;
          document.body.classList.remove('is-resizing-console');
        }}
        onKeyDown={resizeWithKeyboard}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize console"
        aria-valuenow={displayHeight}
        aria-valuemin={MIN_HEIGHT}
        aria-valuemax={Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 96))}
        tabIndex={0}
        style={{
          height: 8, cursor: 'row-resize',
          background: 'var(--border-light)',
          flexShrink: 0,
          transition: 'background 0.15s',
          touchAction: 'none',
          userSelect: 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--border-light)'}
        title="Drag to resize console"
      />

      {/* ── Header ── */}
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={14} color="var(--accent-light)" />
          <span className="drawer-title-full" style={{ fontWeight: 600 }}>Execution Console &amp; Output</span>
          <span className="drawer-title-mobile" style={{ fontWeight: 600 }}>Console</span>
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
              {logs.map((log, i) => {
                const logType = log.type || 'stdout';
                const isError = logType === 'stderr';
                const isWarning = logType === 'warning';

                return (
                  <div
                    key={i}
                    className={`log-line ${logType}`}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '2px 0',
                      borderLeft: isError ? '2px solid rgba(241, 76, 76, 0.85)' : isWarning ? '2px solid rgba(245, 197, 66, 0.8)' : '2px solid transparent',
                      paddingLeft: 6,
                      background: isError ? 'rgba(241, 76, 76, 0.06)' : isWarning ? 'rgba(245, 197, 66, 0.06)' : 'transparent'
                    }}
                  >
                    {renderLogIcon(logType)}
                    <span style={{ userSelect: 'text', flex: 1, wordBreak: 'break-word', color: isError ? '#FF8D8D' : isWarning ? '#FFD76B' : 'var(--text-primary)' }}>{log.text}</span>
                  </div>
                );
              })}

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
