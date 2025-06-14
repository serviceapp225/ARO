import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  size?: 'small' | 'large';
  onTimeUp?: () => void;
}

export function CountdownTimer({ endTime, size = 'small', onTimeUp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      // Debug logging
      console.log('Timer debug:', {
        now: new Date(now).toISOString(),
        endTime: endTime.toISOString(),
        distance: distance,
        distanceHours: Math.floor(distance / (1000 * 60 * 60))
      });

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onTimeUp?.();
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, total: distance });
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
          {timeLeft.days > 0 && `${timeLeft.days}д `}
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </div>
        <div className="text-sm opacity-90">
          {timeLeft.days > 0 && `${timeLeft.days} дней `}
          {timeLeft.hours > 0 && `${timeLeft.hours} часов `}
          {timeLeft.minutes} минут {timeLeft.seconds} секунд
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold ${timeLeft.total < 300000 ? 'animate-pulse' : ''}`}>
      <Clock className="w-2.5 h-2.5 inline mr-0.5" />
      {timeLeft.days > 0 ? `${timeLeft.days}д ` : ''}
      {timeLeft.hours > 0 ? `${timeLeft.hours}ч ` : ''}
      {timeLeft.minutes}м {timeLeft.seconds}с
    </div>
  );
}
