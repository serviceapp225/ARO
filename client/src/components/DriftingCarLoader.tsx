import React from 'react';
import { Car } from 'lucide-react';

interface DriftingCarLoaderProps {
  message?: string;
}

export default function DriftingCarLoader({ message = "Загрузка..." }: DriftingCarLoaderProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <style>{`
        @keyframes drift {
          0% { transform: translateX(0) rotate(5deg); }
          25% { transform: translateX(60px) rotate(-3deg); }
          50% { transform: translateX(120px) rotate(8deg); }
          75% { transform: translateX(180px) rotate(-2deg); }
          100% { transform: translateX(240px) rotate(5deg); }
        }
        
        @keyframes smoke {
          0% { opacity: 0.8; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.5) translateY(-15px); }
        }
        
        @keyframes road-lines {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
        
        .car-drift {
          animation: drift 2.5s ease-in-out infinite;
        }
        
        .smoke-effect {
          animation: smoke 1.5s ease-out infinite;
        }
        
        .road-lines {
          animation: road-lines 0.8s linear infinite;
        }
      `}</style>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 flex flex-col items-center space-y-6 shadow-2xl max-w-md mx-4">
        {/* Дорога */}
        <div className="relative w-80 h-24 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg overflow-hidden shadow-inner">
          {/* Разметка дороги */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1/2 opacity-90">
            <div className="flex space-x-8 road-lines">
              <div className="w-16 h-1 bg-yellow-400"></div>
              <div className="w-16 h-1 bg-yellow-400"></div>
              <div className="w-16 h-1 bg-yellow-400"></div>
              <div className="w-16 h-1 bg-yellow-400"></div>
              <div className="w-16 h-1 bg-yellow-400"></div>
            </div>
          </div>
          
          {/* Машинка дрифтует */}
          <div className="absolute top-4 left-4 car-drift">
            <Car 
              size={32} 
              className="text-red-500 drop-shadow-xl" 
            />
            {/* Следы от шин */}
            <div className="absolute -bottom-1 -left-3 w-10 h-1 bg-black/50 rounded-full opacity-70"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-1 bg-black/30 rounded-full opacity-50"></div>
          </div>
          
          {/* Дым от шин */}
          <div className="absolute top-8 left-16 smoke-effect">
            <div className="w-3 h-3 bg-gray-300/60 rounded-full"></div>
          </div>
          <div className="absolute top-7 left-20 smoke-effect" style={{ animationDelay: '0.3s' }}>
            <div className="w-2 h-2 bg-gray-400/50 rounded-full"></div>
          </div>
          <div className="absolute top-9 left-24 smoke-effect" style={{ animationDelay: '0.6s' }}>
            <div className="w-1 h-1 bg-gray-500/40 rounded-full"></div>
          </div>
        </div>
        
        {/* Текст загрузки */}
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {message}
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}