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
