import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  User, 
  Bell, 
  Palette, 
  Shield,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Database,
  Download,
  Upload,
  Coins,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';
import { getAvailableServices, type CryptoServiceName } from '@/services';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('tetonicSettings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const [notifications, setNotifications] = useState(() => {
    const saved = loadSettings();
    return saved?.notifications || {
      tradingSignals: true,
      newsAlerts: true,
      priceAlerts: false,
      marketUpdates: true,
      pushNotifications: true
    };
  });

  // Profile state
  const [profileData, setProfileData] = useState(() => {
    const saved = loadSettings();
    return saved?.profile || {
      username: 'admin',
      email: 'admin@tethonic.com',
      language: 'fa',
      timezone: 'utc'
    };
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Top 100 Binance cryptocurrencies as default
  const defaultCryptoSymbols = [
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'TRX', 'AVAX', 'SHIB',
    'DOT', 'LINK', 'BCH', 'NEAR', 'MATIC', 'ICP', 'UNI', 'LTC', 'XLM', 'ETC',
    'ATOM', 'HBAR', 'FIL', 'APT', 'LDO', 'VET', 'ARB', 'TAO', 'MNT', 'IMX',
    'INJ', 'OP', 'RENDER', 'SEI', 'WIF', 'STX', 'SUI', 'AAVE', 'GRT', 'THETA',
    'RUNE', 'FTM', 'BONK', 'PEPE', 'ALGO', 'FLOW', 'EGLD', 'MANA', 'SAND', 'XTZ',
    'BEAM', 'AXS', 'CHZ', 'DYDX', 'KAS', 'ROSE', 'GALA', 'ENS', 'BLUR', 'GMT',
    'CFX', 'CRV', 'ORDI', 'COMP', 'PYTH', 'SUPER', 'WLD', 'SATS', 'PENDLE', 'FET',
    'JASMY', 'OCEAN', 'JTO', 'CAKE', 'TIA', 'JUP', 'STRK', 'MEME', 'BOME', 'ENA',
    'WOO', 'RNDR', 'FLOKI', 'PEOPLE', 'AGIX', 'ARKM', 'KAVA', 'WAVES', 'ZIL', 'AR',
    'LUNC', 'ONE', 'QTUM', 'ZEC', 'DASH', 'NEO', 'IOST', 'ZEN', 'TFUEL', 'IOTX'
  ];

  // Cryptocurrencies symbols only
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>(() => {
    const saved = loadSettings();
    return saved?.cryptoSymbols || defaultCryptoSymbols;
  });

  // Crypto service selection
  const [selectedCryptoService, setSelectedCryptoService] = useState<CryptoServiceName>(() => {
    const saved = loadSettings();
    return saved?.cryptoService || 'binance';
  });

  // Dialog states
  const [newSymbolDialog, setNewSymbolDialog] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Save all settings to localStorage
  const saveToLocalStorage = () => {
    const settings = {
      profile: profileData,
      notifications,
      cryptoSymbols,
      cryptoService: selectedCryptoService,
      theme,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('tetonicSettings', JSON.stringify(settings));
  };

  // Load settings from backup file
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup.profile) setProfileData(backup.profile);
        if (backup.notifications) setNotifications(backup.notifications);
        if (backup.cryptoSymbols) setCryptoSymbols(backup.cryptoSymbols);
        if (backup.cryptoService) setSelectedCryptoService(backup.cryptoService);
        if (backup.theme) setTheme(backup.theme);
        
        saveToLocalStorage();
        toast.success('بک‌آپ با موفقیت بازیابی شد');
      } catch {
        toast.error('فایل بک‌آپ نامعتبر');
      }
    };
    reader.readAsText(file);
  };

  // Export backup
  const handleExportBackup = () => {
    const settings = {
      profile: profileData,
      notifications,
      cryptoSymbols,
      cryptoService: selectedCryptoService,
      theme,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tethonic-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('بک‌آپ با موفقیت ذخیره شد');
  };

  // Auto-save settings when they change
  useEffect(() => {
    saveToLocalStorage();
  }, [profileData, notifications, cryptoSymbols, selectedCryptoService]);

  const texts = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your preferences and data',
      account: 'Account & Security',
      notifications: 'Notifications',
      appearance: 'Appearance',
      symbols: 'Crypto Symbols',
      backup: 'Backup & Restore',
      // Account
      personalInfo: 'Personal Information',
      username: 'Username',
      email: 'Email Address',
      language: 'Language',
      timezone: 'Timezone',
      updateProfile: 'Update Profile',
      // Security
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      // Notifications
      notificationSettings: 'Notification Settings',
      tradingSignals: 'Trading Signals',
      newsAlerts: 'News Alerts',
      priceAlerts: 'Price Alerts',
      marketUpdates: 'Market Updates',
      pushNotifications: 'Push Notifications',
      // Appearance
      themeSettings: 'Theme Settings',
      lightMode: 'Light',
      darkMode: 'Dark',
      systemMode: 'System',
      // Symbols
      cryptoSymbols: 'Cryptocurrency Symbols',
      cryptoService: 'Crypto Data Provider',
      addSymbol: 'Add Symbol',
      symbolPlaceholder: 'e.g., BTC',
      remove: 'Remove',
      // Backup
      backupSettings: 'Backup & Restore',
      exportBackup: 'Export Backup',
      importBackup: 'Import Backup',
      exportDesc: 'Download backup of your settings',
      importDesc: 'Restore settings from backup file',
      // Actions
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      success: 'Settings saved successfully',
      error: 'Failed to save settings'
    },
    fa: {
      title: 'تنظیمات',
      subtitle: 'مدیریت تنظیمات و داده‌های شما',
      account: 'حساب کاربری و امنیت',
      notifications: 'اعلان‌ها',
      appearance: 'ظاهر',
      symbols: 'نمادهای ارز',
      backup: 'پشتیبان‌گیری و بازیابی',
      // Account
      personalInfo: 'اطلاعات شخصی',
      username: 'نام کاربری',
      email: 'آدرس ایمیل',
      language: 'زبان',
      timezone: 'منطقه زمانی',
      updateProfile: 'به‌روزرسانی پروفایل',
      // Security
      changePassword: 'تغییر رمز عبور',
      currentPassword: 'رمز عبور فعلی',
      newPassword: 'رمز عبور جدید',
      confirmPassword: 'تأیید رمز عبور',
      // Notifications
      notificationSettings: 'تنظیمات اعلان‌ها',
      tradingSignals: 'سیگنال‌های معاملاتی',
      newsAlerts: 'هشدارهای خبری',
      priceAlerts: 'هشدارهای قیمت',
      marketUpdates: 'به‌روزرسانی‌های بازار',
      pushNotifications: 'اعلان‌های پوش',
      // Appearance
      themeSettings: 'تنظیمات تم',
      lightMode: 'روشن',
      darkMode: 'تاریک',
      systemMode: 'سیستم',
      // Symbols
      cryptoSymbols: 'نمادهای ارز دیجیتال',
      cryptoService: 'ارائه‌دهنده داده‌های ارز',
      addSymbol: 'افزودن نماد',
      symbolPlaceholder: 'مثال: BTC',
      remove: 'حذف',
      // Backup
      backupSettings: 'پشتیبان‌گیری و بازیابی',
      exportBackup: 'ذخیره پشتیبان',
      importBackup: 'بازیابی پشتیبان',
      exportDesc: 'دانلود فایل پشتیبان تنظیمات',
      importDesc: 'بازیابی تنظیمات از فایل پشتیبان',
      // Actions
      save: 'ذخیره',
      cancel: 'لغو',
      add: 'افزودن',
      success: 'تنظیمات با موفقیت ذخیره شد',
      error: 'خطا در ذخیره تنظیمات'
    }
  };

  const t = texts.fa;
  const isRTL = true;

  // Handler functions
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('لطفاً تمام فیلدهای رمز عبور را پر کنید');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('رمزهای عبور مطابقت ندارند');
      return;
    }
    
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('رمز عبور با موفقیت تغییر کرد');
    }, 1000);
  };

  const handleAddSymbol = () => {
    if (!newSymbol.trim()) {
      toast.error('لطفاً نماد ارز را وارد کنید');
      return;
    }
    
    const symbol = newSymbol.trim().toUpperCase();
    if (cryptoSymbols.includes(symbol)) {
      toast.error('این نماد قبلاً اضافه شده');
      return;
    }
    
    setCryptoSymbols(prev => [...prev, symbol]);
    setNewSymbol('');
    setNewSymbolDialog(false);
    toast.success('نماد با موفقیت اضافه شد');
  };

  const handleRemoveSymbol = (symbol: string) => {
    setCryptoSymbols(prev => prev.filter(s => s !== symbol));
    toast.success('نماد با موفقیت حذف شد');
  };

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">{t.account}</TabsTrigger>
          <TabsTrigger value="notifications">{t.notifications}</TabsTrigger>
          <TabsTrigger value="appearance">{t.appearance}</TabsTrigger>
          <TabsTrigger value="symbols">{t.symbols}</TabsTrigger>
        </TabsList>

        {/* Account & Security Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.personalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input 
                    id="username" 
                    value={profileData.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.language}</Label>
                  <Select 
                    value={profileData.language}
                    onValueChange={(value) => handleProfileChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fa">فارسی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.timezone}</Label>
                  <Select 
                    value={profileData.timezone}
                    onValueChange={(value) => handleProfileChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="tehran">Asia/Tehran</SelectItem>
                      <SelectItem value="london">Europe/London</SelectItem>
                      <SelectItem value="newyork">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.changePassword}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t.currentPassword}</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t.newPassword}</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="gap-2 w-fit"
                >
                  {isChangingPassword && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {t.changePassword}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.notificationSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {t[key as keyof typeof t] as string}
                    </Label>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t.themeSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-6 w-6" />
                  {t.lightMode}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-6 w-6" />
                  {t.darkMode}
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-6 w-6" />
                  {t.systemMode}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crypto Symbols Settings */}
        <TabsContent value="symbols" className="space-y-6">
          {/* Crypto Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.cryptoService}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {'انتخاب ارائه‌دهنده داده‌های ارز:'}
                  </Label>
                  <Select value={selectedCryptoService} onValueChange={(value: CryptoServiceName) => setSelectedCryptoService(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableServices().map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center gap-2">
                            <span>{service.name}</span>
                            {service.supportsWebSocket && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded">
                                WebSocket
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  {'ارائه‌دهنده داده‌های ارز دیجیتال مورد نظر خود را انتخاب کنید. سرویس‌های دارای WebSocket به‌روزرسانی‌های لحظه‌ای ارائه می‌دهند.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Crypto Symbols */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                {t.cryptoSymbols}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {'نمادهای ارز دیجیتال برای نمایش در داشبورد اضافه کنید'}
                </p>
                <Dialog open={newSymbolDialog} onOpenChange={setNewSymbolDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t.addSymbol}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>{t.addSymbol}</DialogTitle>
                      <DialogDescription>
                        {'نماد ارز دیجیتالی که می‌خواهید دنبال کنید را وارد کنید'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input
                          value={newSymbol}
                          onChange={(e) => setNewSymbol(e.target.value)}
                          placeholder={t.symbolPlaceholder}
                          className="uppercase"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddSymbol} className="flex-1">
                          {t.add}
                        </Button>
                        <Button variant="outline" onClick={() => setNewSymbolDialog(false)} className="flex-1">
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cryptoSymbols.map((symbol) => (
                  <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{symbol.slice(0, 2)}</span>
                      </div>
                      <span className="font-medium">{symbol}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSymbol(symbol)}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {cryptoSymbols.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {'هنوز نمادی اضافه نشده. روی "افزودن نماد" کلیک کنید.'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup & Restore Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t.backup}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">{t.exportBackup}</h3>
              <p className="text-sm text-muted-foreground">
                {t.exportDesc}
              </p>
              <Button onClick={handleExportBackup} className="gap-2 w-full">
                <Download className="h-4 w-4" />
                {t.exportBackup}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">{t.importBackup}</h3>
              <p className="text-sm text-muted-foreground">
                {t.importDesc}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                  id="backup-file"
                />
                <Label htmlFor="backup-file" className="cursor-pointer w-full">
                  <Button variant="outline" className="gap-2 w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      {t.importBackup}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
