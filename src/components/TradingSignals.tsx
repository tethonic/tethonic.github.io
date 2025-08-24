import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Target,
  DollarSign,
  Clock,
  RefreshCw,
  Signal
} from 'lucide-react';
import { useTradingSignals } from '@/hooks/useTradingSignals';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

interface TradingSignalsProps {
  cryptoData: CryptocurrencyData[];
}

const TradingSignalsComponent = ({ cryptoData }: TradingSignalsProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const { 
    signals, 
    totalSignals, 
    buySignals, 
    sellSignals, 
    holdSignals, 
    highConfidenceSignals 
  } = useTradingSignals(cryptoData);

  // Get unique symbols from crypto data
  const availableSymbols = [...new Set(cryptoData.map(crypto => crypto.symbol))].sort();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Progress bar style helper
  const getProgressWidthClass = (confidence: number) => {
    const width = Math.min(100, Math.max(0, confidence));
    if (width >= 90) return 'w-full';
    if (width >= 80) return 'w-4/5';
    if (width >= 70) return 'w-3/4';
    if (width >= 60) return 'w-3/5';
    if (width >= 50) return 'w-1/2';
    if (width >= 40) return 'w-2/5';
    if (width >= 30) return 'w-1/3';
    if (width >= 20) return 'w-1/5';
    if (width >= 10) return 'w-1/12';
    return 'w-0';
  };

  const getSignalColor = (signal: string) => {
    // English signals
    if (signal.includes('Strong Buy')) return 'bg-green-600 text-white';
    if (signal.includes('Buy') && !signal.includes('Strong')) return 'bg-green-500 text-white';
    if (signal.includes('Neutral')) return 'bg-yellow-500 text-white';
    if (signal.includes('Sell') && !signal.includes('Strong')) return 'bg-red-500 text-white';
    if (signal.includes('Strong Sell')) return 'bg-red-600 text-white';
    
    // Persian signals
    if (signal.includes('قوی خرید')) return 'bg-green-600 text-white';
    if (signal.includes('خرید') && !signal.includes('قوی')) return 'bg-green-500 text-white';
    if (signal.includes('خنثی')) return 'bg-yellow-500 text-white';
    if (signal.includes('فروش') && !signal.includes('قوی')) return 'bg-red-500 text-white';
    if (signal.includes('قوی فروش')) return 'bg-red-600 text-white';
    
    return 'bg-gray-500 text-white';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 dark:text-green-400';
      case 'SELL': return 'text-red-600 dark:text-red-400';
      case 'HOLD': return 'text-yellow-600 dark:text-yellow-400';
      case 'WAIT': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'BUY': return 'خرید';
      case 'SELL': return 'فروش';
      case 'HOLD': return 'نگه‌داری';
      case 'WAIT': return 'انتظار';
      default: return action;
    }
  };

  const texts = {
    title: 'سیگنال‌های معاملاتی',
    subtitle: 'سیگنال‌های معاملاتی ارزهای دیجیتال با هوش مصنوعی',
    refresh: 'به‌روزرسانی سیگنال‌ها',
    allSignals: 'همه سیگنال‌ها',
    buySignals: 'سیگنال‌های خرید',
    sellSignals: 'سیگنال‌های فروش',
    highConfidence: 'اطمینان بالا',
    statistics: 'آمار سیگنال‌ها',
    totalSignals: 'کل سیگنال‌ها',
    buyCount: 'سیگنال خرید',
    sellCount: 'سیگنال فروش',
    holdCount: 'نگهداری',
    waitCount: 'انتظار',
    highConfidenceCount: 'اطمینان بالا',
    symbol: 'نماد',
    signal: 'سیگنال',
    confidence: 'اطمینان',
    action: 'عملیات',
    reasons: 'تحلیل',
    entryPrice: 'قیمت ورود',
    stopLoss: 'حد ضرر',
    takeProfit: 'هدف سود',
    riskReward: 'ریسک/سود',
    lastUpdate: 'آخرین به‌روزرسانی',
    trading: 'معاملات',
    moreReasons: 'مورد دیگر',
    entryLabel: 'ورود',
    stopLossLabel: 'ضرر',
    takeProfitLabel: 'سود',
    liveSignals: 'سیگنال‌های لحظه‌ای فعال',
    lastUpdateTime: 'آخرین به‌روزرسانی',
    live: 'زنده',
    allSymbols: 'همه نمادها'
  };

  const t = texts;

  const filterSignals = (filterType: string) => {
    let filteredSignals = signals;
    
    // Filter by symbol first
    if (selectedSymbol !== 'all') {
      filteredSignals = filteredSignals.filter(s => s.symbol === selectedSymbol);
    }
    
    // Then filter by type
    switch (filterType) {
      case 'buy':
        return filteredSignals.filter(s => s.action === 'BUY');
      case 'sell':
        return filteredSignals.filter(s => s.action === 'SELL');
      case 'high-confidence':
        return filteredSignals.filter(s => s.confidence >= 70);
      default:
        return filteredSignals;
    }
  };

  const SignalTable = ({ signals: filteredSignals }: { signals: typeof signals }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4 text-right font-medium">{t.symbol}</th>
            <th className="py-3 px-4 text-right font-medium">{t.signal}</th>
            <th className="py-3 px-4 text-right font-medium">{t.confidence}</th>
            <th className="py-3 px-4 text-right font-medium">{t.action}</th>
            <th className="py-3 px-4 text-right font-medium">{t.reasons}</th>
            <th className="py-3 px-4 text-right font-medium">{t.trading}</th>
          </tr>
        </thead>
        <tbody>
          {filteredSignals.map((signalData) => (
            <tr key={signalData.symbol} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-medium">{signalData.symbol}</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {signalData.symbol.slice(0, 2)}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end">
                  <Badge className={getSignalColor(signalData.signal)}>
                    {signalData.signal}
                  </Badge>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium min-w-[3rem] text-left">{signalData.confidence}%</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 relative">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        signalData.confidence >= 70 ? 'bg-green-600' :
                        signalData.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      } ${getProgressWidthClass(signalData.confidence)}`}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className={`flex items-center gap-1 justify-end ${getActionColor(signalData.action)}`}>
                  <span className="font-medium">{getActionText(signalData.action)}</span>
                  {signalData.action === 'BUY' && <TrendingUp className="h-4 w-4" />}
                  {signalData.action === 'SELL' && <TrendingDown className="h-4 w-4" />}
                  {signalData.action === 'HOLD' && <Activity className="h-4 w-4" />}
                  {signalData.action === 'WAIT' && <Clock className="h-4 w-4" />}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="text-sm space-y-1 max-w-xs text-right">
                  {signalData.reason.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="text-muted-foreground truncate">
                      {reason} •
                    </div>
                  ))}
                  {signalData.reason.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      {t.moreReasons} {signalData.reason.length - 2}+
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                {signalData.entry_price && (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-left">${signalData.entry_price.toFixed(6)} :{t.entryLabel}</span>
                      <Target className="h-3 w-3" />
                    </div>
                    {signalData.stop_loss && (
                      <div className="flex items-center gap-1 text-red-600 justify-end">
                        <span className="text-left">${signalData.stop_loss.toFixed(6)} :{t.stopLossLabel}</span>
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                    )}
                    {signalData.take_profit && (
                      <div className="flex items-center gap-1 text-green-600 justify-end">
                        <span className="text-left">${signalData.take_profit.toFixed(6)} :{t.takeProfitLabel}</span>
                        <DollarSign className="h-3 w-3" />
                      </div>
                    )}
                    {signalData.risk_reward_ratio && (
                      <div className="text-xs text-muted-foreground text-right">
                        1:{signalData.risk_reward_ratio} :ریسک/سود
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div dir="rtl" className="p-6 space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          {/* Symbol Filter */}
          <div className="flex items-center gap-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t.allSymbols} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t.allSymbols}
                </SelectItem>
                {availableSymbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
        </div>
        <div className="space-y-1 text-right">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{highConfidenceSignals}</div>
            <div className="text-sm text-muted-foreground">{t.highConfidenceCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{holdSignals}</div>
            <div className="text-sm text-muted-foreground">{t.holdCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{sellSignals}</div>
            <div className="text-sm text-muted-foreground">{t.sellCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{buySignals}</div>
            <div className="text-sm text-muted-foreground">{t.buyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSignals}</div>
            <div className="text-sm text-muted-foreground">{t.totalSignals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Signals Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 flex-row-reverse">
          <TabsTrigger value="high-confidence">{t.highConfidence}</TabsTrigger>
          <TabsTrigger value="sell">{t.sellSignals}</TabsTrigger>
          <TabsTrigger value="buy">{t.buySignals}</TabsTrigger>
          <TabsTrigger value="all">{t.allSignals}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal className="h-5 w-5" />
                {t.allSignals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalTable signals={filterSignals('all')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                {t.buySignals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalTable signals={filterSignals('buy')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                {t.sellSignals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalTable signals={filterSignals('sell')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-confidence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                {t.highConfidence}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignalTable signals={filterSignals('high-confidence')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Status */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {t.liveSignals} - {t.lastUpdateTime}: {new Date().toLocaleTimeString('fa-IR')}
              </span>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-300">
              {t.live}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSignalsComponent;
