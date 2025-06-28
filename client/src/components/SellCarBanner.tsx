import { Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function SellCarBanner() {
  return (
    <div style={{
      background: 'red',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <p>БАНЕР "ПРОДАЙ СВОЕ АВТО" ЗДЕСЬ</p>
      <a href="/sell" style={{
        background: 'white',
        color: 'red',
        padding: '10px 20px',
        textDecoration: 'none',
        display: 'inline-block',
        marginTop: '10px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        НАЧАТЬ ПРОДАЖУ →
      </a>
      <p>↑ ЭТА КНОПКА ДОЛЖНА ПЕРЕВЕСТИ НА /sell</p>
    </div>
  );
}