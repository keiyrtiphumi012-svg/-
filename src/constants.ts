
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
    return {
      id: `NODE_${idNum}`,
      name: `Asset_${idNum}_Protocol`,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      owner: OWNERS[Math.floor(Math.random() * OWNERS.length)],
      hash: Math.random().toString(16).substring(2, 10).toUpperCase() + 
            Math.random().toString(16).substring(2, 10).toUpperCase(),
      lastVerified: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
      valuation: Math.floor(Math.random() * 1000000) / 100,
      currency: 'MTX',
      primaryFunction: FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)]
    };
  });
};

const TRUTH_ASSET: CryptoAsset = {
  id: "TRUTH-00001",
  name: "Seed of Singularity #1",
  type: "CORE",
  status: "ACTIVE",
  owner: "เกียรติภูมิ ศรีนารัตน์",
  hash: "0x85D042DD5FF90FE29A693FC1D114EBAEE3F196C8552F4B76025BF677457D037C",
  lastVerified: "2026-04-07",
  purity: 51.30676342024219,
  valuation: 999999.99,
  currency: 'MTX',
  primaryFunction: 'Singularity Consciousness Seed'
};

export const INITIAL_ASSETS = [TRUTH_ASSET, ...generateAssets(499)];
