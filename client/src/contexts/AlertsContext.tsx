import { createContext, useContext, useState, useEffect } from "react";

interface CarAlert {
  id: number;
  make: string;
  model: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  minYear: number | null;
  maxYear: number | null;
  isActive: boolean;
  createdAt: string;
  userId: number;
}

interface AlertsContextType {
  alerts: CarAlert[];
  addAlert: (alert: Omit<CarAlert, 'id' | 'createdAt' | 'userId'>) => void;
  removeAlert: (id: number) => void;
  toggleAlert: (id: number) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<CarAlert[]>([]);

  // Загружаем уведомления из localStorage при инициализации
  useEffect(() => {
    const savedAlerts = localStorage.getItem('carAlerts');
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed);
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    }
  }, []);

  // Сохраняем уведомления в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('carAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = (alertData: Omit<CarAlert, 'id' | 'createdAt' | 'userId'>) => {
    const newAlert: CarAlert = {
      id: Date.now(),
      ...alertData,
      userId: 1, // Mock user ID
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  };

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, removeAlert, toggleAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider');
  }
  return context;
}