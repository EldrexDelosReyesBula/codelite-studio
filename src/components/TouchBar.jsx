import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2 } from './icons';

const TOUCH_KEYS = [
  { label: 'Tab', value: '  ' },
  { label: '{', value: '{' },
  { label: '}', value: '}' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: ';', value: ';' },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: ':', value: ':' },
  { label: '=', value: '=' },
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '*', value: '*' },
  { label: '/', value: '/' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '_', value: '_' },
  { label: '.', value: '.' },
  { label: '!', value: '!' },
  { label: '#', value: '#' },
  { label: '=>', value: '=>' },
  { label: 'def', value: 'def ' },
  { label: 'return', value: 'return ' }
];

export default function TouchBar({ onInsertText }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        className="touch-toolbar-toggle"
        style={{
          height: 22,
          minHeight: 22,
          background: 'var(--bg-darkest)',
          borderTop: '0.5px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          fontSize: 10,
          color: 'var(--text-muted)',
          cursor: 'pointer',
          width: '100%',
          border: 0
        }}
        onClick={() => setCollapsed(false)}
        title="Show Quick Symbols"
      >
        <Code2 size={11} />
        <span>Symbols Bar</span>
        <ChevronUp size={11} />
      </button>
    );
  }

  return (
    <div className="touch-toolbar" role="toolbar" aria-label="Touch Code Keys">
      <button
        type="button"
        className="touch-key"
        style={{ minWidth: 44, padding: 0, opacity: 0.7 }}
        onClick={() => setCollapsed(true)}
        title="Hide Touch Symbols"
      >
        <ChevronDown size={14} />
      </button>

      {TOUCH_KEYS.map((key, idx) => (
        <button
          type="button"
          key={idx}
          className="touch-key"
          onClick={() => onInsertText(key.value)}
          title={`Insert ${key.label}`}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
