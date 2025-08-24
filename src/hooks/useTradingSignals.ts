// Trading Signals Hook - Real-time Signal Generation
import { useState, useEffect, useCallback } from 'react';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

export interface TradingSignal {
  symbol: string;
  signal: '💹 قوی خرید' | '📈 خرید' | '⚖️ خنثی' | '📊 فروش' | '📉 قوی فروش' | '⏳ انتظار';
  confidence: number;
  reason: string[];
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_reward_ratio?: number;
  timestamp: string;
}

export const useTradingSignals = (cryptoData: CryptocurrencyData[]) => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);

  const generateSignal = useCallback((crypto: CryptocurrencyData): TradingSignal => {
    const { symbol, price, change, volume = 0, marketCap = 0 } = crypto;
    
    // شبیه‌سازی تحلیل تکنیکال
    const rsi = Math.random() * 100; // شبیه‌سازی RSI
    const macd = (Math.random() - 0.5) * 0.1; // شبیه‌سازی MACD
    const volume_spike = Math.random() > 0.7; // شبیه‌سازی افزایش حجم
    const volume_ratio = volume / (marketCap || 1); // نسبت حجم به ارزش بازار
    
    let signal: '💹 قوی خرید' | '📈 خرید' | '⚖️ خنثی' | '📊 فروش' | '📉 قوی فروش' | '⏳ انتظار' = '⏳ انتظار';
    let action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' = 'WAIT';
    let confidence = 0;
    const reasons: string[] = [];

    // تحلیل RSI
    if (rsi <= 30) {
      reasons.push(`RSI فروش بیش از حد: ${rsi.toFixed(1)}`);
      confidence += 25;
    } else if (rsi >= 70) {
      reasons.push(`RSI خرید بیش از حد: ${rsi.toFixed(1)}`);
      confidence += 25;
    }

    // تحلیل MACD
    if (macd > 0.05) {
      reasons.push('MACD سیگنال صعودی قوی');
      confidence += 20;
    } else if (macd < -0.05) {
      reasons.push('MACD سیگنال نزولی قوی');
      confidence += 20;
    }

    // تحلیل حجم
    if (volume_spike) {
      reasons.push('افزایش ناگهانی حجم معاملات');
      confidence += 15;
    }

    // تحلیل تغییرات قیمت
    if (change > 5) {
      reasons.push(`رشد قیمت قوی: +${change.toFixed(2)}%`);
      confidence += 20;
    } else if (change < -5) {
      reasons.push(`کاهش قیمت شدید: ${change.toFixed(2)}%`);
      confidence += 20;
    }

    // تعیین سیگنال نهایی
    let buyScore = 0;
    let sellScore = 0;

    // امتیازدهی خرید
    if (rsi <= 30) buyScore += 3;
    else if (rsi <= 40) buyScore += 1;
    
    if (macd > 0) buyScore += 2;
    if (change > 2) buyScore += 2;
    if (volume_spike && change > 0) buyScore += 1;
    if (volume_ratio > 0.05) buyScore += 1; // حجم بالا

    // امتیازدهی فروش
    if (rsi >= 70) sellScore += 3;
    else if (rsi >= 60) sellScore += 1;
    
    if (macd < 0) sellScore += 2;
    if (change < -2) sellScore += 2;
    if (volume_spike && change < 0) sellScore += 1;
    if (volume_ratio > 0.05 && change < 0) sellScore += 1; // حجم بالا با کاهش قیمت

    // تصمیم‌گیری نهایی
    if (buyScore >= 6 && buyScore > sellScore * 1.5) {
      signal = '💹 قوی خرید';
      action = 'BUY';
      confidence = Math.min(confidence + (buyScore * 5), 95);
    } else if (buyScore >= 3 && buyScore > sellScore) {
      signal = '📈 خرید';
      action = 'BUY';
      confidence = Math.min(confidence + (buyScore * 3), 85);
    } else if (sellScore >= 6 && sellScore > buyScore * 1.5) {
      signal = '📉 قوی فروش';
      action = 'SELL';
      confidence = Math.min(confidence + (sellScore * 5), 95);
    } else if (sellScore >= 3 && sellScore > buyScore) {
      signal = '📊 فروش';
      action = 'SELL';
      confidence = Math.min(confidence + (sellScore * 3), 85);
    } else if (Math.abs(buyScore - sellScore) <= 1) {
      signal = '⚖️ خنثی';
      action = 'HOLD';
      confidence = Math.max(confidence, 30);
    } else {
      signal = '⏳ انتظار';
      action = 'WAIT';
      confidence = Math.max(confidence, 20);
    }

    // محاسبه سطوح معاملاتی
    let entry_price: number | undefined;
    let stop_loss: number | undefined;
    let take_profit: number | undefined;
    let risk_reward_ratio: number | undefined;

    if (action === 'BUY') {
      entry_price = price;
      stop_loss = price * 0.97; // 3% زیان
      take_profit = price * 1.09; // 9% سود
      risk_reward_ratio = 3.0; // نسبت ریسک به سود 1:3
      reasons.push(`قیمت ورود: $${entry_price.toFixed(6)}`);
      reasons.push(`حد ضرر: $${stop_loss.toFixed(6)}`);
      reasons.push(`هدف سود: $${take_profit.toFixed(6)}`);
    } else if (action === 'SELL') {
      entry_price = price;
      stop_loss = price * 1.03; // 3% زیان
      take_profit = price * 0.91; // 9% سود
      risk_reward_ratio = 3.0;
      reasons.push(`قیمت ورود: $${entry_price.toFixed(6)}`);
      reasons.push(`حد ضرر: $${stop_loss.toFixed(6)}`);
      reasons.push(`هدف سود: $${take_profit.toFixed(6)}`);
    }

    if (reasons.length === 0) {
      reasons.push('عدم وجود سیگنال مشخص - نیاز به تحلیل بیشتر');
    }

    return {
      symbol,
      signal,
      confidence: Math.round(confidence),
      reason: reasons,
      action,
      entry_price,
      stop_loss,
      take_profit,
      risk_reward_ratio,
      timestamp: new Date().toISOString()
    };
  }, []);

  useEffect(() => {
    if (cryptoData.length === 0) return;

    const newSignals = cryptoData.map(crypto => generateSignal(crypto));
    setSignals(newSignals);

    // به‌روزرسانی هر 30 ثانیه
    const interval = setInterval(() => {
      const updatedSignals = cryptoData.map(crypto => generateSignal(crypto));
      setSignals(updatedSignals);
    }, 30000);

    return () => clearInterval(interval);
  }, [cryptoData, generateSignal]);

  return {
    signals,
    totalSignals: signals.length,
    buySignals: signals.filter(s => s.action === 'BUY').length,
    sellSignals: signals.filter(s => s.action === 'SELL').length,
    holdSignals: signals.filter(s => s.action === 'HOLD').length,
    waitSignals: signals.filter(s => s.action === 'WAIT').length,
    highConfidenceSignals: signals.filter(s => s.confidence >= 70).length
  };
};
