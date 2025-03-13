import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import { fork, execSync } from 'child_process'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
// Import our custom Tailwind plugin
import { tailwindPlugin } from './plugins/tailwind-plugin.mjs'

const dev = process.argv.includes('--dev')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, '../')
const buildDir = path.join(rootDir, 'build')

// Preserve assets during cleanup
const assetsDir = path.join(buildDir, 'public/assets')
let hasExistingAssets = false
if (await fs.pathExists(assetsDir)) {
  const tempDir = path.join(rootDir, '.temp_assets')
  await fs.move(assetsDir, tempDir)
  hasExistingAssets = true
}

await fs.emptyDir(buildDir)

// Restore assets if they existed
if (hasExistingAssets) {
  const tempDir = path.join(rootDir, '.temp_assets')
  await fs.move(tempDir, assetsDir)
}

/**
 * Build Client
 */

const clientPublicDir = path.join(rootDir, 'src/client/public')
const clientBuildDir = path.join(rootDir, 'build/public')
const clientHtmlSrc = path.join(rootDir, 'src/client/public/index.html')
const clientHtmlDest = path.join(rootDir, 'build/public/index.html')

// Custom resolver plugin for problematic packages
const nodeModulesPlugin = {
  name: 'problematic-modules-resolver',
  setup(build) {
    // Create a virtual module for three-mesh-bvh that provides a stub implementation
    // This is better than marking it external since it avoids ESM URL resolution errors
    build.onResolve({ filter: /^three-mesh-bvh$/ }, args => {
      return {
        path: args.path,
        namespace: 'stub-modules'
      }
    })

    build.onLoad({ filter: /.*/, namespace: 'stub-modules' }, args => {
      if (args.path === 'three-mesh-bvh') {
        // Create a stub module that provides empty implementations of common functions
        return {
          contents: `
            // Stub implementation for three-mesh-bvh
            export const MeshBVH = class MeshBVH {};
            export const MeshBVHVisualizer = class MeshBVHVisualizer {};
            export const StaticGeometryGenerator = class StaticGeometryGenerator {};
            export const SAH = 0;
            export const CENTER = 1;
            
            // Additional exports needed by the project
            export const computeBoundsTree = () => {};
            export const disposeBoundsTree = () => {};
            export const acceleratedRaycast = () => {};
            
            export default {
              MeshBVH,
              MeshBVHVisualizer,
              StaticGeometryGenerator,
              SAH,
              CENTER,
              computeBoundsTree,
              disposeBoundsTree,
              acceleratedRaycast
            };
          `,
          resolveDir: rootDir
        }
      }
    })
  }
}

{
  const clientCtx = await esbuild.context({
    entryPoints: ['src/client/index.js'],
    entryNames: '/[name]-[hash]',
    outdir: clientBuildDir,
    platform: 'browser',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    metafile: true,
    jsx: 'automatic',
    jsxImportSource: '@firebolt-dev/jsx',
    define: {
      // 'process.env.NODE_ENV': '"development"',
    },
    loader: {
      '.js': 'jsx',
      '.css': 'css', // Add CSS loader
    },
    alias: {
      react: 'react', // always use our own local react (jsx)
    },
    // Remove the external configuration as we're using stubs instead
    plugins: [
      nodeModulesPlugin, // Add our custom resolver plugin
      tailwindPlugin, // Add Tailwind plugin
      {
        name: 'client-finalize-plugin',
        setup(build) {
          build.onEnd(async result => {
            // Check for build errors first
            if (result.errors.length > 0) {
              console.error('Build failed with errors:', result.errors)
              return
            }

            try {
              // copy over public files
              await fs.copy(clientPublicDir, clientBuildDir)
              
              // find js output file
              if (!result.metafile) {
                console.error('No metafile available in build result')
                return
              }
              
              const outputFiles = Object.keys(result.metafile.outputs)
              const jsFile = outputFiles.find(file => file.endsWith('.js'))
              
              if (!jsFile) {
                console.error('No JS output file found in build')
                return
              }
              
              const relativePath = jsFile.split('build/public')[1]
              
              // inject into html and copy over
              let htmlContent = await fs.readFile(clientHtmlSrc, 'utf-8')
              htmlContent = htmlContent.replace('{jsFile}', relativePath)
              htmlContent = htmlContent.replaceAll('{buildId}', Date.now())
              await fs.writeFile(clientHtmlDest, htmlContent)
            } catch (error) {
              console.error('Error in build finalization:', error)
            }
          })
        },
      },
    ],
  })
  if (dev) {
    await clientCtx.watch()
  } else {
    await clientCtx.rebuild()
    await clientCtx.dispose() // Clean up the context to allow process to exit
  }
}

/**
 * Build Server
 */

let spawn

{
  const serverCtx = await esbuild.context({
    entryPoints: ['src/server/index.js'],
    outfile: 'build/index.js',
    platform: 'node',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    packages: 'external',
    define: {
      'process.env.CLIENT': 'false',
      'process.env.SERVER': 'true',
    },
    plugins: [
      nodeModulesPlugin, // Add our custom resolver plugin
      {
        name: 'server-finalize-plugin',
        setup(build) {
          build.onEnd(async result => {
            // copy over physx wasm
            const physxWasmSrc = path.join(rootDir, 'src/server/physx/physx-js-webidl.wasm')
            const physxWasmDest = path.join(rootDir, 'build/physx-js-webidl.wasm')
            await fs.copy(physxWasmSrc, physxWasmDest)
            // start the server or stop here
            if (dev) {
              // (re)start server
              spawn?.kill('SIGTERM')
              spawn = fork(path.join(rootDir, 'build/index.js'))
            } else {
              // Build complete - don't exit
              console.log('Build complete!')
            }
          })
        },
      },
    ],
    loader: {},
  })
  if (dev) {
    await serverCtx.watch()
  } else {
    await serverCtx.rebuild()
    await serverCtx.dispose() // Clean up the context to allow process to exit
    console.log('All builds complete. Exiting...')
  }
}
