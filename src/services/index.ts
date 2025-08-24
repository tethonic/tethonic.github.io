import type { CryptoApiService } from './cryptoTypes';
import { binanceService } from './binanceService';
import { coingeckoService } from './coingeckoService';
import { coinexService } from './coinexService';

export const cryptoServices: Record<string, CryptoApiService> = {
  binance: binanceService,
  coingecko: coingeckoService,
  coinex: coinexService
};

export type CryptoServiceName = keyof typeof cryptoServices;

export function getCryptoService(serviceName: CryptoServiceName): CryptoApiService {
  return cryptoServices[serviceName];
}

export function getAvailableServices(): Array<{id: CryptoServiceName, name: string, supportsWebSocket: boolean}> {
  return Object.entries(cryptoServices).map(([id, service]) => ({
    id: id as CryptoServiceName,
    name: service.name,
    supportsWebSocket: service.supportsWebSocket
  }));
}
