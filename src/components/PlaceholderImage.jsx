import { useEffect, useRef } from 'react';

export default function PlaceholderImage({ width = 800, height = 600, text, bgColor = '#4c1d95', textColor = '#ffffff' }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
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
      ctx.fillStyle = textColor;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Set the src attribute of the canvas's parent image element if it exists
    if (canvas.parentElement && canvas.parentElement.tagName === 'IMG') {
      canvas.parentElement.src = dataUrl;
    }
  }, [width, height, text, bgColor, textColor]);
  
  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
} 