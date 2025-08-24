import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Target,
  RefreshCw,
  Settings2
} from 'lucide-react';

interface AnalysisProps {
  language: 'en' | 'fa';
}

const Analysis = ({ language }: AnalysisProps) => {
  const texts = {
    en: {
      title: 'Technical Analysis',
      subtitle: 'Advanced technical indicators and market analysis tools',
      overview: 'Market Overview',
      indicators: 'Technical Indicators',
      charts: 'Price Charts',
      pair: 'Trading Pair',
      timeframe: 'Timeframe',
      refresh: 'Refresh',
      configure: 'Configure',
      rsi: 'RSI',
      macd: 'MACD',
      bollinger: 'Bollinger Bands',
      ema: 'EMA',
      sma: 'SMA',
      support: 'Support',
      resistance: 'Resistance',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      overbought: 'Overbought',
      oversold: 'Oversold',
      strong: 'Strong',
      weak: 'Weak',
      buy: 'BUY',
      sell: 'SELL',
      hold: 'HOLD'
    },
    fa: {
      title: 'تحلیل تکنیکال',
      subtitle: 'اندیکاتورهای تکنیکال پیشرفته و ابزارهای تحلیل بازار',
      overview: 'نمای کلی بازار',
      indicators: 'اندیکاتورهای تکنیکال',
      charts: 'نمودارهای قیمت',
      pair: 'جفت ارز',
      timeframe: 'بازه زمانی',
      refresh: 'بروزرسانی',
      configure: 'پیکربندی',
      rsi: 'RSI',
      macd: 'MACD',
      bollinger: 'نوارهای بولینگر',
      ema: 'EMA',
      sma: 'SMA',
      support: 'حمایت',
      resistance: 'مقاومت',
      bullish: 'صعودی',
      bearish: 'نزولی',
      neutral: 'خنثی',
      overbought: 'خرید بیش از حد',
      oversold: 'فروش بیش از حد',
      strong: 'قوی',
      weak: 'ضعیف',
      buy: 'خرید',
      sell: 'فروش',
      hold: 'نگهداری'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  const marketOverview = [
    {
      pair: 'BTC/USDT',
      price: '$67,500',
      change: '+3.2%',
      trend: t.bullish,
      volume: '$2.1B',
      signal: t.buy
    },
    {
      pair: 'ETH/USDT',
      price: '$3,450',
      change: '-1.8%',
      trend: t.bearish,
      volume: '$1.8B',
      signal: t.sell
    },
    {
      pair: 'BNB/USDT',
      price: '$285',
      change: '+0.5%',
      trend: t.neutral,
      volume: '$450M',
      signal: t.hold
    }
  ];

  const indicators = [
    {
      name: t.rsi,
      value: '68.5',
      status: t.overbought,
      signal: t.sell,
      strength: t.weak
    },
    {
      name: t.macd,
      value: '+142.3',
      status: t.bullish,
      signal: t.buy,
      strength: t.strong
    },
    {
      name: t.bollinger,
      value: 'Upper Band',
      status: t.overbought,
      signal: t.sell,
      strength: t.strong
    },
    {
      name: t.ema,
      value: '$66,800',
      status: t.bullish,
      signal: t.buy,
      strength: t.strong
    },
    {
      name: t.sma,
      value: '$65,200',
      status: t.bullish,
      signal: t.buy,
      strength: t.strong
    }
  ];

  const supportResistance = [
    { level: '$70,000', type: t.resistance, strength: t.strong },
    { level: '$68,500', type: t.resistance, strength: t.weak },
    { level: '$65,000', type: t.support, strength: t.strong },
    { level: '$62,500', type: t.support, strength: t.weak }
  ];

  const getSignalColor = (signal: string) => {
    if (signal === t.buy) return 'bg-green-500 text-white';
    if (signal === t.sell) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getTrendColor = (trend: string) => {
    if (trend === t.bullish) return 'text-green-600';
    if (trend === t.bearish) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStrengthColor = (strength: string) => {
    if (strength === t.strong) return 'text-green-600';
    return 'text-orange-600';
  };

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="btc-usdt">
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.pair} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="btc-usdt">BTC/USDT</SelectItem>
                <SelectItem value="eth-usdt">ETH/USDT</SelectItem>
                <SelectItem value="bnb-usdt">BNB/USDT</SelectItem>
                <SelectItem value="ada-usdt">ADA/USDT</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="1d">
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t.timeframe} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="4h">4H</SelectItem>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="1w">1W</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>

            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              {t.configure}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="indicators">{t.indicators}</TabsTrigger>
          <TabsTrigger value="charts">{t.charts}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Market Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.overview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketOverview.map((market, index) => (
                  <Card key={index} className="border border-border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{market.pair}</h3>
                          <Badge className={getSignalColor(market.signal)}>
                            {market.signal}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{market.price}</p>
                          <p className={`text-sm ${market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {market.change}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Volume: {market.volume}</span>
                          <span className={getTrendColor(market.trend)}>{market.trend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support & Resistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t.support} & {t.resistance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportResistance.map((level, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${level.type === t.resistance ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="font-medium">{level.level}</span>
                      <Badge variant="outline">{level.type}</Badge>
                    </div>
                    <Badge variant="outline" className={getStrengthColor(level.strength)}>
                      {level.strength}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t.indicators}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators.map((indicator, index) => (
                  <Card key={index} className="border border-border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{indicator.name}</h3>
                          <Badge className={getSignalColor(indicator.signal)}>
                            {indicator.signal}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{indicator.value}</p>
                          <p className="text-sm text-muted-foreground">{indicator.status}</p>
                        </div>
                        <Badge variant="outline" className={getStrengthColor(indicator.strength)}>
                          {indicator.strength}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.charts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Interactive price charts will be displayed here'
                      : 'نمودارهای قیمت تعاملی در اینجا نمایش داده خواهد شد'
                    }
                  </p>
                  <Button variant="outline">
                    {language === 'en' ? 'Load Chart' : 'بارگذاری نمودار'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
