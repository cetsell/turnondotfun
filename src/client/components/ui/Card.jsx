import React from 'react';

/**
 * Card component using Tailwind CSS with system theme support
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {string} props.className - Additional CSS classes
 */
export function Card({
  children,
  title,
  subtitle,
  className = '',
  ...props
}) {
  // Base card classes including frosted glass effect and theme support
  const cardClasses = [
    // Base styles
    'rounded-lg p-6',
    // Theme-aware background and border
    'bg-white/80 dark:bg-gray-800/80',
    'border border-gray-200 dark:border-gray-700',
    // Frosted glass effect
    'backdrop-blur-sm',
    // Shadow with theme support
    'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50',
    className
  ].join(' ');

  // Header classes
  const headerClasses = 'mb-4';
  
  // Title classes with theme support
  const titleClasses = 'text-xl font-bold text-gray-900 dark:text-white';
  
  // Subtitle classes with theme support
  const subtitleClasses = 'text-sm text-gray-600 dark:text-gray-300 mt-1';
  
  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle) && (
        <div className={headerClasses}>
          {title && <h2 className={titleClasses}>{title}</h2>}
          {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
