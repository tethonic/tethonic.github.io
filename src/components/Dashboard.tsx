import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Globe,
  Bell,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import DashboardHome from '@/components/pages/DashboardHome';
import Signals from '@/components/pages/Signals';
import News from '@/components/pages/News';
import Analysis from '@/components/pages/Analysis';
import SettingsPage from '@/components/pages/Settings';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const texts = {
    en: {
      dashboard: 'Dashboard',
      signals: 'Trading Signals',
      news: 'News & Analysis',
      analysis: 'Technical Analysis',
      settings: 'Settings',
      logout: 'Logout',
      online: 'Online',
      offline: 'Offline',
      notifications: 'Notifications'
    },
    fa: {
      dashboard: 'داشبورد',
      signals: 'سیگنال‌های معاملاتی',
      news: 'اخبار و تحلیل',
      analysis: 'تحلیل تکنیکال',
      settings: 'تنظیمات',
      logout: 'خروج',
      online: 'آنلاین',
      offline: 'آفلاین',
      notifications: 'اعلان‌ها'
    }
  };

  const t = texts[language];

  const menuItems = [
    { path: '/dashboard', icon: Home, label: t.dashboard },
    { path: '/dashboard/signals', icon: TrendingUp, label: t.signals },
    { path: '/dashboard/news', icon: Newspaper, label: t.news },
    { path: '/dashboard/analysis', icon: BarChart3, label: t.analysis },
    { path: '/dashboard/settings', icon: Settings, label: t.settings },
  ];

  const currentPath = location.pathname;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Tethonic</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-between gap-3 cursor-pointer hover:cursor-pointer ${
                language === 'fa' ? 'flex-row-reverse' : ''
              }`}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className={`flex-1 ${language === 'fa' ? 'text-right' : 'text-left'}`}>{item.label}</span>
              <Icon className="h-5 w-5 flex-shrink-0" />
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className={`w-full justify-between gap-3 cursor-pointer hover:cursor-pointer ${
            language === 'fa' ? 'flex-row-reverse' : ''
          }`}
        >
          <span className={`flex-1 ${language === 'fa' ? 'text-right' : 'text-left'}`}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          {theme === 'dark' ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className={`w-full justify-between gap-3 cursor-pointer hover:cursor-pointer ${
            language === 'fa' ? 'flex-row-reverse' : ''
          }`}
        >
          <span className={`flex-1 ${language === 'fa' ? 'text-right' : 'text-left'}`}>{language === 'en' ? 'فارسی' : 'English'}</span>
          <Globe className="h-4 w-4 flex-shrink-0" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={`w-full justify-between gap-3 cursor-pointer hover:cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 ${
            language === 'fa' ? 'flex-row-reverse' : ''
          }`}
        >
          <span className={`flex-1 ${language === 'fa' ? 'text-right' : 'text-left'}`}>{t.logout}</span>
          <LogOut className="h-4 w-4 flex-shrink-0" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen bg-background overflow-hidden ${language === 'fa' ? 'fa-lang' : 'en-lang'}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:w-64 lg:flex-col ${language === 'fa' ? 'lg:border-l lg:border-border' : 'lg:border-r lg:border-border'}`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden cursor-pointer hover:cursor-pointer">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === 'fa' ? 'right' : 'left'} className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              {/* Current Page Title */}
              <h2 className="text-lg font-semibold">
                {menuItems.find(item => item.path === currentPath)?.label || t.dashboard}
              </h2>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Online/Offline Status */}
              <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? t.online : t.offline}
              </Badge>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="cursor-pointer hover:cursor-pointer">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <Button variant="ghost" size="sm" className="cursor-pointer hover:cursor-pointer">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto custom-scrollbar min-h-0">
          <Routes>
            <Route path="/" element={<DashboardHome language={language} />} />
            <Route path="/signals" element={<Signals language={language} />} />
            <Route path="/news" element={<News language={language} />} />
            <Route path="/analysis" element={<Analysis language={language} />} />
            <Route path="/settings" element={<SettingsPage language={language} />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center justify-around py-2">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-auto py-2 px-3 cursor-pointer hover:cursor-pointer ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
