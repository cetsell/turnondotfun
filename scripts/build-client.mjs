import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
// Import our custom Tailwind plugin
import { tailwindPlugin } from './plugins/tailwind-plugin.mjs'

const dev = process.argv.includes('--dev')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, '../')
const buildDir = path.join(rootDir, 'build')

await fs.emptyDir(buildDir)

/**
 * Build Client
 */

const buildDirectory = path.join(rootDir, 'build')

{
  const clientCtx = await esbuild.context({
    entryPoints: ['src/client/world-client.js'],
    outfile: 'build/world-client.js',
    platform: 'browser',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: 'inline',
    metafile: true,
    jsx: 'automatic',
    jsxImportSource: '@firebolt-dev/jsx',
    // define: {
    //   // 'process.env.NODE_ENV': '"development"',
    // },
    loader: {
      '.js': 'jsx',
      '.css': 'css', // Add CSS loader
    },
    external: ['three', 'react', 'react-dom', 'ses'],
    // alias: {
    //   react: 'react', // always use our own local react (jsx)
    // },
    plugins: [tailwindPlugin], // Add our Tailwind plugin
  })
  
  if (dev) {
    await clientCtx.watch()
  } else {
    await clientCtx.rebuild()
    await clientCtx.dispose() // Clean up the context to allow process to exit
    console.log('Client build complete')
  }
}
