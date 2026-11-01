// The original domain engine and validators remain the source of truth.
import * as legacy from "../../src/model.js";
import { validateState } from "../../src/store.js";
export type Token = (typeof legacy.tokens)[number];
export interface Account {
  name: string;
  source: string;
  priority: string;
  alerts: boolean;
  keywords: string;
}
export interface Fill {
  id: string;
  token: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  fees: number;
  total: number;
  time: number;
}
export interface Alert {
  id: string;
  token: string;
  status: "Pending" | "Acknowledged" | "Dismissed" | "Expired";
  created: number;
  base: number;
  reason: string;
  category?: string;
}
export interface Message {
  role: "user" | "assistant";
  text: string;
}
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}
export type Settings = Omit<typeof legacy.defaults, "accounts" | "wallets"> & {
  accounts: Account[];
  wallets: string[];
};
export interface State {
  version: number;
  settings: Settings;
  watchlist: string[];
  alerts: Alert[];
  trades: Fill[];
  cash: number;
  chats: Chat[];
  activeChat: string;
  step: number;
  pausedAt: null;
}
export const tokens = legacy.tokens;
export const sources = legacy.sources;
export const posts = legacy.posts;
export const quote = legacy.quote;
export interface Position {
  quantity: number;
  cost: number;
  realised: number;
}
export const holdings = (s: State) =>
  legacy.holdings(s) as Record<string, Position>;
export const portfolio = (s: State) => legacy.portfolio(s);
export const statistics = (s: State, since = 0) => legacy.statistics(s, since);
export const reviewAlert = legacy.reviewAlert;
export const demoReply = (q: string, s: State) => legacy.demoReply(q, s);
export const executeTrade = (
  s: State,
  token: string,
  side: "buy" | "sell",
  amount: number,
) => legacy.trade(s, { token, side, amount }) as State;
export const initialState = () => legacy.initialState() as State;
export const validate = (v: unknown) => validateState(v) as State;
export const tokenBy = (id: string) =>
  tokens.find((t) => t.id === id) ?? tokens[0];
export const keywordsByCategory: Record<string, string[]> = {
  Ecosystem: [
    "Solana",
    "SOL",
    "crypto",
    "cryptocurrency",
    "memecoin",
    "memecoins",
    "Pump.fun",
    "PumpSwap",
    "Raydium",
    "Jupiter",
    "DEX",
    "Solscan",
    "DEX Screener",
    "GeckoTerminal",
    "CoinGecko",
  ],
  Launches: [
    "token launch",
    "new token",
    "new listing",
    "migration",
    "bonding curve",
    "early launch",
    "launchpad",
    "new pair",
    "token sniping",
    "community takeover",
    "CTO",
  ],
  Markets: [
    "liquidity",
    "liquidity pool",
    "market cap",
    "trading volume",
    "trending",
    "breakout",
    "bullish",
    "bearish",
    "buy pressure",
    "sell pressure",
    "accumulation",
    "distribution",
    "volume spike",
    "price spike",
  ],
  Wallets: [
    "whale",
    "whale wallet",
    "smart money",
    "wallet tracking",
    "contract address",
    "token contract",
    "CA",
    "developer wallet",
    "token deployer",
    "on-chain",
    "whale alert",
  ],
  Risk: [
    "rug pull",
    "honeypot",
    "insider trading",
    "locked liquidity",
    "holder concentration",
    "top holders",
    "token burn",
    "unusual activity",
  ],
  Social: ["social sentiment", "alpha", "crypto announcement"],
};
export const recommendedKeywords = Object.values(keywordsByCategory).flat();
export function upgrade(s: State): State {
  const next = structuredClone(s);
  next.settings.fontSize = Math.max(14, next.settings.fontSize);
  if (next.settings.profit === "#8cbfa1") next.settings.profit = "#72ba99";
  if (next.settings.loss === "#ce9090") next.settings.loss = "#d58e82";
  if (
    next.settings.keywords.length === 4 &&
    ["Solana", "Memecoin", "Liquidity", "Token launch"].every((k) =>
      next.settings.keywords.includes(k),
    )
  )
    next.settings.keywords = [...recommendedKeywords];
  return next;
}
export interface DesktopPreferences {
  backdrop: "Acrylic" | "Mica" | "Opaque";
  tint: string;
  startup: boolean;
  closeToTray: boolean;
  nativeNotifications: boolean;
  floatingAlerts: boolean;
  monitor: string;
  chartDensity: number;
  timeframe: "1m" | "5m" | "15m" | "1h";
}
export const desktopDefaults: DesktopPreferences = {
  backdrop: "Acrylic",
  tint: "#101820",
  startup: false,
  closeToTray: false,
  nativeNotifications: false,
  floatingAlerts: false,
  monitor: "Current monitor",
  chartDensity: 8,
  timeframe: "1m",
};
export const money = (n: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
export const compact = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
export const price = (n: number) => n.toFixed(n < 0.001 ? 7 : 5);
export function candles(token: Token, step = 0, interval = 60) {
  let last = token.price * 0.92;
  const start = 1761955200;
  const data = Array.from({ length: 100 }, (_, i) => {
    const open = last,
      delta =
        Math.sin((i + tokens.indexOf(token) * 5) * 1.19) * 0.0025 +
        Math.cos(i * 0.42) * 0.002 +
        0.0008;
    const close = open * (1 + delta),
      wick = open * 0.0012;
    last = close;
    return {
      time: start + i * interval,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick,
      close,
      volume: (25 + ((i * 31) % 80)) * 1000,
    };
  });
  const normalise = token.price / data.at(-1)!.close;
  return data.map((c, i) => {
    const close = i === 99 ? quote(token, step) : c.close * normalise;
    return {
      ...c,
      open: c.open * normalise,
      close,
      high: Math.max(c.high * normalise, close),
      low: Math.min(c.low * normalise, close),
    };
  });
}
