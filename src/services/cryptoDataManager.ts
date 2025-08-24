import { binanceService } from './binanceService';
import { coinexService } from './coinexService';
import { coingeckoService } from './coingeckoService';
import type { CryptocurrencyData, CryptoApiService } from './cryptoTypes';

export class CryptoDataManager {
  private services: { name: string; service: CryptoApiService }[] = [
    { name: 'binance', service: binanceService },
    { name: 'coingecko', service: coingeckoService },
    { name: 'coinex', service: coinexService }
  ];

  /**
   * Fetch cryptocurrency data with automatic fallback
   * @param symbols Array of cryptocurrency symbols
   * @param primaryService Preferred service name (optional)
   * @returns Promise<CryptocurrencyData[]>
   */
  async fetchWithFallback(
    symbols: string[], 
    primaryService?: string
  ): Promise<CryptocurrencyData[]> {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    let data: CryptocurrencyData[] = [];
    const attempted: string[] = [];

    // Reorder services to try primary service first if specified
    const orderedServices = [...this.services];
    if (primaryService) {
      const primaryIndex = orderedServices.findIndex(s => s.name === primaryService);
      if (primaryIndex > -1) {
        const primary = orderedServices.splice(primaryIndex, 1)[0];
        orderedServices.unshift(primary);
      }
    }

    // Try each service until we get data
    for (const { name, service } of orderedServices) {
      try {
        console.log(`🔄 Trying ${name} service...`);
        attempted.push(name);
        
        const result = await service.fetchInitialData(symbols);
        
        if (result && result.length > 0) {
          data = result;
          console.log(`✅ ${name} service successful: ${result.length} items`);
          break;
        } else {
          console.log(`⚠️ ${name} service returned no data`);
        }
      } catch (error) {
        console.error(`❌ ${name} service failed:`, error);
      }
    }

    // If still no data, try parallel fetch as last resort
    if (data.length === 0) {
      console.log('🔄 Trying all services in parallel (last resort)...');
      try {
        const results = await Promise.allSettled(
          this.services.map(({ service }) => service.fetchInitialData(symbols))
        );

        // Combine all successful results
        const allData: CryptocurrencyData[] = [];
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            console.log(`✅ Parallel fetch ${this.services[index].name}: ${result.value.length} items`);
            allData.push(...result.value);
          }
        });

        // Deduplicate by symbol (keep first occurrence)
        data = allData.reduce((acc: CryptocurrencyData[], current: CryptocurrencyData) => {
          const existing = acc.find(item => item.symbol === current.symbol);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

        if (data.length > 0) {
          console.log(`✅ Parallel fetch successful: ${data.length} unique items`);
        }
      } catch (parallelError) {
        console.error('❌ Parallel fetch failed:', parallelError);
      }
    }

    if (data.length === 0) {
      console.error(`❌ All services failed. Attempted: ${attempted.join(', ')}`);
      throw new Error(`Failed to fetch data from all available services: ${attempted.join(', ')}`);
    }

    console.log(`🎉 Final result: ${data.length} cryptocurrencies loaded`);
    return data;
  }

  /**
   * Get available service names
   */
  getAvailableServices(): string[] {
    return this.services.map(s => s.name);
  }

  /**
   * Check if a service is available
   */
  isServiceAvailable(serviceName: string): boolean {
    return this.services.some(s => s.name === serviceName);
  }

  /**
   * Get service by name
   */
  getService(serviceName: string): CryptoApiService | null {
    const service = this.services.find(s => s.name === serviceName);
    return service ? service.service : null;
  }
}

// Export singleton instance
export const cryptoDataManager = new CryptoDataManager();
