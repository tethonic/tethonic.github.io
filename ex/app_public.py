#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CoinEx Public API Dashboard - No Rate Limits
Uses public APIs that don't require authentication
"""

import asyncio
import sqlite3
import logging
import requests
import pandas as pd
import numpy as np
from flask import Flask, render_template_string, jsonify
from waitress import serve
from shared_config import SharedConfig
from datetime import datetime
import json
import time
from typing import Dict, List, Optional, Tuple, Any
import ta
import plotly.graph_objs as go
import plotly.utils

# Configuration
config = SharedConfig()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('public_dashboard.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =================== Technical Analysis ===================
class TechnicalAnalysis:
    """Advanced technical analysis indicators"""
    
    @staticmethod
    def calculate_rsi(prices: pd.Series, period: int = 14) -> float:
        """Calculate RSI indicator"""
        try:
            if len(prices) < period:
                return 50.0
            rsi = ta.momentum.RSIIndicator(prices, window=period).rsi()
            return round(rsi.iloc[-1], 2) if not pd.isna(rsi.iloc[-1]) else 50.0
        except:
            return 50.0
    
    @staticmethod
    def calculate_macd(prices: pd.Series) -> Tuple[float, float]:
        """Calculate MACD indicator"""
        try:
            if len(prices) < 26:
                return 0.0, 0.0
            macd = ta.trend.MACD(prices)
            macd_line = macd.macd().iloc[-1]
            signal_line = macd.macd_signal().iloc[-1]
            if pd.isna(macd_line) or pd.isna(signal_line):
                return 0.0, 0.0
            return round(macd_line, 4), round(signal_line, 4)
        except:
            return 0.0, 0.0
    
    @staticmethod
    def calculate_bollinger_bands(prices: pd.Series, period: int = 20) -> Tuple[float, float, float]:
        """Calculate Bollinger Bands"""
        try:
            if len(prices) < period:
                return 0.0, 0.0, 0.0
            bb = ta.volatility.BollingerBands(prices, window=period)
            upper = bb.bollinger_hband().iloc[-1]
            middle = bb.bollinger_mavg().iloc[-1]
            lower = bb.bollinger_lband().iloc[-1]
            if pd.isna(upper) or pd.isna(middle) or pd.isna(lower):
                return 0.0, 0.0, 0.0
            return round(upper, 4), round(middle, 4), round(lower, 4)
        except:
            return 0.0, 0.0, 0.0
    
    @staticmethod
    def calculate_sma(prices: pd.Series, period: int = 20) -> float:
        """Calculate Simple Moving Average"""
        try:
            if len(prices) < period:
                return prices.iloc[-1] if len(prices) > 0 else 0.0
            sma = prices.rolling(window=period).mean().iloc[-1]
            return round(sma, 4) if not pd.isna(sma) else 0.0
        except:
            return 0.0
    
    @staticmethod
    def calculate_ema(prices: pd.Series, period: int = 20) -> float:
        """Calculate Exponential Moving Average"""
        try:
            if len(prices) < period:
                return prices.iloc[-1] if len(prices) > 0 else 0.0
            ema = ta.trend.EMAIndicator(prices, window=period).ema_indicator().iloc[-1]
            return round(ema, 4) if not pd.isna(ema) else 0.0
        except:
            return 0.0

# =================== Signal Generator ===================
class SignalGenerator:
    """Advanced signal generation with multiple strategies"""
    
    def __init__(self):
        self.ta = TechnicalAnalysis()
    
    def generate_advanced_signal(self, df: pd.DataFrame) -> Dict:
        """Generate advanced trading signal based on multiple indicators"""
        try:
            if len(df) < 30:  # Need enough data for analysis
                return {
                    'signal': 'WAITING',
                    'confidence': 0.0,
                    'reason': 'Insufficient data',
                    'indicators': {}
                }
            
            # Calculate indicators
            close_prices = df['close']
            current_price = close_prices.iloc[-1]
            
            # RSI analysis
            rsi = self.ta.calculate_rsi(close_prices)
            
            # MACD analysis
            macd, macd_signal = self.ta.calculate_macd(close_prices)
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self.ta.calculate_bollinger_bands(close_prices)
            
            # Moving Averages
            sma_20 = self.ta.calculate_sma(close_prices, 20)
            ema_12 = self.ta.calculate_ema(close_prices, 12)
            ema_26 = self.ta.calculate_ema(close_prices, 26)
            
            # Volume analysis
            if 'volume' in df.columns:
                current_volume = df['volume'].iloc[-1]
                avg_volume = df['volume'].rolling(20).mean().iloc[-1]
                volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1.0
            else:
                volume_ratio = 1.0
            
            # Signal scoring
            buy_score = 0
            sell_score = 0
            signals_detail = []
            
            # RSI conditions
            if rsi < 30:
                buy_score += 3
                signals_detail.append("RSI Oversold (Strong Buy)")
            elif rsi < 40:
                buy_score += 1
                signals_detail.append("RSI Low (Buy)")
            elif rsi > 70:
                sell_score += 3
                signals_detail.append("RSI Overbought (Strong Sell)")
            elif rsi > 60:
                sell_score += 1
                signals_detail.append("RSI High (Sell)")
            
            # MACD conditions
            if macd > macd_signal and macd > 0:
                buy_score += 2
                signals_detail.append("MACD Bullish")
            elif macd < macd_signal and macd < 0:
                sell_score += 2
                signals_detail.append("MACD Bearish")
            elif macd > macd_signal:
                buy_score += 1
                signals_detail.append("MACD Above Signal")
            else:
                sell_score += 1
                signals_detail.append("MACD Below Signal")
            
            # Bollinger Bands conditions
            if bb_lower > 0 and current_price < bb_lower:
                buy_score += 2
                signals_detail.append("Price Below BB Lower")
            elif bb_upper > 0 and current_price > bb_upper:
                sell_score += 2
                signals_detail.append("Price Above BB Upper")
            elif bb_middle > 0:
                if current_price > bb_middle:
                    buy_score += 0.5
                else:
                    sell_score += 0.5
            
            # Moving Average conditions
            if sma_20 > 0 and current_price > sma_20:
                buy_score += 1
                signals_detail.append("Price Above SMA20")
            elif sma_20 > 0:
                sell_score += 1
                signals_detail.append("Price Below SMA20")
            
            if ema_12 > ema_26:
                buy_score += 1
                signals_detail.append("EMA12 > EMA26")
            else:
                sell_score += 1
                signals_detail.append("EMA12 < EMA26")
            
            # Volume confirmation
            if volume_ratio > 1.5:
                if buy_score > sell_score:
                    buy_score += 1
                    signals_detail.append("High Volume (Bullish)")
                elif sell_score > buy_score:
                    sell_score += 1
                    signals_detail.append("High Volume (Bearish)")
            
            # Determine signal
            total_score = buy_score + sell_score
            if total_score == 0:
                signal = "⏳ WAITING"
                confidence = 0
            elif buy_score >= 6 and buy_score > sell_score * 1.5:
                signal = "💹 STRONG BUY"
                confidence = min(buy_score * 15, 95)
            elif sell_score >= 6 and sell_score > buy_score * 1.5:
                signal = "📉 STRONG SELL"
                confidence = min(sell_score * 15, 95)
            elif buy_score > sell_score:
                signal = "📈 BUY"
                confidence = min(buy_score * 12, 80)
            elif sell_score > buy_score:
                signal = "📊 SELL"
                confidence = min(sell_score * 12, 80)
            else:
                signal = "⚖️ NEUTRAL"
                confidence = 30
            
            indicators = {
                'rsi': rsi,
                'macd': macd,
                'macd_signal': macd_signal,
                'bb_upper': bb_upper,
                'bb_middle': bb_middle,
                'bb_lower': bb_lower,
                'sma_20': sma_20,
                'ema_12': ema_12,
                'ema_26': ema_26,
                'volume_ratio': volume_ratio,
                'buy_score': buy_score,
                'sell_score': sell_score
            }
            
            return {
                'signal': signal,
                'confidence': confidence,
                'indicators': indicators,
                'signals_detail': signals_detail,
                'current_price': current_price
            }
            
        except Exception as e:
            logger.error(f"Signal generation error: {e}")
            return {
                'signal': '❌ ERROR',
                'confidence': 0.0,
                'reason': str(e),
                'indicators': {}
            }

class PublicDashboard:
    def __init__(self):
        self.app = Flask(__name__)
        self.db_conn = None
        self.base_url = "https://api.coinex.com"
        self.signal_generator = SignalGenerator()
        self.init_database()
        self.setup_routes()
        
    def init_database(self):
        """Initialize SQLite database"""
        try:
            self.db_conn = sqlite3.connect('public_signals.db', check_same_thread=False)
            cursor = self.db_conn.cursor()
            
            # Drop and recreate table to ensure all columns exist
            cursor.execute("DROP TABLE IF EXISTS crypto_data")
            cursor.execute("""
                CREATE TABLE crypto_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    price REAL,
                    volume_24h REAL,
                    change_24h REAL,
                    market_cap REAL,
                    signal TEXT,
                    confidence REAL,
                    rsi REAL,
                    macd REAL,
                    macd_signal REAL,
                    bb_upper REAL,
                    bb_middle REAL,
                    bb_lower REAL,
                    sma_20 REAL,
                    ema_12 REAL,
                    ema_26 REAL,
                    volume_ratio REAL,
                    buy_score REAL,
                    sell_score REAL,
                    signals_detail TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS available_assets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_code TEXT UNIQUE,
                    deposit_enabled BOOLEAN,
                    withdraw_enabled BOOLEAN,
                    chains TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS historical_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    timestamp INTEGER,
                    open_price REAL,
                    high_price REAL,
                    low_price REAL,
                    close_price REAL,
                    volume REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.db_conn.commit()
            logger.info("Public database initialized with fresh schema")
        except Exception as e:
            logger.error(f"Database error: {e}")
    
    def fetch_historical_data(self, symbol: str, timeframe: str = "1h", limit: int = 100):
        """Fetch historical kline data from public API"""
        try:
            # Convert symbol format (e.g., BTCUSDT -> BTC/USDT)
            if symbol.endswith('USDT'):
                formatted_symbol = symbol[:-4] + 'USDT'
            else:
                formatted_symbol = symbol
            
            url = f"{self.base_url}/v2/spot/kline"
            params = {
                'market': formatted_symbol,
                'period': timeframe,
                'limit': limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and data['data']:
                    # Convert to DataFrame
                    klines = []
                    for item in data['data']:
                        klines.append({
                            'timestamp': int(item[0]),
                            'open': float(item[1]),
                            'high': float(item[2]),
                            'low': float(item[3]),
                            'close': float(item[4]),
                            'volume': float(item[5])
                        })
                    
                    df = pd.DataFrame(klines)
                    df['datetime'] = pd.to_datetime(df['timestamp'], unit='s')
                    return df
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return pd.DataFrame()
    
    def calculate_advanced_signal(self, symbol: str) -> Dict:
        """Calculate advanced signal for a symbol using historical data"""
        try:
            # Get historical data
            df = self.fetch_historical_data(symbol, "1h", 100)
            
            if df.empty:
                return {
                    'signal': 'NO_DATA',
                    'confidence': 0.0,
                    'indicators': {}
                }
            
            # Generate signal using advanced analysis
            signal_data = self.signal_generator.generate_advanced_signal(df)
            
            # Store in database
            self.store_historical_data(symbol, df)
            
            return signal_data
            
        except Exception as e:
            logger.error(f"Error calculating advanced signal for {symbol}: {e}")
            return {
                'signal': 'ERROR',
                'confidence': 0.0,
                'indicators': {},
                'error': str(e)
            }
    
    def store_historical_data(self, symbol: str, df: pd.DataFrame):
        """Store historical data in database"""
        try:
            cursor = self.db_conn.cursor()
            
            # Clear old data for this symbol
            cursor.execute("DELETE FROM historical_data WHERE symbol = ?", (symbol,))
            
            # Insert new data
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT INTO historical_data 
                    (symbol, timestamp, open_price, high_price, low_price, close_price, volume)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (symbol, row['timestamp'], row['open'], row['high'], 
                     row['low'], row['close'], row['volume']))
            
            self.db_conn.commit()
            
        except Exception as e:
            logger.error(f"Error storing historical data: {e}")
    
    def fetch_available_assets(self):
        """Fetch available assets from public API"""
        try:
            response = requests.get(f"{self.base_url}/v2/assets/all-deposit-withdraw-config", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    return data['data']
            return []
        except Exception as e:
            logger.error(f"Error fetching assets: {e}")
            return []
    
    def fetch_market_data(self):
        """Fetch market data from public API"""
        try:
            response = requests.get(f"{self.base_url}/v2/spot/ticker", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    return data['data']
            return []
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return []
    
    def update_market_data(self):
        """Update market data with advanced technical analysis"""
        try:
            market_data = self.fetch_market_data()
            
            cursor = self.db_conn.cursor()
            
            # Clear old data
            cursor.execute("DELETE FROM crypto_data WHERE timestamp < datetime('now', '-1 hour')")
            
            # Focus on major USDT pairs for detailed analysis
            major_pairs = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'SOLUSDT', 
                          'LINKUSDT', 'MATICUSDT', 'AVAXUSDT', 'ATOMUSDT', 'NEARUSDT']
            
            processed_count = 0
            for ticker in market_data:
                try:
                    symbol = ticker.get('market', '').upper()
                    if not symbol.endswith('USDT'):
                        continue
                    
                    price = float(ticker.get('last', 0))
                    volume_24h = float(ticker.get('vol', 0))
                    change_24h = float(ticker.get('change_percentage', 0))
                    
                    # Use advanced analysis for major pairs, simple for others
                    if symbol in major_pairs:
                        signal_data = self.calculate_advanced_signal(symbol)
                        signal = signal_data.get('signal', 'WAITING')
                        confidence = signal_data.get('confidence', 0.0)
                        indicators = signal_data.get('indicators', {})
                        signals_detail = json.dumps(signal_data.get('signals_detail', []))
                        
                        # Extract indicators
                        rsi = indicators.get('rsi', 50.0)
                        macd = indicators.get('macd', 0.0)
                        macd_signal = indicators.get('macd_signal', 0.0)
                        bb_upper = indicators.get('bb_upper', 0.0)
                        bb_middle = indicators.get('bb_middle', 0.0)
                        bb_lower = indicators.get('bb_lower', 0.0)
                        sma_20 = indicators.get('sma_20', 0.0)
                        ema_12 = indicators.get('ema_12', 0.0)
                        ema_26 = indicators.get('ema_26', 0.0)
                        volume_ratio = indicators.get('volume_ratio', 1.0)
                        buy_score = indicators.get('buy_score', 0.0)
                        sell_score = indicators.get('sell_score', 0.0)
                    else:
                        # Simple signal for other pairs
                        signal = self.calculate_simple_signal(change_24h)
                        confidence = abs(change_24h) * 10
                        rsi = macd = macd_signal = bb_upper = bb_middle = bb_lower = 0.0
                        sma_20 = ema_12 = ema_26 = volume_ratio = buy_score = sell_score = 0.0
                        signals_detail = json.dumps([f"Simple signal based on 24h change: {change_24h}%"])
                    
                    cursor.execute("""
                        INSERT INTO crypto_data (
                            symbol, price, volume_24h, change_24h, signal, confidence,
                            rsi, macd, macd_signal, bb_upper, bb_middle, bb_lower,
                            sma_20, ema_12, ema_26, volume_ratio, buy_score, sell_score, signals_detail
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (symbol, price, volume_24h, change_24h, signal, confidence,
                         rsi, macd, macd_signal, bb_upper, bb_middle, bb_lower,
                         sma_20, ema_12, ema_26, volume_ratio, buy_score, sell_score, signals_detail))
                    
                    processed_count += 1
                    
                    # Add delay between major pair analysis to avoid overwhelming the API
                    if symbol in major_pairs:
                        time.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"Error processing ticker {ticker}: {e}")
                    continue
            
            self.db_conn.commit()
            logger.info(f"Updated market data for {processed_count} symbols with advanced analysis")
            
        except Exception as e:
            logger.error(f"Error updating market data: {e}")
    
    def calculate_simple_signal(self, price_change):
        """Generate simple signal based on price change"""
        if price_change > 5:
            return "💹 STRONG BUY"
        elif price_change > 2:
            return "📈 BUY"
        elif price_change < -5:
            return "📉 STRONG SELL"
        elif price_change < -2:
            return "📊 SELL"
        else:
            return "⏳ HOLD"
    
    def update_available_assets(self):
        """Update available assets in database"""
        try:
            assets_data = self.fetch_available_assets()
            
            cursor = self.db_conn.cursor()
            
            for asset_info in assets_data:
                try:
                    asset = asset_info.get('asset', {})
                    asset_code = asset.get('ccy', '').upper()
                    deposit_enabled = asset.get('deposit_enabled', False)
                    withdraw_enabled = asset.get('withdraw_enabled', False)
                    
                    chains = []
                    for chain_info in asset_info.get('chains', []):
                        chains.append(chain_info.get('chain', ''))
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO available_assets 
                        (asset_code, deposit_enabled, withdraw_enabled, chains, updated_at)
                        VALUES (?, ?, ?, ?, datetime('now'))
                    """, (asset_code, deposit_enabled, withdraw_enabled, json.dumps(chains)))
                    
                except Exception as e:
                    logger.error(f"Error processing asset {asset_info}: {e}")
                    continue
            
            self.db_conn.commit()
            logger.info(f"Updated {len(assets_data)} available assets")
            
        except Exception as e:
            logger.error(f"Error updating assets: {e}")
    
    async def monitor_data(self):
        """Monitor and update data periodically"""
        while True:
            try:
                logger.info("Updating market data...")
                self.update_market_data()
                
                logger.info("Updating available assets...")
                self.update_available_assets()
                
                logger.info("Data update completed. Waiting 5 minutes...")
                await asyncio.sleep(300)  # 5 minutes
                
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                await asyncio.sleep(60)
    
    def setup_routes(self):
        """Setup Flask routes"""
        
        # Add custom Jinja filter for JSON parsing
        @self.app.template_filter('from_json')
        def from_json_filter(json_str):
            try:
                return json.loads(json_str) if json_str else []
            except:
                return []
        
        @self.app.route('/')
        def index():
            try:
                cursor = self.db_conn.cursor()
                cursor.execute("""
                    SELECT symbol, price, volume_24h, change_24h, signal, confidence,
                           rsi, macd, macd_signal, bb_upper, bb_middle, bb_lower,
                           sma_20, ema_12, ema_26, volume_ratio, buy_score, sell_score,
                           signals_detail, timestamp 
                    FROM crypto_data 
                    WHERE symbol LIKE '%USDT'
                    ORDER BY volume_24h DESC 
                    LIMIT 50
                """)
                market_data = cursor.fetchall()
                
                cursor.execute("""
                    SELECT COUNT(*) as total_assets, 
                           SUM(CASE WHEN deposit_enabled = 1 THEN 1 ELSE 0 END) as deposit_enabled,
                           SUM(CASE WHEN withdraw_enabled = 1 THEN 1 ELSE 0 END) as withdraw_enabled
                    FROM available_assets
                """)
                asset_stats = cursor.fetchone()
                
                return render_template_string(self.get_html_template(), 
                                            market_data=market_data, 
                                            asset_stats=asset_stats)
            except Exception as e:
                logger.error(f"Route error: {e}")
                return f"Error: {e}"
        
        @self.app.route('/api/market-data')
        def api_market_data():
            try:
                cursor = self.db_conn.cursor()
                cursor.execute("""
                    SELECT symbol, price, volume_24h, change_24h, signal, confidence,
                           rsi, macd, macd_signal, bb_upper, bb_middle, bb_lower,
                           sma_20, ema_12, ema_26, volume_ratio, buy_score, sell_score,
                           signals_detail, timestamp 
                    FROM crypto_data 
                    WHERE symbol LIKE '%USDT'
                    ORDER BY volume_24h DESC 
                    LIMIT 100
                """)
                data = cursor.fetchall()
                
                result = []
                for row in data:
                    signals_detail = []
                    try:
                        if row[18]:
                            signals_detail = json.loads(row[18])
                    except:
                        signals_detail = []
                    
                    result.append({
                        'symbol': row[0],
                        'price': row[1],
                        'volume_24h': row[2],
                        'change_24h': row[3],
                        'signal': row[4],
                        'confidence': row[5],
                        'technical_indicators': {
                            'rsi': row[6],
                            'macd': row[7],
                            'macd_signal': row[8],
                            'bollinger_bands': {
                                'upper': row[9],
                                'middle': row[10],
                                'lower': row[11]
                            },
                            'moving_averages': {
                                'sma_20': row[12],
                                'ema_12': row[13],
                                'ema_26': row[14]
                            },
                            'volume_ratio': row[15],
                            'scores': {
                                'buy_score': row[16],
                                'sell_score': row[17]
                            }
                        },
                        'signals_detail': signals_detail,
                        'timestamp': row[19]
                    })
                
                return jsonify({
                    'status': 'success',
                    'data': result,
                    'count': len(result),
                    'updated_at': datetime.now().isoformat()
                })
            except Exception as e:
                logger.error(f"API error: {e}")
                return jsonify({'status': 'error', 'error': str(e)})
        
        @self.app.route('/api/assets')
        def api_assets():
            try:
                cursor = self.db_conn.cursor()
                cursor.execute("""
                    SELECT asset_code, deposit_enabled, withdraw_enabled, chains 
                    FROM available_assets 
                    ORDER BY asset_code
                """)
                data = cursor.fetchall()
                
                result = []
                for row in data:
                    result.append({
                        'asset_code': row[0],
                        'deposit_enabled': bool(row[1]),
                        'withdraw_enabled': bool(row[2]),
                        'chains': json.loads(row[3]) if row[3] else []
                    })
                
                return jsonify(result)
            except Exception as e:
                logger.error(f"API error: {e}")
                return jsonify({'error': str(e)})
    
    def get_html_template(self):
        """HTML template for advanced dashboard"""
        return """
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoinEx Advanced Public API Dashboard</title>
    <meta http-equiv="refresh" content="300">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            direction: ltr !important;
            text-align: left !important;
        }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f8f9fa;
            direction: ltr !important;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
        }
        .signal-strong_buy, .signal-💹_strong_buy { 
            background-color: #d1f2eb !important; 
            color: #0d7377; 
            border-left: 4px solid #28a745;
        }
        .signal-buy, .signal-📈_buy { 
            background-color: #d4edda !important; 
            color: #155724; 
            border-left: 4px solid #28a745;
        }
        .signal-hold, .signal-⏳_hold, .signal-neutral, .signal-⚖️_neutral { 
            background-color: #fff3cd !important; 
            color: #856404; 
            border-left: 4px solid #ffc107;
        }
        .signal-sell, .signal-📊_sell { 
            background-color: #f8d7da !important; 
            color: #721c24; 
            border-left: 4px solid #dc3545;
        }
        .signal-strong_sell, .signal-📉_strong_sell { 
            background-color: #f5c6cb !important; 
            color: #491217; 
            border-left: 4px solid #dc3545;
        }
        .signal-waiting, .signal-⏳_waiting { 
            background-color: #e2e3e5 !important; 
            color: #6c757d; 
            border-left: 4px solid #6c757d;
        }
        .table th, .table td {
            text-align: left !important;
            direction: ltr !important;
            vertical-align: middle !important;
        }
        .positive { color: #28a745; font-weight: bold; }
        .negative { color: #dc3545; font-weight: bold; }
        .card-stat {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .indicator-value {
            font-size: 0.85em;
            color: #6c757d;
        }
        .confidence-bar {
            width: 100%;
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
        }
        .confidence-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .confidence-high { background-color: #28a745; }
        .confidence-medium { background-color: #ffc107; }
        .confidence-low { background-color: #dc3545; }
        .crypto-icon {
            width: 24px;
            height: 24px;
            margin-right: 8px;
        }
        .signal-details {
            font-size: 0.75em;
            color: #6c757d;
            margin-top: 4px;
        }
        .table-hover tbody tr:hover {
            background-color: rgba(0,0,0,.075) !important;
        }
        .advanced-indicator {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 2px 6px;
            margin: 1px;
            display: inline-block;
            font-size: 0.7em;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1 class="text-center">
                <i class="fas fa-chart-line"></i> 
                CoinEx Advanced Technical Analysis Dashboard
            </h1>
            <p class="text-center">
                <i class="fas fa-infinity"></i> No Rate Limits • 
                <i class="fas fa-brain"></i> Advanced Technical Analysis • 
                <i class="fas fa-clock"></i> Real-time Signals
            </p>
        </div>
    </div>
    
    <div class="container">
        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card card-stat text-center">
                    <div class="card-body">
                        <i class="fas fa-coins fa-2x mb-2"></i>
                        <h5 class="card-title">Total Assets</h5>
                        <h2>{{ asset_stats[0] if asset_stats else 0 }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-stat text-center">
                    <div class="card-body">
                        <i class="fas fa-arrow-down fa-2x mb-2"></i>
                        <h5 class="card-title">Deposit Enabled</h5>
                        <h2 class="text-success">{{ asset_stats[1] if asset_stats else 0 }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-stat text-center">
                    <div class="card-body">
                        <i class="fas fa-arrow-up fa-2x mb-2"></i>
                        <h5 class="card-title">Withdraw Enabled</h5>
                        <h2 class="text-info">{{ asset_stats[2] if asset_stats else 0 }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-stat text-center">
                    <div class="card-body">
                        <i class="fas fa-robot fa-2x mb-2"></i>
                        <h5 class="card-title">AI Signals</h5>
                        <h2 class="text-warning">{{ market_data|length }}</h2>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Market Data Table -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5><i class="fas fa-chart-area"></i> Advanced Technical Analysis - Top USDT Pairs</h5>
                            <small class="text-muted">
                                <i class="fas fa-sync-alt"></i> Auto-refresh every 5 minutes | 
                                <i class="fas fa-shield-alt"></i> No API rate limits | 
                                <i class="fas fa-brain"></i> RSI, MACD, Bollinger Bands, Moving Averages
                            </small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success">Live</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th><i class="fas fa-coins"></i> Symbol</th>
                                        <th><i class="fas fa-dollar-sign"></i> Price (USDT)</th>
                                        <th><i class="fas fa-percentage"></i> 24h Change</th>
                                        <th><i class="fas fa-chart-bar"></i> Volume</th>
                                        <th><i class="fas fa-robot"></i> AI Signal</th>
                                        <th><i class="fas fa-tachometer-alt"></i> Confidence</th>
                                        <th><i class="fas fa-cogs"></i> Technical Indicators</th>
                                        <th><i class="fas fa-clock"></i> Last Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for data in market_data %}
                                    <tr class="signal-{{ data[4].lower().replace(' ', '_') }}">
                                        <td>
                                            <strong>
                                                <i class="fab fa-bitcoin text-warning me-1"></i>
                                                {{ data[0] }}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong>${{ "%.6f"|format(data[1]) }}</strong>
                                        </td>
                                        <td class="{% if data[3] > 0 %}positive{% else %}negative{% endif %}">
                                            {% if data[3] > 0 %}
                                                <i class="fas fa-arrow-up"></i>
                                            {% else %}
                                                <i class="fas fa-arrow-down"></i>
                                            {% endif %}
                                            {{ "%.2f"|format(data[3]) }}%
                                        </td>
                                        <td>${{ "{:,.0f}".format(data[2]) }}</td>
                                        <td>
                                            <span class="badge 
                                                {% if 'STRONG BUY' in data[4] or '💹' in data[4] %}bg-success
                                                {% elif 'BUY' in data[4] or '📈' in data[4] %}bg-primary
                                                {% elif 'HOLD' in data[4] or '⏳' in data[4] or 'NEUTRAL' in data[4] or '⚖️' in data[4] %}bg-warning
                                                {% elif 'SELL' in data[4] and 'STRONG' not in data[4] and '📊' in data[4] %}bg-danger
                                                {% elif 'STRONG SELL' in data[4] or '📉' in data[4] %}bg-dark
                                                {% else %}bg-secondary{% endif %}">
                                                {{ data[4] }}
                                            </span>
                                            {% if data[18] and data[18] != '[]' %}
                                            <div class="signal-details">
                                                {% set details = data[18]|from_json %}
                                                {% for detail in details[:2] %}
                                                    <small>• {{ detail }}</small><br>
                                                {% endfor %}
                                            </div>
                                            {% endif %}
                                        </td>
                                        <td>
                                            {% if data[5] %}
                                            <div class="confidence-bar">
                                                <div class="confidence-fill 
                                                    {% if data[5] >= 70 %}confidence-high
                                                    {% elif data[5] >= 40 %}confidence-medium
                                                    {% else %}confidence-low{% endif %}" 
                                                    style="width: {{ data[5] }}%"></div>
                                            </div>
                                            <small>{{ "%.0f"|format(data[5]) }}%</small>
                                            {% else %}
                                            <small class="text-muted">N/A</small>
                                            {% endif %}
                                        </td>
                                        <td>
                                            {% if data[6] and data[6] != 0 %}
                                            <div class="advanced-indicators">
                                                <span class="advanced-indicator">
                                                    RSI: {{ "%.1f"|format(data[6]) }}
                                                </span>
                                                {% if data[7] and data[7] != 0 %}
                                                <span class="advanced-indicator">
                                                    MACD: {{ "%.4f"|format(data[7]) }}
                                                </span>
                                                {% endif %}
                                                {% if data[12] and data[12] != 0 %}
                                                <span class="advanced-indicator">
                                                    SMA20: ${{ "%.2f"|format(data[12]) }}
                                                </span>
                                                {% endif %}
                                                {% if data[15] and data[15] != 0 %}
                                                <span class="advanced-indicator">
                                                    Vol: {{ "%.1f"|format(data[15]) }}x
                                                </span>
                                                {% endif %}
                                            </div>
                                            {% else %}
                                            <small class="text-muted">Simple Analysis</small>
                                            {% endif %}
                                        </td>
                                        <td><small>{{ data[19] }}</small></td>
                                    </tr>
                                    {% endfor %}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Technical Analysis Legend -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-info-circle"></i> Technical Analysis Indicators</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <h6><i class="fas fa-wave-square"></i> RSI (Relative Strength Index)</h6>
                                <small>
                                    • &lt;30: Oversold (Buy signal)<br>
                                    • &gt;70: Overbought (Sell signal)<br>
                                    • 30-70: Neutral zone
                                </small>
                            </div>
                            <div class="col-md-3">
                                <h6><i class="fas fa-chart-line"></i> MACD</h6>
                                <small>
                                    • MACD > Signal: Bullish<br>
                                    • MACD < Signal: Bearish<br>
                                    • Zero line cross: Trend change
                                </small>
                            </div>
                            <div class="col-md-3">
                                <h6><i class="fas fa-arrows-alt-v"></i> Bollinger Bands</h6>
                                <small>
                                    • Price < Lower: Oversold<br>
                                    • Price > Upper: Overbought<br>
                                    • Middle: 20-period SMA
                                </small>
                            </div>
                            <div class="col-md-3">
                                <h6><i class="fas fa-chart-area"></i> Moving Averages</h6>
                                <small>
                                    • SMA20: 20-period average<br>
                                    • EMA12/26: Exponential averages<br>
                                    • Price position indicates trend
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- API Endpoints -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-code"></i> Available API Endpoints</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-database"></i> Market Data API</h6>
                                <code>GET /api/market-data</code>
                                <p><small>Returns current market data with technical analysis for all USDT pairs</small></p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-coins"></i> Assets API</h6>
                                <code>GET /api/assets</code>
                                <p><small>Returns all available assets with deposit/withdraw status and chain information</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Add from_json filter functionality
        function parseJsonSafely(jsonString) {
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                return [];
            }
        }
    </script>
</body>
</html>
        """

async def main():
    """Main function"""
    logger.info("Starting CoinEx Public API Dashboard...")
    
    dashboard = PublicDashboard()
    
    # Initial data fetch
    logger.info("Fetching initial data...")
    dashboard.update_market_data()
    dashboard.update_available_assets()
    
    # Start monitoring in background
    monitoring_task = asyncio.create_task(dashboard.monitor_data())
    
    # Start web server
    logger.info("Starting web server on http://localhost:5000")
    serve(dashboard.app, host="0.0.0.0", port=5000, threads=4)

if __name__ == "__main__":
    asyncio.run(main())
