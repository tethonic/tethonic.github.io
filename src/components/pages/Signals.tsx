import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface SignalsProps {
  language: 'en' | 'fa';
}

const Signals = ({ language }: SignalsProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const texts = {
    en: {
      title: 'Trading Signals',
      subtitle: 'Professional crypto trading signals with technical analysis',
      active: 'Active Signals',
      history: 'Signal History',
      all: 'All Signals',
      buy: 'BUY',
      sell: 'SELL',
      hold: 'HOLD',
      strong: 'Strong',
      medium: 'Medium',
      weak: 'Weak',
      confidence: 'Confidence',
      entryPrice: 'Entry Price',
      targetPrice: 'Target Price',
      stopLoss: 'Stop Loss',
      timeframe: 'Timeframe',
      type: 'Type',
      filter: 'Filter',
      refresh: 'Refresh',
      profit: 'Profit',
      loss: 'Loss',
      pending: 'Pending',
      completed: 'Completed',
      successRate: 'Success Rate',
      totalProfit: 'Total Profit'
    },
    fa: {
      title: 'سیگنال‌های معاملاتی',
      subtitle: 'سیگنال‌های حرفه‌ای معاملات کریپتو با تحلیل تکنیکال',
      active: 'سیگنال‌های فعال',
      history: 'تاریخچه سیگنال‌ها',
      all: 'همه سیگنال‌ها',
      buy: 'خرید',
      sell: 'فروش',
      hold: 'نگهداری',
      strong: 'قوی',
      medium: 'متوسط',
      weak: 'ضعیف',
      confidence: 'اطمینان',
      entryPrice: 'قیمت ورود',
      targetPrice: 'قیمت هدف',
      stopLoss: 'حد ضرر',
      timeframe: 'بازه زمانی',
      type: 'نوع',
      filter: 'فیلتر',
      refresh: 'بروزرسانی',
      profit: 'سود',
      loss: 'ضرر',
      pending: 'در انتظار',
      completed: 'تکمیل شده',
      successRate: 'نرخ موفقیت',
      totalProfit: 'کل سود'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  const activeSignals = [
    {
      pair: 'BTC/USDT',
      action: t.buy,
      strength: t.strong,
      confidence: 92,
      entryPrice: '$67,500',
      targetPrice: '$72,000',
      stopLoss: '$64,000',
      timeframe: '4H',
      time: '2 hours ago',
      status: 'active'
    },
    {
      pair: 'ETH/USDT',
      action: t.sell,
      strength: t.medium,
      confidence: 85,
      entryPrice: '$3,450',
      targetPrice: '$3,200',
      stopLoss: '$3,600',
      timeframe: '1D',
      time: '4 hours ago',
      status: 'active'
    },
    {
      pair: 'ADA/USDT',
      action: t.hold,
      strength: t.weak,
      confidence: 78,
      entryPrice: '$0.48',
      targetPrice: '$0.52',
      stopLoss: '$0.45',
      timeframe: '1W',
      time: '6 hours ago',
      status: 'pending'
    }
  ];

  const signalHistory = [
    {
      pair: 'SOL/USDT',
      action: t.buy,
      confidence: 88,
      entryPrice: '$145.00',
      exitPrice: '$156.50',
      result: t.profit,
      profit: '+7.9%',
      date: '2 days ago'
    },
    {
      pair: 'MATIC/USDT',
      action: t.sell,
      confidence: 82,
      entryPrice: '$0.85',
      exitPrice: '$0.79',
      result: t.profit,
      profit: '+7.1%',
      date: '3 days ago'
    },
    {
      pair: 'DOT/USDT',
      action: t.buy,
      confidence: 75,
      entryPrice: '$8.20',
      exitPrice: '$7.95',
      result: t.loss,
      profit: '-3.0%',
      date: '5 days ago'
    }
  ];

  const getActionColor = (action: string) => {
    if (action === t.buy) return 'bg-green-500 hover:bg-green-600';
    if (action === t.sell) return 'bg-red-500 hover:bg-red-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };

  const getStrengthColor = (strength: string) => {
    if (strength === t.strong) return 'text-green-600';
    if (strength === t.medium) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.successRate}
                </p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.totalProfit}
                </p>
                <p className="text-2xl font-bold text-blue-600">+24.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.active}
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">{t.filter}:</span>
            </div>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.timeframe} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="4h">4H</SelectItem>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="1w">1W</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="buy">{t.buy}</SelectItem>
                <SelectItem value="sell">{t.sell}</SelectItem>
                <SelectItem value="hold">{t.hold}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="cursor-pointer hover:cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">{t.active}</TabsTrigger>
          <TabsTrigger value="history">{t.history}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSignals.map((signal, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{signal.pair}</h3>
                    <Badge className={getActionColor(signal.action)}>
                      {signal.action}
                    </Badge>
                    <Badge variant="outline" className={getStrengthColor(signal.strength)}>
                      {signal.strength}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {signal.time}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.entryPrice}</p>
                    <p className="font-semibold">{signal.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.targetPrice}</p>
                    <p className="font-semibold text-green-600">{signal.targetPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.stopLoss}</p>
                    <p className="font-semibold text-red-600">{signal.stopLoss}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.timeframe}</p>
                    <p className="font-semibold">{signal.timeframe}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{t.confidence}:</span>
                    <Progress value={signal.confidence} className="w-32" />
                    <span className="text-sm font-medium">{signal.confidence}%</span>
                  </div>
                  <Badge variant={signal.status === 'active' ? 'default' : 'secondary'}>
                    {signal.status === 'active' ? t.active : t.pending}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {signalHistory.map((signal, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{signal.pair}</h3>
                    <Badge className={getActionColor(signal.action)}>
                      {signal.action}
                    </Badge>
                    <Badge 
                      variant={signal.result === t.profit ? 'default' : 'destructive'}
                    >
                      {signal.result}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {signal.date}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.entryPrice}</p>
                    <p className="font-semibold">{signal.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exit Price</p>
                    <p className="font-semibold">{signal.exitPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.confidence}</p>
                    <p className="font-semibold">{signal.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P&L</p>
                    <p className={`font-semibold ${signal.result === t.profit ? 'text-green-600' : 'text-red-600'}`}>
                      {signal.profit}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Signals;
