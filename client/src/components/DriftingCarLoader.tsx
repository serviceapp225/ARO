import React from 'react';
import { Car } from 'lucide-react';
import './DriftingCarLoader.css';

interface DriftingCarLoaderProps {
  message?: string;
}

export default function DriftingCarLoader({ message = "Загрузка..." }: DriftingCarLoaderProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 flex flex-col items-center space-y-6 shadow-2xl max-w-sm mx-4">
        {/* Дорога */}
        <div className="relative w-80 h-20 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg overflow-hidden shadow-inner">
          {/* Разметка дороги */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1/2 opacity-80">
            <div className="flex space-x-6 animate-road-lines">
              <div className="w-12 h-1 bg-yellow-400"></div>
              <div className="w-12 h-1 bg-yellow-400"></div>
              <div className="w-12 h-1 bg-yellow-400"></div>
              <div className="w-12 h-1 bg-yellow-400"></div>
              <div className="w-12 h-1 bg-yellow-400"></div>
            </div>
          </div>
          
          {/* Машинка дрифтует */}
          <div className="absolute top-3 left-2 animate-realistic-drift">
            <Car 
              size={28} 
              className="text-red-500 drop-shadow-xl transform-gpu" 
            />
            {/* Следы от шин - множественные */}
            <div className="absolute -bottom-1 -left-4 w-12 h-1 bg-black/40 rounded-full animate-fade-trails transform rotate-12"></div>
            <div className="absolute -bottom-1 -left-2 w-8 h-1 bg-black/25 rounded-full animate-fade-trails transform rotate-8" style={{ animationDelay: '0.1s' }}></div>
          </div>
          
          {/* Дым от шин - множественный */}
          <div className="absolute top-6 left-12 animate-smoke">
            <div className="w-3 h-3 bg-gray-300/50 rounded-full"></div>
          </div>
          <div className="absolute top-5 left-16 animate-smoke" style={{ animationDelay: '0.2s' }}>
            <div className="w-2 h-2 bg-gray-400/40 rounded-full"></div>
          </div>
          <div className="absolute top-7 left-20 animate-smoke" style={{ animationDelay: '0.4s' }}>
            <div className="w-1 h-1 bg-gray-500/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Текст загрузки */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
      

    </div>
  );
}