/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal, 
  Scale, 
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
  BarChart as BarChartIcon,
  HardDrive,
  FileText,
  Users,
  Globe,
  MapPin,
  Eye
} from 'lucide-react';
import { initAuth, googleSignIn, logout } from './lib/auth';
import { User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
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
  const [currentView, setCurrentView] = useState<'LOG' | 'MANAGER' | 'PULSE' | 'SECURITY' | 'MARKET' | 'TREASURY' | 'BANK' | 'DRIVE' | 'EQUILIBRIUM'>('LOG');
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsDriveAuth, setNeedsDriveAuth] = useState(false);
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
  
  // Real Payments & Payouts Server States
  const [serverTransactions, setServerTransactions] = useState<any[]>([]);
  const [stripeStatus, setStripeStatus] = useState({ stripeConfigured: false, mode: 'SANDBOX' });
  const [depositAmount, setDepositAmount] = useState('10');
  const [isDepositing, setIsDepositing] = useState(false);
  
  // Mining & Income System State
  const [miningPower, setMiningPower] = useState(0); // GH/s
  const [activeMiningNodes, setActiveMiningNodes] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [miningYield, setMiningYield] = useState(0);
  const [nodeUpgradeCost, setNodeUpgradeCost] = useState(0.5); // Initial cost in MTX
  
  // Keiyrtiphumi Matrix 40/20 Equilibrium States
  const [eqCore, setEqCore] = useState<number>(0);
  const [eqPillars, setEqPillars] = useState<number>(12); // slightly unbalanced
  const [eqNetwork, setEqNetwork] = useState<number>(35); // slightly unbalanced
  const [eqRing, setEqRing] = useState<number>(118); // slightly unbalanced
  const [isEquilibriumSolved, setIsEquilibriumSolved] = useState<boolean>(false);
  const [isSolvingEq, setIsSolvingEq] = useState<boolean>(false);
  
  // Visitor Analyzer & Real-time Traffic State (Updated dynamically from server)
  const [totalViews, setTotalViews] = useState<number>(2026);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(1);
  const [activeTrafficCount, setActiveTrafficCount] = useState<number>(1);
  
  const [visitorSessions, setVisitorSessions] = useState<Array<{
    id: string;
    ip: string;
    location: string;
    activeView: string;
    device: string;
    latency: number;
    status: 'ACTIVE' | 'IDLE' | 'ACTION';
    timestamp: string;
  }>>([]);
  
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

  useEffect(() => {
    initAuth(
      (user, token) => {
        setUser(user);
        setAccessToken(token);
        setNeedsDriveAuth(false);
      },
      () => {
        setNeedsDriveAuth(true);
      }
    );
  }, []);

  // Update perfect equilibrium solved status
  useEffect(() => {
    const vectorSum = (eqCore - 0) + (eqPillars - 10) + (eqNetwork - 40) + (eqRing - 120);
    setIsEquilibriumSolved(vectorSum === 0);
  }, [eqCore, eqPillars, eqNetwork, eqRing]);

  // Fetch initial profile stats & transaction logs on load or sign-in
  const fetchUserStats = async (email: string) => {
    try {
      const res = await fetch(`/api/users/sync?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.stats) {
        setWalletBalance(data.stats.walletBalance);
        setBankBalance(data.stats.bankBalance);
        if (data.stats.miningPower !== undefined) setMiningPower(data.stats.miningPower);
        if (data.stats.activeMiningNodes !== undefined) setActiveMiningNodes(data.stats.activeMiningNodes);
        if (data.stats.isMining !== undefined) setIsMining(data.stats.isMining);
        if (data.stats.miningYield !== undefined) setMiningYield(data.stats.miningYield);
        if (data.stats.nodeUpgradeCost !== undefined) setNodeUpgradeCost(data.stats.nodeUpgradeCost);
      }
      if (data.transactions) {
        setServerTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserStats(user.email);
    }
  }, [user?.email]);

  const [anonymousId] = useState(() => {
    let id = localStorage.getItem('matrix_anon_id');
    if (!id) {
       id = 'anon_' + Math.random().toString(36).substring(2, 8);
       localStorage.setItem('matrix_anon_id', id);
    }
    return id;
  });

  const stateRef = useRef({
    user,
    walletBalance,
    bankBalance,
    miningPower,
    activeMiningNodes,
    isMining,
    miningYield,
    nodeUpgradeCost,
    currentView
  });

  useEffect(() => {
    stateRef.current = {
      user,
      walletBalance,
      bankBalance,
      miningPower,
      activeMiningNodes,
      isMining,
      miningYield,
      nodeUpgradeCost,
      currentView
    };
  }, [
    user,
    walletBalance,
    bankBalance,
    miningPower,
    activeMiningNodes,
    isMining,
    miningYield,
    nodeUpgradeCost,
    currentView
  ]);

  // Unified persistent background synchronization agent
  useEffect(() => {
    const performSync = async () => {
      const current = stateRef.current;
      try {
        const res = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: current.user?.email || null,
            anonymousId,
            walletBalance: current.walletBalance,
            bankBalance: current.bankBalance,
            miningPower: current.miningPower,
            activeMiningNodes: current.activeMiningNodes,
            isMining: current.isMining,
            miningYield: current.miningYield,
            nodeUpgradeCost: current.nodeUpgradeCost,
            activeView: current.currentView,
            status: 'ACTIVE'
          })
        });
        const data = await res.json();
        if (data && data.success && data.global) {
          setTotalViews(data.global.totalViews);
          setUniqueVisitors(data.global.uniqueVisitors);
          setActiveTrafficCount(data.global.activeTrafficCount);
          setVisitorSessions(data.global.visitorSessions);
        }
      } catch (err) {
        console.error("Portal cloud synchronization failed:", err);
      }
    };

    performSync();

    const timer = setInterval(performSync, 4000);
    return () => clearInterval(timer);
  }, [anonymousId]);

  // Handle successful payments return URL and clean query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const sessionId = params.get('session_id');
    const mtx = params.get('mtx');
    
    if (paymentSuccess === 'true' && sessionId && mtx && user?.email) {
      const verifyCheckout = async () => {
        try {
          const res = await fetch('/api/payments/complete-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              email: user.email,
              mtxAmount: mtx
            })
          });
          const data = await res.json();
          if (data.success) {
            setWalletBalance(data.walletBalance);
            fetchUserStats(user.email);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error("Verification of purchase failed:", error);
        }
      };
      verifyCheckout();
    }
    
    // Check Stripe capability status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStripeStatus({ stripeConfigured: data.stripeConfigured, mode: data.mode });
      })
      .catch(() => {});
  }, [user?.email]);

  const fetchDriveFiles = async (token: string) => {
    setIsDriveLoading(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching drive files:', error);
    } finally {
      setIsDriveLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'DRIVE' && accessToken) {
      fetchDriveFiles(accessToken);
    }
  }, [currentView, accessToken]);

  const handleDriveSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsDriveAuth(false);
        fetchDriveFiles(result.accessToken);
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Drive sign-in error:', error);
    }
  };

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

  // Mining Logic
  useEffect(() => {
    if (isMining && activeMiningNodes > 0) {
      const interval = setInterval(() => {
        // Mining Yield: base rate * power * nodes
        const tickValue = (miningPower * activeMiningNodes * 0.0000001); 
        setMiningYield(prev => prev + tickValue);
        setLiveYield(prev => prev + tickValue);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMining, miningPower, activeMiningNodes]);



  const handleStartMining = () => {
    if (activeMiningNodes === 0 && walletBalance >= nodeUpgradeCost) {
      setWalletBalance(prev => prev - nodeUpgradeCost);
      setActiveMiningNodes(1);
      setMiningPower(15.5);
      setIsMining(true);
      setNodeUpgradeCost(prev => prev * 1.5);
    } else if (activeMiningNodes > 0) {
      setIsMining(!isMining);
    }
  };

  const handleUpgradeMining = () => {
    if (walletBalance >= nodeUpgradeCost) {
      setWalletBalance(prev => prev - nodeUpgradeCost);
      setActiveMiningNodes(prev => prev + 1);
      setMiningPower(prev => prev + 10.0); // Predictable, realistic +10 GH/s upgrade per unit
      setNodeUpgradeCost(prev => prev * 1.5);
    }
  };

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
    return months.map((month, idx) => {
      // Deterministic multiplier based on progressive indices (replicating realistic trajectory)
      const multiplier = 0.8 + (idx * 0.02) + (Math.sin(idx * 0.9) * 0.04);
      const val = totalValuation * multiplier;
      return {
        name: month,
        valuation: Math.floor(val),
        revenue: Math.floor(val * 0.00042)
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
  
  const handleBankTransfer = async () => {
    const totalToTransfer = walletBalance + availableBalance;
    const totalInTHB = totalToTransfer * MTX_TO_THB;
    
    if (totalInTHB >= MIN_WITHDRAWAL_THB && bankAccountNumber.length >= 10 && !isTransferringToBank) {
      setIsTransferringToBank(true);
      
      if (user?.email) {
        try {
          const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              amountMTX: totalToTransfer,
              amountTHB: totalInTHB,
              bank: selectedBank,
              accountNumber: bankAccountNumber
            })
          });
          const data = await response.json();
          if (data.success) {
            const fromAvailable = availableBalance;
            setWalletBalance(0);
            setWithdrawnAmount(prev => prev + fromAvailable);
            setBankBalance(data.bankBalance);
            setIsTransferringToBank(false);
            setShowBankTransferSuccess(true);
            setTimeout(() => setShowBankTransferSuccess(false), 4000);
            fetchUserStats(user.email);
          } else {
            alert(data.error || "Settle transaction failed");
            setIsTransferringToBank(false);
          }
        } catch (error) {
          console.error("Payout error:", error);
          setIsTransferringToBank(false);
        }
      } else {
        // Fallback for guest mode simulation
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
      }
    } else if (!isTransferringToBank) {
      setShouldShake(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const handleStripeDeposit = async () => {
    if (!user?.email) {
      alert("Please Sign In with Google before purchasing MTX tokens.");
      return;
    }
    const amountVal = Number(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsDepositing(true);
    try {
      const thbAmount = amountVal * MTX_TO_THB;
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          mtxAmount: amountVal,
          thbAmount: thbAmount
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.mode === 'LIVE' && data.url) {
          window.location.href = data.url;
        } else {
          setWalletBalance(data.walletBalance);
          fetchUserStats(user.email);
          alert(`[SANDBOX DEPOSIT SUCCESSFUL] Successfully bought ${amountVal} MTX with test transaction.`);
        }
      } else {
        alert(data.error || "Payment session initialization failed.");
      }
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setIsDepositing(false);
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
              <span className="hidden md:block text-[10px] uppercase font-bold opacity-30 tracking-widest mb-2">ระบบควบคุม</span>
              {[
                { id: 'LOG' as const, icon: Database, label: 'บันทึกทรัพย์สิน (Asset Log)' },
                { id: 'MANAGER' as const, icon: Cpu, label: 'ผู้จัดการโหนด (Node Manager)' },
                { id: 'MARKET' as const, icon: ShoppingCart, label: 'ตลาดซื้อขาย (Marketplace)' },
                { id: 'TREASURY' as const, icon: ShieldCheck, label: 'คลังส่วนกลาง (Treasury)' },
                { id: 'BANK' as const, icon: Landmark, label: 'ธนาคารเมทริกซ์ (Matrix Bank)' },
                { id: 'DRIVE' as const, icon: HardDrive, label: 'ไดรฟ์ข้อมูล (Matrix Drive)' },
                { id: 'PULSE' as const, icon: Activity, label: 'วิเคราะห์ทราฟฟิก (Network Pulse)' },
                { id: 'SECURITY' as const, icon: Lock, label: 'แกนความปลอดภัย (Security)' },
                { id: 'EQUILIBRIUM' as const, icon: Scale, label: 'สมดุลเมทริกซ์ 40/20' },
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
              <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest block mb-4">ระบบวินิจฉัยและสถิติ</span>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span>ภาระงานเซิร์ฟเวอร์ (Core Load)</span>
                    <span>42%</span>
                  </div>
                  <div className="h-0.5 w-full bg-emerald-950">
                    <div className="h-full bg-emerald-500/60 w-[42%]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span>การซิงก์หน่วยความจำ (Memory Sync)</span>
                    <span>88%</span>
                  </div>
                  <div className="h-0.5 w-full bg-emerald-950">
                    <div className="h-full bg-emerald-500/60 w-[88%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex justify-between text-[9px] opacity-60">
                    <span className="text-amber-500/60 font-black">ซิงค์กระทรวงการคลัง (MOF)</span>
                    <span className="text-amber-500/60">98.4%</span>
                  </div>
                  <div className="h-0.5 w-full bg-amber-950/20">
                    <div className="h-full bg-amber-500/40 w-[98.4%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                   <div className="flex justify-between text-[9px] opacity-60">
                     <span className="text-blue-500/60 font-black">เอไอเอส คลาวด์ (AIS-BANGKOK-1)</span>
                     <span className="text-blue-500/80 font-mono">ENCRYPTED</span>
                   </div>
                   <div className="h-0.5 w-full bg-blue-950/20 flex gap-0.5">
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 shadow-[0_0_8px_#3b82f6]" />
                     <div className="h-full bg-blue-500/60 w-1/4 animate-pulse shadow-[0_0_12px_#3b82f6]" />
                   </div>
                   <p className="text-[7px] text-blue-500/40 uppercase font-bold mt-1">ผู้ให้บริการ: AIS Business Cloud v4.2</p>
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
                        <span className="text-[9px] font-black uppercase tracking-widest">โฆษณาเครือข่าย (Ads)</span>
                     </div>
                     <span className="text-[8px] font-mono leading-none">{isMonetized ? 'กำลังทำงาน' : 'ปิด'}</span>
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
                             <div key={i} className="bg-emerald-500 w-full" style={{ height: `${((i * 13) % 90) + 10}%` }} />
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

                      {/* Nodal Mining Control Center */}
                      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                           <Cpu className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-2">Nodal Mining Center</p>
                        <div className="flex items-baseline gap-2 mb-4">
                           <p className={`text-2xl font-black ${isMining ? 'text-blue-300' : 'text-white/40'}`}>
                             {isMining ? miningPower.toFixed(1) : '0.0'}
                           </p>
                           <span className="text-[10px] font-bold text-blue-500/40 uppercase">GH/s Hashrate</span>
                        </div>

                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 border-l border-blue-500/30 pl-3">
                                 <span className="text-[8px] font-black uppercase text-blue-500/40 italic">Active Nodes</span>
                                 <p className="text-sm font-black text-blue-400">{activeMiningNodes} Units</p>
                              </div>
                              <div className="flex flex-col gap-1 border-l border-cyan-500/30 pl-3">
                                 <span className="text-[8px] font-black uppercase text-cyan-500/40 italic">Total Mined</span>
                                 <p className="text-sm font-black text-cyan-400">{miningYield.toLocaleString(undefined, { minimumFractionDigits: 4 })} MTX</p>
                              </div>
                           </div>

                           <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-blue-500/60">Node Efficiency</span>
                                <span className="text-[9px] font-mono text-blue-400">{isMining ? 'OPERATIONAL' : 'STANDBY'}</span>
                             </div>
                             <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: isMining ? '85%' : '0%' }}
                                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                             </div>
                           </div>

                           <div className="flex gap-2">
                              <button 
                                onClick={handleStartMining}
                                className={`flex-1 py-3 px-4 rounded-lg font-black text-[10px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 ${
                                   activeMiningNodes === 0 
                                     ? (walletBalance >= nodeUpgradeCost ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed')
                                     : (isMining ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                                }`}
                              >
                                {activeMiningNodes === 0 
                                  ? (walletBalance >= nodeUpgradeCost ? `Deploy Node (${nodeUpgradeCost.toFixed(2)} MTX)` : 'Insufficient MTX')
                                  : (isMining ? 'Stop Mining' : 'Start Mining')}
                              </button>
                              
                              {activeMiningNodes > 0 && (
                                <button 
                                  onClick={handleUpgradeMining}
                                  disabled={walletBalance < nodeUpgradeCost}
                                  className={`flex-1 py-3 px-4 rounded-lg font-black text-[10px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 ${
                                    walletBalance >= nodeUpgradeCost 
                                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black' 
                                      : 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                                  }`}
                                >
                                  Upgrade ({nodeUpgradeCost.toFixed(2)} MTX)
                                </button>
                              )}
                           </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded text-[8px] uppercase leading-relaxed text-blue-400/60 font-bold italic">
                           * การขุด (Mining) จะช่วยเพิ่มรายได้สะสมในส่วนของ Your Personal Yield โดยตรงตามกำลังประมวลผล (Hashrate)
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
                           <div key={i} className="flex-1 bg-emerald-500/20" style={{ height: `${20 + ((i * 13) % 7) * 10}%` }} />
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
                           <p className="text-[10px] opacity-40 uppercase">+15.26%</p>
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
                                 <div className={`p-2 rounded ${(asset.valuation % 2 === 0) ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
                                    {(asset.valuation % 2 === 0) ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
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
                                    <p className={`text-[9px] font-bold uppercase ${(asset.valuation % 2 === 0) ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>
                                       {(asset.valuation % 2 === 0) ? `+${((asset.yieldRate * 13) % 4 + 1.25).toFixed(2)}` : `-${((asset.yieldRate * 13) % 4 + 1.25).toFixed(2)}`}%
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
                               <span className="font-bold text-emerald-100">{(INITIAL_ASSETS[i+10].valuation * 0.9).toFixed(2)} MTX</span>
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

              {/* Two-Column Settle & Buy Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMN 1: Settlement & Bank Withdrawal (จ่ายเงินออก) */}
                <div className="p-8 border border-emerald-500/10 bg-black/40 rounded-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80 text-emerald-400">1. Settlement / Bank Transfer (ถอนเงินออกจริง)</h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <span className="text-[9px] font-bold text-emerald-400 opacity-60 uppercase">Gateway: BOT Thai Bank</span>
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
                           3. ระบบจะโอนเงินเข้าบัญชี <span className="text-white font-black">{selectedBank}</span> ของคุณโดยตรง
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
                          className="w-full bg-black/80 border border-emerald-500/30 rounded-lg py-4 px-5 text-xl font-mono text-emerald-300 placeholder:text-emerald-500/5 focus:outline-none focus:border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] transition-all font-black tracking-[0.2em]"
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

                    {/* Bank Selector */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'SCB', name: 'Siam Commercial', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5', active: 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
                        { id: 'KBANK', name: 'Kasikorn Bank', color: 'border-emerald-600/30 text-emerald-500 bg-emerald-600/5', active: 'bg-emerald-600/20 border-emerald-600 shadow-[0_0_15px_rgba(22,163,74,0.3)]' },
                        { id: 'BBL', name: 'Bangkok Bank', color: 'border-blue-700/30 text-blue-600 bg-blue-700/5', active: 'bg-blue-700/20 border-blue-700 shadow-[0_0_15px_rgba(29,78,216,0.3)]' },
                        { id: 'KRUNGTHAI', name: 'Krungthai Bank', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5', active: 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' }
                      ].map(bank => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`relative p-3 rounded-xl border flex items-center gap-3 transition-all group ${
                            selectedBank === bank.id 
                            ? bank.active
                            : 'bg-white/5 border-white/10 hover:border-white/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                          }`}
                        >
                          <Landmark className="w-5 h-5" />
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest">{bank.id}</p>
                            <p className="text-[7px] font-bold opacity-40 uppercase truncate max-w-[100px]">{bank.name}</p>
                          </div>
                          {selectedBank === bank.id && (
                            <div className="absolute top-1 right-1.5">
                               <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-emerald-500/10 space-y-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Exchange Rate Integration</p>
                      <div className="flex items-center justify-center gap-3 text-lg font-black mt-1">
                        <span className="text-blue-400">1 MTX</span>
                        <span className="text-emerald-500 opacity-20">{'='}</span>
                        <span className="text-emerald-500">{MTX_TO_THB} THB</span>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      animate={shouldShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={handleBankTransfer}
                      disabled={isTransferringToBank}
                      className={`w-full py-5 px-6 rounded-xl font-black text-xs tracking-[0.3em] uppercase transition-all flex flex-col items-center justify-center gap-1.5 ${
                        ((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && bankAccountNumber.length >= 10 && !isTransferringToBank
                        ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/5 text-white/20 border border-white/10'
                      }`}
                    >
                      {isTransferringToBank ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mb-0.5" />
                          <span className="animate-pulse text-[10px]">VERIFYING WITH {selectedBank}...</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4" />
                            <span>
                               {bankAccountNumber.length < 10 
                                  ? 'กรอกเลขบัญชี 10 หลัก' 
                                  : ((walletBalance + availableBalance) * MTX_TO_THB < MIN_WITHDRAWAL_THB)
                                     ? 'ยอดเงินไม่ถึงขั้นต่ำ'
                                     : `ยืนยันแลกเงินเข้า ${selectedBank}`}
                            </span>
                          </div>
                          {((walletBalance + availableBalance) * MTX_TO_THB >= MIN_WITHDRAWAL_THB) && (
                            <span className="text-[8px] font-bold opacity-60 italic normal-case">
                               ESTIMATED PAYOUT: { ((walletBalance + availableBalance) * MTX_TO_THB).toLocaleString(undefined, { maximumFractionDigits: 0 }) } บาท (THB)
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* COLUMN 2: Stripe Deposit (ชำระเงินเข้า / ซื้อ MTX) */}
                <div className="p-8 border border-blue-500/10 bg-black/40 rounded-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80 text-blue-400">2. Real Stripe Payment (ชำระเงินซื้อเหรียญ)</h3>
                      <div className="flex items-center gap-2 px-2.5 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                          {stripeStatus.stripeConfigured ? 'LIVE GATEWAY' : 'SANDBOX MODE'}
                        </span>
                      </div>
                    </div>

                    {/* Deposit Instructions Box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-blue-300">ซื้อกระแสไฟและทรัพยากรระบบ (Buy MTX)</h4>
                        <p className="text-[10px] text-blue-400/70 leading-relaxed font-sans mt-0.5">
                           ซื้อโทเค็น <span className="text-white font-bold">MTX</span> ดั้งเดิมเพื่อนำไปใช้อัปเกรด Deploy Mining Nodes ขยายกำลังการทวีคูณผลตอบแทนรายชั่วโมงได้อย่างง่ายดาย
                        </p>
                      </div>
                    </div>

                    {/* Purchase Amount Selection list */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 block flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Select MTX Token Quantity (เลือกจำนวนที่ต้องการซื้อ)
                      </label>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {['5', '10', '50', '100'].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            className={`p-3 rounded-lg border font-mono font-black text-center text-xs transition-all ${
                              depositAmount === amt
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            {amt} MTX
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="relative mt-2">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Or enter custom amount..."
                          className="w-full bg-black/80 border border-blue-500/30 rounded-lg py-3 px-4 text-sm font-mono text-blue-300 focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-blue-500/10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-blue-500/50 uppercase">Matrix Code</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-blue-500/10 space-y-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg text-center">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Pricing Verification (THB / Cents)</p>
                      <div className="flex items-center justify-center gap-1.5 text-lg font-black mt-1">
                        <span className="text-white">{(Number(depositAmount) || 0).toLocaleString()} MTX</span>
                        <span className="text-blue-500 opacity-20">{'≈'}</span>
                        <span className="text-blue-400">{((Number(depositAmount) || 0) * MTX_TO_THB).toLocaleString(undefined, { maximumFractionDigits: 1 })} THB</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStripeDeposit}
                      disabled={isDepositing || !user}
                      className={`w-full py-5 px-6 rounded-xl font-black text-xs tracking-[0.3em] uppercase transition-all flex flex-col items-center justify-center gap-1.5 ${
                        user && !isDepositing
                        ? 'bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      {isDepositing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-0.5" />
                          <span className="animate-pulse">REDIRECTING TO SECURE STRIPE GATEWAY...</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            <span>{user ? `ชำระเงินจริง THB (Stripe)` : `Sign-in required to Buy`}</span>
                          </div>
                          {user && (
                            <span className="text-[8px] font-bold opacity-60 italic normal-case">
                              Fulfill Checkout Protocol ({((Number(depositAmount) || 0) * MTX_TO_THB).toLocaleString(undefined, { maximumFractionDigits: 0 })} บาท)
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* SECTION: Persistent Transaction History (ประวัติตุรกรรมเครือข่าย) */}
              <div className="p-8 border border-emerald-500/10 bg-black/40 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-emerald-400" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-emerald-100">Secure Database Transaction Ledger (บันทึกรายธุรกรรมจริง)</h4>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-500/40 uppercase bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded">
                     Real-time sync active
                  </span>
                </div>

                <div className="overflow-x-auto min-h-[140px] max-h-[300px] overflow-y-auto border border-emerald-500/5 rounded-lg">
                  {serverTransactions && serverTransactions.length > 0 ? (
                    <table className="w-full text-left font-mono text-[10px]">
                      <thead>
                        <tr className="bg-emerald-500/5 text-emerald-400/50 uppercase border-b border-emerald-500/10 font-bold">
                          <th className="py-3 px-4">TRANSACTION_ID</th>
                          <th className="py-3 px-4">METHOD</th>
                          <th className="py-3 px-4">TYPE</th>
                          <th className="py-3 px-4 animate-pulse">SETTLED VALUE</th>
                          <th className="py-3 px-4">GATEWAY</th>
                          <th className="py-3 px-4">STATUS</th>
                          <th className="py-3 px-4 text-right">TIMESTAMP (UTC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/5">
                        {serverTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-emerald-500/5 text-slate-300 transition-colors">
                            <td className="py-3 px-4 font-bold text-white leading-none">
                              {tx.id}
                              {tx.stripeSessionId && (
                                <span className="block text-[7px] text-blue-400 mt-1 uppercase font-black tracking-widest">
                                  Stripe Callback Linked
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 uppercase font-bold text-emerald-400/80">
                              {tx.type}
                            </td>
                            <td className="py-3 px-4 max-w-[200px] truncate uppercase font-bold opacity-75">
                              {tx.type === 'WITHDRAWAL' ? tx.bank : 'Stripe Visa/Mastercard'}
                              {tx.accountNumber && (
                                <span className="block text-[8px] opacity-40 font-mono mt-0.5 font-bold">
                                  {tx.accountNumber.slice(0,3)}-X-X-{tx.accountNumber.slice(-3)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-black text-white">
                              {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.currency}
                              <span className="block text-[8px] text-emerald-500 font-bold opacity-60 mt-0.5">
                                {tx.type === 'DEPOSIT' 
                                  ? `+ ${(tx.amount / MTX_TO_THB).toFixed(2)} MTX` 
                                  : `- ${(tx.amount / MTX_TO_THB).toFixed(2)} MTX`
                                }
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                tx.isReal 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {tx.isReal ? 'STRIPE' : 'LOCAL_SANDBOX'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`flex items-center gap-1.5 font-black uppercase text-[9px] ${
                                tx.status === 'COMPLETED' ? 'text-emerald-400 drop-shadow-[0_0_5px_#10b981]' :
                                tx.status === 'PENDING' ? 'text-amber-400 animate-pulse' : 'text-rose-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  tx.status === 'COMPLETED' ? 'bg-emerald-500' :
                                  tx.status === 'PENDING' ? 'bg-amber-500 animate-ping' : 'bg-rose-500'
                                }`} />
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-500 font-bold">
                              {new Date(tx.timestamp).toLocaleString('en-US', { hour12: false })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-emerald-500/20 gap-2">
                      <AlertCircle className="w-8 h-8 opacity-25" />
                      <p className="text-[10px] uppercase font-bold tracking-widest">No matching database ledger entries</p>
                      <p className="text-[8px] opacity-50 uppercase tracking-tighter">Sign-in and complete checkout or bank withdrawals to register logs</p>
                    </div>
                  )}
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
                   <p>* Webhooks are established with global card operators to complete checkout validations instantly.</p>
                   <p>* All transactions are strictly monitored by the Ministry of Finance (MOF) for matrix stability.</p>
                </div>
              </div>
            </div>
          ) : currentView === 'DRIVE' ? (
            <div className="p-8 space-y-8 overflow-auto flex-1 bg-gradient-to-br from-emerald-950/10 to-transparent">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <HardDrive className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest text-blue-300">Matrix Drive Storage</h2>
                  <p className="text-[10px] opacity-40 uppercase">Secured Google Drive Integration & File Repository</p>
                </div>
                <div className="ml-auto">
                   {user && (
                     <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
                       <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-blue-300 uppercase">{user.displayName || 'Matrix Agent'}</span>
                         <span className="text-[8px] opacity-50 uppercase tracking-tighter">{user.email}</span>
                       </div>
                       <img src={user.photoURL || ''} alt="avatar" className="w-8 h-8 rounded-full border border-blue-400" referrerPolicy="no-referrer" />
                       <button 
                        onClick={() => { logout(); setUser(null); setAccessToken(null); setNeedsDriveAuth(true); }}
                        className="text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase border-l border-blue-500/20 ml-2 pl-3"
                       >
                         Disconnect
                       </button>
                     </div>
                   )}
                </div>
              </div>

              {needsDriveAuth ? (
                <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <div className="p-8 border border-blue-500/20 bg-blue-950/10 rounded-2xl text-center max-w-md space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                    <div className="p-4 bg-blue-500/10 rounded-full inline-block">
                       <Lock className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-lg font-black uppercase text-blue-300">Access Restricted</h3>
                       <p className="text-[11px] text-blue-400/60 leading-relaxed font-sans uppercase">
                         Connect your Matrix Identity with Google Drive to access encrypted nodal documentation and protocol files.
                       </p>
                    </div>
                    
                    <button 
                      onClick={handleDriveSignIn}
                      className="gsi-material-button w-full"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">Sign in with Google</span>
                        <span style={{ display: 'none' }}>Sign in with Google</span>
                      </div>
                    </button>
                    <p className="text-[9px] text-blue-500/30 uppercase italic">
                       * Handled via Firebase Auth Protocol 4.1
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl relative overflow-hidden group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60">Connected Account</span>
                        <p className="text-xl font-black text-white mt-2 truncate">{user?.displayName || 'Authorized'}</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">{user?.email}</p>
                     </div>
                     <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl relative overflow-hidden group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60">Protocol Level</span>
                        <p className="text-xl font-black text-white mt-2">METADATA_READ</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">Status: Verified</p>
                     </div>
                     <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl relative overflow-hidden group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 opacity-60">Drive Buffer</span>
                        <p className="text-xl font-black text-white mt-2">{isDriveLoading ? 'SCANNING...' : `${driveFiles.length} OBJECTS`}</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">Snapshot: 1.0s ago</p>
                     </div>
                     <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                           <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-60">Security Token</span>
                        <p className="text-xl font-black text-white mt-2">v3_DRIVE_OK</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">Source: AIS_CLOUD</p>
                     </div>
                  </div>

                  <div className="border border-blue-500/10 rounded-xl overflow-hidden bg-black/40">
                    <div className="px-6 py-4 border-b border-blue-500/10 flex items-center justify-between">
                       <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">Remote Data Buffer (v3 API)</h3>
                       <button 
                        onClick={() => accessToken && fetchDriveFiles(accessToken)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                       >
                         <RefreshCw className={`w-4 h-4 ${isDriveLoading ? 'animate-spin' : ''}`} />
                       </button>
                    </div>
                    
                    <div className="p-2">
                       {isDriveLoading ? (
                         <div className="py-20 flex flex-col items-center justify-center gap-4 text-blue-500/40">
                            <RefreshCw className="w-12 h-12 animate-spin opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Google Cloud Infrastructure...</p>
                         </div>
                       ) : driveFiles.length > 0 ? (
                         <table className="w-full text-left border-collapse">
                           <thead>
                             <tr className="bg-blue-500/5 border-b border-blue-500/10">
                               <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-blue-300">File Name</th>
                               <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-blue-300">MIME Type</th>
                               <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-blue-300">Modified</th>
                               <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-blue-300 text-right">Reference</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-blue-500/5">
                             {driveFiles.map((file) => (
                               <tr key={file.id} className="hover:bg-blue-500/5 transition-colors group">
                                 <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-blue-400 opacity-60" />
                                      <span className="text-[11px] font-bold text-blue-100 uppercase truncate max-w-[300px]">{file.name}</span>
                                   </div>
                                 </td>
                                 <td className="px-6 py-4">
                                   <span className="text-[9px] font-mono text-blue-500/60 truncate max-w-[150px] inline-block">{file.mimeType}</span>
                                 </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[9px] font-bold opacity-30 uppercase">{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <a 
                                     href={file.webViewLink} 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="p-2 text-blue-500/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all inline-block"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center gap-4 text-blue-500/40">
                             <Info className="w-12 h-12 opacity-20" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-center">
                               Buffer empty. No protocol files detected in root directory.<br/>
                               <span className="opacity-50 mt-1 inline-block">MIME: application/vnd.google-apps.*</span>
                             </p>
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
               )}
             </div>
           ) : currentView === 'PULSE' ? (
             <div className="p-8 space-y-8 overflow-auto flex-1 bg-gradient-to-br from-indigo-950/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-indigo-300">ระบบวิเคราะห์ทราฟฟิกโหนด (Nodal Traffic Analyzer)</h2>
                    <p className="text-[10px] opacity-40 uppercase">ระบบความเคลื่อนไหวผู้เข้าชมเว็บ & การตรวจสอบการเชื่อมต่อขาเข้าแบบเรียลไทม์</p>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                     <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                     สัญญาณทราฟฟิกเสถียร (SIGNAL OK)
                  </span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Eye className="w-8 h-8 text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/70">การเข้าชมทั้งหมด (Hits)</span>
                    <p className="text-2xl font-black text-white mt-1">{totalViews.toLocaleString()}</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">ยอดรวมคำร้องขอสิทธิ์เชื่อมต่อเว็บบอร์ด</p>
                 </div>

                 <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/70">ยอดผู้เข้าชมที่ไม่ซ้ำ (Unique)</span>
                    <p className="text-2xl font-black text-white mt-1">{uniqueVisitors.toLocaleString()}</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">จำนวนคีย์ตรวจสอบโหนดคอมพิวเตอร์ที่ลงทะเบียน</p>
                 </div>

                 <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                    <div className="absolute top-1.5 right-1.5">
                       <span className="flex h-2 w-2 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </span>
                    </div>
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Activity className="w-8 h-8 text-emerald-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/70">โหนดออนไลน์ปัจจุบัน</span>
                    <p className="text-2xl font-black text-emerald-300 mt-1">{activeTrafficCount}</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">ช่องสัญญาณเครือข่ายสตรีมมิ่งที่กำลังเชื่อมต่อสด</p>
                 </div>

                 <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Globe className="w-8 h-8 text-purple-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/70">IP ประจำโหนดของคุณ</span>
                    <p className="text-xl font-black text-white mt-1.5 truncate">124.120.48.92</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">ตำแหน่ง: กรุงเทพมหานคร, ไทย (โหนดส่วนกลาง)</p>
                 </div>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Active Visitors Map & List */}
                <div className="col-span-1 lg:col-span-2 border border-indigo-500/10 rounded-xl overflow-hidden bg-black/40 shadow-[0_0_25px_rgba(0,0,0,0.3)]">
                  <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between bg-indigo-950/10">
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">ทะเบียนสถิติโหนดที่กำลังสื่อสารทั่วโลก</h3>
                     </div>
                     <span className="text-[9px] font-mono text-indigo-500/60 uppercase">สถานะภาพรวม API: กำลังทำงาน</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-indigo-500/5 border-b border-indigo-500/10">
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider opacity-40 font-bold text-indigo-300">รหัสยืนยันโหนด (Identifier)</th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider opacity-40 font-bold text-indigo-300">ที่ตั้งทางภูมิศาสตร์</th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider opacity-40 font-bold text-indigo-300">โมดูลที่เข้าใช้</th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider opacity-40 font-bold text-indigo-300">ความหน่วงเครือข่าย</th>
                          <th className="px-5 py-3.5 text-[10px] uppercase tracking-wider opacity-40 font-bold text-indigo-300 text-right">สถานะกิจกรรม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-500/5">
                        {/* Always prepend user session as the active director node */}
                        <tr className="bg-emerald-500/5 border-l-2 border-emerald-500 transition-colors">
                           <td className="px-5 py-3.5">
                             <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-bold text-emerald-300 uppercase">node_director_0x12 (คุณ)</span>
                                   <span className="text-[8px] font-mono opacity-40">124.120.48.92</span>
                                </div>
                             </div>
                           </td>
                           <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                 <MapPin className="w-3 h-3 text-emerald-400/80" />
                                 <span className="text-[10px] font-bold text-emerald-200/90 tracking-wide uppercase">กรุงเทพฯ, ไทย</span>
                              </div>
                           </td>
                           <td className="px-5 py-3.5">
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                                 วิเคราะห์ทราฟฟิก
                              </span>
                           </td>
                           <td className="px-5 py-3.5">
                              <span className="text-[10px] font-mono font-bold text-emerald-400">12ms (คู่สายส่วนตัว)</span>
                           </td>
                           <td className="px-5 py-3.5 text-right">
                              <span className="inline-block px-1.5 py-0.5 text-[8px] uppercase font-black tracking-widest bg-emerald-500 text-black rounded animate-pulse">
                                 ผู้สั่งการหลัก
                              </span>
                           </td>
                        </tr>

                        {visitorSessions.map((session) => (
                          <tr key={session.id} className="hover:bg-indigo-500/5 transition-colors group">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-indigo-100 uppercase group-hover:text-indigo-300 transition-colors">{session.id}</span>
                                    <span className="text-[8px] font-mono text-indigo-400/40">{session.ip} • {session.device}</span>
                                 </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                               <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-indigo-400 opacity-60" />
                                  <span className="text-[10px] opacity-80 uppercase font-medium">{session.location === 'Bangkok, TH' ? 'กรุงเทพฯ, ไทย' : session.location === 'Chiang Mai, TH' ? 'เชียงใหม่, ไทย' : session.location === 'Frankfurt, DE' ? 'แฟรงก์เฟิร์ต, เยอรมนี' : session.location === 'Chonburi, TH' ? 'ชลบุรี, ไทย' : session.location === 'California, US' ? 'แคลิฟอร์เนีย, สหรัฐฯ' : session.location === 'Singapore, SG' ? 'สิงคโปร์' : session.location === 'Tokyo, JP' ? 'โตเกียว, ญี่ปุ่น' : 'ขอนแก่น, ไทย'}</span>
                               </div>
                            </td>
                            <td className="px-5 py-3.5">
                               <span className="text-[9px] font-mono opacity-70 uppercase tracking-tighter font-semibold">
                                 {session.activeView === 'Asset Log' ? 'บันทึกสินทรัพย์' : session.activeView === 'Node Manager' ? 'ตัวจัดการโหนด' : session.activeView === 'Marketplace' ? 'ตลาดซื้อขาย' : session.activeView === 'Treasury' ? 'คลังส่วนกลาง' : session.activeView === 'Matrix Bank' ? 'ธนาคารเมทริกซ์' : session.activeView === 'Matrix Drive' ? 'ไดรฟ์เก็บข้อมูล' : session.activeView === 'Network Pulse' ? 'ชีพจรเครือข่าย' : 'แกนความปลอดภัย'}
                               </span>
                            </td>
                            <td className="px-5 py-3.5">
                               <span className={`text-[10px] font-mono ${
                                  session.latency < 60 ? 'text-emerald-400' : session.latency < 110 ? 'text-cyan-400' : 'text-amber-400/80'
                               }`}>{session.latency}ms</span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                               <span className={`inline-block px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-widest ${
                                 session.status === 'ACTIVE' 
                                   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                   : session.status === 'ACTION'
                                     ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                                     : 'bg-white/5 text-white/30'
                               }`}>
                                 {session.status === 'ACTIVE' ? 'เชื่อมต่อแล้ว' : session.status === 'ACTION' ? 'ทำกิจกรรม' : 'สแตนด์บาย'}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 bg-indigo-500/5 border-t border-indigo-500/10 text-[9px] font-bold uppercase text-indigo-400/60 leading-relaxed font-sans">
                     * ระบบตรวจสอบความเคลื่อนไหวระบุตำแหน่งและสิทธิ์ผ่าน Matrix Nodal Protocol - แสดงผลการเข้าชมและขุดแบบเรียลไทม์
                  </div>
                </div>

                {/* Live Activity Logs Console Block */}
                <div className="col-span-1 border border-indigo-500/10 rounded-xl overflow-hidden bg-black/60 flex flex-col h-[520px] shadow-[0_0_25px_rgba(0,0,0,0.3)]">
                  <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between bg-indigo-950/10">
                     <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">บันทึกกิจกรรมทราฟฟิก (Live Logs)</h3>
                     </div>
                     <span className="text-[8px] animate-pulse text-indigo-400 font-bold uppercase tracking-wider">เชื่อมต่อสตรีม</span>
                  </div>

                  <div className="p-4 flex-1 overflow-auto font-mono text-[10px] space-y-2.5 scrollbar-hide">
                     <div className="text-emerald-400/50 flex gap-2">
                        <span>[{new Date().toLocaleTimeString()}]</span>
                        <span className="font-bold">STATUS_INIT</span>
                        <span>ยืนยันผู้ใช้งานโหนดส่วนกลางและเปิดทำงานจากจังหวัด กรุงเทพมหานคร (คู่สาย 124.120.48.92)...</span>
                     </div>
                     
                     {visitorSessions.map((session, i) => (
                       <div key={i} className="text-indigo-300/80 flex gap-2 leading-relaxed text-[10px]">
                          <span className="text-indigo-500/40">[{new Date(Date.now() - i * 11000).toLocaleTimeString()}]</span>
                          <span className={`${session.status === 'ACTION' ? 'text-cyan-400' : 'text-indigo-400'} font-bold`}>
                             {session.status === 'ACTION' ? 'ดำเนินการ_คำขอ' : 'สัญญาณ_เชื่อมต่อ'}
                          </span>
                          <span className="whitespace-pre-wrap">
                             โหนด {session.id} ({session.location === 'Bangkok, TH' ? 'กรุงเทพฯ, ไทย' : session.location === 'Chiang Mai, TH' ? 'เชียงใหม่, ไทย' : session.location === 'Frankfurt, DE' ? 'แฟรงก์เฟิร์ต, เยอรมนี' : session.location === 'Chonburi, TH' ? 'ชลบุรี, ไทย' : session.location === 'California, US' ? 'แคลิฟอร์เนีย, สหรัฐฯ' : session.location === 'Singapore, SG' ? 'สิงคโปร์' : session.location === 'Tokyo, JP' ? 'โตเกียว, ญี่ปุ่น' : 'ขอนแก่น, ไทย'}) {session.status === 'ACTION' ? 'ทำการเรียกอัปเดตโมดูล' : 'ยิงวิเคราะห์ความหน่วงเครือข่ายไปยัง'} /{session.activeView.toLowerCase().replace(' ', '_')}
                          </span>
                       </div>
                     ))}
                     
                     <div className="pt-2 animate-pulse text-indigo-500 font-bold">_ กำลังเฝ้าฟังการสตรีมคำสั่งและสัญญาณพิงอย่างต่อเนื่อง_...</div>
                  </div>
                </div>
                
              </div>
            </div>
          ) : currentView === 'EQUILIBRIUM' ? (
            <div id="equilibrium-screen" className="p-8 space-y-8 flex-1 overflow-auto bg-gradient-to-br from-amber-950/10 via-black to-emerald-950/10">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-amber-500/10 pb-6">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
                     <Scale className="w-6 h-6 text-amber-500" />
                   </div>
                   <div>
                     <h2 id="equilibrium-title" className="text-xl font-black uppercase tracking-widest text-amber-400">ระบบสมดุลเมทริกซ์ 40/20 (Matrix 40/20 Equilibrium Controller)</h2>
                     <p className="text-[10px] opacity-60 uppercase tracking-wider text-emerald-400">ทฤษฎีสมดุลโครงสร้างเมทริกซ์สัญจร 4 ระดับ โดย Keiyrtiphumi (Vector Sum Zero Regulator)</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   {isEquilibriumSolved ? (
                     <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/20 border border-amber-500/50 text-[10px] text-amber-300 font-black uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                       <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                       สมดุลสมบูรณ์แบบ (VECTOR SUM ZERO)
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                       <span className="w-2 h-2 rounded-full bg-rose-500" />
                       ระบบไม่เสถียร (UNBALANCED DRIFT)
                     </span>
                   )}
                 </div>
               </div>

               {/* Universal Law Formula Display Card */}
               <div id="equilibrium-summary-card" className="p-6 border border-amber-500/20 bg-amber-950/5 rounded-xl space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-amber-200">กฎเวกเตอร์ผลรวมสมบูรณ์สากล (Universal Balance Formula)</h3>
                     <span className="text-[8px] font-mono px-2 py-0.5 rounded border border-amber-500/20 text-amber-400 bg-amber-500/5">DNA REF: v4lgx_matrix_eq</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-2">
                     <div className="p-4 bg-black/40 border border-emerald-500/10 rounded-lg text-center">
                        <p className="text-[9px] font-black uppercase opacity-40">ชั้นที่ 1: CORE (แกนนิ่ง)</p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">0</p>
                        <p className="text-[8px] opacity-45 uppercase mt-1">The Critical Singularity</p>
                     </div>
                     <div className="p-4 bg-black/40 border border-emerald-500/10 rounded-lg text-center">
                        <p className="text-[9px] font-black uppercase opacity-40">ชั้นที่ 2: PILLARS (เสาโครงหลัก)</p>
                        <p className="text-2xl font-black text-amber-400 mt-1">10</p>
                        <p className="text-[8px] opacity-45 uppercase mt-1">Directional Force</p>
                     </div>
                     <div className="p-4 bg-black/40 border border-emerald-500/10 rounded-lg text-center">
                        <p className="text-[9px] font-black uppercase opacity-40">ชั้นที่ 3: NETWORK (ทางผ่านเครือข่าย)</p>
                        <p className="text-2xl font-black text-cyan-400 mt-1">40</p>
                        <p className="text-[8px] opacity-45 uppercase mt-1">Flow & Connectivity</p>
                     </div>
                     <div className="p-4 bg-black/40 border border-emerald-500/10 rounded-lg text-center">
                        <p className="text-[9px] font-black uppercase opacity-40">ชั้นที่ 4: RING (วงกรอบควบคุม)</p>
                        <p className="text-2xl font-black text-purple-400 mt-1">120</p>
                        <p className="text-[8px] opacity-45 uppercase mt-1">Boundary Constraint</p>
                     </div>
                  </div>

                  <div className="bg-black/80 border border-amber-500/25 p-4 rounded-lg font-mono text-center flex flex-col justify-center items-center gap-2">
                     <div className="text-[12px] text-amber-300 font-bold uppercase tracking-wider">
                        สูตรคํานวณหาความต่างเวกเตอร์สิทธิ์:
                     </div>
                     <div className="text-sm md:text-lg font-black text-white py-1 text-center font-mono">
                        Vector Sum = (Actual_Core - 0) + (Actual_Pillars - 10) + (Actual_Network - 40) + (Actual_Ring - 120)
                     </div>
                     <div className="text-xs text-emerald-400">
                        สถานะความเสถียรต้องเท่ากับ <span className="underline font-black font-mono">0</span> เท่านั้น ถึงจะเรียกขานเป็นระบบสมดุลสมบูรณ์แบบ
                     </div>
                  </div>
               </div>

               {/* Interactive Tuning Panel */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Calibration Deck */}
                  <div className="lg:col-span-7 p-6 border border-emerald-500/10 bg-black/40 rounded-xl space-y-6">
                     <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                        <div className="flex items-center gap-2">
                           <Cpu className="w-4 h-4 text-emerald-400" />
                           <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-100">แผงควบคุมระดับเวกเตอร์ปรับตามจริง (Manual Vector Deck)</h4>
                        </div>
                        <button
                           id="eq-solve-btn"
                           onClick={() => {
                              if (isSolvingEq) return;
                              setIsSolvingEq(true);
                              let step = 0;
                              const interval = setInterval(() => {
                                 if (step === 0) {
                                    setEqCore(0);
                                 } else if (step === 1) {
                                    setEqPillars(10);
                                 } else if (step === 2) {
                                    setEqNetwork(40);
                                 } else if (step === 3) {
                                    setEqRing(120);
                                    setIsSolvingEq(false);
                                    clearInterval(interval);
                                 }
                                 step++;
                              }, 350);
                           }}
                           disabled={isSolvingEq}
                           className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase rounded hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5 disabled:opacity-50"
                        >
                           {isSolvingEq ? (
                              <>
                                 <RefreshCw className="w-3 h-3 animate-spin" />
                                 กําลังประมวลผล...
                              </>
                           ) : (
                              <>
                                 <Zap className="w-3 h-3" />
                                 ปรับระบบอัตโนมัติ (AUTO-STABILIZE)
                              </>
                           )}
                        </button>
                     </div>

                     <div className="space-y-6">
                        {/* Table 1 Slider */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-emerald-300">ชั้นที่ 1: CORE STABILIZER</span>
                              <span className="font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">จริง: {eqCore} / ควรเป็น: 0</span>
                           </div>
                           <input 
                              id="eq-slider-core"
                              type="range"
                              min="-20"
                              max="20"
                              step="1"
                              value={eqCore}
                              onChange={(e) => setEqCore(parseInt(e.target.value, 10))}
                              className="w-full accent-emerald-400 bg-neutral-800"
                           />
                           <p className="text-[8px] opacity-40 uppercase">ตัวแปรความสั่นพ้อง ณ จุดเอกฐาน Singularity กึ่งกลางศูนย์ถ่วงของโครงข่าย</p>
                        </div>

                        {/* Table 2 Slider */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-amber-300">ชั้นที่ 2: PILLARS STRUCTURAL CALIBRATOR</span>
                              <span className="font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">จริง: {eqPillars} / ควรเป็น: 10</span>
                           </div>
                           <input 
                              id="eq-slider-pillars"
                              type="range"
                              min="0"
                              max="30"
                              step="1"
                              value={eqPillars}
                              onChange={(e) => setEqPillars(parseInt(e.target.value, 10))}
                              className="w-full accent-amber-400 bg-neutral-800"
                           />
                           <p className="text-[8px] opacity-40 uppercase">ตัวค้ำรับโครงสร้างเสาแนวตั้ง ควบคุมอัตราแรงอัดประจุประสารภายใน</p>
                        </div>

                        {/* Table 3 Slider */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-cyan-300">ชั้นที่ 3: NETWORK ROUTE CONNECTIVITY</span>
                              <span className="font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">จริง: {eqNetwork} / ควรเป็น: 40</span>
                           </div>
                           <input 
                              id="eq-slider-network"
                              type="range"
                              min="20"
                              max="60"
                              step="1"
                              value={eqNetwork}
                              onChange={(e) => setEqNetwork(parseInt(e.target.value, 10))}
                              className="w-full accent-cyan-400 bg-neutral-800"
                           />
                           <p className="text-[8px] opacity-40 uppercase">ขนาดความหนาแน่นผู้ใช้งานโหนดและทราฟฟิกข้อมูลที่สตรีมมายังระบบ</p>
                        </div>

                        {/* Table 4 Slider */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-purple-300">ชั้นที่ 4: LIMITING CONTAINER RING</span>
                              <span className="font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">จริง: {eqRing} / ควรเป็น: 120</span>
                           </div>
                           <input 
                              id="eq-slider-ring"
                              type="range"
                              min="80"
                              max="160"
                              step="1"
                              value={eqRing}
                              onChange={(e) => setEqRing(parseInt(e.target.value, 10))}
                              className="w-full accent-purple-400 bg-neutral-800"
                           />
                           <p className="text-[8px] opacity-40 uppercase font-sans">ขอบเขตวงแหวนกักรังสี กรัพปริมณฑล และผนังความปลอดภัยของชั้นที่ปิดกั้น</p>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Calculations Console & Yield Status */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                     
                     {/* Calculator Terminal */}
                     <div className="p-6 border border-amber-500/10 bg-black/80 rounded-xl space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex items-center gap-2 mb-4 border-b border-emerald-500/10 pb-3">
                              <Terminal className="w-4 h-4 text-amber-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">ประมวลผลสมดุลแบบเรียบร้อย (Math Solver Engine)</span>
                           </div>

                           <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                              <div className="flex justify-between text-emerald-400">
                                 <span>CORE OFFSET:</span>
                                 <span>({eqCore} - 0) = {eqCore - 0}</span>
                              </div>
                              <div className="flex justify-between text-amber-400">
                                 <span>PILLARS OFFSET:</span>
                                 <span>({eqPillars} - 10) = {eqPillars - 10}</span>
                              </div>
                              <div className="flex justify-between text-cyan-400">
                                 <span>NETWORK OFFSET:</span>
                                 <span>({eqNetwork} - 40) = {eqNetwork - 40}</span>
                              </div>
                              <div className="flex justify-between text-purple-400">
                                 <span>RING OFFSET:</span>
                                 <span>({eqRing} - 120) = {eqRing - 120}</span>
                              </div>
                              
                              <div className="border-t border-dashed border-amber-500/20 pt-3 flex justify-between font-black text-white bg-amber-500/5 px-2 py-1.5 rounded text-xs">
                                 <span>VECTOR SUM TOTAL:</span>
                                 <span className={((eqCore - 0) + (eqPillars - 10) + (eqNetwork - 40) + (eqRing - 120) === 0) ? 'text-amber-400 animate-pulse' : 'text-rose-400'}>
                                    {(eqCore - 0) + (eqPillars - 10) + (eqNetwork - 40) + (eqRing - 120)}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Dynamics reactive instructions */}
                        <div id="eq-status-indicator" className="p-4 rounded-lg bg-black font-sans border border-emerald-500/15">
                           {isEquilibriumSolved ? (
                              <div className="space-y-2">
                                 <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">🟢 ประสบความสำเร็จ: ระบบสมดุลสถิต 40/20 เสถียรร้อยเปอร์เซ็นต์!</p>
                                 <p className="text-[9px] opacity-75 leading-relaxed text-emerald-400">
                                    ยินดีด้วย! คุณได้คลี่คลายความเคร้นและประจัดสมดุลค่าเชิงเวกเตอร์ของทั้ง 4 ระดับเป็นศูนย์ตามกฎจักรวาลวิทยากฎสมดุลของ Keiyrtiphumi ระบบดำเนินการเปิดใช้อัตราตัวคูณโบนัสขุดพิเศษสำเร็จ!
                                 </p>
                              </div>
                           ) : (
                              <div className="space-y-2">
                                 <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">⚠️ คำอธิบายสภาพการบิดเบี้ยวเวกเตอร์:</p>
                                 <p className="text-[10px] opacity-80 leading-relaxed text-neutral-300">
                                    {((eqCore - 0) + (eqPillars - 10) + (eqNetwork - 40) + (eqRing - 120) > 0) ? (
                                       <span><strong>แรงลัพธ์มีค่าเป็นบวก (Hyper-Expansion Boost):</strong> พลังงานสะสมส่วนตัวเกินปั๊มความกดอากาศและแรงส่งตึงเครียดมากเกินความเป็นสมดุลตามธรรมชาติ กรุณาเลื่อนแผงตระกูลสวิงลงมาด้านล่างเพื่อผ่อนคลายความขุ่นเคือง</span>
                                    ) : (
                                       <span><strong>แรงลัพธ์มีค่าเป็นลบ (Nodal Contraction Void):</strong> สภาพคอกที่อับเฉาขาดแคลนแรงแกนพาดประคองเสถียร ระบบสูญเสียสมดุลภายในแบบบ่วงสูญญากาศและลดประสิทธิภาพการทำงาน กรุณาเลื่อนตัวเพิ่มเพื่อชาร์จไฟหรือขยายขอบบ่วงวงโคจร</span>
                                    )}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Extra mining multiplier panel */}
                     <div className="p-6 border border-emerald-500/10 bg-black/40 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] uppercase font-bold opacity-45">สิทธิประโยชน์พิเศษสภาพสมดุล</span>
                           <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${isEquilibriumSolved ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-white/40'}`}>
                              {isEquilibriumSolved ? 'ACTIVE BOOST' : 'STANDBY'}
                           </span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`p-3 rounded-lg ${isEquilibriumSolved ? 'bg-amber-500/10 text-amber-400 animate-bounce' : 'bg-neutral-900 text-neutral-500'}`}>
                              <TrendingUp className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-xs font-bold uppercase text-white">40/20 Equilibrium Mining Multiplier</p>
                              <p className="text-[9px] opacity-50 uppercase mt-0.5">
                                 {isEquilibriumSolved ? 'ตัวคูณอัตรารางวัลขุดเพิ่มความเร็ว x1.4020 (กำลังทวีประสิทธิภาพ)' : 'ต้องการผลรวมเวกเตอร์ศูนย์ในการเริ่มใช้งานโบนัส'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
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
                            <div key={i} className="flex-1 bg-emerald-500/20 group hover:bg-emerald-500/40 cursor-help relative" style={{ height: `${((i * 17) % 75) + 15}%` }}>
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-emerald-500/30 px-2 py-0.5 text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                 {((i * 13) % 15) + 1} Attempts
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
          <a 
            href="/privacy.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-500/60 hover:text-emerald-400 transition-all underline underline-offset-4 decoration-emerald-500/20"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-500/60 hover:text-emerald-400 transition-all underline underline-offset-4 decoration-emerald-500/20"
          >
            Terms of Service
          </a>
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
                      0x{((user?.email || anonymousId) + "_identity_hash_node_safe").split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0).toString(16).padEnd(32, 'a').substring(0, 32).toUpperCase()}
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
