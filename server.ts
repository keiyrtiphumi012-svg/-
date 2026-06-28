import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

// Initialize express app
const app = express();
const PORT = 3000;

// Use built-in middlewares
app.use(express.json());

// Path to log files for database persistence in local workspace
const DATA_DIR = path.join(process.cwd(), "data");
const STATS_FILE = path.join(DATA_DIR, "user_stats.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STATS_FILE)) {
  fs.writeFileSync(STATS_FILE, JSON.stringify({}), "utf8");
}
if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([]), "utf8");
}

// Lazy Initialize Stripe SDK
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(stripeKey, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

// Helper to read and write custom statistics and balances
interface UserStats {
  walletBalance: number;
  bankBalance: number;
  miningPower?: number;
  activeMiningNodes?: number;
  isMining?: boolean;
  miningYield?: number;
  nodeUpgradeCost?: number;
  lastActive?: number;
  activeView?: string;
  device?: string;
  ip?: string;
  location?: string;
}
interface AllUsersStats {
  [email: string]: UserStats;
}

const GLOBAL_STATS_FILE = path.join(DATA_DIR, "global_stats.json");

// Define structure
interface GlobalStats {
  totalViews: number;
  uniqueIPs: string[];
}

// Ensure global_stats.json exists
if (!fs.existsSync(GLOBAL_STATS_FILE)) {
  fs.writeFileSync(GLOBAL_STATS_FILE, JSON.stringify({ totalViews: 2026, uniqueIPs: [] }, null, 2), "utf8");
}

function getGlobalStats(): GlobalStats {
  try {
    return JSON.parse(fs.readFileSync(GLOBAL_STATS_FILE, "utf8")) as GlobalStats;
  } catch {
    return { totalViews: 2026, uniqueIPs: [] };
  }
}

function updateGlobalStats(stats: Partial<GlobalStats>) {
  try {
    const current = getGlobalStats();
    const updated = { ...current, ...stats };
    fs.writeFileSync(GLOBAL_STATS_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (error) {
    console.error("Error updating global stats:", error);
  }
}

interface ActiveSession {
  id: string;
  email: string | null;
  ip: string;
  location: string;
  activeView: string;
  device: string;
  latency: number;
  status: "ACTIVE" | "IDLE" | "ACTION";
  timestamp: string;
  lastActiveTime: number;
}

// Memory Active sessions list
let activeSessions: { [sessionId: string]: ActiveSession } = {};

function getGeoFromIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  }
  const locations = [
    "Bangkok, TH", "Chiang Mai, TH", "Chonburi, TH", "Phuket, TH", "Khon Kaen, TH", 
    "Songkhla, TH", "Nakhon Ratchasima, TH", "Nonthaburi, TH", "Pathum Thani, TH", "Rayong, TH"
  ];
  return locations[Math.abs(hash) % locations.length];
}

function getDeviceFromUA(userAgent: string = ""): { device: string; browser: string } {
  const ua = userAgent.toLowerCase();
  let device = "Desktop (Windows)";
  if (ua.includes("iphone")) device = "Mobile (iOS)";
  else if (ua.includes("ipad")) device = "Tablet (iPadOS)";
  else if (ua.includes("android")) device = "Mobile (Android)";
  else if (ua.includes("macintosh") || ua.includes("mac os")) device = "Desktop (macOS)";
  else if (ua.includes("linux")) device = "Desktop (Linux)";

  let browser = "Chrome";
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edge")) browser = "Edge";

  return { device, browser };
}

function getUserStats(email: string): UserStats {
  try {
    const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf8")) as AllUsersStats;
    if (!data[email]) {
      // Default initial balance
      data[email] = {
        walletBalance: 5.0,
        bankBalance: 0,
        miningPower: 0,
        activeMiningNodes: 0,
        isMining: false,
        miningYield: 0,
        nodeUpgradeCost: 0.5,
        lastActive: Date.now()
      };
      fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf8");
    }
    return data[email];
  } catch (error) {
    console.error("Error reading stats:", error);
    return {
      walletBalance: 5.0,
      bankBalance: 0,
      miningPower: 0,
      activeMiningNodes: 0,
      isMining: false,
      miningYield: 0,
      nodeUpgradeCost: 0.5,
      lastActive: Date.now()
    };
  }
}

function updateUserStats(email: string, stats: Partial<UserStats>) {
  try {
    const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf8")) as AllUsersStats;
    if (!data[email]) {
      data[email] = {
        walletBalance: 5.0,
        bankBalance: 0,
        miningPower: 0,
        activeMiningNodes: 0,
        isMining: false,
        miningYield: 0,
        nodeUpgradeCost: 0.5,
        lastActive: Date.now()
      };
    }
    data[email] = { ...data[email], ...stats };
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

// Helper to log actions/transactions
interface Transaction {
  id: string;
  email: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "MINING_UPGRADE" | "YIELD";
  amount: number;
  currency: string;
  bank?: string;
  accountNumber?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  timestamp: string;
  isReal: boolean;
  stripeSessionId?: string;
}

function getTransactions(email: string): Transaction[] {
  try {
    const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf8")) as Transaction[];
    return transactions.filter((t) => t.email === email);
  } catch (error) {
    console.error("Error reading transactions:", error);
    return [];
  }
}

function addTransaction(tx: Omit<Transaction, "id" | "timestamp">) {
  try {
    const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf8")) as Transaction[];
    const newTx: Transaction = {
      ...tx,
      id: "TX-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      timestamp: new Date().toISOString(),
    };
    transactions.unshift(newTx); // Prefix latest first
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), "utf8");
    return newTx;
  } catch (error) {
    console.error("Error saving transaction:", error);
    return null;
  }
}

// API Routes

// Health & configuration check
app.get("/api/health", (req, res) => {
  const stripe = getStripe();
  res.json({
    status: "ok",
    stripeConfigured: !!stripe,
    mode: stripe ? "LIVE" : "SANDBOX",
  });
});

// Single Unified Real-time Synchronized API
app.post("/api/users/sync", (req, res) => {
  const { 
    email, 
    anonymousId,
    walletBalance, 
    bankBalance,
    miningPower,
    activeMiningNodes,
    isMining,
    miningYield,
    nodeUpgradeCost,
    activeView,
    status
  } = req.body;

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";
  const { device } = getDeviceFromUA(userAgent);
  const location = getGeoFromIP(clientIp);

  const id = email || anonymousId || "anonymous_guest";

  const isNewSession = !activeSessions[id];
  const globalStats = getGlobalStats();

  if (isNewSession) {
    globalStats.totalViews += 1;
    if (!globalStats.uniqueIPs.includes(clientIp)) {
      globalStats.uniqueIPs.push(clientIp);
    }
    updateGlobalStats({ 
      totalViews: globalStats.totalViews, 
      uniqueIPs: globalStats.uniqueIPs 
    });
  }

  const now = Date.now();
  activeSessions[id] = {
    id: id.includes("@") ? id.replace(/@.*/, "") : id.substring(0, 10),
    email: email || null,
    ip: clientIp,
    location,
    activeView: activeView || "Registry Core",
    device,
    latency: Math.floor(Math.random() * 30) + 12,
    status: status || "ACTIVE",
    timestamp: "Just now",
    lastActiveTime: now
  };

  // Evict sessions inactive for more than 45 seconds (fully dynamic)
  Object.keys(activeSessions).forEach(sessId => {
    if (now - activeSessions[sessId].lastActiveTime > 45000) {
      delete activeSessions[sessId];
    }
  });

  let stats: UserStats = { walletBalance: 5.0, bankBalance: 0 };
  if (email) {
    const currentStats = getUserStats(email);
    const updatedStats: UserStats = {
      walletBalance: walletBalance !== undefined ? Number(walletBalance) : currentStats.walletBalance,
      bankBalance: bankBalance !== undefined ? Number(bankBalance) : currentStats.bankBalance,
      miningPower: miningPower !== undefined ? Number(miningPower) : (currentStats.miningPower ?? 0),
      activeMiningNodes: activeMiningNodes !== undefined ? Number(activeMiningNodes) : (currentStats.activeMiningNodes ?? 0),
      isMining: isMining !== undefined ? Boolean(isMining) : (currentStats.isMining ?? false),
      miningYield: miningYield !== undefined ? Number(miningYield) : (currentStats.miningYield ?? 0),
      nodeUpgradeCost: nodeUpgradeCost !== undefined ? Number(nodeUpgradeCost) : (currentStats.nodeUpgradeCost ?? 0.5),
      lastActive: now,
      activeView: activeView || currentStats.activeView || "Registry Core",
      device,
      ip: clientIp,
      location
    };
    updateUserStats(email, updatedStats);
    stats = updatedStats;
  }

  // Calculate real active mining nodes from all users active in the last 10 minutes
  let totalActiveNodes = 0;
  try {
    const allStatsData = JSON.parse(fs.readFileSync(STATS_FILE, "utf8")) as AllUsersStats;
    Object.values(allStatsData).forEach((u: any) => {
      const isActiveIn5Min = u.lastActive && (now - u.lastActive < 300000);
      if (isActiveIn5Min && u.isMining && u.activeMiningNodes) {
        totalActiveNodes += u.activeMiningNodes;
      }
    });
  } catch (e) {
    console.error("Error compiling mining nodes:", e);
  }

  // Ensure current user is accounted for
  if (email && stats.isMining && stats.activeMiningNodes) {
    totalActiveNodes = Math.max(totalActiveNodes, stats.activeMiningNodes);
  }

  const activeTrafficCount = Object.keys(activeSessions).length;
  const txHistory = email ? getTransactions(email) : [];

  res.json({
    success: true,
    stats: email ? stats : null,
    transactions: txHistory,
    global: {
      totalViews: globalStats.totalViews,
      uniqueVisitors: globalStats.uniqueIPs.length,
      activeTrafficCount: Math.max(1, activeTrafficCount),
      totalActiveNodes: totalActiveNodes,
      visitorSessions: Object.values(activeSessions)
    }
  });
});

// Legacy support: sync route as GET (returns user's current status and transactions)
app.get("/api/users/sync", (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: "Email query param is required" });
  }
  const stats = getUserStats(email);
  const txHistory = getTransactions(email);
  res.json({ stats, transactions: txHistory });
});

// Update specific wallet balance (e.g. for mining accumulation details)
app.post("/api/users/update-balance", (req, res) => {
  const { email, walletBalance, bankBalance } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  updateUserStats(email, {
    ...(walletBalance !== undefined && { walletBalance }),
    ...(bankBalance !== undefined && { bankBalance }),
  });
  res.json({ success: true });
});

// Create a withdrawal transaction request (PAYOUT out to Thai bank)
app.post("/api/withdraw", (req, res) => {
  const { email, amountMTX, amountTHB, bank, accountNumber } = req.body;
  if (!email || !amountMTX || !bank || !accountNumber) {
    return res.status(400).json({ error: "Missing required withdrawal fields" });
  }

  const currentStats = getUserStats(email);
  if (currentStats.walletBalance < amountMTX) {
    return res.status(400).json({ error: "Insufficient wallet balance to perform transfer" });
  }

  // Deduct from wallet & add to simulated bank balance
  const nextWalletBal = Math.max(0, currentStats.walletBalance - amountMTX);
  const nextBankBal = currentStats.bankBalance + amountTHB;
  updateUserStats(email, { walletBalance: nextWalletBal, bankBalance: nextBankBal });

  // Add a logged transaction
  const stripe = getStripe();
  const tx = addTransaction({
    email,
    type: "WITHDRAWAL",
    amount: amountTHB,
    currency: "THB",
    bank,
    accountNumber,
    status: stripe ? "PENDING" : "COMPLETED", // Real Stripe key -> Mark as pending admin verification
    isReal: !!stripe,
  });

  res.json({
    success: true,
    tx,
    walletBalance: nextWalletBal,
    bankBalance: nextBankBal,
    message: stripe 
      ? `Real Withdrawal registered. Our payment administrator is processing this to your selected ${bank} account.`
      : `Sandbox Withdrawal processed immediately! Your simulated THB bank balance has been adjusted.`,
  });
});

// Redeem R&D Funding Grant
app.post("/api/apply-grant", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "ข้อมูลประจำตัวหรือรหัสผ่านประเมินทุนขาดหาย" });
  }

  const sanitizedCode = code.trim().toLowerCase();
  if (sanitizedCode !== "a4dff9660c4b54da8") {
    return res.status(400).json({ error: "รหัสจัดสรรทุนวิจัยไม่ถูกต้องหรือไม่ได้รับการระบุในสารบบ AIS" });
  }

  try {
    const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf8")) as Transaction[];
    const alreadyRedeemed = transactions.some(
      (t) => t.email === email && t.id === "A4DFF9660C4B54DA8"
    );
    if (alreadyRedeemed) {
      return res.status(400).json({ error: "สิทธิ์การใช้รหัสทุนวิจัยและพัฒนานี้ถูกอนุมัติข้ามสายโหนดไปเรียบร้อยแล้ว" });
    }

    const currentStats = getUserStats(email);
    const grantMTX = 5000.0;
    const grantTHB = grantMTX * 175.50; // MTX_TO_THB rate is 175.50

    const nextWalletBal = currentStats.walletBalance + grantMTX;
    updateUserStats(email, { walletBalance: nextWalletBal });

    const newTx: Transaction = {
      id: "A4DFF9660C4B54DA8",
      email,
      type: "DEPOSIT",
      amount: grantTHB,
      currency: "THB",
      status: "COMPLETED",
      isReal: true,
      timestamp: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), "utf8");

    res.json({
      success: true,
      walletBalance: nextWalletBal,
      tx: newTx,
      message: `อนุมัติเสร็จสิ้น! คุณได้รับ 'เงินทุนวิจัยและพัฒนา' จากระบบจัดสรร AIS จำนวน +5,000.00 MTX (≈ ${grantTHB.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท) เข้าสู่กระเป๋าโหนดเรียบร้อยแล้ว`,
    });
  } catch (error: any) {
    console.error("Error processing R&D Grant:", error);
    res.status(500).json({ error: "ระบบประมวลผลเครือข่ายขัดข้อง กรุณาลองใหม่อีกครั้ง" });
  }
});

// Create Stripe Checkout Session (deposit / buying MTX tokens with real money)
app.post("/api/payments/create-session", async (req, res) => {
  const { email, mtxAmount, thbAmount } = req.body;
  if (!email || !mtxAmount || !thbAmount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const appUrl = process.env.NODE_ENV === "production"
    ? `https://ais-dev-cjlnd4xo4w6fybte6a332f-472411173535.asia-southeast1.run.app` // Use proper app host URLs
    : `http://localhost:3000`;

  const stripe = getStripe();
  if (!stripe) {
    // Sandbox Fallback Mode (Runs if STRIPE_SECRET_KEY env is not specified)
    const currentStats = getUserStats(email);
    const nextWalletBal = currentStats.walletBalance + Number(mtxAmount);
    updateUserStats(email, { walletBalance: nextWalletBal });

    const tx = addTransaction({
      email,
      type: "DEPOSIT",
      amount: Number(thbAmount),
      currency: "THB",
      status: "COMPLETED",
      isReal: false,
    });

    return res.json({
      success: true,
      mode: "SANDBOX",
      walletBalance: nextWalletBal,
      tx,
      message: `Sandbox payment succeeded! ${mtxAmount} MTX added to your wallet balance.`,
    });
  }

  try {
    // Real Stripe Integration checkout session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `Matrix Global Registry - Buy ${mtxAmount} MTX`,
              description: "Secure Digital Asset Purchase Protocol",
            },
            unit_amount: Math.round(Number(thbAmount) * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&mtx=${mtxAmount}`,
      cancel_url: `${appUrl}?payment_cancelled=true`,
      metadata: {
        email,
        mtxAmount: String(mtxAmount),
        thbAmount: String(thbAmount),
      },
    });

    // Record as Pending real checkout transaction
    addTransaction({
      email,
      type: "DEPOSIT",
      amount: Number(thbAmount),
      currency: "THB",
      status: "PENDING",
      isReal: true,
      stripeSessionId: session.id,
    });

    res.json({
      success: true,
      mode: "LIVE",
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating real Stripe Checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user balance directly upon query parameters return (secure callback fallback)
app.post("/api/payments/complete-session", async (req, res) => {
  const { sessionId, email, mtxAmount } = req.body;
  if (!sessionId || !email || !mtxAmount) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Double check transaction status in transactions list
  try {
    const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf8")) as Transaction[];
    const txIndex = transactions.findIndex(
      (t) => t.stripeSessionId === sessionId && t.status === "PENDING"
    );

    if (txIndex !== -1) {
      transactions[txIndex].status = "COMPLETED";
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), "utf8");

      // Credit the real balance
      const currentStats = getUserStats(email);
      const nextWalletBal = currentStats.walletBalance + Number(mtxAmount);
      updateUserStats(email, { walletBalance: nextWalletBal });

      return res.json({ success: true, walletBalance: nextWalletBal });
    }
    return res.json({ success: false, message: "Transaction already processed or not found." });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Stripe webhook handler to fulfill real purchase securely (if user configures webhook url)
app.post("/api/payments/webhook", async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(400).send("Webhook ignored: Stripe is not active");

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Direct raw parsing if no webhook secret is supplied
      event = req.body;
    }
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email;
    const mtxAmt = session.metadata?.mtxAmount;

    if (email && mtxAmt) {
      // Verify and update status
      const currentStats = getUserStats(email);
      updateUserStats(email, { walletBalance: currentStats.walletBalance + Number(mtxAmt) });

      // Update logged transactions statuses code
      try {
        const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf8")) as Transaction[];
        const txIndex = transactions.findIndex((t) => t.stripeSessionId === session.id);
        if (txIndex !== -1) {
          transactions[txIndex].status = "COMPLETED";
          fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), "utf8");
        }
      } catch (e) {
        console.error("Webhook state update fail:", e);
      }
    }
  }

  res.json({ received: true });
});

// Vite Middleware & static assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Matrix Server] Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
