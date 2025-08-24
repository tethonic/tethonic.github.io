import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  BarChart3, 
  Newspaper,
  Signal,
  AlertTriangle
} from 'lucide-react';

interface DashboardHomeProps {
  language: 'en' | 'fa';
}

const DashboardHome = ({ language }: DashboardHomeProps) => {
  // Load crypto symbols from localStorage
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tetonicSettings');
      const settings = saved ? JSON.parse(saved) : null;
      return settings?.cryptoSymbols || ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
    } catch {
      return ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
    }
  });

  // Mock cryptocurrency data based on symbols
  const [cryptocurrencies, setCryptocurrencies] = useState(() => {
    const mockData: any = {
      'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 67500, change: 2.5, marketCap: 1320000000000, volume: 24500000000 },
      'ETH': { symbol: 'ETH', name: 'Ethereum', price: 3450, change: -1.2, marketCap: 415000000000, volume: 15200000000 },
      'BNB': { symbol: 'BNB', name: 'BNB', price: 315, change: 3.1, marketCap: 48500000000, volume: 1800000000 },
      'ADA': { symbol: 'ADA', name: 'Cardano', price: 0.48, change: -0.8, marketCap: 17200000000, volume: 950000000 },
      'SOL': { symbol: 'SOL', name: 'Solana', price: 145, change: 5.2, marketCap: 64500000000, volume: 2100000000 },
      'DOGE': { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: 1.8, marketCap: 12100000000, volume: 560000000 },
      'DOT': { symbol: 'DOT', name: 'Polkadot', price: 6.5, change: -2.1, marketCap: 8200000000, volume: 380000000 },
      'MATIC': { symbol: 'MATIC', name: 'Polygon', price: 0.92, change: 4.2, marketCap: 8500000000, volume: 420000000 },
    };
    
    return cryptoSymbols.map(symbol => 
      mockData[symbol] || { symbol, name: symbol, price: 0, change: 0, marketCap: 0, volume: 0 }
    );
  });

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('tetonicSettings');
        const settings = saved ? JSON.parse(saved) : null;
        if (settings?.cryptoSymbols) {
          setCryptoSymbols(settings.cryptoSymbols);
        }
      } catch {
        // ignore errors
      }
    };

    // Update cryptocurrencies when symbols change
    const mockData: any = {
      'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 67500, change: 2.5, marketCap: 1320000000000, volume: 24500000000 },
      'ETH': { symbol: 'ETH', name: 'Ethereum', price: 3450, change: -1.2, marketCap: 415000000000, volume: 15200000000 },
      'BNB': { symbol: 'BNB', name: 'BNB', price: 315, change: 3.1, marketCap: 48500000000, volume: 1800000000 },
      'ADA': { symbol: 'ADA', name: 'Cardano', price: 0.48, change: -0.8, marketCap: 17200000000, volume: 950000000 },
      'SOL': { symbol: 'SOL', name: 'Solana', price: 145, change: 5.2, marketCap: 64500000000, volume: 2100000000 },
      'DOGE': { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: 1.8, marketCap: 12100000000, volume: 560000000 },
      'DOT': { symbol: 'DOT', name: 'Polkadot', price: 6.5, change: -2.1, marketCap: 8200000000, volume: 380000000 },
      'MATIC': { symbol: 'MATIC', name: 'Polygon', price: 0.92, change: 4.2, marketCap: 8500000000, volume: 420000000 },
    };
    
    setCryptocurrencies(cryptoSymbols.map(symbol => 
      mockData[symbol] || { symbol, name: symbol, price: 0, change: 0, marketCap: 0, volume: 0 }
    ));

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [cryptoSymbols]);

  const texts = {
    en: {
      welcome: 'Welcome to Tethonic',
      subtitle: 'Your Professional Digital Currency Analysis Platform',
      overview: 'Market Overview',
      activeSignals: 'Active Signals',
      portfolioValue: 'Portfolio Value',
      todaysGain: "Today's Gain",
      successRate: 'Success Rate',
      totalSignals: 'Total Signals',
      latestNews: 'Latest News',
      quickActions: 'Quick Actions',
      viewAllSignals: 'View All Signals',
      readNews: 'Read News',
      technicalAnalysis: 'Technical Analysis',
      settings: 'Settings',
      marketSentiment: 'Market Sentiment',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      strong: 'Strong',
      buy: 'BUY',
      sell: 'SELL',
      hold: 'HOLD',
      // Cryptocurrencies
      cryptoMarket: 'Cryptocurrency Market',
      symbol: 'Symbol',
      name: 'Name',
      price: 'Price',
      change: 'Change',
      marketCap: 'Market Cap',
      volume: 'Volume',
      supply: 'Supply'
    },
    fa: {
      welcome: 'به تتونیک خوش آمدید',
      subtitle: 'پلتفرم حرفه‌ای تحلیل ارزهای دیجیتال شما',
      overview: 'نمای کلی بازار',
      activeSignals: 'سیگنال‌های فعال',
      portfolioValue: 'ارزش پورتفولیو',
      todaysGain: 'سود امروز',
      successRate: 'نرخ موفقیت',
      totalSignals: 'کل سیگنال‌ها',
      latestNews: 'آخرین اخبار',
      quickActions: 'اقدامات سریع',
      viewAllSignals: 'مشاهده همه سیگنال‌ها',
      readNews: 'مطالعه اخبار',
      technicalAnalysis: 'تحلیل تکنیکال',
      settings: 'تنظیمات',
      marketSentiment: 'حس و حال بازار',
      bullish: 'صعودی',
      bearish: 'نزولی',
      neutral: 'خنثی',
      strong: 'قوی',
      buy: 'خرید',
      sell: 'فروش',
      hold: 'نگهداری',
      // Cryptocurrencies
      cryptoMarket: 'بازار ارزهای دیجیتال',
      symbol: 'نماد',
      name: 'نام',
      price: 'قیمت',
      change: 'تغییر',
      marketCap: 'ارزش بازار',
      volume: 'حجم',
      supply: 'عرضه'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  // Mock data
  const stats = [
    {
      title: t.activeSignals,
      value: '12',
      change: '+3',
      icon: Signal,
      color: 'text-purple-600'
    },
    {
      title: t.portfolioValue,
      value: '$45,280',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: t.todaysGain,
      value: '$1,240',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: t.successRate,
      value: '87%',
      change: '+2%',
      icon: Activity,
      color: 'text-purple-600'
    }
  ];

  const activeSignals = [
    { pair: 'BTC/USDT', action: t.buy, price: '$67,500', confidence: 92, type: 'strong' },
    { pair: 'ETH/USDT', action: t.sell, price: '$3,450', confidence: 85, type: 'medium' },
    { pair: 'ADA/USDT', action: t.hold, price: '$0.48', confidence: 78, type: 'weak' },
  ];

  const recentNews = [
    {
      title: language === 'en' 
        ? 'Bitcoin Surges Past $67,000 as Institutional Adoption Increases' 
        : 'بیت کوین با افزایش پذیرش نهادی از ۶۷,۰۰۰ دلار عبور کرد',
      time: '2 hours ago',
      impact: 'high'
    },
    {
      title: language === 'en'
        ? 'Ethereum 2.0 Staking Rewards Show Strong Performance'
        : 'پاداش‌های استیکینگ اتریوم ۲.۰ عملکرد قوی نشان می‌دهد',
      time: '4 hours ago',
      impact: 'medium'
    },
    {
      title: language === 'en'
        ? 'New DeFi Protocol Launches with $100M TVL'
        : 'پروتکل جدید DeFi با ۱۰۰ میلیون دلار TVL راه‌اندازی شد',
      time: '6 hours ago',
      impact: 'low'
    }
  ];

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{t.welcome}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Signals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Signal className="h-5 w-5" />
              {t.activeSignals}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSignals.map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{signal.pair}</p>
                      <p className="text-sm text-muted-foreground">{signal.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge 
                        variant={signal.action === t.buy ? 'default' : signal.action === t.sell ? 'destructive' : 'secondary'}
                      >
                        {signal.action}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {signal.confidence}% confidence
                      </p>
                    </div>
                    <Progress value={signal.confidence} className="w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Sentiment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t.marketSentiment}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {t.bullish}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {t.strong}
              </div>
              <Progress value={75} className="mb-4" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-red-500">{t.bearish}</div>
                <div className="text-gray-500">{t.neutral}</div>
                <div className="text-green-500">{t.bullish}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {t.latestNews}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNews.map((news, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <AlertTriangle className={`h-4 w-4 mt-1 ${
                    news.impact === 'high' ? 'text-red-500' : 
                    news.impact === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">
                      {news.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {news.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button className="w-full justify-start gap-3 cursor-pointer hover:cursor-pointer" variant="outline">
                <Signal className="h-4 w-4" />
                {t.viewAllSignals}
              </Button>
              <Button className="w-full justify-start gap-3 cursor-pointer hover:cursor-pointer" variant="outline">
                <Newspaper className="h-4 w-4" />
                {t.readNews}
              </Button>
              <Button className="w-full justify-start gap-3 cursor-pointer hover:cursor-pointer" variant="outline">
                <BarChart3 className="h-4 w-4" />
                {t.technicalAnalysis}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cryptocurrency Market */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.cryptoMarket}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.symbol}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.name}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.price}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.change}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.marketCap}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.volume}</th>
                </tr>
              </thead>
              <tbody>
                {cryptocurrencies.map((crypto: any) => (
                  <tr key={crypto.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{crypto.symbol}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">{crypto.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">${crypto.price.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-medium ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        ${(crypto.marketCap / 1000000000).toFixed(2)}B
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        ${(crypto.volume / 1000000000).toFixed(2)}B
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
