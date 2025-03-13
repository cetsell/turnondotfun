import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const dev = process.argv.includes('--dev')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, '../')
const buildDir = path.join(rootDir, 'build')

// Create a build directory if it doesn't exist
await fs.ensureDir(buildDir)

// Custom plugin to process CSS with Tailwind
const tailwindPlugin = {
  name: 'tailwind',
  setup(build) {
    // Process CSS files
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.readFile(args.path, 'utf8')
      
      // Process with PostCSS and Tailwind
      try {
        const result = await postcss([
          tailwindcss,
          autoprefixer
        ]).process(css, {
          from: args.path,
          to: path.join(buildDir, 'index.css')
        })

        return {
          contents: result.css,
          loader: 'css'
        }
      } catch (error) {
        console.error('Error processing CSS:', error)
        return {
          errors: [{ text: error.message }]
        }
      }
    })
  }
}

/**
 * Build Client with CSS Processing
 */
async function buildClient() {
  try {
    // Main app build (index.js entry point)
    const appCtx = await esbuild.context({
      entryPoints: ['src/client/index.js'],
      outfile: path.join(buildDir, 'index.js'),
      platform: 'browser',
      format: 'esm',
      bundle: true,
      treeShaking: true,
      minify: !dev,
      sourcemap: dev ? 'inline' : false,
      metafile: true,
      jsx: 'automatic',
      jsxImportSource: '@firebolt-dev/jsx',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.css': 'css',
      },
      plugins: [tailwindPlugin],
    })

    if (dev) {
      console.log('Watching for changes...')
      await appCtx.watch()
    } else {
      console.log('Building client...')
      await appCtx.rebuild()
      await appCtx.dispose()
    }

    // Also build the world-client separately
    const clientCtx = await esbuild.context({
      entryPoints: ['src/client/world-client.js'],
      outfile: path.join(buildDir, 'world-client.js'),
      platform: 'browser',
      format: 'esm',
      bundle: true,
      treeShaking: true,
      minify: !dev,
      sourcemap: dev ? 'inline' : false,
      metafile: true,
      jsx: 'automatic',
      jsxImportSource: '@firebolt-dev/jsx',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
      },
      external: ['three', 'react', 'react-dom', 'ses'],
    })

    if (dev) {
      await clientCtx.watch()
    } else {
      await clientCtx.rebuild()
      await clientCtx.dispose()
    }

    // Copy the public directory to the build directory
    if (fs.existsSync(path.join(rootDir, 'src/client/public'))) {
      await fs.copy(
        path.join(rootDir, 'src/client/public'),
        buildDir,
        { overwrite: true }
      )
    }

    console.log('Client build completed successfully!')
    
    if (!dev) {
      process.exit(0)
    }
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildClient() 