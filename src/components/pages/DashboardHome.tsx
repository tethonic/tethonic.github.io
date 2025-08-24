import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';

interface DashboardHomeProps {
  language: 'en' | 'fa';
}

interface CryptocurrencyData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
}

const DashboardHome = ({ language }: DashboardHomeProps) => {
  // Crypto symbol to name mapping
  const cryptoNames: { [key: string]: string } = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum', 
    'BNB': 'BNB',
    'SOL': 'Solana',
    'XRP': 'XRP',
    'DOGE': 'Dogecoin',
    'ADA': 'Cardano',
    'TRX': 'TRON',
    'AVAX': 'Avalanche',
    'SHIB': 'Shiba Inu',
    'DOT': 'Polkadot',
    'LINK': 'Chainlink',
    'BCH': 'Bitcoin Cash',
    'NEAR': 'NEAR Protocol',
    'MATIC': 'Polygon',
    'ICP': 'Internet Computer',
    'UNI': 'Uniswap',
    'LTC': 'Litecoin',
    'XLM': 'Stellar',
    'ETC': 'Ethereum Classic',
    'ATOM': 'Cosmos',
    'HBAR': 'Hedera',
    'FIL': 'Filecoin',
    'APT': 'Aptos',
    'LDO': 'Lido DAO',
    'VET': 'VeChain',
    'ARB': 'Arbitrum',
    'TAO': 'Bittensor',
    'MNT': 'Mantle',
    'IMX': 'Immutable X',
    'INJ': 'Injective',
    'OP': 'Optimism',
    'RENDER': 'Render Token',
    'SEI': 'Sei',
    'WIF': 'dogwifhat',
    'STX': 'Stacks',
    'SUI': 'Sui',
    'AAVE': 'Aave',
    'GRT': 'The Graph',
    'THETA': 'Theta Network',
    'RUNE': 'THORChain',
    'FTM': 'Fantom',
    'BONK': 'Bonk',
    'PEPE': 'Pepe',
    'ALGO': 'Algorand',
    'FLOW': 'Flow',
    'EGLD': 'MultiversX',
    'MANA': 'Decentraland',
    'SAND': 'The Sandbox',
    'XTZ': 'Tezos',
    'BEAM': 'Beam',
    'AXS': 'Axie Infinity',
    'CHZ': 'Chiliz',
    'DYDX': 'dYdX',
    'KAS': 'Kaspa',
    'ROSE': 'Oasis Network',
    'GALA': 'Gala',
    'ENS': 'Ethereum Name Service',
    'BLUR': 'Blur',
    'GMT': 'STEPN',
    'CFX': 'Conflux',
    'CRV': 'Curve DAO Token',
    'ORDI': 'ORDI',
    'COMP': 'Compound',
    'PYTH': 'Pyth Network',
    'SUPER': 'SuperVerse',
    'WLD': 'Worldcoin',
    'SATS': '1000SATS',
    'PENDLE': 'Pendle',
    'FET': 'Fetch.ai',
    'JASMY': 'JasmyCoin',
    'OCEAN': 'Ocean Protocol',
    'JTO': 'Jito',
    'CAKE': 'PancakeSwap',
    'TIA': 'Celestia',
    'JUP': 'Jupiter',
    'STRK': 'Starknet',
    'MEME': 'Memecoin',
    'BOME': 'BOOK OF MEME',
    'ENA': 'Ethena',
    'WOO': 'WOO Network',
    'RNDR': 'Render Token',
    'FLOKI': 'FLOKI',
    'PEOPLE': 'ConstitutionDAO',
    'AGIX': 'SingularityNET',
    'ARKM': 'Arkham',
    'KAVA': 'Kava',
    'WAVES': 'Waves',
    'ZIL': 'Zilliqa',
    'AR': 'Arweave',
    'LUNC': 'Terra Luna Classic',
    'ONE': 'Harmony',
    'QTUM': 'Qtum',
    'ZEC': 'Zcash',
    'DASH': 'Dash',
    'NEO': 'Neo',
    'IOST': 'IOST',
    'ZEN': 'Horizen',
    'TFUEL': 'Theta Fuel',
    'IOTX': 'IoTeX'
  };

  // Load crypto symbols from localStorage
  const [cryptoSymbols, setCryptoSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tetonicSettings');
      const settings = saved ? JSON.parse(saved) : null;
      return settings?.cryptoSymbols || [];
    } catch {
      return [];
    }
  });

  const [cryptocurrencies, setCryptocurrencies] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial data from Binance API
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

      // Fetch 24hr ticker statistics for all symbols
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Binance');
      }

      const allData = await response.json();

      // Filter data for our selected symbols and convert to USDT pairs
      const filteredData = cryptoSymbols
        .map(symbol => {
          // Try different pair formats
          const usdtPair = allData.find((item: any) => 
            item.symbol === `${symbol}USDT` || 
            item.symbol === `${symbol}BUSD` || 
            item.symbol === `${symbol}USD`
          );
          
          if (usdtPair) {
            return {
              symbol,
              name: cryptoNames[symbol] || symbol,
              price: parseFloat(usdtPair.lastPrice),
              change: parseFloat(usdtPair.priceChangePercent),
              marketCap: 0, // Binance API doesn't provide market cap directly
              volume: parseFloat(usdtPair.quoteVolume)
            };
          }
          
          return null;
        })
        .filter(Boolean) as CryptocurrencyData[];

      setCryptocurrencies(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cryptocurrency data');
      console.error('Error fetching crypto data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket connection for real-time data
  const setupWebSocket = (): WebSocket | null => {
    if (cryptoSymbols.length === 0) return null;

    // Create stream names for all symbols (prioritize USDT pairs)
    const streams = cryptoSymbols
      .map(symbol => `${symbol.toLowerCase()}usdt@ticker`)
      .join('/');

    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle single stream data
        if (data.s) {
          updateCryptocurrencyData(data);
        }
        // Handle multiple streams data (array)
        else if (Array.isArray(data)) {
          data.forEach(item => updateCryptocurrencyData(item));
        }
      } catch (err) {
        console.error('Error parsing WebSocket data:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (cryptoSymbols.length > 0) {
          setupWebSocket();
        }
      }, 3000);
    };

    return ws;
  };

  // Update cryptocurrency data from WebSocket
  const updateCryptocurrencyData = (tickerData: any) => {
    const symbol = tickerData.s.replace('USDT', '').replace('BUSD', '').replace('USD', '');
    
    setCryptocurrencies(prev => {
      const index = prev.findIndex(crypto => crypto.symbol === symbol);
      if (index === -1) return prev;

      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        price: parseFloat(tickerData.c), // Current price
        change: parseFloat(tickerData.P), // 24h price change percentage
        volume: parseFloat(tickerData.q) // 24h quote volume
      };
      
      return updated;
    });
  };

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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch initial data and setup WebSocket when symbols change
  useEffect(() => {
    let ws: WebSocket | null = null;

    const initializeData = async () => {
      // Fetch initial data
      await fetchInitialData();
      
      // Setup WebSocket for real-time updates
      if (cryptoSymbols.length > 0) {
        ws = setupWebSocket();
      }
    };

    initializeData();

    // Cleanup WebSocket on unmount or symbols change
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [cryptoSymbols]);

  // Refresh function for manual refresh button
  const handleRefresh = async () => {
    await fetchInitialData();
  };

  const texts = {
    en: {
      title: 'Cryptocurrency Market',
      symbol: 'Symbol',
      name: 'Name',
      price: 'Price (USDT)',
      change: '24h Change',
      volume: '24h Volume',
      refresh: 'Refresh',
      loading: 'Loading market data...',
      error: 'Error loading data',
      retry: 'Retry',
      noData: 'Please select cryptocurrencies from Settings first',
      connected: 'Connected',
      disconnected: 'Disconnected', 
      realTime: 'Real-time'
    },
    fa: {
      title: 'بازار ارزهای دیجیتال',
      symbol: 'نماد',
      name: 'نام',
      price: 'قیمت (USDT)',
      change: 'تغییر ۲۴ ساعته',
      volume: 'حجم ۲۴ ساعته',
      refresh: 'بروزرسانی',
      loading: 'در حال بارگذاری اطلاعات بازار...',
      error: 'خطا در بارگذاری اطلاعات',
      retry: 'تلاش مجدد',
      noData: 'ابتدا از بخش تنظیمات، ارزهای مورد نظر خود را انتخاب کنید',
      connected: 'متصل',
      disconnected: 'قطع شده',
      realTime: 'لحظه‌ای'
    }
  };

  const t = texts[language];
  const isRTL = language === 'fa';

  if (loading) {
    return (
      <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
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
      <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-red-600">{t.error}: {error}</p>
            <Button onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t.retry}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 custom-scrollbar ${isRTL ? 'text-right' : ''}`}>
      {/* Cryptocurrency Market */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.title}
              {/* WebSocket connection status */}
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {wsConnected ? t.realTime : t.disconnected}
                </span>
              </div>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cryptocurrencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.noData}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.symbol}</th>
                    <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.name}</th>
                    <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.price}</th>
                    <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.change}</th>
                    <th className={`py-3 px-4 text-left font-medium ${isRTL ? 'text-right' : ''}`}>{t.volume}</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptocurrencies.map((crypto) => (
                    <tr key={crypto.symbol} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold">{crypto.symbol}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground">{crypto.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          ${crypto.price < 1 
                            ? crypto.price.toFixed(6) 
                            : crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-medium ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          ${crypto.volume >= 1000000000 
                            ? (crypto.volume / 1000000000).toFixed(2) + 'B' 
                            : crypto.volume >= 1000000 
                            ? (crypto.volume / 1000000).toFixed(2) + 'M'
                            : crypto.volume.toLocaleString()
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
