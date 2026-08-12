import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, ExternalLink, Monitor } from 'lucide-react';

export default function WebPreview({ files, isVisible, onConsoleLog }) {
  const iframeRef = useRef(null);

  const assembleHTML = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html')) || files[0];
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles  = files.filter(f => f.name.endsWith('.js'));

    if (!htmlFile) {
      return '<html><body style="background:#111;color:#fff;font-family:sans-serif;padding:20px;">No HTML file found in project.</body></html>';
    }

    let rawHtml = htmlFile.content || '';
    let cssString = cssFiles.map(c => `<style>${c.content}</style>`).join('\n');

    const consoleInterceptorScript = `
      <script>
        (function() {
          var _origLog = console.log;
          var _origError = console.error;
          var _origWarn = console.warn;
          function sendLog(type, args) {
            try {
              var msg = Array.from(args).map(function(a){ return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ');
              window.parent.postMessage({ type: 'CODEFORGE_CONSOLE', logType: type, message: msg }, '*');
            } catch(e) {}
          }
          console.log   = function() { sendLog('stdout', arguments); _origLog.apply(console, arguments); };
          console.error = function() { sendLog('stderr', arguments); _origError.apply(console, arguments); };
          console.warn  = function() { sendLog('info', arguments);   _origWarn.apply(console, arguments); };
        })();
      </script>
    `;

    let jsString = jsFiles.map(j => `<script>${j.content}</script>`).join('\n');

    if (rawHtml.includes('</head>')) {
      rawHtml = rawHtml.replace('</head>', `${cssString}${consoleInterceptorScript}</head>`);
    } else {
      rawHtml = `${cssString}${consoleInterceptorScript}${rawHtml}`;
    }
    if (rawHtml.includes('</body>')) {
      rawHtml = rawHtml.replace('</body>', `${jsString}</body>`);
    } else {
      rawHtml = `${rawHtml}${jsString}`;
    }
    return rawHtml;
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = assembleHTML();
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [files]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'CODEFORGE_CONSOLE') {
        onConsoleLog?.(e.data.message, e.data.logType);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const openInNewTab = () => {
    const html = assembleHTML();
    const win = window.open();
    if (win) { win.document.write(html); win.document.close(); }
  };

  if (!isVisible) return null;

  return (
    <div className="preview-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
      <div className="preview-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-bright)' }}>
          <Monitor size={14} color="var(--accent-light)" />
          <span>Live Preview</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={refreshPreview} title="Reload Preview">
            <RotateCw size={13} />
          </button>
          <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={openInNewTab} title="Open in New Window">
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, background: '#0F0F0F', overflow: 'hidden', width: '100%', height: '100%' }}>
        <iframe
          ref={iframeRef}
          title="Web Live Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
        />
      </div>
    </div>
  );
}
