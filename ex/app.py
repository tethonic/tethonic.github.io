#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CoinEx Professional Trading Dashboard
Advanced cryptocurrency trading analysis and monitoring system
Version: 2.0
Author: Milad Trading Bot
"""

# =================== Imports ===================
import ccxt
import asyncio
import pandas as pd
import sqlite3
import logging
import threading
import json
import io
import os
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from contextlib import asynccontextmanager
import warnings

# Flask and Web Components
from flask import Flask, render_template_string, request, send_file, jsonify, redirect, url_for
from waitress import serve

# Telegram
from telegram import Bot
from telegram.error import TelegramError

# Technical Analysis
import ta
import plotly.graph_objs as go
import plotly.utils

# Configuration Management
import configparser

# Suppress warnings
warnings.filterwarnings('ignore')
pd.options.mode.chained_assignment = None

# Shared Configuration
from shared_config import config
# =================== Logging Setup ===================
def setup_logging():
    """Setup comprehensive logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('trading_bot.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# =================== Database Manager ===================
class DatabaseManager:
    """Handles all database operations"""
    
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.conn = None
        self.setup_database()
    
    def setup_database(self):
        """Initialize database and create tables"""
        try:
            self.conn = sqlite3.connect(self.db_name, check_same_thread=False)
            cursor = self.conn.cursor()
            
            # Create signals table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS signals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    rsi_15m REAL,
                    rsi_1h REAL,
                    rsi_4h REAL,
                    rsi_1d REAL,
                    macd REAL,
                    macd_signal REAL,
                    bb_upper REAL,
                    bb_lower REAL,
                    close_price REAL,
                    volume REAL,
                    timestamp TEXT,
                    signal TEXT,
                    confidence REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create trades table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    entry_price REAL,
                    current_price REAL,
                    amount REAL,
                    stop_loss REAL,
                    take_profit REAL,
                    trailing_stop REAL,
                    status TEXT DEFAULT 'open',
                    pnl REAL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create portfolio table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS portfolio (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    total_balance REAL,
                    available_balance REAL,
                    total_pnl REAL,
                    win_rate REAL,
                    total_trades INTEGER,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.conn.commit()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database setup error: {e}")
    
    def insert_signal(self, signal_data: Dict):
        """Insert signal data into database"""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO signals 
                (symbol, rsi_15m, rsi_1h, rsi_4h, rsi_1d, macd, macd_signal, 
                 bb_upper, bb_lower, close_price, volume, timestamp, signal, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                signal_data['symbol'], signal_data['rsi_15m'], signal_data['rsi_1h'],
                signal_data['rsi_4h'], signal_data['rsi_1d'], signal_data['macd'],
                signal_data['macd_signal'], signal_data['bb_upper'], signal_data['bb_lower'],
                signal_data['close_price'], signal_data['volume'], signal_data['timestamp'],
                signal_data['signal'], signal_data['confidence']
            ))
            self.conn.commit()
        except Exception as e:
            logger.error(f"Error inserting signal: {e}")
    
    def insert_trade(self, trade_data: Dict):
        """Insert trade data into database"""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO trades 
                (symbol, side, entry_price, current_price, amount, stop_loss, take_profit, trailing_stop, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                trade_data['symbol'], trade_data['side'], trade_data['entry_price'],
                trade_data['current_price'], trade_data['amount'], trade_data['stop_loss'],
                trade_data['take_profit'], trade_data['trailing_stop'], trade_data['status']
            ))
            self.conn.commit()
            return cursor.lastrowid
        except Exception as e:
            logger.error(f"Error inserting trade: {e}")
            return None
    
    def get_signals(self, limit: int = 100):
        """Get recent signals from database"""
        try:
            df = pd.read_sql_query("""
                SELECT * FROM signals 
                ORDER BY created_at DESC 
                LIMIT ?
            """, self.conn, params=[limit])
            return df
        except Exception as e:
            logger.error(f"Error getting signals: {e}")
            return pd.DataFrame()
    
    def get_trades(self, status: str = None):
        """Get trades from database"""
        try:
            query = "SELECT * FROM trades ORDER BY created_at DESC"
            params = []
            if status:
                query = "SELECT * FROM trades WHERE status = ? ORDER BY created_at DESC"
                params = [status]
            
            df = pd.read_sql_query(query, self.conn, params=params)
            return df
        except Exception as e:
            logger.error(f"Error getting trades: {e}")
            return pd.DataFrame()

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
            return round(rsi.iloc[-1], 2)
        except:
            return 50.0
    
    @staticmethod
    def calculate_macd(prices: pd.Series) -> Tuple[float, float]:
        """Calculate MACD indicator"""
        try:
            macd = ta.trend.MACD(prices)
            macd_line = macd.macd().iloc[-1]
            signal_line = macd.macd_signal().iloc[-1]
            return round(macd_line, 4), round(signal_line, 4)
        except:
            return 0.0, 0.0
    
    @staticmethod
    def calculate_bollinger_bands(prices: pd.Series, period: int = 20) -> Tuple[float, float, float]:
        """Calculate Bollinger Bands"""
        try:
            bb = ta.volatility.BollingerBands(prices, window=period)
            upper = bb.bollinger_hband().iloc[-1]
            middle = bb.bollinger_mavg().iloc[-1]
            lower = bb.bollinger_lband().iloc[-1]
            return round(upper, 4), round(middle, 4), round(lower, 4)
        except:
            return 0.0, 0.0, 0.0
    
    @staticmethod
    def calculate_ichimoku(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate Ichimoku Cloud indicators"""
        try:
            # Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2
            df['tenkan_sen'] = (df['high'].rolling(9).max() + df['low'].rolling(9).min()) / 2
            
            # Kijun-sen (Base Line): (26-period high + 26-period low)/2
            df['kijun_sen'] = (df['high'].rolling(26).max() + df['low'].rolling(26).min()) / 2
            
            # Senkou Span A (Leading Span A): (Conversion Line + Base Line)/2
            df['senkou_a'] = ((df['tenkan_sen'] + df['kijun_sen']) / 2).shift(26)
            
            # Senkou Span B (Leading Span B): (52-period high + 52-period low)/2
            df['senkou_b'] = ((df['high'].rolling(52).max() + df['low'].rolling(52).min()) / 2).shift(26)
            
            # Chikou Span (Lagging Span): Close plotted 26 periods back
            df['chikou'] = df['close'].shift(-26)
            
            return df
        except Exception as e:
            logger.error(f"Ichimoku calculation error: {e}")
            return df
    
    @staticmethod
    def calculate_volume_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """Calculate volume-based indicators"""
        try:
            # Volume Moving Average
            df['volume_ma'] = df['volume'].rolling(20).mean()
            
            # On-Balance Volume
            df['obv'] = ta.volume.OnBalanceVolumeIndicator(df['close'], df['volume']).on_balance_volume()
            
            return df
        except Exception as e:
            logger.error(f"Volume indicators error: {e}")
            return df

# =================== Signal Generator ===================
class SignalGenerator:
    """Advanced signal generation with multiple strategies"""
    
    def __init__(self):
        self.ta = TechnicalAnalysis()
    
    def generate_signal(self, df: pd.DataFrame) -> Dict:
        """Generate trading signal based on multiple indicators"""
        try:
            if len(df) < 52:  # Need enough data for Ichimoku
                return {
                    'signal': 'WAITING',
                    'confidence': 0.0,
                    'reason': 'Insufficient data'
                }
            
            # Calculate indicators
            close_price = df['close'].iloc[-1]
            
            # RSI analysis
            rsi = self.ta.calculate_rsi(df['close'])
            
            # MACD analysis
            macd, macd_signal = self.ta.calculate_macd(df['close'])
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self.ta.calculate_bollinger_bands(df['close'])
            
            # Ichimoku Cloud
            df = self.ta.calculate_ichimoku(df)
            tenkan = df['tenkan_sen'].iloc[-1]
            kijun = df['kijun_sen'].iloc[-1]
            senkou_a = df['senkou_a'].iloc[-26] if len(df) > 26 else df['senkou_a'].iloc[-1]
            senkou_b = df['senkou_b'].iloc[-26] if len(df) > 26 else df['senkou_b'].iloc[-1]
            
            # Volume analysis
            current_volume = df['volume'].iloc[-1]
            avg_volume = df['volume'].rolling(20).mean().iloc[-1]
            
            # Signal scoring
            buy_score = 0
            sell_score = 0
            
            # RSI conditions
            if rsi < 30:
                buy_score += 2
            elif rsi > 70:
                sell_score += 2
            elif rsi < 40:
                buy_score += 1
            elif rsi > 60:
                sell_score += 1
            
            # MACD conditions
            if macd > macd_signal:
                buy_score += 1
            else:
                sell_score += 1
            
            # Bollinger Bands conditions
            if close_price < bb_lower:
                buy_score += 1
            elif close_price > bb_upper:
                sell_score += 1
            
            # Ichimoku conditions
            if not pd.isna(senkou_a) and not pd.isna(senkou_b):
                cloud_top = max(senkou_a, senkou_b)
                cloud_bottom = min(senkou_a, senkou_b)
                
                if close_price > cloud_top and tenkan > kijun:
                    buy_score += 2
                elif close_price < cloud_bottom and tenkan < kijun:
                    sell_score += 2
            
            # Volume confirmation
            if current_volume > avg_volume * 1.2:
                if buy_score > sell_score:
                    buy_score += 1
                elif sell_score > buy_score:
                    sell_score += 1
            
            # Determine signal
            if buy_score >= 4 and buy_score > sell_score:
                signal = "💹 Strong BUY"
                confidence = min(buy_score * 20, 100)
            elif sell_score >= 4 and sell_score > buy_score:
                signal = "📉 Strong SELL"
                confidence = min(sell_score * 20, 100)
            elif buy_score > sell_score:
                signal = "📈 BUY"
                confidence = min(buy_score * 15, 80)
            elif sell_score > buy_score:
                signal = "📊 SELL"
                confidence = min(sell_score * 15, 80)
            else:
                signal = "⏳ WAITING"
                confidence = 0
            
            return {
                'signal': signal,
                'confidence': confidence,
                'rsi': rsi,
                'macd': macd,
                'macd_signal': macd_signal,
                'bb_upper': bb_upper,
                'bb_lower': bb_lower,
                'close_price': close_price,
                'volume': current_volume,
                'buy_score': buy_score,
                'sell_score': sell_score
            }
            
        except Exception as e:
            logger.error(f"Signal generation error: {e}")
            return {
                'signal': '❌ ERROR',
                'confidence': 0.0,
                'reason': str(e)
            }

# =================== Trading Manager ===================
class TradingManager:
    """Manages trading operations and risk management"""
    
    def __init__(self, db_manager: DatabaseManager, telegram_bot: Bot):
        self.db = db_manager
        self.bot = telegram_bot
    
    def calculate_position_size(self, price: float, risk_percent: float = 1.0) -> float:
        """Calculate position size based on risk management"""
        try:
            # Simplified position sizing - in real implementation, use account balance
            account_balance = 1000  # This should come from exchange API
            risk_amount = account_balance * (risk_percent / 100)
            position_size = risk_amount / (price * config.STOP_LOSS_PCT)
            return round(position_size, 6)
        except:
            return 1.0
    
    def create_trade(self, symbol: str, side: str, price: float, signal_data: Dict):
        """Create a new trade with proper risk management"""
        try:
            amount = self.calculate_position_size(price)
            
            # Calculate stop loss and take profit
            if side == "buy":
                stop_loss = price * (1 - config.STOP_LOSS_PCT)
                take_profit = price * (1 + config.TAKE_PROFIT_PCT)
                trailing_stop = price * (1 - config.TRAILING_STOP_PCT)
            else:
                stop_loss = price * (1 + config.STOP_LOSS_PCT)
                take_profit = price * (1 - config.TAKE_PROFIT_PCT)
                trailing_stop = price * (1 + config.TRAILING_STOP_PCT)
            
            trade_data = {
                'symbol': symbol,
                'side': side,
                'entry_price': price,
                'current_price': price,
                'amount': amount,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'trailing_stop': trailing_stop,
                'status': 'open'
            }
            
            trade_id = self.db.insert_trade(trade_data)
            
            # Send Telegram notification
            self.send_trade_notification(trade_data, signal_data)
            
            logger.info(f"Trade created: {symbol} {side} @ {price}")
            return trade_id
            
        except Exception as e:
            logger.error(f"Error creating trade: {e}")
            return None
    
    def send_trade_notification(self, trade_data: Dict, signal_data: Dict):
        """Send trade notification via Telegram"""
        try:
            message = f"""
🚀 **NEW TRADE**
💱 Symbol: {trade_data['symbol']}
📊 Type: {trade_data['side'].upper()}
💰 Entry Price: {trade_data['entry_price']:.4f}
🛑 Stop Loss: {trade_data['stop_loss']:.4f}
🎯 Take Profit: {trade_data['take_profit']:.4f}
📈 Signal: {signal_data.get('signal', 'N/A')}
🎯 Confidence: {signal_data.get('confidence', 0):.1f}%
⏰ Time: {datetime.now().strftime('%H:%M:%S')}
            """
            
            self.bot.send_message(chat_id=config.CHAT_ID, text=message, parse_mode='Markdown')
        except TelegramError as e:
            logger.error(f"Telegram notification error: {e}")

# =================== Exchange Manager ===================
class ExchangeManager:
    """Manages exchange connections and data fetching"""
    
    def __init__(self):
        try:
            self.exchange = ccxt.coinex({
                'apiKey': config.API_KEY,
                'secret': config.SECRET,
                'enableRateLimit': True,
                'sandbox': False
            })
            logger.info("Exchange connected successfully")
        except Exception as e:
            logger.error(f"Exchange connection error: {e}")
            self.exchange = None
    
    async def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 100) -> pd.DataFrame:
        """Fetch OHLCV data from exchange with rate limiting"""
        try:
            if not self.exchange:
                return pd.DataFrame()
            
            # Add delay to respect rate limits
            await asyncio.sleep(0.1)  # 100ms delay between requests
            
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            # Check if it's a rate limit error
            if 'rate limit' in str(e).lower() or 'too many requests' in str(e).lower():
                logger.warning(f"Rate limit hit for {symbol}, waiting longer...")
                await asyncio.sleep(1.0)  # Wait 1 second on rate limit
                try:
                    ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
                    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                    return df
                except Exception as retry_error:
                    logger.error(f"Retry failed for {symbol}: {retry_error}")
                    return pd.DataFrame()
            else:
                logger.error(f"Error fetching OHLCV for {symbol}: {e}")
                return pd.DataFrame()
    
    def get_symbols(self) -> List[str]:
        """Get list of available symbols"""
        try:
            if not self.exchange:
                return []
            
            markets = self.exchange.load_markets()
            usdt_symbols = [symbol for symbol in markets.keys() if symbol.endswith('/USDT')]
            # Limit to top 20 symbols to reduce API calls
            return sorted(usdt_symbols)[:20]
        except Exception as e:
            logger.error(f"Error getting symbols: {e}")
            return [f"COIN{i}/USDT" for i in range(1, 11)]  # Reduced fallback

# =================== Monitoring System ===================
class MonitoringSystem:
    """Main monitoring and analysis system"""
    
    def __init__(self):
        self.db = DatabaseManager(config.DATABASE_NAME)
        self.exchange_manager = ExchangeManager()
        self.signal_generator = SignalGenerator()
        self.telegram_bot = Bot(token=config.TELEGRAM_TOKEN)
        self.trading_manager = TradingManager(self.db, self.telegram_bot)
        self.active_symbols = set()
    
    async def analyze_symbol(self, symbol: str):
        """Analyze a single symbol and generate signals"""
        try:
            # Fetch data for multiple timeframes
            timeframes = ['15m', '1h', '4h', '1d']
            rsi_values = []
            close_prices = []
            
            for tf in timeframes:
                df = await self.exchange_manager.fetch_ohlcv(symbol, tf, limit=100)
                if df.empty:
                    continue
                
                rsi = TechnicalAnalysis.calculate_rsi(df['close'])
                rsi_values.append(rsi)
                close_prices.append(df['close'].iloc[-1])
            
            if len(rsi_values) < 4:
                return
            
            # Use 15m timeframe for main analysis
            main_df = await self.exchange_manager.fetch_ohlcv(symbol, '15m', limit=100)
            if main_df.empty:
                return
            
            # Generate signal
            signal_result = self.signal_generator.generate_signal(main_df)
            
            # Prepare signal data for database
            signal_data = {
                'symbol': symbol,
                'rsi_15m': rsi_values[0],
                'rsi_1h': rsi_values[1],
                'rsi_4h': rsi_values[2],
                'rsi_1d': rsi_values[3],
                'macd': signal_result.get('macd', 0),
                'macd_signal': signal_result.get('macd_signal', 0),
                'bb_upper': signal_result.get('bb_upper', 0),
                'bb_lower': signal_result.get('bb_lower', 0),
                'close_price': signal_result.get('close_price', 0),
                'volume': signal_result.get('volume', 0),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'signal': signal_result['signal'],
                'confidence': signal_result['confidence']
            }
            
            # Store signal in database
            self.db.insert_signal(signal_data)
            
            # Execute trades based on strong signals
            if signal_result['confidence'] >= 80:
                if "Strong BUY" in signal_result['signal']:
                    self.trading_manager.create_trade(symbol, "buy", signal_result['close_price'], signal_data)
                elif "Strong SELL" in signal_result['signal']:
                    self.trading_manager.create_trade(symbol, "sell", signal_result['close_price'], signal_data)
            
            self.active_symbols.add(symbol)
            
        except Exception as e:
            logger.error(f"Error analyzing {symbol}: {e}")
    
    async def monitor_symbol(self, symbol: str):
        """Continuously monitor a symbol"""
        while True:
            try:
                await self.analyze_symbol(symbol)
                await asyncio.sleep(config.MONITOR_INTERVAL)
            except Exception as e:
                logger.error(f"Monitoring error for {symbol}: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def start_monitoring(self, symbols: List[str]):
        """Start monitoring multiple symbols with batch processing to avoid rate limits"""
        batch_size = 5  # Process 5 symbols at a time
        batch_delay = 2.0  # Wait 2 seconds between batches
        
        logger.info(f"Starting batch monitoring for {len(symbols)} symbols (batch size: {batch_size})")
        
        # Split symbols into batches
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}: {batch}")
            
            # Create semaphore for this batch
            semaphore = asyncio.Semaphore(batch_size)
            
            async def monitor_with_semaphore(symbol):
                async with semaphore:
                    await self.monitor_symbol(symbol)
            
            # Process batch
            tasks = [monitor_with_semaphore(symbol) for symbol in batch]
            try:
                await asyncio.gather(*tasks, return_exceptions=True)
            except Exception as e:
                logger.error(f"Batch processing error: {e}")
            
            # Wait between batches to respect rate limits
            if i + batch_size < len(symbols):  # Don't wait after last batch
                logger.info(f"Waiting {batch_delay}s before next batch...")
                await asyncio.sleep(batch_delay)

# =================== Flask Web Dashboard ===================
class WebDashboard:
    """Advanced web dashboard with real-time data"""
    
    def __init__(self, db_manager: DatabaseManager, exchange_manager: ExchangeManager):
        self.app = Flask(__name__)
        self.db = db_manager
        self.exchange = exchange_manager
        self.setup_routes()
    
    def setup_routes(self):
        """Setup all Flask routes"""
        
        @self.app.route('/')
        def dashboard():
            """Main dashboard page"""
            try:
                signals_df = self.db.get_signals(100)
                trades_df = self.db.get_trades()
                
                # Get chart data if symbol requested
                symbol = request.args.get('symbol', '')
                timeframe = request.args.get('tf', '15m')
                chart_data = None
                
                if symbol:
                    chart_data = self.generate_chart(symbol, timeframe)
                
                return render_template_string(self.get_html_template(), 
                                            signals=signals_df, 
                                            trades=trades_df,
                                            request=request, 
                                            chart_data=chart_data)
            except Exception as e:
                logger.error(f"Dashboard error: {e}")
                return f"Dashboard loading error: {str(e)}"
        
        @self.app.route('/api/signals')
        def api_signals():
            """API endpoint for signals data"""
            try:
                signals_df = self.db.get_signals(50)
                return jsonify(signals_df.to_dict('records'))
            except Exception as e:
                return jsonify({'error': str(e)})
        
        @self.app.route('/api/trades')
        def api_trades():
            """API endpoint for trades data"""
            try:
                trades_df = self.db.get_trades()
                return jsonify(trades_df.to_dict('records'))
            except Exception as e:
                return jsonify({'error': str(e)})
        
        @self.app.route('/download_csv')
        def download_csv():
            """Download signals as CSV"""
            try:
                signals_df = self.db.get_signals(1000)
                output = io.BytesIO()
                signals_df.to_csv(output, index=False, encoding='utf-8')
                output.seek(0)
                
                return send_file(
                    output,
                    mimetype='text/csv',
                    as_attachment=True,
                    download_name=f'signals_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
                )
            except Exception as e:
                logger.error(f"CSV download error: {e}")
                return f"Download error: {str(e)}"
    
    def generate_chart(self, symbol: str, timeframe: str) -> str:
        """Generate Plotly chart for symbol"""
        try:
            # This is a synchronous call - in production, consider making it async
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            df = loop.run_until_complete(self.exchange.fetch_ohlcv(symbol, timeframe, 100))
            loop.close()
            
            if df.empty:
                return None
            
            # Add technical indicators
            df = TechnicalAnalysis.calculate_ichimoku(df)
            
            # Create candlestick chart
            fig = go.Figure()
            
            # Candlestick
            fig.add_trace(go.Candlestick(
                x=df['timestamp'],
                open=df['open'],
                high=df['high'],
                low=df['low'],
                close=df['close'],
                name='Price'
            ))
            
            # Add Ichimoku Cloud
            if 'senkou_a' in df.columns and 'senkou_b' in df.columns:
                fig.add_trace(go.Scatter(
                    x=df['timestamp'],
                    y=df['senkou_a'],
                    mode='lines',
                    name='Senkou A',
                    line=dict(color='green', width=1)
                ))
                
                fig.add_trace(go.Scatter(
                    x=df['timestamp'],
                    y=df['senkou_b'],
                    mode='lines',
                    name='Senkou B',
                    line=dict(color='red', width=1),
                    fill='tonexty',
                    fillcolor='rgba(0,100,80,0.2)'
                ))
            
            # Update layout
            fig.update_layout(
                title=f'{symbol} - {timeframe}',
                xaxis_title='Time',
                yaxis_title='Price',
                height=500,
                xaxis_rangeslider_visible=False
            )
            
            return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
            
        except Exception as e:
            logger.error(f"Chart generation error: {e}")
            return None
    
    def get_html_template(self) -> str:
        """Return HTML template for dashboard"""
        return """
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoinEx Professional Dashboard</title>
    <meta http-equiv="refresh" content="30">
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        * {
            direction: ltr !important;
            text-align: left !important;
        }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f8f9fa; 
            direction: ltr !important;
            text-align: left !important;
        }
        .container, .container-fluid {
            direction: ltr !important;
        }
        .row {
            direction: ltr !important;
            flex-direction: row !important;
        }
        .col-md-4, .col-12, .col-md-6, .col-lg-3, .col-lg-6, .col-lg-9, [class*="col-"] {
            direction: ltr !important;
            text-align: left !important;
        }
        .dashboard-header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px 0; 
        }
        .card { 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            border: none; 
        }
        .signal-strong-buy { background-color: #d4edda; }
        .signal-strong-sell { background-color: #f8d7da; }
        .signal-buy { background-color: #e2f4ff; }
        .signal-sell { background-color: #fff3cd; }
        .table-responsive { 
            max-height: 400px; 
            overflow-y: auto; 
        }
        .form-label { 
            text-align: left !important; 
            font-weight: 500;
        }
        .form-control, .form-select {
            text-align: left !important;
            direction: ltr !important;
        }
        .input-group {
            direction: ltr !important;
        }
        .input-group .form-control {
            direction: ltr !important;
            text-align: left !important;
        }
        .table th {
            text-align: left !important;
        }
        .table td {
            text-align: left !important;
        }
        .btn {
            text-align: center !important;
        }
        /* Force Bootstrap grid to work LTR */
        .g-3, .row > * {
            direction: ltr !important;
        }
        /* Override any RTL styles */
        [dir="rtl"] * {
            direction: ltr !important;
        }
    </style>
</head>
<body>
    <div class="dashboard-header">
        <div class="container">
            <h1 class="text-center">🚀 CoinEx Professional Dashboard</h1>
            <p class="text-center mb-0">Advanced Cryptocurrency Trading & Analysis System</p>
        </div>
    </div>
    
    <div class="container-fluid mt-4">
        <!-- Chart Section -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">📈 Analysis Chart</h5>
                        <form method="get" class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Symbol:</label>
                                <input type="text" class="form-control" name="symbol" 
                                       value="{{ request.args.get('symbol', '') }}" placeholder="e.g., BTC/USDT">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Timeframe:</label>
                                <select class="form-select" name="tf">
                                    <option value="15m" {% if request.args.get('tf') == '15m' %}selected{% endif %}>15 minutes</option>
                                    <option value="1h" {% if request.args.get('tf') == '1h' %}selected{% endif %}>1 hour</option>
                                    <option value="4h" {% if request.args.get('tf') == '4h' %}selected{% endif %}>4 hours</option>
                                    <option value="1d" {% if request.args.get('tf') == '1d' %}selected{% endif %}>1 day</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">&nbsp;</label>
                                <button type="submit" class="btn btn-primary d-block">Show Chart</button>
                            </div>
                        </form>
                        
                        {% if chart_data %}
                        <div id="chart" class="mt-3"></div>
                        <script>
                            var plotData = {{ chart_data | safe }};
                            Plotly.newPlot('chart', plotData.data, plotData.layout);
                        </script>
                        {% endif %}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Statistics Row -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title text-primary">Total Signals</h5>
                        <h2 class="text-primary">{{ signals|length }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title text-success">Buy Signals</h5>
                        <h2 class="text-success">{{ signals[signals['signal'].str.contains('BUY', na=False)]|length }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title text-danger">Sell Signals</h5>
                        <h2 class="text-danger">{{ signals[signals['signal'].str.contains('SELL', na=False)]|length }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title text-info">Total Trades</h5>
                        <h2 class="text-info">{{ trades|length }}</h2>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Signals Table -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">📊 Latest Signals</h5>
                        <div>
                            <select id="signalFilter" class="form-select form-select-sm" onchange="filterTable()">
                                <option value="all">All Signals</option>
                                <option value="💹 Strong BUY">Strong Buy</option>
                                <option value="📉 Strong SELL">Strong Sell</option>
                                <option value="📈 BUY">Buy</option>
                                <option value="📊 SELL">Sell</option>
                                <option value="Waiting">Waiting</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="signalsTable">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Symbol</th>
                                        <th>RSI 15m</th>
                                        <th>RSI 1h</th>
                                        <th>RSI 4h</th>
                                        <th>RSI 1d</th>
                                        <th>Price</th>
                                        <th>Signal</th>
                                        <th>Confidence</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for index, row in signals.iterrows() %}
                                    <tr class="
                                        {% if '💹 Strong BUY' in row.signal %}signal-strong-buy
                                        {% elif '📉 Strong SELL' in row.signal %}signal-strong-sell
                                        {% elif 'BUY' in row.signal %}signal-buy
                                        {% elif 'SELL' in row.signal %}signal-sell
                                        {% endif %}
                                    ">
                                        <td><strong>{{ row.symbol }}</strong></td>
                                        <td>{{ "%.1f"|format(row.rsi_15m if row.rsi_15m else 0) }}</td>
                                        <td>{{ "%.1f"|format(row.rsi_1h if row.rsi_1h else 0) }}</td>
                                        <td>{{ "%.1f"|format(row.rsi_4h if row.rsi_4h else 0) }}</td>
                                        <td>{{ "%.1f"|format(row.rsi_1d if row.rsi_1d else 0) }}</td>
                                        <td>{{ "%.4f"|format(row.close_price if row.close_price else 0) }}</td>
                                        <td><span class="badge bg-primary">{{ row.signal }}</span></td>
                                        <td>{{ "%.0f"|format(row.confidence if row.confidence else 0) }}%</td>
                                        <td>{{ row.timestamp }}</td>
                                    </tr>
                                    {% endfor %}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="mt-3">
                            <a href="/download_csv" class="btn btn-success">📁 Download CSV</a>
                            <button onclick="location.reload()" class="btn btn-info">🔄 Refresh</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function filterTable() {
            var filter = document.getElementById("signalFilter").value;
            var table = document.getElementById("signalsTable");
            var rows = table.getElementsByTagName("tr");
            
            for (var i = 1; i < rows.length; i++) {
                var signalCell = rows[i].getElementsByTagName("td")[6];
                if (signalCell) {
                    var signalText = signalCell.textContent || signalCell.innerText;
                    if (filter === "all" || signalText.includes(filter)) {
                        rows[i].style.display = "";
                    } else {
                        rows[i].style.display = "none";
                    }
                }
            }
        }
        
        // Auto-refresh notification
        setTimeout(function() {
            var notification = document.createElement('div');
            notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '9999';
            notification.innerHTML = '🔄 Page will refresh in 30 seconds...';
            document.body.appendChild(notification);
            
            setTimeout(function() {
                notification.remove();
            }, 5000);
        }, 25000);
    </script>
</body>
</html>
        """
    
    def run(self, host: str = "0.0.0.0", port: int = 5000):
        """Run the Flask application using Waitress WSGI server"""
        try:
            logger.info(f"Starting production server on {host}:{port}")
            serve(self.app, host=host, port=port, threads=4)
        except ImportError:
            logger.warning("Waitress not installed, falling back to development server")
            self.app.run(host=host, port=port, debug=False, threaded=True)

# =================== Main Application ===================
def run_flask_app(db_manager, exchange_manager):
    """Run Flask application in a separate thread"""
    dashboard = WebDashboard(db_manager, exchange_manager)
    dashboard.run(config.FLASK_HOST, config.FLASK_PORT)

async def main():
    """Main application entry point"""
    try:
        logger.info("Starting CoinEx Professional Dashboard...")
        
        # Initialize components
        monitoring_system = MonitoringSystem()
        
        # Get symbols to monitor
        symbols = monitoring_system.exchange_manager.get_symbols()
        logger.info(f"Monitoring {len(symbols)} symbols")
        
        # Start Flask dashboard in background thread
        flask_thread = threading.Thread(
            target=run_flask_app,
            args=(monitoring_system.db, monitoring_system.exchange_manager),
            daemon=True
        )
        flask_thread.start()
        
        logger.info(f"Dashboard available at http://localhost:{config.FLASK_PORT}")
        
        # Send startup notification
        try:
            monitoring_system.telegram_bot.send_message(
                chat_id=config.CHAT_ID,
                text="CoinEx Professional Dashboard is now active!\n"
                     f"URL: http://localhost:{config.FLASK_PORT}\n"
                     f"Monitoring {len(symbols)} symbols"
            )
        except:
            pass
        
        # Start monitoring
        await monitoring_system.start_monitoring(symbols)
        
    except KeyboardInterrupt:
        logger.info("⛔ Application stopped by user")
    except Exception as e:
        logger.error(f"💥 Application error: {e}")
        logger.error(traceback.format_exc())

# =================== Entry Point ===================
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⛔ Application stopped by user")
    except Exception as e:
        print(f"💥 Startup error: {e}")
