// Technical Analysis Hooks for Real-time Crypto Analysis
import { useState, useEffect, useCallback } from 'react';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

// Types for technical indicators
export interface RSIData {
  rsi_15m: number;
  rsi_1h: number;
  rsi_4h: number;
  rsi_1d: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface MACDData {
  macd: number;
  macd_signal: number;
  macd_histogram: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
}

export interface BollingerBandsData {
  upper: number;
  middle: number;
  lower: number;
  position: 'ABOVE_UPPER' | 'BELOW_LOWER' | 'BETWEEN' | 'NEAR_MIDDLE';
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface VolumeAnalysis {
  current_volume: number;
  avg_volume_20: number;
  volume_ratio: number;
  signal: 'HIGH_VOLUME' | 'LOW_VOLUME' | 'NORMAL';
}

export interface TechnicalSignal {
  symbol: string;
  overall_signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  rsi: RSIData;
  macd: MACDData;
  bollinger: BollingerBandsData;
  volume: VolumeAnalysis;
  price: number;
  timestamp: string;
}

// Combined Technical Analysis Hook
export const useTechnicalAnalysis = (cryptoData: CryptocurrencyData[], symbol: string) => {
  const [technicalSignal, setTechnicalSignal] = useState<TechnicalSignal | null>(null);

  // Simulate historical price data (in real app, you'd fetch this from API)
  const generateMockPriceHistory = useCallback((currentPrice: number): { prices: number[], volumes: number[] } => {
    const prices = [];
    const volumes = [];
    let price = currentPrice * 0.95; // Start from 5% below current price
    
    for (let i = 0; i < 100; i++) {
      // Random walk with slight upward bias
      const change = (Math.random() - 0.48) * 0.02; // Slight bullish bias
      price = price * (1 + change);
      prices.push(price);
      
      // Random volume
      volumes.push(Math.random() * 1000000 + 500000);
    }
    
    return { prices, volumes };
  }, []);

  useEffect(() => {
    const targetCrypto = cryptoData.find(crypto => crypto.symbol === symbol);
    if (!targetCrypto) return;

    // Generate mock historical data
    const { prices, volumes } = generateMockPriceHistory(targetCrypto.price);
    
    // Calculate RSI
    const calculateRSI = (priceArray: number[], period: number = 14): number => {
      if (priceArray.length < period + 1) return 50;

      let gains = 0;
      let losses = 0;

      for (let i = 1; i <= period; i++) {
        const change = priceArray[i] - priceArray[i - 1];
        if (change > 0) {
          gains += change;
        } else {
          losses += Math.abs(change);
        }
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;

      for (let i = period + 1; i < priceArray.length; i++) {
        const change = priceArray[i] - priceArray[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
      }

      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    // Calculate EMA
    const calculateEMA = (priceArray: number[], period: number): number[] => {
      if (priceArray.length === 0) return [];
      
      const multiplier = 2 / (period + 1);
      const ema = [priceArray[0]];

      for (let i = 1; i < priceArray.length; i++) {
        ema.push((priceArray[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
      }

      return ema;
    };

    // Calculate indicators
    const rsi_15m = calculateRSI(prices.slice(-100), 14);
    const rsi_1h = calculateRSI(prices.slice(-200), 14);
    const rsi_4h = calculateRSI(prices.slice(-400), 14);
    const rsi_1d = calculateRSI(prices, 14);

    // RSI Signal
    const generateRSISignal = (rsi: number): { signal: 'BUY' | 'SELL' | 'NEUTRAL'; strength: 'STRONG' | 'MODERATE' | 'WEAK' } => {
      if (rsi <= 20) return { signal: 'BUY', strength: 'STRONG' };
      if (rsi <= 30) return { signal: 'BUY', strength: 'MODERATE' };
      if (rsi <= 40) return { signal: 'BUY', strength: 'WEAK' };
      if (rsi >= 80) return { signal: 'SELL', strength: 'STRONG' };
      if (rsi >= 70) return { signal: 'SELL', strength: 'MODERATE' };
      if (rsi >= 60) return { signal: 'SELL', strength: 'WEAK' };
      return { signal: 'NEUTRAL', strength: 'WEAK' };
    };

    const rsiSignal = generateRSISignal(rsi_1h);

    // MACD Calculation
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
    
    const macdHistory = [];
    for (let i = 26; i < Math.min(ema12.length, ema26.length); i++) {
      macdHistory.push(ema12[i] - ema26[i]);
    }
    
    const signalLine = calculateEMA(macdHistory, 9);
    const macdSignalValue = signalLine[signalLine.length - 1] || 0;
    const histogram = macdLine - macdSignalValue;

    let macdSignal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    let trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';

    if (macdLine > macdSignalValue && macdLine > 0) {
      macdSignal = 'BUY';
      trend = 'BULLISH';
    } else if (macdLine < macdSignalValue && macdLine < 0) {
      macdSignal = 'SELL';
      trend = 'BEARISH';
    } else if (macdLine > macdSignalValue) {
      macdSignal = 'BUY';
      trend = 'BULLISH';
    } else if (macdLine < macdSignalValue) {
      macdSignal = 'SELL';
      trend = 'BEARISH';
    }

    // Bollinger Bands
    const period = 20;
    const multiplier = 2;
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = sma + (multiplier * stdDev);
    const lower = sma - (multiplier * stdDev);
    const currentPrice = targetCrypto.price;
    
    let position: 'ABOVE_UPPER' | 'BELOW_LOWER' | 'BETWEEN' | 'NEAR_MIDDLE' = 'BETWEEN';
    let bollingerSignal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    
    if (currentPrice > upper) {
      position = 'ABOVE_UPPER';
      bollingerSignal = 'SELL';
    } else if (currentPrice < lower) {
      position = 'BELOW_LOWER';
      bollingerSignal = 'BUY';
    } else if (Math.abs(currentPrice - sma) < stdDev * 0.1) {
      position = 'NEAR_MIDDLE';
      bollingerSignal = 'NEUTRAL';
    }

    // Volume Analysis
    const currentVolume = volumes[volumes.length - 1];
    const recentVolumes = volumes.slice(-20);
    const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / 20;
    const volumeRatio = currentVolume / avgVolume;

    let volumeSignal: 'HIGH_VOLUME' | 'LOW_VOLUME' | 'NORMAL' = 'NORMAL';
    
    if (volumeRatio > 2.0) {
      volumeSignal = 'HIGH_VOLUME';
    } else if (volumeRatio < 0.5) {
      volumeSignal = 'LOW_VOLUME';
    }

    // Combine signals to generate overall signal
    let buyScore = 0;
    let sellScore = 0;

    // RSI scoring
    if (rsiSignal.signal === 'BUY') {
      buyScore += rsiSignal.strength === 'STRONG' ? 3 : rsiSignal.strength === 'MODERATE' ? 2 : 1;
    } else if (rsiSignal.signal === 'SELL') {
      sellScore += rsiSignal.strength === 'STRONG' ? 3 : rsiSignal.strength === 'MODERATE' ? 2 : 1;
    }

    // MACD scoring
    if (macdSignal === 'BUY') buyScore += 2;
    if (macdSignal === 'SELL') sellScore += 2;

    // Bollinger Bands scoring
    if (bollingerSignal === 'BUY') buyScore += 2;
    if (bollingerSignal === 'SELL') sellScore += 2;

    // Volume confirmation
    if (volumeSignal === 'HIGH_VOLUME') {
      if (buyScore > sellScore) buyScore += 1;
      if (sellScore > buyScore) sellScore += 1;
    }

    // Determine overall signal
    let overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
    let confidence = 0;

    const totalScore = buyScore + sellScore;
    if (totalScore > 0) {
      confidence = Math.min(((Math.max(buyScore, sellScore) / totalScore) * 100), 95);
      
      if (buyScore >= 6 && buyScore > sellScore * 1.5) {
        overallSignal = 'STRONG_BUY';
      } else if (sellScore >= 6 && sellScore > buyScore * 1.5) {
        overallSignal = 'STRONG_SELL';
      } else if (buyScore > sellScore && buyScore >= 3) {
        overallSignal = 'BUY';
      } else if (sellScore > buyScore && sellScore >= 3) {
        overallSignal = 'SELL';
      }
    }

    setTechnicalSignal({
      symbol,
      overall_signal: overallSignal,
      confidence,
      rsi: {
        rsi_15m,
        rsi_1h,
        rsi_4h,
        rsi_1d,
        signal: rsiSignal.signal,
        strength: rsiSignal.strength
      },
      macd: {
        macd: macdLine,
        macd_signal: macdSignalValue,
        macd_histogram: histogram,
        signal: macdSignal,
        trend
      },
      bollinger: {
        upper,
        middle: sma,
        lower,
        position,
        signal: bollingerSignal
      },
      volume: {
        current_volume: currentVolume,
        avg_volume_20: avgVolume,
        volume_ratio: volumeRatio,
        signal: volumeSignal
      },
      price: targetCrypto.price,
      timestamp: new Date().toISOString()
    });
  }, [cryptoData, symbol, generateMockPriceHistory]);

  return technicalSignal;
};
