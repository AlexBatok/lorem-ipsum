import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const config = {
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  outdir: 'extension/dist',
  outbase: 'extension/src',
  sourcemap: false,
  minify: false,
};

const entries = [
  { entryPoints: ['extension/src/popup/popup.ts'] },
  { entryPoints: ['extension/src/background.ts'] },
  { entryPoints: ['extension/src/content/content.ts'] },
];

async function run() {
  for (const entry of entries) {
    if (watch) {
      const ctx = await esbuild.context({ ...config, ...entry });
      await ctx.watch();
    } else {
      await esbuild.build({ ...config, ...entry });
    }
  }
  if (watch) {
    console.log('Watching for changes...');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
