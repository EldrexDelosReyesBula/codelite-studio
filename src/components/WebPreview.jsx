import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, ExternalLink, Monitor } from './icons';

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function resolveProjectFile(reference, htmlPath, projectFiles) {
  const assetPath = reference.split(/[?#]/, 1)[0].replace(/\\/g, '/');
  if (!assetPath || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(assetPath)) return null;

  const segments = assetPath.startsWith('/')
    ? []
    : htmlPath.split('/').slice(0, -1);
  for (const segment of assetPath.replace(/^\/+/, '').split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (segments.length === 0) return null;
      segments.pop();
    } else {
      segments.push(segment);
    }
  }

  const resolvedPath = segments.join('/');
  return projectFiles.find(file => file.name === resolvedPath) ?? null;
}

export default function WebPreview({ files, entryFilePath, refreshToken, isVisible, onConsoleLog }) {
  const iframeRef = useRef(null);

  const assembleHTML = () => {
    const htmlFiles = files.filter(file => /\.html?$/i.test(file.name));
    const htmlFile = htmlFiles.find(file => file.path === entryFilePath) ||
      htmlFiles.find(file => /^index\.html?$/i.test(file.name)) ||
      htmlFiles[0];

    if (!htmlFile) {
      return '<html><body style="background:#111;color:#fff;font-family:sans-serif;padding:20px;">No HTML file found in project.</body></html>';
    }

    let rawHtml = htmlFile.content || '';
    rawHtml = rawHtml.replace(/<link\b[^>]*>/gi, (tag) => {
      const rel = getAttribute(tag, 'rel').toLowerCase().split(/\s+/);
      const href = getAttribute(tag, 'href');
      if (!rel.includes('stylesheet')) return tag;
      const cssFile = resolveProjectFile(href, htmlFile.name, files);
      return cssFile ? `<style>${cssFile.content || ''}</style>` : tag;
    });
    rawHtml = rawHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (tag) => {
      const src = getAttribute(tag, 'src');
      if (!src) return tag;
      const jsFile = resolveProjectFile(src, htmlFile.name, files);
      if (!jsFile) return tag;
      const scriptAttributes = tag.match(/^<script\b([^>]*)>/i)?.[1] || '';
      const attributesWithoutSrc = scriptAttributes.replace(/\s+src\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, '');
      return `<script${attributesWithoutSrc}>${jsFile.content || ''}</script>`;
    });

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

    if (rawHtml.includes('</head>')) {
      rawHtml = rawHtml.replace('</head>', `${consoleInterceptorScript}</head>`);
    } else {
      rawHtml = `${consoleInterceptorScript}${rawHtml}`;
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
  }, [files, entryFilePath, refreshToken]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (
        e.source === iframeRef.current?.contentWindow &&
        e.origin === 'null' &&
        e.data?.type === 'CODEFORGE_CONSOLE'
      ) {
        onConsoleLog?.(e.data.message, e.data.logType);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const openInNewTab = () => {
    const html = assembleHTML();
    const win = window.open();
    if (!win) return;
    win.opener = null;
    const frame = win.document.createElement('iframe');
    frame.title = 'Sandboxed Web Preview';
    frame.setAttribute('sandbox', 'allow-scripts allow-modals allow-forms allow-popups');
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff';
    win.document.body.style.margin = '0';
    win.document.body.append(frame);
    frame.srcdoc = html;
  };

  if (!isVisible) return null;

  return (
    <div className="preview-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
      <div className="preview-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-bright)' }}>
          <Monitor size={14} color="var(--accent-light)" />
          <span>Live Preview{entryFilePath ? ` · ${files.find(file => file.path === entryFilePath)?.name || ''}` : ''}</span>
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
