import React from 'react';

/**
 * Button component using Tailwind CSS with system theme support
 * @param {Object} props Component props
 * @param {string} props.variant - Button variant (primary, secondary, outline, text)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 */
export function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  // Base classes that all buttons share
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors duration-300 focus:outline-none';
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark dark:bg-secondary-light dark:hover:bg-secondary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light',
    text: 'bg-transparent text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary'
  };
  
  // Disabled state classes
  const disabledClasses = 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500 hover:bg-gray-300';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    disabled ? disabledClasses : variantClasses[variant] || variantClasses.primary,
    className
  ].join(' ');
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
