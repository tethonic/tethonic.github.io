import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Globe, 
  Palette, 
  Shield,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';

interface SettingsPageProps {
  language: 'en' | 'fa';
}

const SettingsPage = ({ language }: SettingsPageProps) => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    tradingSignals: true,
    newsAlerts: true,
    priceAlerts: false,
    marketUpdates: true,
    pushNotifications: true
  });

  const texts = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your account preferences and application settings',
      profile: 'Profile',
      notifications: 'Notifications',
      appearance: 'Appearance',
      security: 'Security',
      about: 'About',
      // Profile
      personalInfo: 'Personal Information',
      username: 'Username',
      email: 'Email Address',
      language: 'Language',
      timezone: 'Timezone',
      // Notifications
      notificationSettings: 'Notification Settings',
      tradingSignals: 'Trading Signals',
      newsAlerts: 'News Alerts',
      priceAlerts: 'Price Alerts',
      marketUpdates: 'Market Updates',
      pushNotifications: 'Push Notifications',
      // Appearance
      themeSettings: 'Theme Settings',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      systemMode: 'System',
      // Security
      securitySettings: 'Security Settings',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      twoFactor: 'Two-Factor Authentication',
      // About
      appInfo: 'Application Information',
      version: 'Version',
      buildDate: 'Build Date',
      developer: 'Developer',
      // Actions
      save: 'Save Changes',
      reset: 'Reset to Default',
      success: 'Settings saved successfully',
      error: 'Failed to save settings'
    },
    fa: {
      title: 'تنظیمات',
      subtitle: 'مدیریت تنظیمات حساب کاربری و برنامه',
      profile: 'پروفایل',
      notifications: 'اعلان‌ها',
      appearance: 'ظاهر',
      security: 'امنیت',
      about: 'درباره',
      // Profile
      personalInfo: 'اطلاعات شخصی',
      username: 'نام کاربری',
      email: 'آدرس ایمیل',
      language: 'زبان',
      timezone: 'منطقه زمانی',
      // Notifications
      notificationSettings: 'تنظیمات اعلان‌ها',
      tradingSignals: 'سیگنال‌های معاملاتی',
      newsAlerts: 'هشدارهای خبری',
      priceAlerts: 'هشدارهای قیمت',
      marketUpdates: 'به‌روزرسانی‌های بازار',
      pushNotifications: 'اعلان‌های پوش',
      // Appearance
      themeSettings: 'تنظیمات تم',
      lightMode: 'حالت روشن',
      darkMode: 'حالت تاریک',
      systemMode: 'سیستم',
      // Security
      securitySettings: 'تنظیمات امنیت',
      changePassword: 'تغییر رمز عبور',
      currentPassword: 'رمز عبور فعلی',
      newPassword: 'رمز عبور جدید',
      confirmPassword: 'تأیید رمز عبور',
      twoFactor: 'احراز هویت دو مرحله‌ای',
      // About
      appInfo: 'اطلاعات برنامه',
      version: 'نسخه',
      buildDate: 'تاریخ ساخت',
      developer: 'توسعه‌دهنده',
      // Actions
      save: 'ذخیره تغییرات',
      reset: 'بازنشانی به پیش‌فرض',
      success: 'تنظیمات با موفقیت ذخیره شد',
      error: 'خطا در ذخیره تنظیمات'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  const handleSaveSettings = () => {
    try {
      // Simulate saving settings
      setTimeout(() => {
        toast.success(t.success);
      }, 500);
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t.profile}</TabsTrigger>
          <TabsTrigger value="notifications">{t.notifications}</TabsTrigger>
          <TabsTrigger value="appearance">{t.appearance}</TabsTrigger>
          <TabsTrigger value="security">{t.security}</TabsTrigger>
          <TabsTrigger value="about">{t.about}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
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
                  <Input id="username" defaultValue="admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" type="email" defaultValue="admin@tethonic.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.language}</Label>
                  <Select defaultValue={language}>
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
                  <Select defaultValue="utc">
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
                    checked={value}
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

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.securitySettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">{t.changePassword}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t.currentPassword}</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t.newPassword}</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">{t.twoFactor}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Add an extra layer of security to your account'
                      : 'لایه امنیتی اضافی به حساب خود اضافه کنید'
                    }
                  </p>
                </div>
                <Button variant="outline">
                  {language === 'en' ? 'Setup' : 'تنظیم'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t.appInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.version}
                    </Label>
                    <p className="text-lg font-semibold">1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.buildDate}
                    </Label>
                    <p className="text-lg font-semibold">August 24, 2025</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.developer}
                    </Label>
                    <p className="text-lg font-semibold">Tethonic Team</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-center p-6 border rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Tethonic</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'Professional Digital Currency Analysis Platform'
                        : 'پلتفرم حرفه‌ای تحلیل ارزهای دیجیتال'
                      }
                    </p>
                    <Badge variant="outline" className="mt-2">
                      PWA Ready
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          {t.save}
        </Button>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t.reset}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
