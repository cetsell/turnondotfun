/**
 * Theme configuration
 * All styling is now handled by Tailwind CSS classes
 * This file only exports the theme provider for React context
 */

export default {};
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  components,

  // Theme functions
  initializeTheme,
  getColor: (colorPath) => {
    const parts = colorPath.split('.');
    let result = theme;
    
    for (const part of parts) {
      if (result[part] === undefined) {
        console.warn(`Theme color path "${colorPath}" not found`);
        return null;
      }
      result = result[part];
    }
    
    return result;
  },
  getSpacing: (size) => {
    return theme.spacing[size] || size;
  }
};

export default theme;
