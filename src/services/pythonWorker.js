let pyodideInstance = null;
let isLoading = false;

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (isLoading) {
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return pyodideInstance;
  }

  isLoading = true;
  try {
    if (!self.loadPyodide) {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
    }

    if (!self.loadPyodide) {
      throw new Error('Pyodide failed to load in worker context.');
    }

    pyodideInstance = await self.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });

    await pyodideInstance.loadPackage(['numpy', 'matplotlib']);

    const setupPlotHook = `
import io
import base64

try:
    import matplotlib
    matplotlib.use('Agg', force=True)
    import matplotlib.pyplot as plt

    def _safe_tight_layout(*args, **kwargs):
        try:
            return plt.gcf().tight_layout(*args, **kwargs)
        except Exception:
            return None

    def _custom_show():
        try:
            fig = plt.gcf()
            fig.tight_layout()
        except Exception:
            pass

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close('all')
        print(f"__CODEFORGE_PLOT__:{img_str}")

    plt.tight_layout = _safe_tight_layout
    plt.show = _custom_show
except Exception:
    pass
`;

    await pyodideInstance.runPythonAsync(setupPlotHook);
    isLoading = false;
    self.postMessage({ type: 'ready' });
    return pyodideInstance;
  } catch (err) {
    isLoading = false;
    throw err;
  }
}

self.onmessage = async (event) => {
  const { type, code } = event.data || {};

  if (type !== 'run') return;

  try {
    const pyodide = await ensurePyodide();

    pyodide.setStdout({
      batched: (text) => {
        if (String(text).includes('__CODEFORGE_PLOT__:')) {
          const parts = String(text).split('__CODEFORGE_PLOT__:');
          if (parts[1]) {
            self.postMessage({ type: 'plot', dataUrl: `data:image/png;base64,${parts[1].trim()}` });
          }
        } else {
          self.postMessage({ type: 'stdout', text: String(text) });
        }
      }
    });

    pyodide.setStderr({
      batched: (text) => self.postMessage({ type: 'stderr', text: String(text) })
    });

    await pyodide.runPythonAsync(code);
    self.postMessage({ type: 'done' });
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message || String(err) });
  }
};
