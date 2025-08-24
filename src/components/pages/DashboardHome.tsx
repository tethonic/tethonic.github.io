import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';
import { getCryptoService, type CryptoServiceName } from '@/services';
import { cryptoDataManager } from '@/services/cryptoDataManager';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

interface DashboardHomeProps {
  language: 'en' | 'fa';
}

// Crypto Icon Component with multiple fallbacks
const CryptoIcon = ({ symbol }: { symbol: string }) => {
  const [iconError, setIconError] = useState(0);
  
  // Define colors for major cryptocurrencies
  const cryptoColors: Record<string, { from: string; to: string }> = {
    'BTC': { from: 'from-orange-400', to: 'to-orange-600' },
    'ETH': { from: 'from-blue-400', to: 'to-indigo-600' },
    'BNB': { from: 'from-yellow-400', to: 'to-yellow-600' },
    'SOL': { from: 'from-purple-400', to: 'to-purple-600' },
    'XRP': { from: 'from-blue-500', to: 'to-blue-700' },
    'ADA': { from: 'from-blue-400', to: 'to-blue-600' },
    'DOGE': { from: 'from-yellow-400', to: 'to-yellow-600' },
    'MATIC': { from: 'from-purple-500', to: 'to-indigo-600' },
    'DOT': { from: 'from-pink-400', to: 'to-pink-600' },
    'SHIB': { from: 'from-orange-400', to: 'to-red-500' },
    'AVAX': { from: 'from-red-400', to: 'to-red-600' },
    'UNI': { from: 'from-pink-400', to: 'to-purple-600' },
    'LINK': { from: 'from-blue-400', to: 'to-blue-600' },
    'ATOM': { from: 'from-purple-400', to: 'to-purple-600' },
    'LTC': { from: 'from-gray-400', to: 'to-gray-600' },
    'BCH': { from: 'from-green-400', to: 'to-green-600' },
    'TRX': { from: 'from-red-400', to: 'to-red-600' }
  };
  
  const iconSources = [
    `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/32/color/${symbol.toLowerCase()}.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${symbol.toLowerCase()}.png`,
    `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/32`,
    null // Fallback to styled text
  ];

  const handleImageError = () => {
    setIconError(prev => prev + 1);
  };

  if (iconError >= iconSources.length - 1 || iconSources[iconError] === null) {
    // Styled text fallback with crypto-specific colors
    const colors = cryptoColors[symbol] || { from: 'from-blue-500', to: 'to-purple-600' };
    
    return (
      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={iconSources[iconError] || ''}
      alt={symbol}
      className="w-6 h-6 rounded"
      onError={handleImageError}
      loading="lazy"
    />
  );
};

const DashboardHome = ({ language }: DashboardHomeProps) => {
  // Load settings from localStorage
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tetonicSettings');
      const settings = saved ? JSON.parse(saved) : null;
      return settings?.cryptoSymbols || [];
    } catch {
      return [];
    }
  });

  const [selectedService, setSelectedService] = useState<CryptoServiceName>(() => {
    try {
      const saved = localStorage.getItem('tetonicSettings');
      const settings = saved ? JSON.parse(saved) : null;
      return settings?.cryptoService || 'binance';
    } catch {
      return 'binance';
    }
  });

  const [cryptocurrencies, setCryptocurrencies] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial data using fallback strategy
  const fetchInitialData = async () => {
    // Don't fetch if no symbols are selected
    if (cryptoSymbols.length === 0) {
      setLoading(false);
      setCryptocurrencies([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use crypto data manager with fallback strategy
      const data = await cryptoDataManager.fetchWithFallback(cryptoSymbols, selectedService);
      
      setCryptocurrencies(data);
      setWsConnected(false);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data from all sources');
      setCryptocurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket connection for real-time data
  const setupWebSocket = (): WebSocket | null => {
    if (cryptoSymbols.length === 0) return null;

    const service = getCryptoService(selectedService);
    
    if (!service.supportsWebSocket) {
      // For services without WebSocket (like CoinGecko), set up polling
      const interval = setInterval(fetchInitialData, 30000); // Poll every 30 seconds
      return {
        close: () => clearInterval(interval)
      } as any;
    }

    const ws = service.setupWebSocket?.(cryptoSymbols, (updatedData: CryptocurrencyData) => {
      setCryptocurrencies(prev => {
        const index = prev.findIndex(item => item.symbol === updatedData.symbol);
        if (index >= 0) {
          const newData = [...prev];
          newData[index] = updatedData;
          return newData;
        } else {
          return [...prev, updatedData];
        }
      });
    });

    if (ws) {
      ws.onopen = () => {
        console.log(`${service.name} WebSocket connected`);
        setWsConnected(true);
      };

      ws.onclose = () => {
        console.log(`${service.name} WebSocket disconnected`);
        setWsConnected(false);
      };

      ws.onerror = (error) => {
        console.error(`${service.name} WebSocket error:`, error);
        setWsConnected(false);
      };
    }

    return ws || null;
  };

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('tetonicSettings');
        const settings = saved ? JSON.parse(saved) : null;
        if (settings) {
          const newSymbols = settings.cryptoSymbols || [];
          const newService = settings.cryptoService || 'binance';
          
          if (JSON.stringify(newSymbols) !== JSON.stringify(cryptoSymbols) || newService !== selectedService) {
            setCryptoSymbols(newSymbols);
            setSelectedService(newService);
          }
        }
      } catch (error) {
        console.error('Error reading settings:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab changes)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cryptoSymbols, selectedService]);

  // Initial data load and WebSocket setup
  useEffect(() => {
    fetchInitialData();

    let ws: WebSocket | null = null;
    
    // Set up WebSocket after initial data load
    const timeoutId = setTimeout(() => {
      ws = setupWebSocket();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (ws) {
        ws.close();
      }
    };
  }, [cryptoSymbols, selectedService]);

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap === 0) return 'N/A';
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(2)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  const texts = {
    en: {
      title: 'Cryptocurrency Market',
      subtitle: `Real-time data from ${getCryptoService(selectedService).name}`,
      refresh: 'Refresh',
      symbol: 'Symbol',
      name: 'Name',
      price: 'Price',
      change: '24h Change',
      marketCap: 'Market Cap',
      volume: '24h Volume',
      noData: 'No cryptocurrency data available',
      configureSymbols: 'Configure symbols in Settings',
      loading: 'Loading cryptocurrency data...',
      error: 'Error loading data',
      wsConnected: 'Real-time updates active',
      wsDisconnected: 'Real-time updates inactive'
    },
    fa: {
      title: 'بازار ارزهای دیجیتال',
      subtitle: `داده‌های لحظه‌ای از ${getCryptoService(selectedService).name}`,
      refresh: 'بروزرسانی',
      symbol: 'نماد',
      name: 'نام',
      price: 'قیمت',
      change: 'تغییر ۲۴ ساعته',
      marketCap: 'ارزش بازار',
      volume: 'حجم ۲۴ ساعته',
      noData: 'داده‌ای از ارزهای دیجیتال در دسترس نیست',
      configureSymbols: 'نمادها را در تنظیمات پیکربندی کنید',
      loading: 'بارگذاری داده‌های ارز دیجیتال...',
      error: 'خطا در بارگذاری داده‌ها',
      wsConnected: 'به‌روزرسانی‌های لحظه‌ای فعال',
      wsDisconnected: 'به‌روزرسانی‌های لحظه‌ای غیرفعال'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <p className="text-destructive">{t.error}: {error}</p>
            <Button onClick={fetchInitialData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t.refresh}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cryptocurrencies.length === 0) {
    return (
      <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">{t.noData}</p>
              <p className="text-sm text-muted-foreground">{t.configureSymbols}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t.subtitle}</span>
            {getCryptoService(selectedService).supportsWebSocket && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                wsConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {wsConnected ? t.wsConnected : t.wsDisconnected}
              </span>
            )}
          </div>
        </div>
        <Button onClick={fetchInitialData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t.refresh}
        </Button>
      </div>

      {/* Cryptocurrency Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.symbol}</th>
                  <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.name}</th>
                  <th className={`py-3 px-4 text-right font-medium ${isRTL ? 'text-left' : ''}`}>{t.price}</th>
                  <th className={`py-3 px-4 text-right font-medium ${isRTL ? 'text-left' : ''}`}>{t.change}</th>
                  <th className={`py-3 px-4 text-right font-medium ${isRTL ? 'text-left' : ''}`}>{t.volume}</th>
                  <th className={`py-3 px-4 text-right font-medium ${isRTL ? 'text-left' : ''}`}>{t.marketCap}</th>
                </tr>
              </thead>
              <tbody>
                {cryptocurrencies.map((crypto) => (
                  <tr key={crypto.symbol} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <CryptoIcon symbol={crypto.symbol} />
                        </div>
                        <span className="font-medium">{crypto.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{crypto.name}</td>
                    <td className={`py-3 px-4 font-mono font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                      {formatPrice(crypto.price)}
                    </td>
                    <td className={`py-3 px-4 font-mono font-medium ${isRTL ? 'text-left' : 'text-right'} ${
                      crypto.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatChange(crypto.change)}
                    </td>
                    <td className={`py-3 px-4 font-mono text-muted-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                      {formatVolume(crypto.volume)}
                    </td>
                    <td className={`py-3 px-4 font-mono text-muted-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                      {formatMarketCap(crypto.marketCap)}
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
