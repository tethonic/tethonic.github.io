import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface NewsProps {
  language: 'en' | 'fa';
}

const News = ({ language }: NewsProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  const texts = {
    en: {
      title: 'News & Fundamental Analysis',
      subtitle: 'Stay updated with the latest cryptocurrency news and market analysis',
      latest: 'Latest News',
      analysis: 'Market Analysis',
      category: 'Category',
      impact: 'Market Impact',
      all: 'All',
      bitcoin: 'Bitcoin',
      ethereum: 'Ethereum',
      defi: 'DeFi',
      regulation: 'Regulation',
      adoption: 'Adoption',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      filter: 'Filter',
      refresh: 'Refresh',
      readMore: 'Read More',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      breakingNews: 'Breaking News',
      trending: 'Trending'
    },
    fa: {
      title: 'اخبار و تحلیل بنیادی',
      subtitle: 'با آخرین اخبار ارزهای دیجیتال و تحلیل بازار به‌روز باشید',
      latest: 'آخرین اخبار',
      analysis: 'تحلیل بازار',
      category: 'دسته‌بندی',
      impact: 'تأثیر بازار',
      all: 'همه',
      bitcoin: 'بیت کوین',
      ethereum: 'اتریوم',
      defi: 'DeFi',
      regulation: 'مقررات',
      adoption: 'پذیرش',
      high: 'بالا',
      medium: 'متوسط',
      low: 'پایین',
      filter: 'فیلتر',
      refresh: 'بروزرسانی',
      readMore: 'ادامه مطلب',
      bullish: 'صعودی',
      bearish: 'نزولی',
      neutral: 'خنثی',
      breakingNews: 'خبر فوری',
      trending: 'پرطرفدار'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  const newsData = [
    {
      id: 1,
      title: language === 'en' 
        ? 'Bitcoin Surges Past $67,000 as Institutional Adoption Accelerates'
        : 'بیت کوین با تسریع پذیرش نهادی از ۶۷,۰۰۰ دلار عبور کرد',
      summary: language === 'en'
        ? 'Major corporations and financial institutions continue to add Bitcoin to their balance sheets, driving unprecedented demand.'
        : 'شرکت‌های بزرگ و موسسات مالی همچنان به افزودن بیت کوین به ترازنامه‌های خود ادامه می‌دهند و تقاضای بی‌سابقه‌ای ایجاد می‌کنند.',
      category: t.bitcoin,
      impact: t.high,
      sentiment: t.bullish,
      time: '2 hours ago',
      breaking: true,
      trending: true
    },
    {
      id: 2,
      title: language === 'en'
        ? 'Ethereum 2.0 Staking Rewards Show Strong Performance with 8.5% APY'
        : 'پاداش‌های استیکینگ اتریوم ۲.۰ با ۸.۵٪ بازدهی سالانه عملکرد قوی نشان می‌دهد',
      summary: language === 'en'
        ? 'Ethereum staking continues to attract investors with competitive returns and improved network security.'
        : 'استیکینگ اتریوم با بازدهی رقابتی و بهبود امنیت شبکه همچنان سرمایه‌گذاران را جذب می‌کند.',
      category: t.ethereum,
      impact: t.medium,
      sentiment: t.bullish,
      time: '4 hours ago',
      breaking: false,
      trending: true
    },
    {
      id: 3,
      title: language === 'en'
        ? 'New DeFi Protocol Launches with $100M Total Value Locked'
        : 'پروتکل جدید DeFi با ۱۰۰ میلیون دلار ارزش قفل شده راه‌اندازی شد',
      summary: language === 'en'
        ? 'Revolutionary yield farming protocol introduces novel tokenomics and cross-chain compatibility.'
        : 'پروتکل انقلابی yield farming با معرفی توکنومیکس جدید و سازگاری بین‌زنجیره‌ای.',
      category: t.defi,
      impact: t.medium,
      sentiment: t.bullish,
      time: '6 hours ago',
      breaking: false,
      trending: false
    },
    {
      id: 4,
      title: language === 'en'
        ? 'SEC Provides Clarity on Cryptocurrency Exchange Regulations'
        : 'SEC در مورد مقررات صرافی‌های ارز دیجیتال وضوح ایجاد کرد',
      summary: language === 'en'
        ? 'New regulatory guidelines expected to reduce uncertainty and promote institutional participation.'
        : 'انتظار می‌رود راهنماهای تنظیمی جدید عدم اطمینان را کاهش دهد و مشارکت نهادی را ترویج کند.',
      category: t.regulation,
      impact: t.high,
      sentiment: t.bullish,
      time: '8 hours ago',
      breaking: false,
      trending: true
    },
    {
      id: 5,
      title: language === 'en'
        ? 'Major Payment Processor Announces Crypto Integration Plans'
        : 'پردازشگر پرداخت بزرگ برنامه‌های ادغام کریپتو را اعلام کرد',
      summary: language === 'en'
        ? 'Global payment network to support Bitcoin, Ethereum, and stablecoin transactions for millions of merchants.'
        : 'شبکه پرداخت جهانی از تراکنش‌های بیت کوین، اتریوم و استیبل کوین برای میلیون‌ها تاجر پشتیبانی خواهد کرد.',
      category: t.adoption,
      impact: t.high,
      sentiment: t.bullish,
      time: '12 hours ago',
      breaking: false,
      trending: false
    }
  ];

  const analysisData = [
    {
      title: language === 'en' 
        ? 'Bitcoin Technical Analysis: Bullish Pattern Emerges'
        : 'تحلیل تکنیکال بیت کوین: الگوی صعودی ظاهر شد',
      content: language === 'en'
        ? 'Bitcoin has formed a bullish flag pattern with strong support at $65,000. Key resistance levels at $70,000 and $75,000.'
        : 'بیت کوین الگوی پرچم صعودی با حمایت قوی در ۶۵,۰۰۰ دلار تشکیل داده است. سطوح مقاومت کلیدی در ۷۰,۰۰۰ و ۷۵,۰۰۰ دلار.',
      sentiment: t.bullish,
      time: '1 hour ago'
    },
    {
      title: language === 'en'
        ? 'Altcoin Season Analysis: Ethereum Leading the Charge'
        : 'تحلیل فصل آلت کوین: اتریوم در صدر حرکت',
      content: language === 'en'
        ? 'Ethereum shows strong momentum with DeFi recovery and Layer 2 adoption. Watch for $3,800 resistance break.'
        : 'اتریوم با بازیابی DeFi و پذیرش لایه ۲ شتاب قوی نشان می‌دهد. شکست مقاومت ۳,۸۰۰ دلار را زیر نظر بگیرید.',
      sentiment: t.bullish,
      time: '3 hours ago'
    },
    {
      title: language === 'en'
        ? 'Market Sentiment Analysis: Institutional FOMO Building'
        : 'تحلیل احساسات بازار: FOMO نهادی در حال شکل‌گیری',
      content: language === 'en'
        ? 'On-chain metrics suggest institutional accumulation continues. Retail sentiment remains cautiously optimistic.'
        : 'معیارهای روی زنجیره نشان می‌دهد انباشت نهادی ادامه دارد. احساسات خرده‌فروشی با احتیاط خوشبینانه باقی می‌ماند.',
      sentiment: t.bullish,
      time: '5 hours ago'
    }
  ];

  const getImpactColor = (impact: string) => {
    if (impact === t.high) return 'text-red-500 bg-red-50 border-red-200';
    if (impact === t.medium) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-green-500 bg-green-50 border-green-200';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === t.bullish) return 'text-green-600 bg-green-50';
    if (sentiment === t.bearish) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">{t.filter}:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="bitcoin">{t.bitcoin}</SelectItem>
                <SelectItem value="ethereum">{t.ethereum}</SelectItem>
                <SelectItem value="defi">{t.defi}</SelectItem>
                <SelectItem value="regulation">{t.regulation}</SelectItem>
                <SelectItem value="adoption">{t.adoption}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.impact} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="high">{t.high}</SelectItem>
                <SelectItem value="medium">{t.medium}</SelectItem>
                <SelectItem value="low">{t.low}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* News Tabs */}
      <Tabs defaultValue="news" className="space-y-4">
        <TabsList>
          <TabsTrigger value="news">{t.latest}</TabsTrigger>
          <TabsTrigger value="analysis">{t.analysis}</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          {newsData.map((news) => (
            <Card key={news.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {news.breaking && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {t.breakingNews}
                          </Badge>
                        )}
                        {news.trending && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {t.trending}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {news.title}
                      </h3>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {news.time}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed">
                    {news.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{news.category}</Badge>
                      <Badge 
                        variant="outline" 
                        className={getImpactColor(news.impact)}
                      >
                        {news.impact} {t.impact.toLowerCase()}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={getSentimentColor(news.sentiment)}
                      >
                        {news.sentiment === t.bullish && <TrendingUp className="h-3 w-3 mr-1" />}
                        {news.sentiment === t.bearish && <TrendingDown className="h-3 w-3 mr-1" />}
                        {news.sentiment}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      {t.readMore}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisData.map((analysis, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{analysis.title}</span>
                  <Badge 
                    variant="outline"
                    className={getSentimentColor(analysis.sentiment)}
                  >
                    {analysis.sentiment === t.bullish && <TrendingUp className="h-3 w-3 mr-1" />}
                    {analysis.sentiment === t.bearish && <TrendingDown className="h-3 w-3 mr-1" />}
                    {analysis.sentiment}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {analysis.time}
                    </div>
                    <Button variant="outline" size="sm">
                      {t.readMore}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
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

export default News;
