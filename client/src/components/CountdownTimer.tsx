import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  size?: 'small' | 'large';
  onTimeUp?: () => void;
}

export function CountdownTimer({ endTime, size = 'small', onTimeUp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        onTimeUp?.();
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, total: distance });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp]);

  const getColorClass = () => {
    if (timeLeft.total < 300000) return 'from-red-600 to-red-800'; // 5 minutes
    if (timeLeft.total < 3600000) return 'from-orange-500 to-orange-700'; // 1 hour
    return 'from-red-600 to-red-700';
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  if (size === 'large') {
    return (
      <div className={`bg-gradient-to-r ${getColorClass()} text-white p-6 rounded-2xl text-center ${timeLeft.total < 300000 ? 'animate-pulse' : ''}`}>
        <div className="text-sm mb-2">Auction Ends In</div>
        <div className="text-3xl font-bold font-mono mb-2">
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </div>
        <div className="text-sm opacity-90">
          {timeLeft.hours > 0 && `${timeLeft.hours} hours `}
          {timeLeft.minutes} minutes
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold ${timeLeft.total < 300000 ? 'animate-pulse' : ''}`}>
      <Clock className="w-3 h-3 inline mr-1" />
      {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
      {timeLeft.minutes}m left
    </div>
  );
}
