import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Прокручиваем к началу страницы при каждом изменении маршрута
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}