import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Function to change the theme
const changeTheme = (theme) => {
  document.documentElement.setAttribute("data-bs-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  
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
};

export function ThemeProvider({ children }) {
  // Effect to handle theme based on system preferences
  useEffect(() => {
    // Check the user's initial preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      changeTheme("dark");
    } else {
      changeTheme("light");
    }

    // Listen to the 'prefers-color-scheme' change event
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      // If the user's preference is 'dark'
      if (event.matches) {
        changeTheme("dark");
      } else {
        changeTheme("light");
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get current theme for context
  const getCurrentTheme = () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  };

  return (
    <ThemeContext.Provider value={{ theme: getCurrentTheme() }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
