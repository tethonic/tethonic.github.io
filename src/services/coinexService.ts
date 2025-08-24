import type { CryptoApiService, CryptocurrencyData } from './cryptoTypes';
import { cryptoNames } from './cryptoTypes';

export const coinexService: CryptoApiService = {
  name: 'CoinEx',
  supportsWebSocket: true,

  async fetchInitialData(symbols: string[]): Promise<CryptocurrencyData[]> {
    try {
      const response = await fetch('https://api.coinex.com/v1/market/ticker/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from CoinEx');
      }

      const result = await response.json();
      const allData = result.data;

      return symbols
        .map(symbol => {
          const usdtPair = allData[`${symbol}USDT`] || allData[`${symbol}USD`] || allData[symbol];
          
          if (usdtPair) {
            return {
              symbol,
              name: cryptoNames[symbol] || symbol,
              price: parseFloat(usdtPair.last),
              change: parseFloat(usdtPair.change_rate) * 100,
              marketCap: 0,
              volume: parseFloat(usdtPair.vol_usdt || usdtPair.vol)
            };
          }
          
          return null;
        })
        .filter(Boolean) as CryptocurrencyData[];
    } catch (error) {
      console.error('CoinEx API error:', error);
      throw error;
    }
  },

  setupWebSocket(symbols: string[], onUpdate: (data: CryptocurrencyData) => void): WebSocket | null {
    if (symbols.length === 0) return null;

    const wsUrl = 'wss://socket.coinex.com/';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      symbols.forEach(symbol => {
        const market = `${symbol}USDT`;
        const subscribeMessage = {
          method: "state.subscribe",
          params: [market],
          id: Date.now()
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.method === 'state.update' && data.params && data.params.length >= 2) {
          const market = data.params[0];
          const tickerData = data.params[1];
          const symbol = market.replace('USDT', '').replace('USD', '');
          
          if (tickerData.last) {
            onUpdate({
              symbol,
              name: cryptoNames[symbol] || symbol,
              price: parseFloat(tickerData.last),
              change: parseFloat(tickerData.change_rate) * 100,
              marketCap: 0,
              volume: parseFloat(tickerData.vol_usdt || tickerData.vol || 0)
            });
          }
        }
      } catch (err) {
        console.error('Error parsing CoinEx WebSocket data:', err);
      }
    };

    return ws;
  }
};
