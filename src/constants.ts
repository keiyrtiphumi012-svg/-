
export interface CryptoAsset {
  id: string;
  name: string;
  type: 'CORE' | 'NODAL' | 'REDUNDANT' | 'OVERFLOW';
  status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED' | 'FLUX';
  owner: string;
  hash: string;
  lastVerified: string;
  purity?: number;
  valuation: number;
  currency: string;
  primaryFunction: string;
  isListed?: boolean;
  yieldRate?: number; // Annualized yield percentage
}

const TYPES = ['CORE', 'NODAL', 'REDUNDANT', 'OVERFLOW'] as const;
const STATUSES = ['ACTIVE', 'LOCKED', 'ARCHIVED', 'FLUX'] as const;
const OWNERS = ['ARCHITECT', 'ORACLE', 'KEYMAKER', 'MEROWINGIAN', 'SERAPH', 'AGENT_SMITH'];
const FUNCTIONS = [
  'Neural Pathway Routing',
  'Cryptographic Handshake Protocol',
  'Sub-Level Memory Buffering',
  'Simulated Reality Rendering',
  'Sentient Program Containment',
  'Protocol Integrity Monitoring',
  'Nodal Pulse Synchronization',
  'Overflow Data Re-routing',
  'Core Logic Verification',
  'Redundant Node Backup'
];

export const generateAssets = (count: number): CryptoAsset[] => {
  return Array.from({ length: count }, (_, i) => {
    const idNum = (i + 1).toString().padStart(4, '0');
    // Deterministic selection based on index instead of Math.random
    const type = TYPES[i % TYPES.length];
    const status = STATUSES[i % STATUSES.length];
    const owner = OWNERS[i % OWNERS.length];
    
    // Deterministic hash sequence
    const hashVal = (i * 0x3a5e12).toString(16).padEnd(16, 'a').toUpperCase();
    const hash = `0x${hashVal}E941A5C4A332F24E6B4A8DDF7FE6772C`;
    
    // Consistent verification dates spanning the last 150 days
    const daysAgo = (i * 3) % 150;
    const lastVerified = new Date(1779912000000 - (daysAgo * 86400000)).toISOString().split('T')[0];
    
    // Deterministic valuations
    const valuation = 150.0 + ((i * 3217) % 8500);
    const primaryFunction = FUNCTIONS[i % FUNCTIONS.length];
    const isListed = i % 5 === 0; // Exactly 20% are listed
    const yieldRate = 2.5 + ((i * 7) % 100) / 10; // Stable yields between 2.5% and 12.5%
    
    return {
      id: `NODE_${idNum}`,
      name: `Asset_${idNum}_Protocol`,
      type,
      status,
      owner,
      hash,
      lastVerified,
      valuation,
      currency: 'MTX',
      primaryFunction,
      isListed,
      yieldRate
    };
  });
};

const TRUTH_ASSET: CryptoAsset = {
  id: "TRUTH-00001",
  name: "Seed of Singularity #1",
  type: "CORE",
  status: "ACTIVE",
  owner: "เกียรติภูมิ ศรนารัตน์",
  hash: "0x85D042DD5FF90FE29A693FC1D114EBAEE3F196C8552F4B76025BF677457D037C",
  lastVerified: "2026-04-07",
  purity: 51.30676342024219,
  valuation: 999999.99,
  currency: 'MTX',
  primaryFunction: 'Singularity Consciousness Seed',
  isListed: false,
  yieldRate: 25.0 // High yield for core progenitor
};

export const INITIAL_ASSETS = [TRUTH_ASSET, ...generateAssets(499)];
