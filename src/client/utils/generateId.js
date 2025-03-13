/**
 * Generates a unique ID for new worlds
 * 
 * @param {number} length - The length of the ID to generate (default: 12)
 * @returns {string} A unique ID
 */
export function generateUniqueId(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = Date.now().toString(36);
  
  let result = timestamp.slice(0, 4) + '-';
  
  // Add random characters to complete the ID
  const remainingLength = length - result.length;
  for (let i = 0; i < remainingLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}
