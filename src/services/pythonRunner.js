let pyodideInstance = null;
let isLoading = false;

export async function initPyodide(onLog) {
  if (pyodideInstance) return pyodideInstance;
  if (isLoading) {
    while (!pyodideInstance) {
      await new Promise(res => setTimeout(res, 200));
    }
    return pyodideInstance;
  }

  isLoading = true;
  if (onLog) onLog('Initializing Pyodide Python 3.11 WASM Engine...', 'info');

  try {
    if (typeof window.loadPyodide !== 'function') {
      throw new Error('Pyodide script tag not found or network connection restricted.');
    }
    pyodideInstance = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

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

export async function runPythonCode(code, onStdout, onStderr, onPlot, onPromptInput) {
  try {
    const pyodide = await initPyodide(onStdout);

    // Setup stdout / stderr redirection in Python
    pyodide.setStdout({
      batched: (text) => onStdout && onStdout(text, 'stdout')
    });
    pyodide.setStderr({
      batched: (text) => onStderr && onStderr(text, 'stderr')
    });

    // Custom Matplotlib hook to capture plots and output as base64 images
    const setupPlotHook = `
import sys
import io
import base64

try:
    import matplotlib
    try:
        matplotlib.use('module://matplotlib_pyodide.html5_canvas_backend')
    except Exception:
        try:
            matplotlib.use('module://matplotlib.backends.html5_canvas_backend')
        except Exception:
            pass
    import matplotlib.pyplot as plt

    def _custom_show():
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close('all')
        print(f"__CODEFORGE_PLOT__:{img_str}")

    plt.show = _custom_show
except Exception as e:
    pass
`;
    await pyodide.runPythonAsync(setupPlotHook);

    // Filter stdout for plot strings
    const originalStdout = onStdout;
    const wrappedStdout = (text, type) => {
      if (text.includes('__CODEFORGE_PLOT__:')) {
        const parts = text.split('__CODEFORGE_PLOT__:');
        if (parts[1]) {
          const base64Data = parts[1].trim();
          if (onPlot) onPlot(`data:image/png;base64,${base64Data}`);
        }
      } else {
        if (originalStdout) originalStdout(text, type);
      }
    };

    pyodide.setStdout({ batched: (text) => wrappedStdout(text, 'stdout') });

    // Execute user code
    await pyodide.runPythonAsync(code);
    onStdout('--- Execution completed ---', 'info');
  } catch (err) {
    onStderr(err.message, 'stderr');
  }
}
