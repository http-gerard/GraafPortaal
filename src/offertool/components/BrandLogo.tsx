import React from 'react';

interface BrandLogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="Studio Graaf" 
        className={`${sizeMap[size]} object-contain`} 
      />
    </div>
  );
};
