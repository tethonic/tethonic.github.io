import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Globe, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [language, setLanguage] = useState<'en' | 'fa'>('en');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const texts = {
    en: {
      title: 'Welcome to Tethonic',
      subtitle: 'Professional Digital Currency Analysis Platform',
      description: 'Sign in to access advanced trading signals, technical indicators, and fundamental analysis.',
      username: 'Username',
      password: 'Password',
      signIn: 'Sign In',
      demoCredentials: 'Demo Credentials',
      features: {
        signals: 'Trading Signals',
        indicators: 'Technical Indicators',
        news: 'Fundamental Analysis',
        bilingual: 'Bilingual Support'
      },
      loginError: 'Invalid username or password',
      loading: 'Signing in...'
    },
    fa: {
      title: 'خوش آمدید به تتونیک',
      subtitle: 'پلتفرم حرفه‌ای تحلیل ارزهای دیجیتال',
      description: 'برای دسترسی به سیگنال‌های معاملاتی پیشرفته، اندیکاتورهای تکنیکال و تحلیل بنیادی وارد شوید.',
      username: 'نام کاربری',
      password: 'رمز عبور',
      signIn: 'ورود',
      demoCredentials: 'اطلاعات نمونه',
      features: {
        signals: 'سیگنال‌های معاملاتی',
        indicators: 'اندیکاتورهای تکنیکال',
        news: 'تحلیل بنیادی',
        bilingual: 'پشتیبانی دو زبانه'
      },
      loginError: 'نام کاربری یا رمز عبور اشتباه است',
      loading: 'در حال ورود...'
    }
  };

  const t = texts[language];

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const success = onLogin(data.username, data.password);
      if (success) {
        toast.success(language === 'en' ? 'Login successful!' : 'ورود موفقیت‌آمیز!');
      } else {
        setLoginError(t.loginError);
        toast.error(t.loginError);
      }
    } catch (error) {
      setLoginError(t.loginError);
      toast.error(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
            className="gap-2 cursor-pointer hover:cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'فارسی' : 'English'}
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className={`text-2xl font-bold ${language === 'fa' ? 'text-right' : ''}`}>
                {t.title}
              </CardTitle>
              <CardDescription className={`mt-2 ${language === 'fa' ? 'text-right' : ''}`}>
                {t.subtitle}
              </CardDescription>
              <p className={`text-sm text-muted-foreground mt-2 ${language === 'fa' ? 'text-right' : ''}`}>
                {t.description}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className={language === 'fa' ? 'text-right block' : ''}>
                  {t.username}
                </Label>
                <Input
                  id="username"
                  type="text"
                  {...register('username')}
                  className={language === 'fa' ? 'text-right' : ''}
                  dir={language === 'fa' ? 'rtl' : 'ltr'}
                />
                {errors.username && (
                  <p className={`text-sm text-red-500 ${language === 'fa' ? 'text-right' : ''}`}>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={language === 'fa' ? 'text-right block' : ''}>
                  {t.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`${language === 'fa' ? 'text-right' : ''} pr-10`}
                    dir={language === 'fa' ? 'rtl' : 'ltr'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer hover:cursor-pointer ${language === 'fa' ? 'left-0' : 'right-0'}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className={`text-sm text-red-500 ${language === 'fa' ? 'text-right' : ''}`}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription className={language === 'fa' ? 'text-right' : ''}>
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 cursor-pointer hover:cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? t.loading : t.signIn}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
