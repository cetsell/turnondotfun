import { useEffect } from 'react';
import PlaceholderImage from './PlaceholderImage';

export default function FeatureImages() {
  const features = [
    {
      id: 'rich-narratives',
      text: 'Rich Narratives',
      color: '#4c1d95'
    },
    {
      id: 'unique-characters',
      text: 'Unique Characters',
      color: '#5b21b6'
    },
    {
      id: 'real-time-3d',
      text: 'Real-Time 3D',
      color: '#6d28d9'
    },
    {
      id: 'creator-marketplace',
      text: 'Creator Marketplace',
      color: '#7c3aed'
    }
  ];
  
  useEffect(() => {
    // This component is just for generating placeholder images
    // In a real app, you would use actual images instead
    console.log('Feature images generated');
  }, []);
  
  return (
    <div style={{ display: 'none' }}>
      {features.map(feature => (
        <PlaceholderImage 
          key={feature.id}
          width={800}
          height={600}
          text={feature.text}
          bgColor={feature.color}
        />
      ))}
      <PlaceholderImage 
        width={1200}
        height={800}
        text="Interactive Demo"
        bgColor="#4c1d95"
      />
      <PlaceholderImage 
        width={1920}
        height={1080}
        text="Hero Background"
        bgColor="#0f0f1a"
      />
    </div>
  );
} 