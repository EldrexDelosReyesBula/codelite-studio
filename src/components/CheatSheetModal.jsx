import React, { useState } from 'react';
import { X, BookOpen, Copy, Check } from 'lucide-react';

const PYTHON_SNIPPETS = [
  {
    title: 'Python Output & Format Spec',
    category: 'Core Syntax',
    code: `name = "Developer Workspace"\nstatus_code = 200\nprint(f"[System] {name} initialized with status {status_code}")\n`
  },
  {
    title: 'List Iteration & Comprehension',
    category: 'Data Structures',
    code: `metrics = [10, 25, 40, 55, 70]\nfiltered = [m * 1.5 for m in metrics if m > 20]\nfor raw, proc in zip(metrics, filtered):\n    print(f"Raw {raw} -> Processed {proc:.1f}")\n`
  },
  {
    title: 'Function Definition & Standard Modules',
    category: 'Functions',
    code: `import math\n\ndef compute_vector_magnitude(x, y):\n    return round(math.sqrt(x**2 + y**2), 3)\n\nprint("Magnitude:", compute_vector_magnitude(3.0, 4.0))\n`
  },
  {
    title: 'Matplotlib Graph Line Plot',
    category: 'Data Analytics',
    code: `import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.cos(x)\n\nplt.figure(figsize=(6, 4))\nplt.plot(x, y, color='#007ACC', label='Cosine Wave')\nplt.title('Performance Plot')\nplt.legend()\nplt.grid(True)\nplt.show()\n`
  }
];

const WEB_SNIPPETS = [
  {
    title: 'Responsive Flexbox Container',
    category: 'CSS Specs',
    code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #0f1117;\n}\n.card {\n  background: #161b22;\n  border: 1px solid #30363d;\n  padding: 24px;\n  border-radius: 12px;\n}\n`
  },
  {
    title: 'DOM Listener & Event Handling',
    category: 'JavaScript',
    code: `let count = 0;\nconst button = document.getElementById('triggerBtn');\nif (button) {\n  button.addEventListener('click', () => {\n    count++;\n    console.log("[Event] Trigger count:", count);\n  });\n}\n`
  },
  {
    title: 'Async Fetch API HTTP Client',
    category: 'JavaScript',
    code: `async function fetchMetrics() {\n  try {\n    const response = await fetch('https://api.github.com/zen');\n    const data = await response.text();\n    console.log("[Response]:", data);\n  } catch (error) {\n    console.error("[Fetch Error]:", error);\n  }\n}\nfetchMetrics();\n`
  }
];

export default function CheatSheetModal({ isOpen, onClose, onInsertSnippet }) {
  const [tab, setTab] = useState('python');
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const snippets = tab === 'python' ? PYTHON_SNIPPETS : WEB_SNIPPETS;

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--accent-light)" />
            <span>Developer Code Snippets & Library</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              className={`frame-btn ${tab === 'python' ? 'active' : ''}`}
              onClick={() => setTab('python')}
              style={{ flex: 1, padding: '8px', fontSize: '13px' }}
            >
              🐍 Python Specs
            </button>
            <button
              className={`frame-btn ${tab === 'web' ? 'active' : ''}`}
              onClick={() => setTab('web')}
              style={{ flex: 1, padding: '8px', fontSize: '13px' }}
            >
              🌐 Web Dev Specs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {snippets.map((snip, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-darkest)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>{snip.title}</span>
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: 'var(--bg-active)', color: 'var(--accent-light)', padding: '2px 6px', borderRadius: '4px' }}>
                      {snip.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      style={{ width: 28, height: 28 }}
                      onClick={() => handleCopy(snip.code, idx)}
                      title="Copy code"
                    >
                      {copiedIdx === idx ? <Check size={14} color="#4EC9B0" /> : <Copy size={14} />}
                    </button>
                    <button
                      className="btn-primary"
                      style={{ height: 28, fontSize: '11px', padding: '0 10px' }}
                      onClick={() => {
                        onInsertSnippet(snip.code);
                        onClose();
                      }}
                    >
                      Insert
                    </button>
                  </div>
                </div>

                <pre
                  style={{
                    background: '#121212',
                    padding: '10px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: '#D4D4D4',
                    overflowX: 'auto',
                    margin: 0
                  }}
                >
                  {snip.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
