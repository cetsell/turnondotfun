/**
 * Simple Yoga Layout implementation
 * This provides a minimal implementation of the Yoga layout engine
 * to prevent errors in the application.
 */

// Create the global Yoga object
(function(global) {
  // Define constants
  const DISPLAY_FLEX = 0;
  const DISPLAY_NONE = 1;
  
  const FLEX_DIRECTION_COLUMN = 0;
  const FLEX_DIRECTION_COLUMN_REVERSE = 1;
  const FLEX_DIRECTION_ROW = 2;
  const FLEX_DIRECTION_ROW_REVERSE = 3;
  
  const JUSTIFY_FLEX_START = 0;
  const JUSTIFY_FLEX_END = 1;
  const JUSTIFY_CENTER = 2;
  
  const ALIGN_STRETCH = 0;
  const ALIGN_FLEX_START = 1;
  const ALIGN_FLEX_END = 2;
  const ALIGN_CENTER = 3;
  const ALIGN_BASELINE = 4;
  const ALIGN_SPACE_BETWEEN = 5;
  const ALIGN_SPACE_AROUND = 6;
  const ALIGN_SPACE_EVENLY = 7;
  
  const WRAP_NO_WRAP = 0;
  const WRAP_WRAP = 1;
  const WRAP_WRAP_REVERSE = 2;
  
  const EDGE_LEFT = 0;
  const EDGE_TOP = 1;
  const EDGE_RIGHT = 2;
  const EDGE_BOTTOM = 3;
  const EDGE_ALL = 4;
  
  const GUTTER_ALL = 0;
  
  const MEASURE_MODE_EXACTLY = 0;
  const MEASURE_MODE_AT_MOST = 1;
  
  // Create a mock Node class
  class Node {
    constructor() {
      this.children = [];
      this.parent = null;
      this.margin = 0;
      this.padding = 0;
      this.border = 0;
      this.gap = 0;
    }
    
    setMargin(edge, value) {
      this.margin = value;
    }
    
    setPadding(edge, value) {
      this.padding = value;
    }
    
    setBorder(edge, value) {
      this.border = value;
    }
    
    setGap(gutter, value) {
      this.gap = value;
    }
    
    getComputedPadding(edge) {
      return this.padding;
    }
    
    static create() {
      return new Node();
    }
  }
  
  // Export the Yoga object to the global scope
  global.Yoga = {
    // Constants
    DISPLAY_FLEX,
    DISPLAY_NONE,
    FLEX_DIRECTION_COLUMN,
    FLEX_DIRECTION_COLUMN_REVERSE,
    FLEX_DIRECTION_ROW,
    FLEX_DIRECTION_ROW_REVERSE,
    JUSTIFY_FLEX_START,
    JUSTIFY_FLEX_END,
    JUSTIFY_CENTER,
    ALIGN_STRETCH,
    ALIGN_FLEX_START,
    ALIGN_FLEX_END,
    ALIGN_CENTER,
    ALIGN_BASELINE,
    ALIGN_SPACE_BETWEEN,
    ALIGN_SPACE_AROUND,
    ALIGN_SPACE_EVENLY,
    WRAP_NO_WRAP,
    WRAP_WRAP,
    WRAP_WRAP_REVERSE,
    EDGE_LEFT,
    EDGE_TOP,
    EDGE_RIGHT,
    EDGE_BOTTOM,
    EDGE_ALL,
    GUTTER_ALL,
    MEASURE_MODE_EXACTLY,
    MEASURE_MODE_AT_MOST,
    
    // Node class
    Node
  };
  
  console.log('Mock Yoga layout engine initialized');
})(typeof window !== 'undefined' ? window : global);
