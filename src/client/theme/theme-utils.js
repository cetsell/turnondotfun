/**
 * This file exists to ensure Tailwind processes all theme-related classes
 * even if they're dynamically applied and might be missed by the purge process
 */

// This function is never called - it's just to make sure Tailwind sees these classes
export function ensureThemeClassesAreProcessed() {
  // Common theme classes we want to ensure are included in the build
  const themeClasses = [
    // Standard Tailwind classes we're using
    'bg-white',
    'bg-black',
    'text-black',
    'text-white',
    'text-gray-800',
    'text-gray-200',
    'border-gray-200',
    'border-gray-700',
    'bg-white/80',
    'bg-black/80',
    'bg-white/30',
    'bg-black/30',
    'bg-white/90',
    'bg-black/90',
    
    // Dark mode variants
    'dark:bg-black',
    'dark:text-white',
    'dark:border-gray-700',
    
    // Button classes
    'btn',
    'btn-primary',
    'btn-secondary',
    'hover:bg-primary/30',
    'hover:bg-secondary/30',
    'hover:shadow-md',
    
    // Form classes
    'form-group',
    'form-label',
    
    // Card classes
    'card',
    'glass',
    
    // Text classes
    'title',
    'subtitle',
    
    // Link classes
    'link-primary',
    'link-secondary',
    
    // Layout classes
    'page-container',
    
    // Error classes
    'error-message',
    
    // Group hover classes
    'group-hover:bg-primary/30',
    'group-hover:text-primary',
    
    // Standard Tailwind utility classes we use
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'gap-6',
    'rounded-lg',
    'p-4',
    'py-2',
    'px-4',
    'mx-auto',
    'mb-4',
    'mb-6',
    'font-bold',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-center',
    'max-w-md',
    'w-full',
    'transition-all',
    'duration-300'
  ];
  
  // Dynamically create a string containing all classes
  // This ensures Tailwind sees all these classes during build
  return themeClasses.join(' ');
}

/**
 * Function to change the theme
 * Matches the user's code pattern
 */
export function changeTheme(theme) {
  const html = document.documentElement;
  html.setAttribute("data-bs-theme", theme);
  html.classList.toggle("dark", theme === "dark");
  
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) {
    if (theme === "dark") {
      metaThemeColor.setAttribute("content", "#000000");
    } else {
      metaThemeColor.setAttribute("content", "#FFFFFF");
    }
  } else {
    // Create meta tag if it doesn't exist
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme === 'dark' ? '#000000' : '#FFFFFF';
    document.head.appendChild(meta);
  }
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
} 