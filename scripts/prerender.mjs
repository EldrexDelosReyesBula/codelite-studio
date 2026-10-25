import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectRoot, 'dist', 'index.html');
const vite = await createServer({
  configFile: path.join(projectRoot, 'vite.config.js'),
  root: projectRoot,
  appType: 'custom',
  logLevel: 'error',
  server: {
    middlewareMode: true,
    hmr: false
  }
});

try {
  const { default: SeoLanding } = await vite.ssrLoadModule('/src/SeoLanding.jsx');
  const renderedLanding = renderToString(createElement(SeoLanding));
  const html = await readFile(outputPath, 'utf8');
  const rootPlaceholder = '<div id="root"></div>';

  if (!html.includes(rootPlaceholder)) {
    throw new Error('Could not find the application root in the built HTML.');
  }

  await writeFile(outputPath, html.replace(rootPlaceholder, `<div id="root">${renderedLanding}</div>`));
} finally {
  await vite.close();
}
