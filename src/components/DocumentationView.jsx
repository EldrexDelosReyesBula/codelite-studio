import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  X
} from './icons';

const DOC_TOPICS = [
  {
    id: 'py-basics',
    category: 'Python 3.11 Standard Library',
    title: 'Core Data Structures & Math Specs',
    icon: <FileCode size={18} color="#4EC9B0" />,
    summary: 'Python dynamic typing, string formatting, numerical algorithms, and system modules.',
    content: `
# Python Core Specs
import sys
import math

dataset = [10.5, 20.3, 15.8, 30.1]
summary = {
    "count": len(dataset),
    "sum": sum(dataset),
    "mean": sum(dataset) / len(dataset)
}

print(f"Engine: Python {sys.version.split()[0]} on {sys.platform}")
print("Summary Metrics:", summary)
`,
    snippet: `import sys\nimport math\n\nprint("Python Version:", sys.version)\n`
  },
  {
    id: 'py-loops',
    category: 'Python 3.11 Control Flow',
    title: 'Functional Programming & Generators',
    icon: <FileCode size={18} color="#4EC9B0" />,
    summary: 'Generator expressions, filter/map iterators, and high-performance list comprehension.',
    content: `
# List Comprehension & Iterators
def fibonacci_gen(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

fib_sequence = list(fibonacci_gen(10))
even_fibs = [x for x in fib_sequence if x % 2 == 0]

print("Fibonacci Sequence:", fib_sequence)
print("Even Values:", even_fibs)
`,
    snippet: `def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fib(10)))\n`
  },
  {
    id: 'py-plots',
    category: 'Python 3.11 Data Science',
    title: 'Matplotlib Engine & Vector Rendering',
    icon: <FileCode size={18} color="#4EC9B0" />,
    summary: 'Generate publication-quality line graphs, scatter plots, and bar charts in CodeLite Studio WASM.',
    content: `
import matplotlib.pyplot as plt
import numpy as np

# Generate Synthetic Frequency Data
x = np.linspace(0, 10, 100)
y_signal = np.sin(x)
y_noise = y_signal + np.random.normal(0, 0.1, 100)

plt.figure(figsize=(7, 4))
plt.plot(x, y_signal, label='Ground Truth', color='#007ACC', linewidth=2)
plt.scatter(x, y_noise, label='Sample Measurements', color='#4EC9B0', s=12, alpha=0.6)
plt.title('Signal Response Spectrum')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Amplitude')
plt.grid(True, alpha=0.25)
plt.legend()
plt.tight_layout()
plt.show()
`,
    snippet: `import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\nplt.plot(x, np.sin(x), color='#007ACC')\nplt.grid(True)\nplt.show()\n`
  },
  {
    id: 'web-html',
    category: 'Web Specifications',
    title: 'HTML5 Modern Architecture & Semantics',
    icon: <Code2 size={18} color="#CE9178" />,
    summary: 'HTML5 semantic tags, accessibility properties, and module script integration.',
    content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Workspace</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <header class="navbar">
      <h1>Developer Console</h1>
    </header>
    <main class="content">
      <div class="card">
        <button id="trigger">Execute Action</button>
      </div>
    </main>
  </div>
  <script type="module" src="script.js"></script>
</body>
</html>
`,
    snippet: `<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="style.css"></head>\n<body>\n  <div id="app"></div>\n  <script src="script.js"></script>\n</body>\n</html>\n`
  },
  {
    id: 'web-css',
    category: 'Web Specifications',
    title: 'CSS Grid, Flexbox & Theme Variables',
    icon: <Code2 size={18} color="#CE9178" />,
    summary: 'CSS custom properties, glassmorphism filters, flexbox, and dark mode design systems.',
    content: `
:root {
  --bg-primary: #0d1117;
  --bg-card: #161b22;
  --border-color: #30363d;
  --accent-color: #58a6ff;
}

body {
  margin: 0;
  background: var(--bg-primary);
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
`,
    snippet: `body {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  background: #0d1117;\n  color: #e6edf3;\n}\n`
  },
  {
    id: 'web-js',
    category: 'Web Specifications',
    title: 'JavaScript ES6+ & Async Fetch API',
    icon: <Code2 size={18} color="#CE9178" />,
    summary: 'Promises, async/await, DOM mutation, event delegation, and HTTP client requests.',
    content: `
// Event Delegation & Reactive State
const state = { count: 0 };

document.addEventListener('click', (e) => {
  if (e.target.matches('#trigger')) {
    state.count++;
    console.log('[System] Trigger fired. Active count:', state.count);
  }
});

// Async REST Request
async function fetchEndpoint(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`HTTP Status \${response.status}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[System] Request Error:', error.message);
  }
}
`,
    snippet: `async function fetchData(url) {\n  const res = await fetch(url);\n  return await res.json();\n}\n`
  }
];

export default function DocumentationView({ isOpen, onInsertSnippet, onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(DOC_TOPICS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTopics = DOC_TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopySnippet = () => {
    if (selectedTopic?.snippet) {
      navigator.clipboard.writeText(selectedTopic.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-main)',
        animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      {/* Top Header */}
      <div 
        style={{
          height: '44px',
          minHeight: '44px',
          background: 'var(--bg-sidebar)',
          borderBottom: '0.5px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text-bright)' }}>
          <BookOpen size={18} color="var(--accent-light)" />
          <span>Developer API & Syntax Reference</span>
        </div>

        <button className="icon-btn" onClick={onClose} title="Close Documentation">
          <X size={18} />
        </button>
      </div>

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Topic Sidebar */}
        <div 
          style={{
            width: '280px',
            background: 'var(--bg-sidebar)',
            borderRight: '0.5px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '12px', borderBottom: '0.5px solid var(--border-light)' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-darkest)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '6px 10px'
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search Python, Web, APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: 'var(--text-bright)',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Topic List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <button
                  type="button"
                  key={topic.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    color: 'inherit',
                    background: isSelected ? 'var(--bg-active)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {topic.icon}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--text-bright)' : 'var(--text-primary)' }}>
                      {topic.title}
                    </span>
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--accent-light)', textTransform: 'uppercase' }}>
                    {topic.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Topic Details */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-main)' }}>
          {selectedTopic ? (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {selectedTopic.icon}
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)', margin: 0 }}>
                  {selectedTopic.title}
                </h1>
              </div>

              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, background: 'var(--bg-active)', color: 'var(--accent-light)', padding: '3px 8px', borderRadius: '4px', marginBottom: '16px' }}>
                {selectedTopic.category}
              </span>

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                {selectedTopic.summary}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  className="btn-primary"
                  onClick={() => onInsertSnippet(selectedTopic.snippet)}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Insert Snippet into Active File</span>
                </button>

                <button
                  className="icon-btn"
                  onClick={handleCopySnippet}
                  style={{ border: '1px solid var(--border-light)', padding: '0 12px' }}
                >
                  {copied ? <Check size={16} color="#4EC9B0" /> : <Copy size={16} />}
                  <span style={{ marginLeft: '6px', fontSize: '12px' }}>{copied ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
              </div>

              {/* Code Example */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ background: 'var(--bg-sidebar)', padding: '8px 16px', borderBottom: '0.5px solid var(--border-light)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Code Example & Syntax
                </div>
                <pre
                  style={{
                    background: '#111111',
                    padding: '16px',
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: '#D4D4D4',
                    lineHeight: '1.6',
                    overflowX: 'auto'
                  }}
                >
                  {selectedTopic.content.trim()}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
              Select a documentation topic from the left sidebar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
