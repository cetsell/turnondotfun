/**
 * API Utilities
 * 
 * This file contains utility functions for making API requests with absolute URLs
 * to ensure they work correctly regardless of the current route.
 */

/**
 * Get the base URL for the application
 * @returns {string} The base URL (e.g., http://localhost:3000)
 */
export const getBaseUrl = () => {
  return window.location.origin;
};

/**
 * Create an absolute URL for an API endpoint
 * @param {string} path - The relative API path (e.g., /api/avatar/assets)
 * @returns {string} The absolute URL
 */
export const getApiUrl = (path) => {
  const baseUrl = getBaseUrl();
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Create an absolute URL for an asset
 * @param {string} path - The relative asset path (e.g., /assets/avatars/base_models/default_male.vrm)
 * @returns {string} The absolute URL
 */
export const getAssetUrl = (path) => {
  return getApiUrl(path);
};

/**
 * Fetch API wrapper that uses absolute URLs
 * @param {string} path - The relative API path
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const fetchApi = async (path, options = {}) => {
  const url = getApiUrl(path);
  return fetch(url, options);
};

/**
 * Check if a file exists by making a HEAD request
 * @param {string} path - The relative file path
 * @returns {Promise<boolean>} Whether the file exists
 */
export const fileExists = async (path) => {
  try {
    const url = getAssetUrl(path);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error checking if file exists: ${path}`, error);
    return false;
  }
}; 