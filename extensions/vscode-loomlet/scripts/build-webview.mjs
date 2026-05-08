import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionDir = join(__dirname, '..');

await build({
  entryPoints: [join(extensionDir, 'webview-src', 'node-editor-webview.js')],
  bundle: true,
  outfile: join(extensionDir, 'media', 'node-editor-webview.js'),
  platform: 'browser',
  format: 'iife',
  globalName: 'LoomletPreview',
  sourcemap: false,
  // Rete.js depends on React; bundle everything together
  jsx: 'automatic',
  // Resolve npm packages (rete, react, etc.) from the extension's node_modules
  nodePaths: [join(extensionDir, 'node_modules')],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('WebView bundle built: media/node-editor-webview.js');
