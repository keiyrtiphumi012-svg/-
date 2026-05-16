
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { CryptoAsset } from '../constants';

interface AssetLoreProps {
  asset: CryptoAsset;
}

export const AssetLore: React.FC<AssetLoreProps> = ({ asset }) => {
  const [lore, setLore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLore = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a high-level system architect in a cyberpunk "Matrix" like world. 
        Describe the lore and history of a digital asset called "${asset.name}" with ID "${asset.id}".
        The asset type is "${asset.type}", its primary function is "${asset.primaryFunction}", and it was last verified on "${asset.lastVerified}" by owner "${asset.owner}".
        Keep the tone technical, mysterious, and immersive. Limit the response to 2 sentences.`,
      });
      setLore(response.text || "History data corrupted. Access denied.");
    } catch (err) {
      console.error(err);
      setError("AI Nodal connection failed. Check neural link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4 border-t border-emerald-500/10 pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/30">Nodal History</span>
        </div>
        {!lore && !loading && (
          <button 
            onClick={generateLore}
            className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 text-[9px] uppercase font-bold text-emerald-400 group transition-all"
          >
            <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            Query Archive
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-4 text-emerald-500/40">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span className="text-[10px] uppercase font-bold animate-pulse">Decrypting history buffer...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-400/5 border border-red-400/20 rounded text-[10px] uppercase font-bold text-red-400">
          {error}
        </div>
      )}

      {lore && !loading && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded font-mono text-[11px] leading-relaxed italic text-emerald-500/70 border-l-2 border-l-emerald-500/40">
          "{lore}"
          <div className="mt-3 flex justify-end">
             <button 
               onClick={() => setLore(null)}
               className="text-[9px] uppercase font-bold opacity-30 hover:opacity-60 transition-opacity"
             >
               Clear Log
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
