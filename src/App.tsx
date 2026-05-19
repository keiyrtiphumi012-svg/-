/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal, 
  Database, 
  Cpu, 
  Activity, 
  Search, 
  Lock, 
  Clock, 
  Hash, 
  User, 
  ExternalLink,
  Download,
  RefreshCw,
  Archive,
  AlertCircle,
  Info,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Landmark,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { INITIAL_ASSETS, CryptoAsset } from './constants';
import { AssetLore } from './components/AssetLore';
import { MarketTicker } from './components/MarketTicker';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [currentView, setCurrentView] = useState<'LOG' | 'MANAGER' | 'PULSE' | 'SECURITY' | 'MARKET' | 'TREASURY' | 'BANK'>('LOG');
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMonetized, setIsMonetized] = useState(true);
  const [reinvestmentRate, setReinvestmentRate] = useState(25); // 25% reinvestment by default
  const [commissionRate, setCommissionRate] = useState(50); // 50% commission as requested
  const [isDomainRegistered, setIsDomainRegistered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [treasuryShares, setTreasuryShares] = useState(0);
  const [isExitTriggered, setIsExitTriggered] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [liveYield, setLiveYield] = useState(0);
  const [walletBalance, setWalletBalance] = useState(5.00);
  const [bankBalance, setBankBalance] = useState(0);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [showBankTransferSuccess, setShowBankTransferSuccess] = useState(false);
  const [isTransferringToBank, setIsTransferringToBank] = useState(false);
  const [selectedBank, setSelectedBank] = useState('SCB');
  const [shouldShake, setShouldShake] = useState(false);
  
  const stakeholders = useMemo(() => [
    { id: 'mof', name: 'Ministry of Finance (TH)', shares: 42.0, role: 'REGULATORY', status: 'VERIFIED' },
    { id: 'ais', name: 'AIS Network Infrastructure', shares: 28.5, role: 'PROVIDER', status: 'ACTIVE' },
    { id: 'user', name: 'Executive Director (You)', shares: 4.0, role: 'DIRECTOR', status: 'VERIFIED' },
    { id: 'founders', name: 'Matrix Core Founders', shares: 15.0, role: 'TECHNICAL', status: 'LOCKED' },
    { id: 'public', name: 'Public Nodal Partners', shares: isExitTriggered ? 0 : 10.5, role: 'THIRD_PARTY', status: isExitTriggered ? 'EXITED' : 'TRADING' }
  ], [isExitTriggered]);

  const totalBuybackEquity = useMemo(() => treasuryShares + (isExitTriggered ? 10.5 : 0), [treasuryShares, isExitTriggered]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Simulate loading sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredAssets = useMemo(() => {
    setCurrentPage(1); // Reset to first page on search
    return assets.filter(asset => 
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, assets]);

  const totalValuation = useMemo(() => assets.reduce((sum, a) => sum + a.valuation, 0), [assets]);
  
  const trendData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let baseVal = totalValuation * 0.8;
    return months.map((month) => {
      baseVal += (Math.random() - 0.35) * (totalValuation * 0.06);
      return {
        name: month,
        valuation: Math.floor(baseVal),
        revenue: Math.floor(baseVal * 0.00042)
      };
    });
  }, [totalValuation]);

  const lifetimeRevenue = useMemo(() => trendData.reduce((sum, d) => sum + d.revenue, 0), [trendData]);
  const MTX_TO_THB = 175.50; // Current Matrix Exchange Rate in THB
  const MIN_WITHDRAWAL_THB = 1.0; // Minimum withdrawal limit in Thai Baht
  const adRevenue = isMonetized ? totalValuation * 0.00042 : 0;
  
  // User Earnings based on Lifetime Revenue
  const userLifetimeCommission = lifetimeRevenue * (commissionRate / 100);
  const userLifetimeEquityYield = lifetimeRevenue * 0.04;
  const initialLifetimeEarnings = userLifetimeCommission + userLifetimeEquityYield;
  
  const totalUserEarnings = initialLifetimeEarnings + liveYield; // Lifetime total + live
  
  // Monthly projected/current
  const userCommission = adRevenue * (commissionRate / 100);
  const userEquityYield = adRevenue * 0.04;
  const monthlyUserEarnings = userCommission + userEquityYield;

  const availableBalance = totalUserEarnings - withdrawnAmount;
  const domainCost = 50.00;
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Live yield accumulation
  useEffect(() => {
    if (isMonetized) {
      const interval = setInterval(() => {
        // Accumulate a small amount every 100ms based on the ad revenue
        // (adRevenue is per cycle, let's assume cycle is ~30 days, so 30*24*3600*10 ticks)
        const tickValue = (adRevenue / (30 * 24 * 3600 * 10)); 
        setLiveYield(prev => prev + Math.max(0.00001, tickValue));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isMonetized, adRevenue]);

  const assetDistributionData = useMemo(() => {
    const types = ['CORE', 'NODAL', 'REDUNDANT', 'OVERFLOW'];
    return types.map(type => ({
      name: type,
      count: assets.filter(a => a.type === type).length,
      valuation: assets.filter(a => a.type === type).reduce((sum, a) => sum + a.valuation, 0)
    }));
  }, [assets]);

  const handleRegisterDomain = () => {
    if (adRevenue >= domainCost) {
      setIsDomainRegistered(true);
    }
  };

  const handleThirdPartyExit = () => {
    if (!isExitTriggered) {
      setIsExitTriggered(true);
      // Simulate treasury absorbing the shares
      setTreasuryShares(prev => prev + 10.5);
    }
  };

  const handleWithdraw = () => {
    if (availableBalance > 0.01) {
      setIsExporting(true);
      const amountToWithdraw = availableBalance;
      setTimeout(() => {
        setWithdrawnAmount(prev => prev + amountToWithdraw);
        setWalletBalance(prev => prev + amountToWithdraw);
        setIsExporting(false);
        setShowWithdrawSuccess(true);
        setTimeout(() => setShowWithdrawSuccess(false), 3000);
      }, 1500);
    }
  };
  
  const handleBankTransfer = () => {
    const totalToTransfer = walletBalance + availableBalance;
    const totalInTHB = totalToTransfer * MTX_TO_THB;
    
    if (totalInTHB >= MIN_WITHDRAWAL_THB && bankAccountNumber.length >= 10 && !isTransferringToBank) {
      setIsTransferringToBank(true);
      
      setTimeout(() => {
        const fromAvailable = availableBalance;
        const totalToBank = walletBalance + availableBalance;
        
        setWalletBalance(0);
        setWithdrawnAmount(prev => prev + fromAvailable);
        setBankBalance(prev => prev + (totalToBank * MTX_TO_THB));
        setIsTransferringToBank(false);
        setShowBankTransferSuccess(true);
        setTimeout(() => setShowBankTransferSuccess(false), 4000);
      }, 2500);
    } else if (!isTransferringToBank) {
      setShouldShake(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    const exportData = {
      protocol: 'MATRIX_VAULT_NODE',
      network: 'AIS_CLOUD_PRO',
      authority: 'MOF_SUPPORTED',
      timestamp: new Date().toISOString(),
      summary: {
        totalAssets: assets.length,
        totalValuationMTX: totalValuation,
        adRevenueGenerated: adRevenue
      },
      registry: assets
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matrix_registry_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleListAsset = (assetId: string) => {
    if (!isRegistered) {
      setShowRegisterModal(true);
      return;
    }
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, isListed: !a.isListed } : a));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isListed: !prev.isListed } : null);
    }
  };

  const handleRegister = () => {
    setIsRegistered(true);
    setShowRegisterModal(false);
  };
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const getStatusColor = (status: CryptoAsset['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'LOCKED': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'ARCHIVED': return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
      case 'FLUX': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
      default: return 'text-white';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center font-mono text-emerald-500 overflow-hidden">
        {/* Matrix Rain Background Effect - Simple Canvas */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-20 gap-4 text-[10px] w-full">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100 }}
                animate={{ y: 800 }}
                transition={{ duration: 2 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
                className="opacity-20"
              >
                {Array.from({ length: 20 }).map((_, j) => (
                  <div key={j}>{Math.random().toString(36).substring(7)}</div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md p-8 border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 animate-pulse" />
            <h1 className="text-xl font-bold tracking-widest uppercase">Registry Loader v8.4.2</h1>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs uppercase tracking-tighter opacity-70">
              <span>Initializing Protocols</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-emerald-950 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-500/50 h-4 uppercase">
              {progress < 30 ? "Establishing Hash Link..." : 
               progress < 60 ? "Synchronizing Peer Nodes..." : 
               progress < 90 ? "Verifying Registry Integrity..." : "Access Granted"}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-emerald-400 selection:bg-emerald-500/30 relative overflow-hidden flex flex-col">
      <div className="scanline" />
      {/* Header */}
      <header className="border-b border-emerald-500/20 bg-black/80 backdrop-blur-sm z-20 flex flex-col md:flex-row items-center justify-between px-6 py-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-emerald-500/30 rounded bg-emerald-500/5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              {isDomainRegistered ? 'matrix-vault.network' : 'Matrix Global Corporation (PCL)'}
              <div className="flex gap-1">
                <span className={`text-[10px] px-2 py-0.5 border rounded font-normal ${isDomainRegistered ? 'border-cyan-500/30 text-cyan-500/60' : 'border-emerald-500/30 text-emerald-500/60'}`}>
                  {isDomainRegistered ? 'CORPORATE_ENTITY' : 'BOARD_CERTIFIED'}
                </span>
                <span className="text-[10px] px-2 py-0.5 border border-amber-500/30 rounded text-amber-500/60 font-black italic bg-amber-500/5">
                  MOF_SUPPORTED
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 border border-blue-500/30 rounded bg-blue-500/5">
                   <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                   <span className="text-[10px] text-blue-500/60 font-black tracking-tighter">
                     AIS_CLOUD_PRO
                   </span>
                </div>
              </div>
            </h1>
            <p className="text-[10px] opacity-40 uppercase truncate">
              REG_NO: 0105569000421 | 
              Total Assets: {assets.length} | 
              Market Cap: {(totalValuation / 1000000).toFixed(2)}M MTX
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end text-[10px] opacity-40 uppercase">
            <span>Latency: 14ms</span>
            <span>Uptime: 99.999%</span>
          </div>
            <div className="flex flex-col items-end border-l border-emerald-500/20 pl-6 h-full justify-center">
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setCurrentView('BANK')}
                className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all rounded flex items-center gap-2"
               >
                 <Landmark className="w-3 h-3" />
                 Cash Out (THB)
               </button>
               <div className="flex flex-col items-end">
                 <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]">{time}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400">{(bankBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </header>
      <MarketTicker assets={assets} />

      <AnimatePresence>
        {showWithdrawSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 10, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400 flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Withdrawal Successful</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-1">Funds transferred to Secured Matrix Wallet</p>
            </div>
          </motion.div>
        )}
        {showBankTransferSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 10, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400 flex items-center gap-3"
          >
            <Landmark className="w-5 h-5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Bank Settlement Verified</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-1">Funds settled at {selectedBank} in THB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-16 md:w-64 border-r border-emerald-500/10 bg-black/40 flex flex-col">
          <div className="p-4 md:p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <span className="hidden md:block text-[10px] uppercase font-bold opacity-30 tracking-widest mb-2">Systems</span>
              {[
                { id: 'LOG' as const, icon: Database, label: 'Asset Log' },
                { id: 'MANAGER' as const, icon: Cpu, label: 'Node Manager' },
                { id: 'MARKET' as const, icon: ShoppingCart, label: 'Marketplace' },
                { id: 'TREASURY' as const, icon: ShieldCheck, label: 'Treasury' },
                { id: 'BANK' as const, icon: Landmark, label: 'Matrix Bank' },
                { id: 'PULSE' as const, icon: Activity, label: 'Network Pulse' },
                { id: 'SECURITY' as const, icon: Lock, label: 'Security Core' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-3 w-full p-2.5 rounded transition-all group ${
                    currentView === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-emerald-500/40 hover:text-emerald-400'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${currentView === item.id ? 'animate-pulse' : ''}`} />
                  <span className="hidden md:block text-[11px] font-medium uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:block pt-6 border-t border-emerald-500/10">
              <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest block mb-4">Diagnostics</span>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span>Core Load</span>
                    <span>42%</span>
                  </div>
                  <div className="h-0.5 w-full bg-emerald-950">
                    <div className="h-full bg-emerald-500/60 w-[42%]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span>Memory Synch</span>
                    <span>88%</span>
                  </div>
                  <div className="h-0.5 w-full bg-emerald-950">
                    <div className="h-full bg-emerald-500/60 w-[88%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span className="text-amber-500/60 font-black">Regulatory Sync (MOF)</span>
                    <span className="text-amber-500/60">98.4%</span>
                  </div>
                  <div className="h-0.5 w-full bg-amber-950/20">
                    <div className="h-full bg-amber-500/40 w-[98.4%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                   <div className="flex justify-between text-[9px] opacity-60">
                     <span className="text-blue-500/60 font-black">AIS Cloud (TH-BANGKOK-1)</span>
                     <span className="text-blue-500/80 font-mono">ENCRYPTED</span>
                   </div>
                   <div className="h-0.5 w-full bg-blue-950/20 flex gap-0.5">
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 animate-pulse shadow-[0_0_12px_#3b82f6]" />
                   </div>
                   <p className="text-[7px] text-blue-500/40 uppercase font-bold mt-1">Provider: AIS Business Cloud v4.2</p>
                </div>

                <div className="pt-4 border-t border-emerald-500/10">
                   <button 
                    onClick={() => setIsMonetized(!isMonetized)}
                    className={`w-full py-2 px-3 border rounded flex items-center justify-between group transition-all ${
                      isMonetized 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                      : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/40 hover:border-emerald-500/30'
                    }`}
                   >
                     <div className="flex items-center gap-2">
                        <Zap className={`w-3 h-3 ${isMonetized ? 'animate-pulse text-cyan-400' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocol Ads</span>
                     </div>
                     <span className="text-[8px] font-mono leading-none">{isMonetized ? 'ACTIVE' : 'IDLE'}</span>
                   </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6 border-t border-emerald-500/10">
             <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-md hidden md:block">
                <p className="text-[10px] uppercase text-emerald-500/60 leading-relaxed">
                  Notice: All assets are currently under immutable lock. Unauthorized decrypt attempts will trigger nodal purge.
                </p>
             </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-black/20">
          {currentView === 'LOG' ? (
            <>
              {/* Action Bar */}
              <div className="p-6 border-b border-emerald-500/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-md group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by Node ID, Protocol, or Owner..."
                    className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-md py-2.5 pl-10 pr-4 text-xs tracking-wide focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-emerald-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] uppercase font-bold opacity-40">
                  <RefreshCw className="w-3 h-3 animate-spin-slow" />
                  <span>Streaming Updates</span>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto p-6">
                <div className="border border-emerald-500/10 rounded-lg overflow-hidden bg-black/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-500/5 border-b border-emerald-500/10 overflow-hidden">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">ID</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Asset Name</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Type</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Valuation</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Owner</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/5">
                      <AnimatePresence mode="popLayout">
                        {paginatedAssets.map((asset) => (
                          <motion.tr 
                            key={asset.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAsset(asset)}
                            className={`group cursor-pointer hover:bg-emerald-500/5 transition-colors ${selectedAsset?.id === asset.id ? 'bg-emerald-500/10' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <span className="text-[11px] font-bold text-emerald-500 group-hover:drop-shadow-[0_0_5px_#10b981] transition-all tracking-tighter">{asset.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-emerald-100 uppercase">{asset.name}</span>
                                <span className="text-[9px] opacity-30 truncate max-w-[200px]">{asset.hash}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] opacity-60 font-mono tracking-tight">{asset.type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-emerald-300 tracking-tighter">
                                  {asset.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-[8px] opacity-30 mt-0.5">{asset.currency}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <User className="w-3 h-3 opacity-30" />
                                 <span className="text-[10px] opacity-80 uppercase tracking-tighter">{asset.owner}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] border font-bold ${getStatusColor(asset.status)}`}>
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 text-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {filteredAssets.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-emerald-500/40 gap-4">
                       <AlertCircle className="w-12 h-12 opacity-20" />
                       <p className="uppercase text-sm tracking-widest">No nodes found in current buffer</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between px-2">
                   <p className="text-[10px] opacity-30 uppercase">
                      Showing {Math.min(filteredAssets.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredAssets.length, currentPage * itemsPerPage)} of {filteredAssets.length} nodes
                   </p>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase opacity-40 font-bold">Page {currentPage} of {totalPages || 1}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 border rounded text-[10px] uppercase font-bold transition-all ${
                            currentPage === 1 
                            ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40 cursor-not-allowed' 
                            : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          Previous
                        </button>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages || totalPages === 0}
                          className={`px-3 py-1 border rounded text-[10px] uppercase font-bold transition-all ${
                            currentPage === totalPages || totalPages === 0
                            ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40 cursor-not-allowed' 
                            : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </>
          ) : currentView === 'MANAGER' ? (
            <div className="p-8 space-y-8 overflow-auto flex-1">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                   <Cpu className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold uppercase tracking-widest">Node Manager</h2>
                   <p className="text-[10px] opacity-40 uppercase">Distribution & Resource Allocation Dashboard</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Core Integrity', val: '98.4%', sub: 'Target: 99.0%', color: 'text-emerald-400' },
                   { label: 'AIS Edge Latency', val: '0.8ms', sub: 'TH-BK-1 Optimized', color: 'text-blue-400' },
                   { label: 'Cloud Distribution', val: 'AIS_PRO', sub: 'Zone: Central-1', color: 'text-cyan-400' },
                   { label: 'Network Uptime', val: '99.99%', sub: 'SLA Guaranteed', color: 'text-emerald-400' }
                 ].map((stat, i) => (
                   <div key={i} className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-lg hover:bg-emerald-500/10 transition-colors group">
                      <span className="text-[10px] uppercase font-bold opacity-30 tracking-[0.2em]">{stat.label}</span>
                      <p className={`text-3xl font-black mt-2 mb-1 ${stat.color} group-hover:scale-105 transition-transform origin-left`}>{stat.val}</p>
                      <span className="text-[9px] opacity-40 uppercase font-bold">{stat.sub}</span>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 border border-emerald-500/10 rounded-lg bg-black/40 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                       <Database className="w-3 h-3" /> Type Distribution
                    </h3>
                    <div className="space-y-4">
                      {['CORE', 'NODAL', 'REDUNDANT', 'OVERFLOW'].map(type => {
                        const count = INITIAL_ASSETS.filter(a => a.type === type).length;
                        const pct = (count / INITIAL_ASSETS.length) * 100;
                        return (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between text-[11px] uppercase font-bold">
                              <span className="opacity-60">{type}</span>
                              <span className="text-emerald-400">{count} Units ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className="h-full bg-emerald-500/40"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-8 border border-emerald-500/10 rounded-lg bg-black/40 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                       <Activity className="w-3 h-3" /> Status Monitoring
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['ACTIVE', 'LOCKED', 'ARCHIVED', 'FLUX'].map(status => {
                        const count = INITIAL_ASSETS.filter(a => a.status === status).length;
                        return (
                          <div key={status} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded flex flex-col items-center">
                            <p className="text-lg font-black text-emerald-100">{count}</p>
                            <span className="text-[9px] uppercase font-bold opacity-40 mt-1">{status}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded text-[10px] uppercase text-center opacity-40">
                       Auto-rebalancing protocol active. Last adjustment 4s ago.
                    </div>
                  </div>
               </div>
            </div>
          ) : currentView === 'TREASURY' ? (
            <div className="p-8 space-y-8 overflow-auto flex-1 bg-gradient-to-br from-emerald-950/10 to-transparent">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                   <ShieldCheck className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-300">Global Treasury</h2>
                   <p className="text-[10px] opacity-40 uppercase">Capital Reserve & Funding Protocol Control</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Total Cap */}
                  <div className="p-8 bg-black/60 border border-emerald-500/20 rounded-xl relative overflow-hidden group">
                     <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="grid grid-cols-10 gap-1 h-full">
                           {Array.from({ length: 10 }).map((_, i) => (
                             <div key={i} className="bg-emerald-500 w-full" style={{ height: `${Math.random() * 100}%` }} />
                           ))}
                        </div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/30">Matrix Total Cap (ทั้งหมด)</span>
                     <div className="mt-4 flex flex-col gap-1">
                        <div className="flex items-baseline gap-3">
                           <h3 className="text-4xl font-black text-emerald-300 drop-shadow-[0_0_20px_#10b981]">
                              {totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </h3>
                           <span className="text-sm font-bold opacity-40">MTX</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500/60 uppercase tracking-tighter">
                           ≈ {(totalValuation * MTX_TO_THB).toLocaleString()} THB
                           <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">Rate: 1 MTX = {MTX_TO_THB} THB</span>
                        </div>
                     </div>
                     <div className="text-[10px] mt-4 opacity-40 uppercase font-bold tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Reserve Verified by AIS Protocols
                     </div>
                  </div>

                  {/* Funding Support */}
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/60">AIS Funding Protocol</span>
                       <span className="text-[9px] px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded font-bold">READY</span>
                    </div>
                    <div className="space-y-4">
                       <p className="text-xs text-emerald-500/70 leading-relaxed uppercase font-medium">
                          AIS provides computational credits and nodal liquidity for high-purity assets. 
                          The current fund support is distributed across all 500 nodes.
                       </p>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-emerald-950 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-500/60 w-[72%]" />
                          </div>
                          <span className="text-[10px] font-bold text-cyan-400">72% Allocated</span>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all">
                       Apply for Seed Funding
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Resource Efficiency</p>
                        <p className="text-2xl font-black text-emerald-300">94.2%</p>
                        <div className="mt-2 h-1 bg-emerald-950 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-[94.2%]" />
                        </div>
                      </div>
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Database className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Lifetime Revenue</p>
                        <div className="flex items-baseline gap-2">
                           <p className="text-2xl font-black text-emerald-300">
                             {(lifetimeRevenue / 1000).toFixed(1)}k
                           </p>
                           <span className="text-[10px] font-bold text-emerald-500/40 uppercase">MTX</span>
                        </div>
                        <p className="text-[8px] font-bold text-emerald-500/30 uppercase mt-2 italic">* Since Genesis Node Operation</p>
                      </div>
                      <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                           <Zap className="w-8 h-8 text-cyan-400" />
                        </div>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Total Ad Revenue</p>
                        <div className="flex items-baseline gap-2">
                           <p className="text-2xl font-black text-cyan-300">
                             {adRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                           </p>
                           <span className="text-[10px] font-bold text-cyan-500/40 uppercase">MTX</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-cyan-500/10 pt-4">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-cyan-500/40 italic">Self-Promotion Fund</span>
                              <span className="text-xs font-black text-cyan-400">
                                 {(adRevenue * (reinvestmentRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })} MTX
                              </span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black uppercase text-cyan-500/40 italic text-right">Commission Rate</span>
                              <span className="text-xs font-black text-blue-400 text-right">
                                 {commissionRate}%
                              </span>
                           </div>
                        </div>
                      </div>
                      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                           <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Your Personal Yield (You)</p>
                        <div className="flex items-baseline gap-2">
                           <p className="text-2xl font-black text-blue-300">
                             {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </p>
                           <span className="text-[10px] font-bold text-blue-500/40 uppercase">Available Balance</span>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-blue-500/40 italic tracking-tight">Accrued Lifetime Earnings</span>
                              <span className="text-xs font-black text-blue-500/60">
                                 {totalUserEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })} MTX
                              </span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black uppercase text-blue-500/40 italic tracking-tight">Total Withdrawn</span>
                              <span className="text-xs font-black text-cyan-400">
                                 {walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} MTX
                              </span>
                           </div>
                        </div>

                         <div className="mt-4 flex items-center gap-2">
                            <button 
                               onClick={handleWithdraw}
                               disabled={availableBalance <= 0.01 || isExporting}
                               className={`flex-1 py-3 px-4 rounded-lg font-black text-[10px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 ${
                                  availableBalance > 0.01 && !isExporting
                                  ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95' 
                                  : 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                               }`}
                            >
                               {isExporting ? 'ENCRYPTING...' : 'To Wallet'}
                            </button>
                            <button 
                               onClick={() => setCurrentView('BANK')}
                               className="flex-1 py-3 px-4 rounded-lg font-black text-[10px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            >
                               Settlement (THB)
                            </button>
                         </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-blue-500/10 pt-4">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-blue-500/40 italic tracking-tight">Director Fee ({commissionRate}%)</span>
                              <span className="text-xs font-black text-blue-400">
                                 {userCommission.toLocaleString(undefined, { maximumFractionDigits: 2 })} MTX
                              </span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black uppercase text-blue-500/40 italic text-right tracking-tight">Equity Yield (4%)</span>
                              <span className="text-xs font-black text-blue-400 text-right">
                                 {userEquityYield.toLocaleString(undefined, { maximumFractionDigits: 2 })} MTX
                              </span>
                           </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded text-[8px] uppercase leading-relaxed text-blue-400/60 font-bold italic">
                           * จัดสรรรายได้: ค่าธรรมเนียมบริหารจัดการ {commissionRate}% + ปันผลจากหุ้นส่วน {stakeholders.find(s => s.id === 'user')?.shares}% ของรายได้รวมทั้งหมด
                        </div>
                      </div>

                      {/* Banking Gateway Integration */}
                      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                           <Landmark className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Banking Gateway (TH)</p>
                        <div className="flex items-baseline gap-2 mb-4">
                           <p className="text-2xl font-black text-emerald-300">
                             {bankBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                           </p>
                           <span className="text-[10px] font-bold text-emerald-500/40 uppercase">THB Settlement</span>
                        </div>

                        <div className="space-y-4">
                           {/* Balance Stats */}
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 border-l border-blue-500/30 pl-3">
                                 <span className="text-[8px] font-black uppercase text-blue-500/40">In Wallet</span>
                                 <p className="text-sm font-black text-blue-400">{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MTX</p>
                              </div>
                              <div className="flex flex-col gap-1 border-l border-cyan-500/30 pl-3">
                                 <span className="text-[8px] font-black uppercase text-cyan-500/40">Pending</span>
                                 <p className="text-sm font-black text-cyan-400">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} MTX</p>
                              </div>
                           </div>

                           {/* Bank Account Input */}
                           <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-emerald-500/60 block">Bank Account Number (เลขบัญชี)</label>
                             <input 
                               type="text"
                               inputMode="numeric"
                               value={bankAccountNumber}
                               onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                               placeholder="กรอกเลขบัญชี 10 หลัก"
                               className="w-full bg-black/60 border border-emerald-500/30 rounded-lg py-3 px-4 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 shadow-inner placeholder:text-emerald-500/10"
                               maxLength={15}
                             />
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              {['SCB', 'KBANK', 'BBL', 'KRUNGTHAI'].map(bank => (
                                 <button
                                    key={bank}
                                    onClick={() => setSelectedBank(bank)}
                                    className={`py-2 px-3 rounded border text-[9px] font-black tracking-widest transition-all ${
                                       selectedBank === bank 
                                       ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                       : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                    }`}
                                 >
                                    {bank}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="mt-4 space-y-3">
                           <motion.button 
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              animate={shouldShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                              transition={{ duration: 0.4 }}
                              onClick={handleBankTransfer}
                              disabled={isTransferringToBank}
                              className={`w-full py-5 px-6 rounded-xl font-black text-[12px] tracking-[0.2em] uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                                 ((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && bankAccountNumber.length >= 10 && !isTransferringToBank
                                 ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                                 : 'bg-white/5 text-white/20 border border-white/10'
                              }`}
                           >
                              {isTransferringToBank ? (
                                 <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-1" />
                                    <span className="animate-pulse">SETTLING WITH BANK...</span>
                                 </>
                              ) : (
                                 <>
                                    <span>
                                       {bankAccountNumber.length < 10 
                                          ? 'กรอกเลขบัญชี 10 หลัก' 
                                          : ((walletBalance + availableBalance) * MTX_TO_THB < MIN_WITHDRAWAL_THB)
                                              ? `ยอดไม่ถึงขั้นต่ำ (${MIN_WITHDRAWAL_THB.toFixed(2)} บาท)`
                                             : `ยืนยันแลกเงินเข้า ${selectedBank}`}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-60 italic normal-case">
                                       Exchange Rate: 1 MTX = {MTX_TO_THB} บาท
                                    </span>
                                 </>
                              )}
                           </motion.button>

                           <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
                              <p className="text-[9px] text-emerald-500/60 leading-tight text-center font-bold">
                                 * ระบบจะดึงจาก Wallet ก่อน หากไม่มีจะดึงจากเงินรอถอน (Pending) อัตโนมัติ
                              </p>
                           </div>

                           <div className="flex justify-between items-center px-1">
                              <span className="text-[8px] font-black text-emerald-500/40 uppercase">Integration Status</span>
                              <div className="flex items-center gap-1">
                                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                 <span className="text-[8px] font-black text-emerald-400 uppercase">API Connected</span>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="p-6 bg-black/40 border border-emerald-500/10 rounded-xl space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-100">Ministry Regulatory Oversight</h3>
                         </div>
                         <div className="flex gap-2">
                            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-bold text-amber-400 uppercase">
                               กระทรวงการคลัง
                            </div>
                            {isDomainRegistered && (
                               <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[8px] font-bold text-cyan-400 uppercase">
                                  DOMAIN_ACTIVE
                               </div>
                            )}
                            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-bold text-emerald-400 uppercase">
                               Cycle 14.b
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-emerald-500/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-full">
                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">AIS External Sync</p>
                               <p className="text-[8px] text-blue-500/60 uppercase font-bold">Encrypted Tunnel: Passive</p>
                            </div>
                         </div>
                         <button 
                           onClick={handleExportData}
                           className={`py-3 px-6 rounded-lg font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all ${
                             isExporting 
                             ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                             : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                           }`}
                         >
                           {isExporting ? (
                             <>
                               <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                               COMPILING_BLAST
                             </>
                           ) : (
                             <>
                               <Download className="w-3 h-3" />
                               Export Registry Data
                             </>
                           )}
                         </button>
                      </div>

                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                               <div className="flex justify-between items-end">
                                  <span className="text-[10px] font-bold uppercase opacity-40">Ad Reinvestment Rate</span>
                                  <span className="text-sm font-black text-emerald-400">{reinvestmentRate}%</span>
                               </div>
                               <input 
                                 type="range" 
                                 min="0" 
                                 max="100" 
                                 value={reinvestmentRate} 
                                 onChange={(e) => setReinvestmentRate(parseInt(e.target.value))}
                                 className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                               />
                               <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-tighter">
                                  <span>Profit Focus</span>
                                  <span>Aggressive Growth</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                               <div className="flex justify-between items-end">
                                  <span className="text-[10px] font-bold uppercase opacity-40">Director Commison (Agent Fee)</span>
                                  <span className="text-sm font-black text-blue-400">{commissionRate}%</span>
                               </div>
                               <input 
                                 type="range" 
                                 min="0" 
                                 max="100" 
                                 value={commissionRate} 
                                 onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                 className="w-full h-1 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                               <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-tighter">
                                  <span>Pro-Bono</span>
                                  <span>Maximum Profit</span>
                               </div>
                            </div>

                            <div className="flex flex-col gap-2">
                               <span className="text-[10px] font-bold uppercase opacity-40">Infrastructure Upgrades</span>
                               <button 
                                 onClick={handleRegisterDomain}
                                 disabled={isDomainRegistered || adRevenue < domainCost}
                                 className={`w-full py-3 px-4 border rounded flex items-center justify-between group transition-all ${
                                   isDomainRegistered 
                                   ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 opacity-60 cursor-default' 
                                   : adRevenue >= domainCost
                                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                      : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/40 cursor-not-allowed'
                                 }`}
                               >
                                 <div className="flex items-center gap-2">
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                       {isDomainRegistered ? 'Domain Registered' : 'Register Protocol Domain'}
                                    </span>
                                 </div>
                                 {!isDomainRegistered && (
                                    <span className="text-[9px] font-mono leading-none">-{domainCost} MTX</span>
                                 )}
                               </button>
                               {!isDomainRegistered && adRevenue < domainCost && (
                                  <p className="text-[8px] text-rose-500/60 uppercase font-bold italic tracking-tighter">
                                     Insufficient Ad Profit (Need { (domainCost - adRevenue).toFixed(2) } MTX more)
                                  </p>
                               )}
                            </div>
                         </div>

                         <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                            <p className="text-[9px] text-emerald-200/60 leading-relaxed italic uppercase font-medium">
                               A portion of the MTX ad revenue is recycled back into the High-Frequency Matrix. {isDomainRegistered ? 'The matrix-vault.network domain is now strictly binding all nodal communications.' : 'Domain registration will verify your network identity globally.'}
                            </p>
                         </div>
                      </div>
                   </div>

                  <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Treasury Ledgers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Operational Reserve', value: '42.1M MTX', status: 'LOCKED' },
                      { label: ' AIS Grant Pool', value: '15.5M MTX', status: 'ACTIVE' },
                      { label: 'Liquidity Buffer', value: '9.2M MTX', status: 'STABLE' },
                    ].map((item, i) => (
                      <div key={i} className="p-5 border border-emerald-500/10 bg-black/40 rounded flex flex-col items-center justify-center text-center gap-1 group hover:border-emerald-500/30 transition-all">
                        <p className="text-[9px] uppercase opacity-40 font-bold">{item.label}</p>
                        <p className="text-lg font-black text-emerald-200">{item.value}</p>
                        <span className="text-[8px] font-bold px-2 py-0.5 border border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/10 transition-colors uppercase">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-lg">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-100">Valuation Cycles</h4>
                        <p className="text-[9px] opacity-40 uppercase mt-1">12-Month Projected Nodal Yield</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-emerald-500/60">
                           <div className="w-2 h-2 bg-emerald-500/40 rounded-sm" />
                           Valuation (MTX)
                        </div>
                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-cyan-400/60">
                           <div className="w-2 h-2 bg-cyan-400/40 rounded-sm" />
                           Ad Yield
                        </div>
                     </div>
                  </div>
                  
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#10b98110" vertical={false} />
                           <XAxis 
                              dataKey="name" 
                              stroke="#10b98140" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              dy={10}
                           />
                           <YAxis 
                              stroke="#10b98140" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                           />
                           <Tooltip 
                              contentStyle={{ 
                                 backgroundColor: '#050505', 
                                 border: '1px solid #10b98130',
                                 borderRadius: '4px',
                                 fontSize: '10px',
                                 textTransform: 'uppercase',
                                 color: '#10b981'
                              }}
                              itemStyle={{ color: '#10b981' }}
                              cursor={{ stroke: '#10b98130' }}
                           />
                           <Area 
                              type="monotone" 
                              dataKey="valuation" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorVal)" 
                           />
                           <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#22d3ee" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorRev)" 
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-lg">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <User className="w-4 h-4 text-emerald-400" />
                           <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-100">Official Shareholder Registry</h4>
                        </div>
                        <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-tighter">SEC_AUDITED_BOOK</span>
                     </div>
                     <div className="space-y-3">
                        {stakeholders.map((person, i) => (
                           <div key={i} className={`flex items-center justify-between p-3 border rounded transition-all font-sans ${
                             person.status === 'EXITED' 
                             ? 'bg-rose-500/5 border-rose-500/20 opacity-60' 
                             : 'bg-white/5 border-white/5 hover:border-emerald-500/20'
                           }`}>
                              <div className="flex flex-col">
                                 <span className={`text-[10px] font-black uppercase tracking-tight ${
                                   person.status === 'EXITED' ? 'text-rose-400' : 'text-emerald-100'
                                 }`}>{person.name}</span>
                                 <div className="flex gap-2">
                                    <span className="text-[8px] font-bold text-emerald-500/40">{person.role}</span>
                                    <span className={`text-[8px] font-bold italic ${
                                      person.status === 'EXITED' ? 'text-rose-500/60' : 'text-amber-500/40'
                                    }`}>{person.status}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className={`text-sm font-black font-mono ${
                                   person.status === 'EXITED' ? 'text-rose-500' : 'text-emerald-400'
                                 }`}>{person.shares.toFixed(1)}%</span>
                                 <div className="flex flex-col items-end mt-1">
                                    <p className="text-[7px] font-bold text-emerald-500/30 uppercase">Voting Equity</p>
                                    {person.id === 'user' && isMonetized && (
                                       <div className="flex flex-col items-end">
                                          <span className="text-[8px] font-black text-blue-400 mt-0.5 animate-pulse">
                                             Live: {totalUserEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MTX
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                        
                        {isExitTriggered && (
                           <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 border-dashed rounded flex items-center justify-between animate-pulse">
                              <div className="flex items-center gap-2">
                                 <RefreshCw className="w-3 h-3 text-emerald-400" />
                                 <div>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase">Treasury Reclamation</p>
                                    <p className="text-[7px] text-emerald-500/60 uppercase font-bold">Protocol: Buyback & Name Return</p>
                                 </div>
                              </div>
                              <span className="text-xs font-black text-emerald-400">+{treasuryShares.toFixed(1)}%</span>
                           </div>
                        )}
                     </div>

                     <div className="mt-4 pt-4 border-t border-white/5">
                        <button 
                           onClick={handleThirdPartyExit}
                           disabled={isExitTriggered}
                           className={`w-full py-2 px-4 rounded text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                             isExitTriggered 
                             ? 'bg-emerald-500/10 text-emerald-500/40 cursor-not-allowed border border-emerald-500/10' 
                             : 'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                           }`}
                        >
                           {isExitTriggered ? 'All External Names Reclaimed' : 'Trigger 3rd-Party Exit Protocol'}
                        </button>
                        <p className="text-[7px] text-emerald-500/40 uppercase mt-2 italic text-center">
                           * Article 12: Corporations must reclaim identity references upon 3rd-party liquidation.
                        </p>
                     </div>
                  </div>

                  <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-lg">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Capital Distribution</h4>
                        <BarChartIcon className="w-3 h-3 opacity-20" />
                     </div>
                     <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={assetDistributionData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#10b98105" vertical={false} />
                              <XAxis 
                                 dataKey="name" 
                                 stroke="#10b98140" 
                                 fontSize={9} 
                                 tickLine={false} 
                                 axisLine={false}
                              />
                              <YAxis hide />
                              <Tooltip 
                                 cursor={{ fill: '#10b98105' }}
                                 contentStyle={{ 
                                    backgroundColor: '#050505', 
                                    border: '1px solid #10b98130',
                                    borderRadius: '4px',
                                    fontSize: '9px'
                                 }}
                              />
                              <Bar dataKey="valuation" radius={[2, 2, 0, 0]}>
                                 {assetDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#22d3ee'} fillOpacity={0.6} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-lg space-y-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Registry Health</h4>
                     <div className="space-y-4 pt-2">
                        {[
                           { label: 'Peering Load', val: 78, color: 'bg-emerald-500' },
                           { label: 'Verification Velocity', val: 92, color: 'bg-cyan-500' },
                           { label: 'Packet Integrity', val: 99, color: 'bg-emerald-400' },
                           { label: 'MOF Compliance', val: 84, color: 'bg-amber-500' }
                        ].map((item, i) => (
                           <div key={i} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] uppercase font-black tracking-widest">
                                 <span className="opacity-40">{item.label}</span>
                                 <span className="text-emerald-100">{item.val}%</span>
                              </div>
                              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.val}%` }}
                                    className={`h-full ${item.color} opacity-60`}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          ) : currentView === 'MARKET' ? (
            <div className="p-8 space-y-8 overflow-auto flex-1">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-300">Nodal Exchange</h2>
                      <p className="text-[10px] opacity-40 uppercase">Decentralized High-Frequency Matrix Stock Market</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Market Open</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Market Index */}
                  <div className="p-6 bg-black/40 border border-emerald-500/10 rounded-xl space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-emerald-400">MTX-500 Index</span>
                     <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-emerald-100 italic">12,419.82</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                           <ArrowUpRight className="w-3 h-3" /> +1.42%
                        </span>
                     </div>
                     <div className="h-12 flex items-end gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                           <div key={i} className="flex-1 bg-emerald-500/20" style={{ height: `${Math.random() * 60 + 20}%` }} />
                        ))}
                     </div>
                  </div>
                  
                  {/* Top Gainer */}
                  <div className="p-6 bg-black/40 border border-emerald-500/10 rounded-xl space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-cyan-400">Top Nodal Gainer</span>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center">
                           <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white uppercase">{INITIAL_ASSETS[0].name}</p>
                           <p className="text-[10px] opacity-40 uppercase">+{ (Math.random() * 15 + 5).toFixed(2) }%</p>
                        </div>
                     </div>
                     <div className="text-[10px] font-bold text-cyan-400 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded w-fit uppercase">
                        Squeeze Detected
                     </div>
                  </div>

                  {/* Volume */}
                  <div className="p-6 bg-black/40 border border-emerald-500/10 rounded-xl space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-amber-400">24H Trading Volume</span>
                     <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-amber-100 italic">4.2M</span>
                        <span className="text-xs font-bold opacity-30 text-white">MTX</span>
                     </div>
                     <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-2 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Synchronized with Global Treasury
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30">Active Listings (ตลาดหุ้น)</h3>
                      <div className="hidden md:flex gap-4">
                         <span className="text-[10px] opacity-40 uppercase font-bold">Sort: Valuation</span>
                         <span className="text-[10px] opacity-40 uppercase font-bold">Filter: Active</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                       {assets.filter(a => a.isListed).length > 0 ? (
                         assets.filter(a => a.isListed).slice(0, 10).map((asset, i) => (
                           <div 
                            key={asset.id} 
                            onClick={() => setSelectedAsset(asset)}
                            className={`p-4 border rounded flex items-center justify-between group transition-all cursor-pointer ${
                              isMonetized && i < 2 
                              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)] scale-[1.02] z-10' 
                              : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                            }`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 rounded ${Math.random() > 0.5 ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
                                    {Math.random() > 0.5 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <p className="text-xs font-bold text-emerald-200 uppercase tracking-wide">{asset.name}</p>
                                       {isMonetized && i < 2 && (
                                          <span className="text-[7px] font-black italic bg-cyan-400 text-black px-1 rounded-sm tracking-tighter">SPONSORED</span>
                                       )}
                                    </div>
                                    <p className="text-[9px] opacity-30 font-mono italic">
                                       {isMonetized && i < 2 ? 'CORE_PARTNER // ' : ''}{asset.id}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-8">
                                 <div className="hidden sm:block text-right">
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Purity</p>
                                    <p className="text-[11px] font-bold text-emerald-400">{(asset.purity || 0).toFixed(2)}%</p>
                                 </div>
                                 <div className="text-right w-24">
                                    <p className="text-xs font-black text-emerald-100">{asset.valuation.toLocaleString()} MTX</p>
                                    <p className={`text-[9px] font-bold uppercase ${Math.random() > 0.5 ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>
                                       {Math.random() > 0.5 ? '+2.41' : '-1.12'}%
                                    </p>
                                 </div>
                                  <button 
                                   onClick={() => setCurrentView('BANK')}
                                   className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                  >
                                     REDEEM THB
                                  </button>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="py-12 border border-dashed border-emerald-500/20 rounded-lg flex flex-col items-center justify-center text-emerald-500/30 gap-3">
                            <AlertCircle className="w-8 h-8 opacity-20" />
                            <p className="text-[10px] uppercase font-bold tracking-widest">No active listings in the current cycle</p>
                            <button 
                              onClick={() => setCurrentView('LOG')}
                              className="text-[9px] underline hover:text-emerald-400 transition-colors uppercase font-bold"
                            >
                              Go to Asset Log to List Nodes
                            </button>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 text-center lg:text-left">Nodal Trends</h3>
                    
                    <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-6">
                       <div className="flex flex-col items-center justify-center py-4 relative">
                          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                          <span className="text-4xl font-black text-emerald-500 drop-shadow-[0_0_15px_#10b981] relative">BULLISH</span>
                          <span className="text-[10px] uppercase opacity-40 mt-2 font-black tracking-widest">Market Confidence</span>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                <span className="opacity-40 italic">Buy Pressure</span>
                                <span className="text-emerald-400">82.4%</span>
                             </div>
                             <div className="h-1.5 bg-emerald-950 rounded-full overflow-hidden p-0.5 border border-emerald-500/10">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '82.4%' }}
                                  className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                                />
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                <span className="opacity-40 italic">Sell Walls</span>
                                <span className="text-rose-400">17.6%</span>
                             </div>
                             <div className="h-1.5 bg-emerald-950 rounded-full overflow-hidden p-0.5 border border-rose-500/10 text-right">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '17.6%' }}
                                  className="h-full bg-rose-500 float-right shadow-[0_0_10px_#f43f5e]" 
                                />
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded flex flex-col gap-2">
                          <span className="text-[9px] uppercase font-bold opacity-30 text-center">Protocol Advice</span>
                          <p className="text-[10px] text-emerald-200 text-center leading-relaxed italic uppercase font-medium">
                            Significant nodal accumulation detected in CORE sectors. Anticipating valuation spike.
                          </p>
                       </div>
                    </div>

                    <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-xl space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Recent Executions</h4>
                       <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center text-[10px]">
                               <span className="opacity-40 uppercase truncate max-w-[100px]">{INITIAL_ASSETS[i+10].name}</span>
                               <span className="font-mono text-emerald-500/60">SOLD</span>
                               <span className="font-bold text-emerald-100">{(Math.random() * 1000).toFixed(2)} MTX</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          ) : currentView === 'BANK' ? (
            <div className="p-8 space-y-8 overflow-auto flex-1 bg-gradient-to-br from-emerald-950/10 to-transparent">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Landmark className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-300">Matrix Banking Gateway</h2>
                  <p className="text-[10px] opacity-40 uppercase">THB Settlement & External Financial Integration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Available Pending Overview */}
                <div className="p-8 bg-black/60 border border-cyan-500/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-12 h-12 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/30 font-sans">Pending Matrix Earnings</span>
                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-4xl font-black text-cyan-300 drop-shadow-[0_0_20px_#22d3ee]">
                        {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <span className="text-sm font-bold opacity-40">MTX</span>
                    </div>
                    <button 
                      onClick={handleWithdraw}
                      disabled={availableBalance <= 0 || isExporting}
                      className="mt-4 w-full py-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                    >
                      {isExporting ? 'PROCESSING...' : 'Move to Wallet'}
                    </button>
                  </div>
                </div>

                {/* Wallet Overview */}
                <div className="p-8 bg-black/60 border border-blue-500/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Database className="w-12 h-12 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/30 font-sans">Matrix Wallet Balance</span>
                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-4xl font-black text-blue-300 drop-shadow-[0_0_20px_#3b82f6]">
                        {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <span className="text-sm font-bold opacity-40">MTX</span>
                    </div>
                    <div className="text-[10px] mt-2 opacity-50 uppercase font-bold text-blue-400/60 italic font-sans animate-pulse">
                      * Ready for Settlement
                    </div>
                  </div>
                </div>

                {/* Bank Account Overview */}
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Landmark className="w-12 h-12 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/30 font-sans">Bank Balance (THB)</span>
                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-4xl font-black text-emerald-300 drop-shadow-[0_0_20px_#10b981]">
                        {bankBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </h3>
                      <span className="text-sm font-bold opacity-40">THB</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <div className={`w-2 h-2 rounded-full animate-pulse ${bankAccountNumber.length >= 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${bankAccountNumber.length >= 10 ? 'text-emerald-400' : 'text-amber-400/60'}`}>
                          {bankAccountNumber.length >= 10 ? `${selectedBank} Connected` : `Waiting for ${selectedBank} Info`}
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Selection & Transfer */}
              <div className="p-8 border border-emerald-500/10 bg-black/40 rounded-xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Select Settlement Destination</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <span className="text-[9px] font-bold text-emerald-400 opacity-60 uppercase">System: Local Gateway (Thailand)</span>
                  </div>
                </div>

                {/* Withdrawal Info Box */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase text-emerald-400">เงื่อนไขการโอนเงิน (Withdrawal Rule)</h4>
                    <p className="text-[10px] text-emerald-500/70 leading-relaxed font-sans mt-0.5">
                       1. ยอดโอนขั้นต่ำอย่างน้อย <span className="text-white font-black">{MIN_WITHDRAWAL_THB.toFixed(2)} บาท</span><br />
                       2. กรอกหมายเลขบัญชีธนาคารให้ครบ <span className="text-white font-black">10 หลัก</span><br />
                       3. ระบบจะโอนเงินเข้าบัญชี <span className="text-white font-black">{selectedBank}</span> ของคุณทันทีที่กดยืนยัน
                    </p>
                  </div>
                </div>

                {/* Account Number Input */}
                <div className="space-y-3 bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Enter Bank Account Number (กรอกเลขบัญชี 10 หลัก)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="000-0-00000-0"
                      className="w-full bg-black/80 border border-emerald-500/30 rounded-lg py-5 px-6 text-2xl font-mono text-emerald-300 placeholder:text-emerald-500/5 focus:outline-none focus:border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] transition-all font-black tracking-[0.2em]"
                      maxLength={15}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       {bankAccountNumber.length >= 10 ? (
                         <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                            <ShieldCheck className="w-4 h-4" /> Ready
                         </div>
                       ) : (
                         <button 
                            onClick={() => setBankAccountNumber('1234567890')}
                            className="flex items-center gap-1 text-[10px] font-black text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded uppercase transition-colors"
                         >
                            <RefreshCw className="w-4 h-4" /> Quick Fill
                         </button>
                       )}
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-white/30 uppercase italic font-sans">
                    * บัญชีนี้ต้องเป็นชื่อของคุณเท่านั้น (This must be your own account)
                  </p>
                </div>

                <div className="space-y-4">
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      animate={shouldShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={handleBankTransfer}
                      disabled={isTransferringToBank}
                      className={`w-full py-8 px-8 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all flex flex-col items-center justify-center gap-2 ${
                        ((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && bankAccountNumber.length >= 10 && !isTransferringToBank
                        ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.5)] border-2 border-emerald-400' 
                        : 'bg-white/10 text-white/40 border border-white/20'
                      }`}
                    >
                      {isTransferringToBank ? (
                        <>
                          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="animate-pulse">SETTLING WITH {selectedBank}...</span>
                          <span className="text-[9px] font-bold opacity-60">BOT-GATEWAY: PROCESSING TRANSACTION</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Landmark className="w-5 h-5" />
                            <span>
                               {bankAccountNumber.length < 10 
                                  ? 'กรุณากรอกเลขบัญชี 10 หลัก' 
                                  : ((walletBalance + availableBalance) * MTX_TO_THB < MIN_WITHDRAWAL_THB)
                                     ? `ยอดเงินไม่ถึงขั้นต่ำ (${MIN_WITHDRAWAL_THB.toFixed(2)} บาท)`
                                     : `ยืนยันโอนเงินเข้าบัญชี ${selectedBank}`}
                            </span>
                          </div>
                          {((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && (
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-black text-black/60 bg-white/20 px-3 py-0.5 rounded-full mt-1">
                                 TOTAL PAYOUT: { ((walletBalance + availableBalance) * MTX_TO_THB).toLocaleString(undefined, { maximumFractionDigits: 0 }) } บาท (THB)
                              </span>
                              <span className="text-[9px] font-bold opacity-50 mt-1 italic">Real-time BOT Exchange Rate applied</span>
                            </div>
                          )}
                        </>
                      )}
                    </motion.button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'SCB', name: 'Siam Commercial', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5', active: 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
                    { id: 'KBANK', name: 'Kasikorn Bank', color: 'border-emerald-600/30 text-emerald-500 bg-emerald-600/5', active: 'bg-emerald-600/20 border-emerald-600 shadow-[0_0_15px_rgba(22,163,74,0.3)]' },
                    { id: 'BBL', name: 'Bangkok Bank', color: 'border-blue-700/30 text-blue-600 bg-blue-700/5', active: 'bg-blue-700/20 border-blue-700 shadow-[0_0_15px_rgba(29,78,216,0.3)]' },
                    { id: 'KRUNGTHAI', name: 'Krungthai Bank', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5', active: 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' }
                  ].map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`relative h-24 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                        selectedBank === bank.id 
                        ? bank.active
                        : 'bg-white/5 border-white/10 hover:border-white/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      <Landmark className="w-6 h-6" />
                      <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-widest">{bank.id}</p>
                        <p className="text-[8px] font-bold opacity-40 uppercase truncate w-full px-2">{bank.name}</p>
                      </div>
                      {selectedBank === bank.id && (
                        <div className="absolute top-2 right-2">
                           <ShieldCheck className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-8 border-t border-emerald-500/10">
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center space-y-2">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Exchange Rate Verification</p>
                      <div className="flex items-center justify-center gap-4 text-2xl font-black">
                        <span className="text-blue-400">1 MTX</span>
                        <span className="text-emerald-500 opacity-20">{'='}</span>
                        <span className="text-emerald-500">{MTX_TO_THB} THB</span>
                      </div>
                      <p className="text-[9px] font-medium opacity-40 uppercase italic tracking-tighter">
                        * Provided by Bank of Thailand (BOT) API Gateway V2.1
                      </p>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      animate={shouldShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={handleBankTransfer}
                      disabled={isTransferringToBank}
                      className={`w-full py-6 px-8 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all flex flex-col items-center justify-center gap-2 ${
                        ((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && bankAccountNumber.length >= 10 && !isTransferringToBank
                        ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/5 text-white/20 border border-white/10'
                      }`}
                    >
                      {isTransferringToBank ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="animate-pulse">SETTLING WITH {selectedBank}...</span>
                          <span className="text-[8px] font-bold opacity-60">BOT-GATEWAY: ESTABLISHING SECURE CONNECTION</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-4 h-4" />
                            <span>
                               {bankAccountNumber.length < 10 
                                  ? 'กรอกเลขบัญชี 10 หลัก' 
                                  : ((walletBalance + availableBalance) * MTX_TO_THB < MIN_WITHDRAWAL_THB)
                                     ? 'ยอดเงินไม่ถึงขั้นต่ำ'
                                     : `ยืนยันแลกเงินเข้า ${selectedBank}`}
                            </span>
                          </div>
                          {((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && (
                            <span className="text-[9px] font-bold opacity-60 italic">
                               ESTIMATED PAYOUT: { ((walletBalance + availableBalance) * MTX_TO_THB).toLocaleString(undefined, { maximumFractionDigits: 0 }) } บาท
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                       <p className="text-[10px] text-emerald-500/60 leading-relaxed text-center font-bold">
                          * ระบบรองรับการแลกขั้นต่ำ {MIN_WITHDRAWAL_THB.toFixed(2)} บาท (ถอนเข้า {selectedBank} ทันที)<br/>
                          ตรวจสอบเลขบัญชีให้ถูกต้องก่อนยืนยัน
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-black/40 border border-emerald-500/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                   <ShieldCheck className="w-4 h-4 text-amber-500" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-100">Settlement Agreement & Compliance</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[9px] uppercase font-bold tracking-tight text-emerald-500/60 leading-relaxed italic">
                   <p>* Your earnings are subject to Director commission rates and shareholder distribution protocols.</p>
                   <p>* All bank transfers are verified against the current Matrix-THB exchange purity index.</p>
                   <p>* Settled funds will appear in your official THB bank ledger within 1.5 seconds (Matrix Time).</p>
                   <p>* All transactions are strictly monitored by the Ministry of Finance (MOF) for matrix stability.</p>
                </div>
              </div>
            </div>
          ) : currentView === 'PULSE' ? (
            <div className="p-8 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold uppercase tracking-widest">Network Pulse</h2>
                   <p className="text-[10px] opacity-40 uppercase">Real-time Stream of Matrix Interactions</p>
                 </div>
               </div>

               <div className="flex-1 overflow-auto border border-emerald-500/20 bg-black/60 rounded-lg p-6 font-mono text-[11px] space-y-1 scrollbar-hide">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1 - (i * 0.05), x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 py-1 border-b border-emerald-500/5"
                    >
                      <span className="text-emerald-500/20">[{new Date(Date.now() - i * 14000).toLocaleTimeString()}]</span>
                      <span className="text-cyan-500/60 font-bold uppercase">CMD_EXEC</span>
                      <span className="text-emerald-500/70">Node Protocol Sync {Math.random().toString(16).substring(2, 10).toUpperCase()} {'->'} Success</span>
                      <span className="ml-auto text-emerald-500/20">#0x{Math.floor(Math.random() * 99999)}</span>
                    </motion.div>
                  ))}
                  <div className="pt-2 animate-pulse text-emerald-400">_ STREAMS_LISTENING_...</div>
               </div>
            </div>
          ) : (
            <div className="p-8 space-y-8 flex-1 overflow-auto">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                   <Lock className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold uppercase tracking-widest">Security Core</h2>
                   <p className="text-[10px] opacity-40 uppercase">Cryptography and Perimeter Authorization</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 border border-emerald-500/20 bg-emerald-950/10 rounded-lg space-y-6 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="w-16 h-16 text-emerald-500 mb-2 drop-shadow-[0_0_15px_#10b981]" />
                    <div>
                      <h4 className="font-bold text-lg uppercase tracking-widest">Mainframe Seal</h4>
                      <p className="text-[10px] opacity-40 mt-1 uppercase">Protocol Grade: Military (Level 9)</p>
                    </div>
                    <div className="w-full py-4 bg-emerald-500/10 rounded border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase cursor-default">
                      System Locked
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="p-8 border border-emerald-500/10 bg-black/40 rounded-lg space-y-4">
                       <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Firewall Ruleset</h4>
                       <div className="space-y-3">
                          {[
                            { name: 'Identity Spoofing Guard', status: 'ACTIVE' },
                            { name: 'Packet Injection Filter', status: 'ACTIVE' },
                            { name: 'Nodal Purge Protocol', status: 'STANDBY' },
                            { name: 'Neural Link Encryption', status: 'ACTIVE' }
                          ].map(rule => (
                            <div key={rule.name} className="flex items-center justify-between p-3 bg-emerald-500/5 rounded border border-emerald-500/10">
                              <span className="text-[11px] uppercase font-medium">{rule.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${rule.status === 'ACTIVE' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400'}`}>
                                {rule.status}
                              </span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-8 border border-emerald-500/10 bg-black/40 rounded-lg">
                       <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-6">Unauthorized Access Attempts</h4>
                       <div className="flex items-end gap-1 h-24">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-emerald-500/20 group hover:bg-emerald-500/40 cursor-help relative" style={{ height: `${Math.random() * 100}%` }}>
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-emerald-500/30 px-2 py-0.5 text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                 {Math.floor(Math.random() * 20)} Attempts
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="flex justify-between text-[9px] uppercase opacity-40 mt-3 font-bold">
                          <span>00:00 UTC</span>
                          <span>24:00 UTC</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full md:w-96 border-l border-emerald-500/20 bg-black/60 backdrop-blur-md z-30 fixed right-0 top-0 bottom-0 md:relative flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded">
                      <Hash className="w-4 h-4" />
                   </div>
                   <span className="text-sm font-bold uppercase tracking-widest">{selectedAsset.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-emerald-500/10 rounded-full transition-colors text-emerald-500/60"
                >
                  <AlertCircle className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                 {/* Identity Sec */}
                 <section className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Protocol Identity</span>
                   <div className="grid grid-cols-1 gap-6">
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded space-y-1">
                         <span className="text-[9px] uppercase opacity-40">Network Name</span>
                         <p className="text-lg font-bold tracking-tight text-emerald-200">{selectedAsset.name}</p>
                      </div>
                      
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-md border-l-4 border-l-cyan-500">
                         <span className="text-[9px] uppercase font-bold text-cyan-500/60 block mb-1">Operational Directive</span>
                         <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">{selectedAsset.primaryFunction}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded space-y-1">
                            <span className="text-[9px] uppercase opacity-40">Nodal Tier</span>
                            <p className="text-xs font-bold text-cyan-400">{selectedAsset.type}</p>
                         </div>
                         <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded space-y-1">
                            <span className="text-[9px] uppercase opacity-40">Verif Date</span>
                            <p className="text-xs font-bold text-slate-300">{selectedAsset.lastVerified}</p>
                         </div>
                         {selectedAsset.purity !== undefined && (
                           <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded space-y-1 col-span-2">
                              <span className="text-[9px] uppercase opacity-40">Nodal Purity Index</span>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedAsset.purity}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_10px_#10b981]"
                                  />
                                </div>
                                <span className="text-xs font-bold text-emerald-300">{selectedAsset.purity.toFixed(2)}%</span>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                 </section>

                 {/* Security Sec */}
                 <section className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Cryptographic Seal</span>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase">
                          <span className="opacity-40">Integrity Hash</span>
                          <span className="text-emerald-500/60">SHA-256</span>
                        </div>
                        <div className="p-4 bg-black/40 border border-emerald-500/20 rounded-md font-mono text-[11px] leading-relaxed break-all text-emerald-500/80 tracking-tighter">
                          {selectedAsset.hash}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-md">
                        <div className={`p-2 rounded-full border ${getStatusColor(selectedAsset.status).split(' ')[1]}`}>
                           <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-white">Security Status</p>
                          <p className={`text-[11px] font-bold uppercase ${getStatusColor(selectedAsset.status).split(' ')[0]}`}>{selectedAsset.status}</p>
                        </div>
                      </div>
                   </div>
                 </section>

                 {/* Ancestry Sec */}
                 <section className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Attribution</span>
                   <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded hover:bg-emerald-500/10 transition-colors group cursor-default">
                      <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/20 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-emerald-100" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase opacity-40">Master Key Owner</p>
                        <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">{selectedAsset.owner}</p>
                      </div>
                   </div>
                 </section>

                 <AssetLore asset={selectedAsset} />

                 {/* Valuation Sec */}
                 <section className="space-y-4">
                   <section className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Financial Performance</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded">
                           <span className="text-[9px] uppercase opacity-40">Est. Annual Yield</span>
                           <p className="text-sm font-black text-emerald-400">+{selectedAsset.yieldRate?.toFixed(2)}%</p>
                        </div>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded">
                           <span className="text-[9px] uppercase opacity-40">Profit / Cycle</span>
                           <p className="text-sm font-black text-cyan-400">
                             {((selectedAsset.valuation * (selectedAsset.yieldRate || 0)) / 100 / 12).toFixed(2)} MTX
                           </p>
                        </div>
                      </div>
                   </section>

                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Nodal Valuation</span>
                   <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex items-end gap-2 relative z-10">
                        <span className="text-3xl font-black text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.5)]">
                          {selectedAsset.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-bold opacity-40 pb-1">{selectedAsset.currency}</span>
                      </div>
                      <p className="text-[10px] uppercase opacity-30 mt-2 font-bold tracking-widest">Estimated Exchange Value (Locked)</p>
                   </div>
                 </section>
              </div>

              <div className="p-6 border-t border-emerald-500/20 bg-black/40 space-y-3">
                 <button 
                  onClick={() => handleListAsset(selectedAsset.id)}
                  className={`w-full py-3 font-black uppercase text-xs tracking-widest rounded transition-all flex items-center justify-center gap-2 ${
                    selectedAsset.isListed 
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  }`}
                 >
                    <TrendingUp className="w-4 h-4" />
                    {selectedAsset.isListed ? 'Delist from Nodal Exchange' : 'List on Nodal Exchange'}
                 </button>
                 <button className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black uppercase text-[10px] tracking-widest rounded hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-3 h-3" />
                    Re-Verify Node
                 </button>
                 <p className="text-center text-[9px] opacity-30 mt-4 uppercase">Protocol Version: 9.01.Alpha</p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Status Bar */}
      <footer className="border-t border-emerald-500/20 bg-black/80 backdrop-blur-sm px-6 py-2 flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-emerald-500">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Connection Secure</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-500/40">
            <Archive className="w-3 h-3" />
            <span>Buffer: 1024KB</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-emerald-500/40">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRegistered ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>Exchange Reg: {isRegistered ? 'VERIFIED' : 'UNREGISTERED'}</span>
          </div>
          <span className="hidden sm:inline">User: {selectedAsset?.owner || 'AUTHENTICATED_GUEST'}</span>
           <span className="text-emerald-500/60 transition-all hover:text-emerald-400 cursor-help underline underline-offset-4 decoration-emerald-500/20">Protocol Docs</span>
        </div>
      </footer>
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-emerald-500/30 rounded-xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-300">Trader Registration</h3>
                  <p className="text-[10px] opacity-40 uppercase font-bold mt-2 leading-relaxed">
                    A valid trader identity is required to interact with the Nodal Exchange protocols.
                  </p>
                </div>
                <div className="w-full space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded text-left">
                    <span className="text-[9px] uppercase font-bold opacity-30">Identity Hash (Computed)</span>
                    <p className="text-[10px] font-mono text-emerald-500/60 truncate mt-1">
                      0x{Math.random().toString(16).substring(2, 34).toUpperCase()}
                    </p>
                  </div>
                  <button 
                    onClick={handleRegister}
                    className="w-full py-3 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    Confirm Registration
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(false)}
                    className="w-full py-2.5 text-[10px] uppercase font-bold text-emerald-500/40 hover:text-emerald-500 transition-colors"
                  >
                    Abort Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
