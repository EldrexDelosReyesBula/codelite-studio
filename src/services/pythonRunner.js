let pyodideInstance = null;
let isLoading = false;
let preloadStarted = false;

export async function initPyodide(onLog) {
  if (pyodideInstance) return pyodideInstance;
  if (isLoading) {
    while (isLoading) {
      await new Promise(res => setTimeout(res, 100));
    }
    return pyodideInstance;
  }

  isLoading = true;
  if (onLog) onLog('Initializing Pyodide Python 3.11 WASM Engine...', 'info');

  try {
    if (typeof window !== 'undefined' && typeof window.loadPyodide === 'function') {
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
    } else {
      const pyodideScript = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = pyodideScript;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Pyodide script failed to load.'));
        document.head.appendChild(script);
      });

      if (typeof window.loadPyodide !== 'function') {
        throw new Error('Pyodide script tag not found or network connection restricted.');
      }

      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
    }

    if (onLog) onLog('Pre-loading Pyodide micro-packages (numpy, matplotlib)...', 'info');
    await pyodideInstance.loadPackage(['numpy', 'matplotlib']);

    if (onLog) onLog('Python 3.11 WASM Engine Ready!', 'success');
    isLoading = false;
    return pyodideInstance;
  } catch (err) {
    isLoading = false;
    if (onLog) onLog(`Failed to load Pyodide: ${err.message}`, 'stderr');
    throw err;
  }
}

// Background pre-load: Start loading Pyodide on app startup without blocking UI
export function preloadPyodideInBackground() {
  if (preloadStarted || pyodideInstance) return;
  preloadStarted = true;
  // Silent background load - no logging
  initPyodide(null).catch(err => console.warn('Pyodide background preload failed:', err));
}

export async function runPythonCode(code, onStdout, onStderr, onPlot, onPromptInput) {
  const worker = new Worker(new URL('./pythonWorker.js', import.meta.url), { type: 'classic' });

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
    };

    worker.onmessage = (event) => {
      const { type, text, dataUrl, message } = event.data || {};

      if (type === 'ready') {
        if (onStdout) onStdout('Python 3.11 WASM Engine Ready!', 'success');
        return;
      }

      if (type === 'stdout') {
        if (onStdout) onStdout(text, 'stdout');
        return;
      }

      if (type === 'stderr') {
        if (onStderr) onStderr(text, 'stderr');
        return;
      }

      if (type === 'plot') {
        if (onPlot) onPlot(dataUrl);
        return;
      }

      if (type === 'error') {
        if (onStderr) onStderr(message, 'stderr');
        cleanup();
        reject(new Error(message));
        return;
      }

      if (type === 'done') {
        if (onStdout) onStdout('--- Execution completed ---', 'info');
        cleanup();
        resolve();
      }
    };

    worker.onerror = (err) => {
      const message = err?.message || String(err);
      if (onStderr) onStderr(message, 'stderr');
      cleanup();
      reject(err);
    };

    worker.postMessage({ type: 'run', code });
  });
}
