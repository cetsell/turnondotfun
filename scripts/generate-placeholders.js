// This script generates placeholder images for development
// Run with: node scripts/generate-placeholders.js

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

// Ensure directories exist
const dirs = [
  'public/images',
  'public/images/features',
  'public/videos'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Generate placeholder images
const images = [
  {
    path: 'public/images/hero-poster.jpg',
    width: 1920,
    height: 1080,
    text: 'Hero Background',
    bgColor: '#0f0f1a'
  },
  {
    path: 'public/images/features/rich-narratives.jpg',
    width: 800,
    height: 600,
    text: 'Rich Narratives',
    bgColor: '#4c1d95'
  },
  {
    path: 'public/images/features/unique-characters.jpg',
    width: 800,
    height: 600,
    text: 'Unique Characters',
    bgColor: '#5b21b6'
  },
  {
    path: 'public/images/features/real-time-3d.jpg',
    width: 800,
    height: 600,
    text: 'Real-Time 3D',
    bgColor: '#6d28d9'
  },
  {
    path: 'public/images/features/creator-marketplace.jpg',
    width: 800,
    height: 600,
    text: 'Creator Marketplace',
    bgColor: '#7c3aed'
  },
  {
    path: 'public/images/interactive-demo.jpg',
    width: 1200,
    height: 800,
    text: 'Interactive Demo',
    bgColor: '#4c1d95'
  }
];

// Function to generate a placeholder image
function generatePlaceholderImage({ path, width, height, text, bgColor }) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add some visual interest - gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add some decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 5; i++) {
    const size = Math.random() * 100 + 50;
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw text
  if (text) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path, buffer);
  console.log(`Generated: ${path}`);
}

// Generate all images
images.forEach(generatePlaceholderImage);

console.log('All placeholder images generated successfully!');

// Note: For videos, you would need to use a video generation library
// For now, we'll just create a placeholder text file
fs.writeFileSync('public/videos/hero-background.mp4', 'Placeholder for video file');
console.log('Created placeholder for video file: public/videos/hero-background.mp4');
console.log('Note: You should replace this with a real video file for production.'); 