import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Car, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

export function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Поиск', href: '/search' },
    { name: 'Избранное', href: '/favorites' },
  ];

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-neutral-900">CarAuctionApp</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    location === item.href
                      ? 'text-primary'
                      : 'text-neutral-700 hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/sell">
                <Button className="bg-red-600 hover:bg-red-700">
                  Продать авто
                </Button>
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <Button variant="ghost">Профиль</Button>
                  </Link>
                  <Button variant="ghost" onClick={logout}>
                    Выйти
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => openAuthModal('login')}
                    className="hidden sm:inline-flex"
                  >
                    Войти
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('register')}
                    className="hidden sm:inline-flex"
                  >
                    Регистрация
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-neutral-700 hover:text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-red-600 hover:bg-red-700 w-full">
                    Продать авто
                  </Button>
                </Link>
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        openAuthModal('login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Войти
                    </Button>
                    <Button 
                      onClick={() => {
                        openAuthModal('register');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Регистрация
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
