import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Target,
  Volume2,
  RefreshCw,
  Brain
} from 'lucide-react';
import { useTechnicalAnalysis } from '@/hooks/useTechnicalAnalysis';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

interface TechnicalAnalysisProps {
  language: 'en' | 'fa';
  cryptoData: CryptocurrencyData[];
}

const TechnicalAnalysisComponent = ({ language, cryptoData }: TechnicalAnalysisProps) => {
  // Get first available symbol or BTC as default
  const availableSymbols = [...new Set(cryptoData.map(crypto => crypto.symbol))].sort();
  const defaultSymbol = availableSymbols.length > 0 ? availableSymbols[0] : 'BTC';
  
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  const [refreshing, setRefreshing] = useState(false);
  
  const technicalSignal = useTechnicalAnalysis(cryptoData, selectedSymbol);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return 'bg-green-600 text-white';
      case 'BUY': return 'bg-green-500 text-white';
      case 'NEUTRAL': return 'bg-yellow-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      case 'STRONG_SELL': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return '💹';
      case 'BUY': return '📈';
      case 'NEUTRAL': return '⚖️';
      case 'SELL': return '📊';
      case 'STRONG_SELL': return '📉';
      default: return '⏳';
    }
  };

  const texts = {
    en: {
      title: 'Real-time Technical Analysis',
      subtitle: 'Advanced AI-powered cryptocurrency analysis',
      selectSymbol: 'Select Cryptocurrency',
      refresh: 'Refresh Analysis',
      overallSignal: 'Overall Signal',
      confidence: 'Confidence Level',
      indicators: 'اندیکاتورهای تکنیکال',
      rsiAnalysis: 'تحلیل RSI',
      macdAnalysis: 'تحلیل MACD',
      bollingerAnalysis: 'باندهای بولینگر',
      volumeAnalysis: 'تحلیل حجم معاملات',
      currentPrice: 'قیمت فعلی',
      lastUpdate: 'آخرین بروزرسانی',
      // RSI
      rsi15m: 'RSI ۱۵ دقیقه‌ای',
      rsi1h: 'RSI ۱ ساعته',
      rsi4h: 'RSI ۴ ساعته',
      rsi1d: 'RSI روزانه',
      rsiSignal: 'سیگنال RSI',
      // MACD
      macdLine: 'خط MACD',
      signalLine: 'خط سیگنال',
      histogram: 'هیستوگرام',
      trend: 'روند',
      // Bollinger
      upperBand: 'باند بالایی',
      middleBand: 'باند میانی',
      lowerBand: 'باند پایینی',
      position: 'موقعیت قیمت',
      // Volume
      currentVolume: 'حجم معاملات فعلی',
      avgVolume: 'حجم معاملات متوسط',
      volumeRatio: 'نسبت حجم معاملات',
      volumeSignal: 'سیگنال حجم معاملات',
      // Signals
      strongBuy: 'خرید قوی',
      buy: 'خرید',
      neutral: 'خنثی',
      sell: 'فروش',
      strongSell: 'فروش قوی',
      // Analysis
      oversold: 'فروش بیش از حد',
      overbought: 'خرید بیش از حد',
      bullish: 'صعودی',
      bearish: 'نزولی',
      sideways: 'جانبی',
      highVolume: 'حجم معاملات بالا',
      lowVolume: 'حجم معاملات پایین',
      normal: 'عادی',
      strong: 'قوی',
      moderate: 'متوسط',
      weak: 'ضعیف',
      // AI Recommendation
      aiRecommendation: 'توصیه معاملاتی هوش مصنوعی',
      strongBuySignal: 'خرید قوی - سیگنال بسیار مثبت',
      buySignal: 'خرید - سیگنال مثبت',
      neutralSignal: 'خنثی - منتظر سیگنال بهتر باشید',
      sellSignal: 'Sell - Negative Signal',
      strongSellSignal: 'Strong Sell - Very Negative Signal',
      analysisDescription: 'This analysis is based on a combination of RSI, MACD, Bollinger Bands and volume analysis.',
      confidenceLevel: 'Confidence Level',
      calculating: 'Calculating technical analysis...'
    },
    fa: {
      title: 'تحلیل تکنیکال لحظه‌ای',
      subtitle: 'تحلیل پیشرفته ارزهای دیجیتال با هوش مصنوعی',
      selectSymbol: 'انتخاب ارز دیجیتال',
      refresh: 'به‌روزرسانی تحلیل',
      overallSignal: 'سیگنال کلی',
      confidence: 'سطح اطمینان',
      indicators: 'شاخص‌های تکنیکال',
      rsiAnalysis: 'تحلیل RSI',
      macdAnalysis: 'تحلیل MACD',
      bollingerAnalysis: 'نوارهای بولینگر',
      volumeAnalysis: 'تحلیل حجم',
      currentPrice: 'قیمت فعلی',
      lastUpdate: 'آخرین به‌روزرسانی',
      // RSI
      rsi15m: 'RSI ۱۵ دقیقه',
      rsi1h: 'RSI ۱ ساعت',
      rsi4h: 'RSI ۴ ساعت',
      rsi1d: 'RSI ۱ روز',
      rsiSignal: 'سیگنال RSI',
      // MACD
      macdLine: 'خط MACD',
      signalLine: 'خط سیگنال',
      histogram: 'هیستوگرام',
      trend: 'روند',
      // Bollinger
      upperBand: 'نوار بالایی',
      middleBand: 'نوار میانی',
      lowerBand: 'نوار پایینی',
      position: 'موقعیت قیمت',
      // Volume
      currentVolume: 'حجم فعلی',
      avgVolume: 'حجم متوسط',
      volumeRatio: 'نسبت حجم',
      volumeSignal: 'سیگنال حجم',
      // Signals
      strongBuy: 'خرید قوی',
      buy: 'خرید',
      neutral: 'خنثی',
      sell: 'فروش',
      strongSell: 'فروش قوی',
      // Analysis
      oversold: 'فروش بیش از حد',
      overbought: 'خرید بیش از حد',
      bullish: 'صعودی',
      bearish: 'نزولی',
      sideways: 'جانبی',
      highVolume: 'حجم بالا',
      lowVolume: 'حجم پایین',
      normal: 'عادی',
      strong: 'قوی',
      moderate: 'متوسط',
      weak: 'ضعیف',
      // AI Recommendation
      aiRecommendation: 'توصیه معاملاتی هوش مصنوعی',
      strongBuySignal: 'خرید قوی - سیگنال بسیار مثبت',
      buySignal: 'خرید - سیگنال مثبت',
      neutralSignal: 'خنثی - انتظار برای سیگنال بهتر',
      sellSignal: 'فروش - سیگنال منفی',
      strongSellSignal: 'فروش قوی - سیگنال بسیار منفی',
      analysisDescription: 'این تحلیل بر اساس ترکیب شاخص‌های RSI، MACD، نوارهای بولینگر و تحلیل حجم انجام شده است.',
      confidenceLevel: 'سطح اطمینان',
      calculating: 'محاسبه تحلیل تکنیکال...'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  if (!technicalSignal) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Brain className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">{t.calculating}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Symbol Selector */}
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.selectSymbol} />
            </SelectTrigger>
            <SelectContent>
              {availableSymbols.map((symbol) => {
                const crypto = cryptoData.find(c => c.symbol === symbol);
                return (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol} {crypto ? `- ${crypto.name}` : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Overall Signal Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t.overallSignal}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {getSignalIcon(technicalSignal.overall_signal)}
              </div>
              <Badge className={`text-lg px-4 py-2 ${getSignalColor(technicalSignal.overall_signal)}`}>
                {getSignalIcon(technicalSignal.overall_signal)} {technicalSignal.overall_signal.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t.confidence}</div>
              <Progress value={technicalSignal.confidence} className="mb-2" />
              <div className="text-lg font-bold">{technicalSignal.confidence.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t.currentPrice}</div>
              <div className="text-xl font-bold">${technicalSignal.price.toFixed(6)}</div>
              <div className="text-xs text-muted-foreground">{t.lastUpdate}: {new Date(technicalSignal.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Tabs defaultValue="rsi" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 flex-row-reverse">
          <TabsTrigger value="volume">حجم</TabsTrigger>
          <TabsTrigger value="bollinger">بولینگر</TabsTrigger>
          <TabsTrigger value="macd">MACD</TabsTrigger>
          <TabsTrigger value="rsi">RSI</TabsTrigger>
        </TabsList>

        {/* RSI Analysis */}
        <TabsContent value="rsi">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t.rsiAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.rsi15m}</div>
                  <div className="text-lg font-bold">{technicalSignal.rsi.rsi_15m.toFixed(1)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.rsi1h}</div>
                  <div className="text-lg font-bold">{technicalSignal.rsi.rsi_1h.toFixed(1)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.rsi4h}</div>
                  <div className="text-lg font-bold">{technicalSignal.rsi.rsi_4h.toFixed(1)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.rsi1d}</div>
                  <div className="text-lg font-bold">{technicalSignal.rsi.rsi_1d.toFixed(1)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{t.rsiSignal}: </span>
                  <Badge className={getSignalColor(technicalSignal.rsi.signal)}>
                    {technicalSignal.rsi.signal}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">قدرت: </span>
                  <Badge variant="outline">{technicalSignal.rsi.strength}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MACD Analysis */}
        <TabsContent value="macd">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.macdAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.macdLine}</div>
                  <div className="text-lg font-bold">{technicalSignal.macd.macd.toFixed(6)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.signalLine}</div>
                  <div className="text-lg font-bold">{technicalSignal.macd.macd_signal.toFixed(6)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.histogram}</div>
                  <div className={`text-lg font-bold ${technicalSignal.macd.macd_histogram > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {technicalSignal.macd.macd_histogram.toFixed(6)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">سیگنال: </span>
                  <Badge className={getSignalColor(technicalSignal.macd.signal)}>
                    {technicalSignal.macd.signal}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.trend}: </span>
                  <Badge variant="outline" className={
                    technicalSignal.macd.trend === 'BULLISH' ? 'border-green-500 text-green-600' :
                    technicalSignal.macd.trend === 'BEARISH' ? 'border-red-500 text-red-600' :
                    'border-yellow-500 text-yellow-600'
                  }>
                    {technicalSignal.macd.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bollinger Bands */}
        <TabsContent value="bollinger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.bollingerAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.upperBand}</div>
                  <div className="text-lg font-bold">${technicalSignal.bollinger.upper.toFixed(6)}</div>
                </div>
                <div className="text-center p-3 border rounded bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm text-muted-foreground">{t.middleBand}</div>
                  <div className="text-lg font-bold">${technicalSignal.bollinger.middle.toFixed(6)}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.lowerBand}</div>
                  <div className="text-lg font-bold">${technicalSignal.bollinger.lower.toFixed(6)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">سیگنال: </span>
                  <Badge className={getSignalColor(technicalSignal.bollinger.signal)}>
                    {technicalSignal.bollinger.signal}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t.position}: </span>
                  <Badge variant="outline">{technicalSignal.bollinger.position}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volume Analysis */}
        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                {t.volumeAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.currentVolume}</div>
                  <div className="text-lg font-bold">{technicalSignal.volume.current_volume.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.avgVolume}</div>
                  <div className="text-lg font-bold">{technicalSignal.volume.avg_volume_20.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-sm text-muted-foreground">{t.volumeRatio}</div>
                  <div className={`text-lg font-bold ${
                    technicalSignal.volume.volume_ratio > 1.5 ? 'text-green-600' :
                    technicalSignal.volume.volume_ratio < 0.5 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {technicalSignal.volume.volume_ratio.toFixed(2)}x
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Badge className={
                  technicalSignal.volume.signal === 'HIGH_VOLUME' ? 'bg-green-500 text-white' :
                  technicalSignal.volume.signal === 'LOW_VOLUME' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }>
                  {technicalSignal.volume.signal}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trading Recommendation */}
      <Card className={`border-2 ${
        technicalSignal.overall_signal.includes('BUY') ? 'border-green-500' :
        technicalSignal.overall_signal.includes('SELL') ? 'border-red-500' :
        'border-yellow-500'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t.aiRecommendation}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {getSignalIcon(technicalSignal.overall_signal)}
            </div>
            <div className="text-2xl font-bold">
              {technicalSignal.overall_signal === 'STRONG_BUY' && t.strongBuySignal}
              {technicalSignal.overall_signal === 'BUY' && t.buySignal}
              {technicalSignal.overall_signal === 'NEUTRAL' && t.neutralSignal}
              {technicalSignal.overall_signal === 'SELL' && t.sellSignal}
              {technicalSignal.overall_signal === 'STRONG_SELL' && t.strongSellSignal}
            </div>
            <div className="text-muted-foreground">
              {t.analysisDescription}
              <br />
              {t.confidenceLevel}: <strong>{technicalSignal.confidence.toFixed(1)}%</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalAnalysisComponent;
