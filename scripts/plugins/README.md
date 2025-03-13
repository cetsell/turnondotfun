# Custom Build Plugins

This directory contains custom plugins for the Hyperfy build process.

## Tailwind Plugin

`tailwind-plugin.mjs` - This plugin adds Tailwind CSS processing to the esbuild pipeline.

### Purpose

This plugin allows the use of Tailwind CSS in the project by:
1. Intercepting CSS files during the build process
2. Processing them through PostCSS with the Tailwind plugin
3. Returning the processed CSS for bundling

### Usage

The plugin is imported and added to the esbuild plugins array in the build scripts:

```javascript
import { tailwindPlugin } from './plugins/tailwind-plugin.mjs'

// In esbuild configuration
plugins: [
  tailwindPlugin,
  // other plugins...
]
```

### When Updating from Upstream Hyperfy

When pulling updates from the upstream Hyperfy repository, you'll need to reapply these changes:

1. Make sure the `plugins` directory remains in place
2. Add the import statement to updated build scripts
3. Add `tailwindPlugin` to the plugins array in the esbuild configuration
4. Add `'.css': 'css'` to the loader configuration

This modular approach minimizes conflicts with upstream changes. 