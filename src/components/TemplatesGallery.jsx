import React from 'react';
import { X, Sparkles, FileCode, Code2, Layers, Activity } from './icons';

const TEMPLATES = [
  {
    id: 'tmpl-py-analysis',
    name: 'Python Data Analysis & Plotting',
    type: 'python',
    icon: <Activity size={24} color="#4EC9B0" />,
    description: 'Numpy calculation and Matplotlib graph plotting in Python 3.11 WASM.',
    files: [
      {
        name: 'main.py',
        content: `import matplotlib.pyplot as plt
import numpy as np

# Generate random data plot
np.random.seed(42)
x = np.linspace(0, 10, 50)
y = np.sin(x) + np.random.normal(0, 0.2, 50)

plt.figure(figsize=(6, 4))
plt.scatter(x, y, color='#007ACC', alpha=0.7, label='Data Points')
plt.plot(x, np.sin(x), color='#4EC9B0', linewidth=2, label='True Sine')
plt.title('CodeLite Studio — Data Plotting')
plt.xlabel('X Axis')
plt.ylabel('Y Axis')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

print("Plot generated successfully!")
`
      }
    ]
  },
  {
    id: 'tmpl-web-portfolio',
    name: 'Modern Developer Portfolio',
    type: 'web',
    icon: <Layers size={24} color="#CE9178" />,
    description: 'Responsive glassmorphic portfolio landing page with mobile dark theme aesthetics.',
    files: [
      {
        name: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <div class="avatar">⚡</div>
    <h1>Alex Rivera</h1>
    <p>Mobile Fullstack Developer & Student</p>
    <div class="tags">
      <span>React</span><span>Python</span><span>WASM</span>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
`
      },
      {
        name: 'style.css',
        content: `body {
  margin: 0;
  background: #0d0d0d;
  color: white;
  font-family: -apple-system, system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.hero {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  backdrop-filter: blur(20px);
}
.avatar { font-size: 48px; margin-bottom: 12px; }
h1 { margin: 0 0 8px 0; font-size: 28px; }
p { color: #888; margin-bottom: 20px; }
.tags span {
  display: inline-block;
  background: #007ACC;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin: 0 4px;
}
`
      },
      {
        name: 'script.js',
        content: `console.log("Welcome to Alex Rivera's Portfolio!");`
      }
    ]
  }
];

export default function TemplatesGallery({ isOpen, onClose, onLoadTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-yellow)" />
            <span>CodeForge Templates Gallery</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gap: '12px' }}>
            {TEMPLATES.map((tmpl) => (
              <button
                type="button"
                key={tmpl.id}
                style={{
                  background: 'var(--bg-darkest)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  color: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={() => {
                  onLoadTemplate(tmpl);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {tmpl.icon}
                  <div>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-bright)', margin: 0 }}>{tmpl.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--accent-light)', textTransform: 'uppercase' }}>
                      {tmpl.type}
                    </span>
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
