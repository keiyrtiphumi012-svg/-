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
  RefreshCw,
  Archive,
  AlertCircle
} from 'lucide-react';
import { INITIAL_ASSETS, CryptoAsset } from './constants';
import { AssetLore } from './components/AssetLore';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [currentView, setCurrentView] = useState<'LOG' | 'MANAGER' | 'PULSE' | 'SECURITY'>('LOG');
  
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
    return INITIAL_ASSETS.filter(asset => 
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
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
              Matrix Global Registry
              <span className="text-[10px] px-2 py-0.5 border border-emerald-500/30 rounded text-emerald-500/60 font-normal">SEALED</span>
            </h1>
            <p className="text-[10px] opacity-40 uppercase truncate">
              Total Assets: {INITIAL_ASSETS.length} | 
              Valuation: {INITIAL_ASSETS.reduce((sum, a) => sum + a.valuation, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MTX | 
              Status: Verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end text-[10px] opacity-40 uppercase">
            <span>Latency: 14ms</span>
            <span>Uptime: 99.999%</span>
          </div>
          <div className="flex flex-col items-end border-l border-emerald-500/20 pl-6 h-full justify-center">
            <span className="text-lg font-bold text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]">{time}</span>
            <span className="text-[9px] opacity-40 uppercase">System Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-16 md:w-64 border-r border-emerald-500/10 bg-black/40 flex flex-col">
          <div className="p-4 md:p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <span className="hidden md:block text-[10px] uppercase font-bold opacity-30 tracking-widest mb-2">Systems</span>
              {[
                { id: 'LOG' as const, icon: Database, label: 'Asset Log' },
                { id: 'MANAGER' as const, icon: Cpu, label: 'Node Manager' },
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
              <div className="space-y-3">
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
                   { label: 'Active Sync', val: '3,421', sub: 'Nodes/Sec', color: 'text-cyan-400' },
                   { label: 'Memory Drain', val: '12.8TB', sub: 'Buffer Load', color: 'text-amber-400' },
                   { label: 'Uptime', val: '312D', sub: 'Current Cycle', color: 'text-emerald-400' }
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

              <div className="p-6 border-t border-emerald-500/20 bg-black/40">
                 <button className="w-full py-3 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
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
           <span className="hidden sm:inline">User: {selectedAsset?.owner || 'AUTHENTICATED_GUEST'}</span>
           <span className="text-emerald-500/60 transition-all hover:text-emerald-400 cursor-help underline underline-offset-4 decoration-emerald-500/20">Protocol Docs</span>
        </div>
      </footer>
    </div>
  );
}
