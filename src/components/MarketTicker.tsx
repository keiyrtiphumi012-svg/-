
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { INITIAL_ASSETS, CryptoAsset } from '../constants';

interface MarketTickerProps {
  assets: CryptoAsset[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ assets }) => {
  const [tickerTime, setTickerTime] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTickerTime(Date.now());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = assets.slice(0, 20).map((asset, index) => {
    // Generate a pseudo-dynamic yet completely deterministic price fluctuation
    const seed = index + 1;
    // Sinusoidal wave between -4.5% and +4.5%
    const changeVal = (Math.sin((tickerTime / 15000) + seed) * 4.5);
    const change = changeVal.toFixed(2);
    
    // Add slightly fluctuating price based on the change multiplier
    const rawPrice = asset.valuation;
    const priceFluc = rawPrice + (rawPrice * (changeVal / 100));
    const price = priceFluc.toFixed(2);

    return {
      symbol: asset.id.substring(0, 4) + "_" + seed,
      price,
      change,
    };
  });

  return (
    <div className="bg-emerald-950/40 border-b border-emerald-500/20 py-1.5 overflow-hidden whitespace-nowrap flex items-center">
      <div className="flex bg-emerald-500/10 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 mr-4 border-r border-emerald-500/20">
        NETWORK_EXCHANGE // LIVE
      </div>
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 items-center"
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400/60 uppercase">{item.symbol}</span>
            <span className="text-[10px] font-mono font-bold text-emerald-100">{item.price}</span>
            <span className={`text-[9px] flex items-center gap-0.5 font-bold ${parseFloat(item.change) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {parseFloat(item.change) >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {item.change}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
