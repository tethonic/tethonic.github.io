import { useState, useEffect } from 'react';
import TradingSignalsComponent from '@/components/TradingSignals';
import { cryptoDataManager } from '@/services/cryptoDataManager';
import type { CryptocurrencyData } from '@/services/cryptoTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SignalsProps {
  language: 'en' | 'fa';
}

const Signals = ({ language }: SignalsProps) => {
  const [cryptoData, setCryptoData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = language === 'fa';

  const texts = {
    en: {
      loading: 'Loading trading signals...',
      noSymbols: 'Please add cryptocurrency symbols in Settings first',
      error: 'Error loading data',
      retry: 'Retry'
    },
    fa: {
      loading: 'در حال بارگذاری سیگنال‌های معاملاتی...',
      noSymbols: 'لطفاً ابتدا نمادهای ارز را در تنظیمات اضافه کنید',
      error: 'خطا در بارگذاری داده‌ها',
      retry: 'تلاش مجدد'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load symbols from localStorage settings
        const saved = localStorage.getItem('tetonicSettings');
        const settings = saved ? JSON.parse(saved) : null;
        const symbols = settings?.cryptoSymbols || ['BTC', 'ETH', 'BNB', 'SOL'];

        // If no symbols configured, show configuration message
        if (!symbols || symbols.length === 0) {
          setError(t.noSymbols);
          setLoading(false);
          return;
        }

        // Try to fetch data using the crypto data manager with fallback
        const sortedData = await cryptoDataManager.fetchWithFallback(symbols);
        setCryptoData(sortedData);

        // Log final result
        console.log(`Signals: Final data: ${sortedData.length} cryptocurrencies loaded`);
      } catch (err) {
        console.error('Error fetching crypto data:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchCryptoData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [language]);

  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-muted-foreground">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              {t.error}
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {t.retry}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TradingSignalsComponent 
        language={language} 
        cryptoData={cryptoData}
      />
    </div>
  );
};

export default Signals;
