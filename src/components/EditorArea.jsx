import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import { 
  Settings2,
  AlignJustify,
  Maximize2,
  Minimize2,
  Search,
  Copy,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info
} from './icons';

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18];
const FORMATTERS = {
  html: {
    parser: 'html',
    loadPlugins: async () => [
      (await import('prettier/plugins/html')).default,
      (await import('prettier/plugins/babel')).default,
      (await import('prettier/plugins/estree')).default
    ]
  },
  css: {
    parser: 'css',
    loadPlugins: async () => [(await import('prettier/plugins/postcss')).default]
  },
  javascript: {
    parser: 'babel',
    loadPlugins: async () => [
      (await import('prettier/plugins/babel')).default,
      (await import('prettier/plugins/estree')).default
    ]
  },
  typescript: {
    parser: 'typescript',
    loadPlugins: async () => [
      (await import('prettier/plugins/typescript')).default,
      (await import('prettier/plugins/estree')).default
    ]
  },
  json: {
    parser: 'json',
    loadPlugins: async () => [
      (await import('prettier/plugins/babel')).default,
      (await import('prettier/plugins/estree')).default
    ]
  },
  markdown: {
    parser: 'markdown',
    loadPlugins: async () => [(await import('prettier/plugins/markdown')).default]
  }
};

export default function EditorArea({
  file,
  onCodeChange,
  editorRef,
  lineToReveal,
  onLineRevealed
}) {
  const localRef = useRef(null);
  const [fontSize, setFontSize]   = useState(14);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [wordWrap, setWordWrap]   = useState('on');
  const [minimap, setMinimap]     = useState(false);
  const [zenMode, setZenMode]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimeoutRef = useRef(null);
  const formatHandlerRef = useRef(null);

  const showFeedback = (message, variant = 'success', action = null) => {
    setFeedback({ message, variant, action });
    clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), variant === 'error' ? 4000 : 2400);
  };

  useEffect(() => () => clearTimeout(feedbackTimeoutRef.current), []);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const formatDocument = async (automatic = false) => {
    const editor = localRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    const formatter = FORMATTERS[model.getLanguageId()];
    if (!formatter) {
      if (!automatic) showFeedback(`Formatting isn't available for ${model.getLanguageId()}.`, 'info');
      return;
    }

    try {
      const formatted = await prettier.format(model.getValue(), {
        parser: formatter.parser,
        plugins: await formatter.loadPlugins(),
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        semi: true
      });
      if (formatted !== model.getValue()) {
        const selections = editor.getSelections() || [];
        editor.pushUndoStop();
        editor.executeEdits('format-document', [{
          range: model.getFullModelRange(),
          text: formatted,
          forceMoveMarkers: true
        }]);
        editor.pushUndoStop();

        const updatedModel = editor.getModel();
        if (updatedModel && selections.length) {
          editor.setSelections(selections.map(selection => {
            const lineNumber = Math.min(selection.positionLineNumber, updatedModel.getLineCount());
            const column = Math.min(
              selection.positionColumn,
              updatedModel.getLineMaxColumn(lineNumber)
            );
            return {
              selectionStartLineNumber: Math.min(selection.selectionStartLineNumber, updatedModel.getLineCount()),
              selectionStartColumn: Math.min(
                selection.selectionStartColumn,
                updatedModel.getLineMaxColumn(Math.min(selection.selectionStartLineNumber, updatedModel.getLineCount()))
              ),
              positionLineNumber: lineNumber,
              positionColumn: column
            };
          }));
        }
        onCodeChange(updatedModel.getValue());
        showFeedback(automatic ? 'Pasted code formatted' : 'Document formatted');
      } else if (!automatic) {
        showFeedback('Already formatted', 'info');
      }
    } catch (error) {
      showFeedback(`Format failed: ${error.message}`, 'error');
    }
  };
  formatHandlerRef.current = formatDocument;

  const copyCode = async () => {
    const editor = localRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable. Use your device keyboard or browser menu.');
      }
      const selection = editor.getSelection();
      const hasSelection = selection && !selection.isEmpty();
      const text = hasSelection ? model.getValueInRange(selection) : model.getValue();
      await navigator.clipboard.writeText(text);
      showFeedback(hasSelection ? 'Selection copied' : 'File copied', 'success', 'copy');
    } catch (error) {
      showFeedback(error.message || 'Unable to copy code', 'error');
    }
  };

  const pasteCode = async () => {
    const editor = localRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    try {
      if (!navigator.clipboard?.readText) {
        throw new Error('Clipboard access is unavailable. Use Paste from your device keyboard or browser menu.');
      }
      const text = await navigator.clipboard.readText();
      if (!text) {
        showFeedback('Clipboard is empty', 'info');
        return;
      }
      const selection = editor.getSelection();
      const range = selection || {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      };
      editor.executeEdits('clipboard-paste', [{
        range,
        text,
        forceMoveMarkers: true
      }]);
      editor.focus();
      showFeedback('Code pasted', 'success', 'paste');
    } catch (error) {
      showFeedback(error.message || 'Unable to paste code', 'error');
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    localRef.current = editor;
    if (editorRef) editorRef.current = editor;

    // Language-specific completions
    const pythonCompletions = {
      python: ['def', 'class', 'import', 'from', 'return', 'for', 'while', 'if', 'elif', 'else', 'try', 'except', 'with', 'as', 'lambda', 'True', 'False', 'None', 'print', 'len', 'range', 'sum', 'min', 'max', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'np', 'plt', 'matplotlib', 'numpy'],
      pandas: ['DataFrame', 'Series', 'read_csv', 'to_csv', 'dropna', 'fillna'],
      matplotlib: ['plt', 'figure', 'plot', 'scatter', 'hist', 'xlabel', 'ylabel', 'title', 'grid', 'legend', 'show', 'tight_layout'],
      numpy: ['np', 'array', 'arange', 'linspace', 'zeros', 'ones', 'reshape', 'mean', 'std', 'sin', 'cos', 'exp', 'sqrt']
    };

    const htmlCompletions = ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'form', 'input', 'button', 'textarea', 'label', 'select', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'main', 'meta', 'title', 'link', 'script', 'style', 'br', 'hr', 'iframe', 'video', 'audio', 'canvas', 'svg', 'class', 'id', 'src', 'href', 'alt', 'title', 'data-', 'placeholder', 'type', 'name', 'value', 'disabled', 'required'];

    const cssCompletions = ['background', 'color', 'display', 'flex', 'grid', 'width', 'height', 'margin', 'padding', 'border', 'border-radius', 'font-size', 'font-weight', 'text-align', 'justify-content', 'align-items', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'opacity', 'transform', 'transition', 'box-shadow', 'overflow', 'visibility', 'cursor', 'line-height', 'letter-spacing', 'text-decoration', 'background-color', 'background-image', 'box-sizing', 'gap', 'row-gap', 'column-gap', 'flex-direction', 'flex-wrap', 'align-self', 'justify-self', 'grid-template-columns', 'grid-template-rows', 'min-width', 'max-width', 'min-height', 'max-height'];

    const javascriptCompletions = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'super', 'static', 'async', 'await', 'import', 'export', 'default', 'from', 'as', 'true', 'false', 'null', 'undefined', 'console', 'log', 'error', 'warn', 'document', 'querySelector', 'getElementById', 'getElementsByClassName', 'addEventListener', 'fetch', 'JSON', 'parse', 'stringify', 'Math', 'Array', 'Object', 'String', 'Number', 'Date', 'Set', 'Map', 'Promise', 'then', 'catch', 'finally', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'];

    const languageName = getLanguage(file?.name);

    // Python completions
    if (languageName === 'python') {
      monaco.languages.registerCompletionItemProvider('python', {
        triggerCharacters: ['.', ' ', '\n', '"', "'", '(', '[', '{'],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const items = [];
          const suggestions = [...pythonCompletions.python, ...pythonCompletions.numpy, ...pythonCompletions.matplotlib];

          suggestions.forEach((label) => {
            items.push({
              label,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: label,
              range,
              detail: 'Python keyword'
            });
          });

          return { suggestions: items };
        }
      });
    }

    // HTML completions
    if (languageName === 'html') {
      monaco.languages.registerCompletionItemProvider('html', {
        triggerCharacters: ['<', ' ', '=', '"', "'", '.', '-'],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const items = [];
          htmlCompletions.forEach((label) => {
            items.push({
              label,
              kind: label.startsWith('class') || label.startsWith('id') || label.startsWith('data-') ? 
                monaco.languages.CompletionItemKind.Property : 
                monaco.languages.CompletionItemKind.Keyword,
              insertText: label,
              range,
              detail: 'HTML attribute/tag'
            });
          });

          return { suggestions: items };
        }
      });
    }

    // CSS completions
    if (languageName === 'css') {
      monaco.languages.registerCompletionItemProvider('css', {
        triggerCharacters: ['-', ' ', ':'],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const items = [];
          cssCompletions.forEach((label) => {
            items.push({
              label,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: label,
              range,
              detail: 'CSS property'
            });
          });

          return { suggestions: items };
        }
      });
    }

    // JavaScript/TypeScript completions
    if (languageName === 'javascript' || languageName === 'typescript') {
      const lang = languageName === 'javascript' ? 'javascript' : 'typescript';
      monaco.languages.registerCompletionItemProvider(lang, {
        triggerCharacters: ['.', ' ', '\n', '"', "'", '(', '[', '{'],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const items = [];
          javascriptCompletions.forEach((label) => {
            items.push({
              label,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: label,
              range,
              detail: 'JavaScript keyword'
            });
          });

          return { suggestions: items };
        }
      });
    }

    // Custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Autosave already handles this — visual feedback only
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction('editor.action.commentLine')?.run();
    });

    editor.addAction({
      id: 'codelite.format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => formatHandlerRef.current?.()
    });
    editor.onDidPaste(() => {
      showFeedback('Code pasted', 'success', 'paste');
      formatHandlerRef.current?.(true);
    });

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
        renderWhitespace: isMobile ? 'selection' : 'boundary',
        minimap: { enabled: minimap }
      });
    }
  }, [fontSize, wordWrap, minimap, isMobile]);

  useEffect(() => {
    if (!localRef.current || !lineToReveal) return;
    localRef.current.revealLineInCenter(lineToReveal);
    localRef.current.setPosition({ lineNumber: lineToReveal, column: 1 });
    localRef.current.focus();
    onLineRevealed?.();
  }, [file?.path, lineToReveal, onLineRevealed]);

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
    renderWhitespace: isMobile ? 'selection' : 'boundary',
    renderLineHighlight: 'gutter',
    selectionHighlight: true,
    occurrencesHighlight: 'off',
    bracketPairColorization: { enabled: false },
    guides: { bracketPairs: false, indentation: false },
    padding: { top: 10, bottom: 10 },
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'mouseover',
    largeFileOptimizations: true,
    formatOnPaste: false,
    formatOnType: false,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    suggest: { showKeywords: true, showSnippets: true },
    quickSuggestions: { other: false, comments: false, strings: false },
    parameterHints: { enabled: false },
    inlineSuggest: { enabled: false },
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

        <button
          type="button"
          className={`editor-clipboard-btn ${feedback?.action === 'copy' ? 'is-complete' : ''}`}
          onClick={copyCode}
          aria-label="Copy selected code or entire file"
          title="Copy selection, or the entire file if nothing is selected"
        >
          {feedback?.action === 'copy' ? <CheckCircle size={15} /> : <Copy size={13} />}
          <span>{feedback?.action === 'copy' ? 'Copied' : 'Copy'}</span>
        </button>
        <button
          type="button"
          className={`editor-clipboard-btn ${feedback?.action === 'paste' ? 'is-complete' : ''}`}
          onClick={pasteCode}
          aria-label="Paste code from clipboard"
          title="Paste clipboard contents at the cursor"
        >
          {feedback?.action === 'paste' && <CheckCircle size={15} />}
          <span>{feedback?.action === 'paste' ? 'Pasted' : 'Paste'}</span>
        </button>
        <button
          type="button"
          className="editor-clipboard-btn"
          onClick={() => formatDocument()}
          aria-label="Format document"
          title="Format document (Alt+Shift+F); supported languages format automatically after paste"
        >
          <Sparkles size={13} />
          <span>Format</span>
        </button>
        <span className="editor-clipboard-status" aria-live="polite" title={feedback?.message}>
          {feedback?.message}
        </span>

        {/* Find in file */}
        <button
          type="button"
          className="icon-btn editor-secondary-control"
          style={{ width: 24, height: 24 }}
          onClick={() => localRef.current?.getAction('actions.find')?.run()}
          title="Find in file (Ctrl+F)"
        >
          <Search size={12} />
        </button>

        {/* Word Wrap toggle */}
        <button
          className="icon-btn editor-secondary-control"
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
          className="icon-btn editor-secondary-control"
          style={{ width: 24, height: 24, opacity: minimap ? 1 : 0.4 }}
          onClick={() => setMinimap(v => !v)}
          title={minimap ? 'Hide Minimap' : 'Show Minimap'}
        >
          <Settings2 size={12} />
        </button>

        {/* Zen Mode toggle */}
        <button
          className="icon-btn editor-secondary-control"
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
      {feedback && (
        <div className={`editor-feedback editor-feedback-${feedback.variant}`} role={feedback.variant === 'error' ? 'alert' : 'status'}>
          {feedback.variant === 'error'
            ? <AlertCircle size={17} />
            : feedback.variant === 'info'
              ? <Info size={17} />
              : <CheckCircle size={17} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
