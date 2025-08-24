import type { CryptoApiService, CryptocurrencyData } from './cryptoTypes';

export const coingeckoService: CryptoApiService = {
  name: 'CoinGecko',
  supportsWebSocket: false,

  async fetchInitialData(symbols: string[]): Promise<CryptocurrencyData[]> {
    try {
      // CoinGecko uses different symbol format, we need to map them
      const geckoSymbols = symbols
        .map(symbol => symbol.toLowerCase())
        .filter(symbol => geckoIdMap[symbol])
        .map(symbol => geckoIdMap[symbol])
        .join(',');

      if (!geckoSymbols) {
        return [];
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${geckoSymbols}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded for CoinGecko API');
        }
        throw new Error('Failed to fetch data from CoinGecko');
      }

      const data = await response.json();

      return data.map((coin: any): CryptocurrencyData => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        volume: coin.total_volume || 0
      }));
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  },

  setupWebSocket(): null {
    // CoinGecko doesn't offer free WebSocket, use polling instead
    return null;
  }
};

// CoinGecko ID mapping for common cryptocurrencies
const geckoIdMap: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'xrp': 'ripple',
  'usdc': 'usd-coin',
  'steth': 'staked-ether',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'doge': 'dogecoin',
  'trx': 'tron',
  'dot': 'polkadot',
  'link': 'chainlink',
  'matic': 'matic-network',
  'shib': 'shiba-inu',
  'icp': 'internet-computer',
  'ltc': 'litecoin',
  'uni': 'uniswap',
  'etc': 'ethereum-classic',
  'dai': 'dai',
  'bch': 'bitcoin-cash',
  'near': 'near',
  'atom': 'cosmos',
  'leo': 'leo-token',
  'apt': 'aptos',
  'fet': 'fetch-ai',
  'xlm': 'stellar',
  'mkr': 'maker',
  'hbar': 'hedera-hashgraph',
  'op': 'optimism',
  'arb': 'arbitrum',
  'imx': 'immutable-x',
  'fil': 'filecoin',
  'ldo': 'lido-dao',
  'cro': 'crypto-com-chain',
  'rndr': 'render-token',
  'grt': 'the-graph',
  'rune': 'thorchain',
  'inj': 'injective-protocol',
  'sui': 'sui',
  'qnt': 'quant-network',
  'mana': 'decentraland',
  'sand': 'the-sandbox',
  'aave': 'aave',
  'flow': 'flow',
  'algo': 'algorand',
  'snx': 'synthetix-network-token',
  'theta': 'theta-token',
  'axs': 'axie-infinity',
  'ape': 'apecoin',
  'chz': 'chiliz',
  'mina': 'mina-protocol',
  'eos': 'eos',
  'cake': 'pancakeswap-token',
  'ftm': 'fantom',
  'ksm': 'kusama',
  'neo': 'neo',
  'kcs': 'kucoin-shares',
  'cfx': 'conflux-token',
  'bat': 'basic-attention-token',
  'comp': 'compound-governance-token',
  'crv': 'curve-dao-token',
  'gala': 'gala',
  'enj': 'enjincoin',
  'lrc': 'loopring',
  'zec': 'zcash',
  'dash': 'dash',
  'yfi': 'yearn-finance',
  'sushi': 'sushi',
  '1inch': '1inch',
  'celo': 'celo',
  'omg': 'omisego',
  'qtum': 'qtum',
  'icx': 'icon',
  'zil': 'zilliqa',
  'bal': 'balancer',
  'ren': 'republic-protocol',
  'storj': 'storj',
  'kava': 'kava',
  'band': 'band-protocol',
  'rlc': 'iexec-rlc',
  'zrx': '0x',
  'uma': 'uma',
  'nmr': 'numeraire',
  'knc': 'kyber-network-crystal',
  'ont': 'ontology',
  'dgb': 'digibyte',
  'hot': 'holo',
  'nano': 'nano',
  'iot': 'iota',
  'xtz': 'tezos',
  'ankr': 'ankr',
  'audio': 'audius',
  'ctsi': 'cartesi',
  'skl': 'skale',
  'nu': 'nucypher',
  'cvc': 'civic',
  'ogn': 'origin-protocol',
  'req': 'request-network',
  'nkn': 'nkn',
  'orn': 'orion-protocol',
  'amp': 'amp-token',
  'poly': 'polymath',
  'rsr': 'reserve-rights-token',
  'chr': 'chromaway',
  'blz': 'bluzelle',
  'celr': 'celer-network',
  'for': 'the-force-protocol',
  'pha': 'pha',
  'adx': 'adex',
  'arpa': 'arpa-chain',
  'bnt': 'bancor',
  'clv': 'clover-finance',
  'cos': 'contentos',
  'ctk': 'certik',
  'cvp': 'concentrated-voting-power',
  'drep': 'drep-new',
  'epx': 'ellipsis-x'
};
