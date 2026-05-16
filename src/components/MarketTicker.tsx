
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { INITIAL_ASSETS, CryptoAsset } from '../constants';

interface MarketTickerProps {
  assets: CryptoAsset[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ assets }) => {
  const tickerItems = assets.slice(0, 20).map(asset => ({
    symbol: asset.id.substring(0, 4),
    price: asset.valuation.toFixed(2),
    change: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
  }));

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
