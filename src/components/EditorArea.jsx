import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Settings2,
  AlignJustify,
  Maximize2,
  Minimize2,
  Search
} from 'lucide-react';

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18];

export default function EditorArea({
  file,
  onCodeChange,
  editorRef
}) {
  const localRef = useRef(null);
  const [fontSize, setFontSize]   = useState(14);
  const [wordWrap, setWordWrap]   = useState('on');
  const [minimap, setMinimap]     = useState(false);
  const [zenMode, setZenMode]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    localRef.current = editor;
    if (editorRef) editorRef.current = editor;

    // Custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Autosave already handles this — visual feedback only
    });

    // Ctrl+/ to toggle line comment
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction('editor.action.commentLine')?.run();
    });

    // F11 = zen mode
    editor.addCommand(monaco.KeyCode.F11, () => {
      setZenMode(v => !v);
    });
  };

  const getLanguage = (fileName) => {
    if (!fileName) return 'plaintext';
    if (fileName.endsWith('.py'))   return 'python';
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css'))  return 'css';
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'javascript';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md'))   return 'markdown';
    return 'plaintext';
  };

  // Sync settings updates into live Monaco editor
  useEffect(() => {
    if (localRef.current) {
      localRef.current.updateOptions({
        fontSize,
        wordWrap,
        minimap: { enabled: minimap }
      });
    }
  }, [fontSize, wordWrap, minimap]);

  const editorOptions = {
    fontSize,
    minimap: { enabled: minimap },
    wordWrap,
    lineNumbers: 'on',
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    fontFamily: "'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace",
    fontLigatures: true,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderWhitespace: 'boundary',
    renderLineHighlight: 'gutter',
    selectionHighlight: true,
    occurrencesHighlight: 'singleFile',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    padding: { top: 10, bottom: 10 },
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'mouseover',
    formatOnPaste: true,
    formatOnType: false,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    suggest: { showKeywords: true, showSnippets: true },
    quickSuggestions: { other: true, comments: true, strings: true },
    parameterHints: { enabled: true },
    inlineSuggest: { enabled: true },
    accessibilitySupport: 'off',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      useShadows: false,
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6
    }
  };

  return (
    <div
      className="editor-wrapper"
      style={zenMode ? {
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'var(--bg-darkest)',
        display: 'flex', flexDirection: 'column'
      } : {}}
    >
      {/* Editor settings toolbar */}
      <div
        className="editor-settings-bar"
        style={{
        height: 28,
        minHeight: 28,
        background: 'var(--bg-darkest)',
        borderBottom: '0.5px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        padding: '0 8px',
        position: 'relative'
      }}>
        {/* Language tag */}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginRight: 'auto'
        }}>
          {getLanguage(file?.name)}
        </span>

        {/* Find in file */}
        <button
          className="icon-btn"
          style={{ width: 24, height: 24 }}
          onClick={() => localRef.current?.getAction('actions.find')?.run()}
          title="Find in file (Ctrl+F)"
        >
          <Search size={12} />
        </button>

        {/* Word Wrap toggle */}
        <button
          className="icon-btn"
          style={{ width: 24, height: 24, opacity: wordWrap === 'on' ? 1 : 0.4 }}
          onClick={() => setWordWrap(v => v === 'on' ? 'off' : 'on')}
          title={wordWrap === 'on' ? 'Disable Word Wrap' : 'Enable Word Wrap'}
        >
          <AlignJustify size={12} />
        </button>

        {/* Font size select */}
        <select
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          style={{
            background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)',
            color: 'var(--text-muted)', fontSize: 10, borderRadius: 4,
            padding: '1px 4px', cursor: 'pointer'
          }}
          title="Font Size"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        {/* Minimap toggle */}
        <button
          className="icon-btn"
          style={{ width: 24, height: 24, opacity: minimap ? 1 : 0.4 }}
          onClick={() => setMinimap(v => !v)}
          title={minimap ? 'Hide Minimap' : 'Show Minimap'}
        >
          <Settings2 size={12} />
        </button>

        {/* Zen Mode toggle */}
        <button
          className="icon-btn"
          style={{ width: 24, height: 24 }}
          onClick={() => setZenMode(v => !v)}
          title={zenMode ? 'Exit Focus Mode (F11)' : 'Enter Focus Mode (F11)'}
        >
          {zenMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      </div>

      {/* Monaco Editor */}
      {file ? (
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content || ''}
          theme="vs-dark"
          onChange={val => onCodeChange(val || '')}
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--text-muted)', fontSize: 13
            }}>
              Loading editor…
            </div>
          }
        />
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', gap: 12
        }}>
          <span style={{ fontSize: 32, opacity: 0.3 }}>{'</>'}</span>
          <span style={{ fontSize: 13 }}>Select a file from the sidebar to start editing</span>
        </div>
      )}
    </div>
  );
}
