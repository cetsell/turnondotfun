import postcss from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

// Get project root directory
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, '../../')
const configPath = path.join(rootDir, 'tailwind.config.js')

/**
 * ESBuild plugin for processing CSS with Tailwind
 * This can be imported and used in the existing build scripts
 * with minimal changes to the core build process.
 */
export const tailwindPlugin = {
  name: 'tailwind',
  setup(build) {
    // Process CSS files
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.readFile(args.path, 'utf8')
      
      console.log(`Processing CSS file: ${args.path}`)
      console.log(`Using Tailwind config from: ${configPath}`)
      
      try {
        console.log('CSS content before processing:')
        console.log(css.substring(0, 500) + '...')
        
        // Process with PostCSS and Tailwind
        const result = await postcss([
          tailwindcssPostcss({
            config: configPath
          }),
          autoprefixer
        ]).process(css, {
          from: args.path,
          to: path.basename(args.path)
        })

        console.log('CSS processing completed successfully')
        console.log('Processed CSS content (first 500 chars):')
        console.log(result.css.substring(0, 500) + '...')

        return {
          contents: result.css,
          loader: 'css'
        }
      } catch (error) {
        console.error('Error processing CSS with Tailwind:')
        console.error(error.message)
        console.error(error.stack)
        
        // More lenient approach - return original CSS on error
        console.log('Returning original CSS content to allow build to continue')
        return {
          contents: css,
          loader: 'css',
          warnings: [{ text: `Tailwind processing error: ${error.message}` }]
        }
      }
    })
  }
} 