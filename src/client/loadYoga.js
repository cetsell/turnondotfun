/**
 * Yoga Loader
 *
 * This function is passed into world.init() providing a browser specific method for loading Yoga.
 * Yoga is a layout engine used for UI components.
 */
import { initYoga } from '../core/extras/yoga'

let promise
export function loadYoga() {
  if (!promise) {
    promise = new Promise(async resolve => {
      try {
        // Check if Yoga is already available globally
        if (globalThis.Yoga) {
          console.log('Yoga already loaded from global scope')
          initYoga()
          resolve(globalThis.Yoga)
          return
        }
        
        // Try to load the Yoga WebAssembly module
        console.log('Attempting to load Yoga WebAssembly module')
        
        try {
          // First try to load from the CDN
          const yogaUrl = 'https://unpkg.com/yoga-layout-wasm@1.9.3/dist/yoga.wasm'
          
          // Load the WebAssembly module
          const response = await fetch(yogaUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch Yoga WASM: ${response.statusText}`)
          }
          
          const buffer = await response.arrayBuffer()
          const wasmModule = await WebAssembly.instantiate(buffer)
          
          // Initialize the Yoga module
          globalThis.Yoga = wasmModule.instance.exports
          
          console.log('Successfully loaded Yoga WebAssembly module')
          initYoga()
          resolve(globalThis.Yoga)
          return
        } catch (wasmError) {
          console.error('Failed to load Yoga WebAssembly module:', wasmError)
          console.warn('Falling back to mock implementation')
        }
        
        // If we reach here, we need to use the mock implementation
        console.log('Creating mock Yoga implementation')
        
        // Create a simple mock implementation
        const mockYoga = {
          // Display constants
          DISPLAY_FLEX: 0,
          DISPLAY_NONE: 1,
          
          // Flex direction constants
          FLEX_DIRECTION_COLUMN: 0,
          FLEX_DIRECTION_COLUMN_REVERSE: 1,
          FLEX_DIRECTION_ROW: 2,
          FLEX_DIRECTION_ROW_REVERSE: 3,
          
          // Justify content constants
          JUSTIFY_FLEX_START: 0,
          JUSTIFY_FLEX_END: 1,
          JUSTIFY_CENTER: 2,
          
          // Align items constants
          ALIGN_STRETCH: 0,
          ALIGN_FLEX_START: 1,
          ALIGN_FLEX_END: 2,
          ALIGN_CENTER: 3,
          ALIGN_BASELINE: 4,
          
          // Align content constants
          ALIGN_SPACE_BETWEEN: 5,
          ALIGN_SPACE_AROUND: 6,
          ALIGN_SPACE_EVENLY: 7,
          
          // Wrap constants
          WRAP_NO_WRAP: 0,
          WRAP_WRAP: 1,
          WRAP_WRAP_REVERSE: 2,
          
          // Edge constants
          EDGE_LEFT: 0,
          EDGE_TOP: 1,
          EDGE_RIGHT: 2,
          EDGE_BOTTOM: 3,
          EDGE_ALL: 4,
          
          // Gutter constants
          GUTTER_ALL: 0,
          
          // Measure mode constants
          MEASURE_MODE_EXACTLY: 0,
          MEASURE_MODE_AT_MOST: 1,
          
          // Node creation
          Node: {
            create: function() {
              return {
                setMargin: function() {},
                setPadding: function() {},
                setBorder: function() {},
                setGap: function() {},
                setFlexWrap: function() {},
                setFlexDirection: function() {},
                setJustifyContent: function() {},
                setAlignItems: function() {},
                setAlignContent: function() {},
                setWidth: function() {},
                setHeight: function() {},
                getComputedWidth: function() { return 0; },
                getComputedHeight: function() { return 0; },
                getComputedPadding: function() { return 0; }
              };
            }
          }
        };
        
        // Set the global Yoga object
        globalThis.Yoga = mockYoga;
        console.log('Mock Yoga implementation created and set globally')
        initYoga()
        resolve(mockYoga)
      } catch (error) {
        console.error('Error in Yoga initialization:', error)
        // Create a minimal mock to prevent crashes
        const minimalMock = { Node: { create: () => ({}) } }
        globalThis.Yoga = minimalMock
        resolve(minimalMock)
      }
    })
  }
  return promise
}
