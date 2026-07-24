import React from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Wind,
  Zap,
} from 'lucide-react';

interface WeatherIconProps {
  iconName: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ iconName, className = 'w-8 h-8' }) => {
  switch (iconName) {
    case 'Sun':
      return <Sun className={className} />;
    case 'SunCloud':
      return <CloudSun className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'Clouds':
      return <Cloud className={className} />;
    case 'CloudFog':
      return <CloudFog className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} />;
    case 'CloudRain':
    case 'CloudRainHeavy':
      return <CloudRain className={className} />;
    case 'CloudSnow':
      return <CloudSnow className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'CloudHail':
      return <Zap className={className} />;
    default:
      return <Wind className={className} />;
  }
};
