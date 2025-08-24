import type { CryptoApiService, CryptocurrencyData } from './cryptoTypes';
import { cryptoNames } from './cryptoTypes';

export const binanceService: CryptoApiService = {
  name: 'Binance',
  supportsWebSocket: true,

  async fetchInitialData(symbols: string[]): Promise<CryptocurrencyData[]> {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Binance');
      }

      const allData = await response.json();

      return symbols
        .map(symbol => {
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
              marketCap: 0,
              volume: parseFloat(usdtPair.quoteVolume)
            };
          }
          
          return null;
        })
        .filter(Boolean) as CryptocurrencyData[];
    } catch (error) {
      console.error('Binance API error:', error);
      throw error;
    }
  },

  setupWebSocket(symbols: string[], onUpdate: (data: CryptocurrencyData) => void): WebSocket | null {
    if (symbols.length === 0) return null;

    const streams = symbols
      .map(symbol => `${symbol.toLowerCase()}usdt@ticker`)
      .join('/');

    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.s) {
          const symbol = data.s.replace('USDT', '').replace('BUSD', '').replace('USD', '');
          onUpdate({
            symbol,
            name: cryptoNames[symbol] || symbol,
            price: parseFloat(data.c),
            change: parseFloat(data.P),
            marketCap: 0,
            volume: parseFloat(data.q)
          });
        }
      } catch (err) {
        console.error('Error parsing Binance WebSocket data:', err);
      }
    };

    return ws;
  }
};
