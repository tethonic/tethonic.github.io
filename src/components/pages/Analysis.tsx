import { useState, useEffect } from 'react';
import TechnicalAnalysisComponent from '@/components/TechnicalAnalysis';
import { cryptoDataManager } from '@/services/cryptoDataManager';
import type { CryptocurrencyData } from '@/services/cryptoTypes';

interface AnalysisProps {
  language: 'en' | 'fa';
}

const Analysis = ({ language }: AnalysisProps) => {
  const [cryptoData, setCryptoData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load crypto data for analysis
  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        // Get settings from localStorage
        const saved = localStorage.getItem('tetonicSettings');
        const settings = saved ? JSON.parse(saved) : null;
        const symbols = settings?.cryptoSymbols || ['BTC', 'ETH', 'BNB', 'SOL'];
        const selectedService = settings?.cryptoService || 'binance';

        // Use crypto data manager with preferred service
        const data = await cryptoDataManager.fetchWithFallback(symbols, selectedService);
        setCryptoData(data);
        console.log(`Analysis: Final data loaded - ${data.length} cryptocurrencies`);
      } catch (error) {
        console.error('Error loading crypto data for analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading analysis data...' : 'بارگذاری داده‌های تحلیل...'}
          </p>
        </div>
      </div>
    );
  }

  return <TechnicalAnalysisComponent language={language} cryptoData={cryptoData} />;
};

export default Analysis;
