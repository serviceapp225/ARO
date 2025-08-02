import { useEffect, useState, memo } from 'react';
import { Clock, Trophy } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date | string | null | undefined;
  size?: 'small' | 'large';
  onTimeUp?: () => void;
  hasWinner?: boolean; // Новый проп для определения выиграно ли
  winnerDisplayUntil?: Date | string | null; // До какого времени показывать "ВЫИГРАНО"
}

export function CountdownTimer({ endTime, size = 'small', onTimeUp, hasWinner = false, winnerDisplayUntil }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Проверяем что endTime существует и валидно
    if (!endTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      setIsInitialized(true);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      
      // Конвертируем endTime в Date объект безопасно
      let endTimeDate: Date;
      if (typeof endTime === 'string') {
        endTimeDate = new Date(endTime);
      } else if (endTime instanceof Date) {
        endTimeDate = endTime;
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsInitialized(true);
        return;
      }
      
      // Проверяем что дата валидна
      if (isNaN(endTimeDate.getTime())) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsInitialized(true);
        return;
      }
      
      const distance = endTimeDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onTimeUp?.();
        setIsInitialized(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, total: distance });
      if (!isInitialized) setIsInitialized(true);
    };

    // Calculate immediately on mount
    calculateTime();

    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp]);

  const getColorClass = () => {
    if (timeLeft.total < 300000) return 'from-red-600 to-red-800'; // 5 minutes
    if (timeLeft.total < 3600000) return 'from-orange-500 to-orange-700'; // 1 hour
    return 'from-red-600 to-red-700';
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Проверяем, нужно ли показывать "ВЫИГРАНО"
  const shouldShowWinnerStatus = () => {
    if (!hasWinner) return false;
    
    // Если время отображения победителя задано, проверяем его
    if (winnerDisplayUntil) {
      const displayUntilDate = new Date(winnerDisplayUntil);
      const now = new Date();
      return now < displayUntilDate;
    }
    
    // Если время отображения не задано, но есть победитель - показываем ВЫИГРАНО
    // Это покрывает случаи когда аукцион завершен досрочно с победителем
    return true;
  };

  // Если аукцион выигран и в периоде отображения, показываем "ВЫИГРАНО"
  if (shouldShowWinnerStatus()) {
    if (size === 'large') {
      return (
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-2xl text-center animate-pulse">
          <div className="text-sm mb-2">Аукцион завершен</div>
          <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8" />
            ВЫИГРАНО
          </div>
          <div className="text-sm opacity-90">
            Поздравляем с победой!
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
        <Trophy className="w-2.5 h-2.5 inline mr-0.5" />
        ВЫИГРАНО
      </div>
    );
  }

  // Если endTime не задано, показываем сообщение об окончании
  if (!endTime) {
    if (size === 'large') {
      return (
        <div className="bg-gray-400 text-white p-6 rounded-2xl text-center">
          <div className="text-sm mb-2">Аукцион завершен</div>
          <div className="text-3xl font-bold font-mono mb-2">
            00:00:00
          </div>
          <div className="text-sm opacity-90">
            Время истекло
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
        <Clock className="w-2.5 h-2.5 inline mr-0.5" />
        Завершен
      </div>
    );
  }

  if (size === 'large') {
    if (!isInitialized) {
      return (
        <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-6 rounded-2xl text-center animate-pulse">
          <div className="text-sm mb-2">Загрузка времени...</div>
          <div className="text-3xl font-bold font-mono mb-2">
            --:--:--
          </div>
          <div className="text-sm opacity-90">
            Инициализация таймера
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-r ${getColorClass()} text-white p-6 rounded-2xl text-center ${timeLeft.total < 300000 ? 'animate-pulse' : ''}`}>
        <div className="text-sm mb-2">Аукцион завершится через</div>
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

  if (!isInitialized) {
    return (
      <div className="bg-gray-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
        <Clock className="w-2.5 h-2.5 inline mr-0.5" />
        --м --с
      </div>
    );
  }

  // Если время истекло
  if (timeLeft.total <= 0) {
    return (
      <div className="bg-gray-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
        <Clock className="w-2.5 h-2.5 inline mr-0.5" />
        Завершен
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