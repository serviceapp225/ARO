import { useState, useEffect } from 'react';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  onPriceUpdate?: () => void;
}

export function AnimatedPrice({ value, className = "", onPriceUpdate }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setIsAnimating(true);
      onPriceUpdate?.();
      
      // Animate price change
      const duration = 1000;
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (endValue - startValue) * easeOutCubic;
        setDisplayValue(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setPrevValue(value);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, prevValue, displayValue, onPriceUpdate]);

  return (
    <div className={`relative ${className}`}>
      <div className={`transition-all duration-300 ${
        isAnimating 
          ? 'transform scale-110 text-green-600 drop-shadow-lg' 
          : 'transform scale-100'
      }`}>
        ${displayValue.toLocaleString()}
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 animate-ping">
          <div className="w-full h-full bg-green-400 rounded-lg opacity-25"></div>
        </div>
      )}
      
      {isAnimating && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce">
            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
          </div>
        </div>
      )}
    </div>
  );
}