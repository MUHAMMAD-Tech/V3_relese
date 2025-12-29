// LETHEX Type Definitions

export type UserRole = 'admin' | 'holder';
export type TransactionType = 'swap' | 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: number;
  admin_access_code: string;
  updated_at: string;
}

export interface TokenWhitelist {
  symbol: string;
  name: string;
  coingecko_id: string;
  logo_url: string | null;
  market_cap_rank: number;
  created_at: string;
}

// Alias for convenience
export type Token = TokenWhitelist;

export interface Holder {
  id: string;
  name: string;
  access_code: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  holder_id: string;
  token_symbol: string;
  amount: string; // numeric stored as string
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  holder_id: string;
  transaction_type: TransactionType;
  from_token: string | null;
  to_token: string | null;
  amount: string; // numeric stored as string
  fee: string;
  net_amount: string;
  execution_price: string | null;
  received_amount: string | null;
  status: TransactionStatus;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface AssetWithToken extends Asset {
  token?: TokenWhitelist;
}

export interface TransactionWithDetails extends Transaction {
  holder?: Holder;
  from_token_data?: TokenWhitelist;
  to_token_data?: TokenWhitelist;
}

// Price data from CoinGecko
export interface TokenPrice {
  symbol: string;
  price_usdt: number;
  price_kgs: number; // KGS = Kyrgyzstani Som
  last_updated: number; // timestamp
}

export interface PriceCache {
  [symbol: string]: TokenPrice;
}

// UI-specific types
export interface PortfolioItem {
  token: TokenWhitelist;
  amount: string;
  price_usdt: number;
  price_kgs: number;
  value_usdt: number;
  value_kgs: number;
}

export interface CommissionSummary {
  total_fees_usdt: number;
  total_fees_kgs: number;
  by_holder: {
    holder_id: string;
    holder_name: string;
    total_fees: number;
    transaction_count: number;
  }[];
}

// Form types
export interface SwapFormData {
  from_token: string;
  to_token: string;
  amount: string;
}

export interface BuyFormData {
  token: string;
  amount: string;
  notes?: string;
}

export interface SellFormData {
  token: string;
  amount: string;
  notes?: string;
}

export interface HolderFormData {
  name: string;
  email?: string;
  phone?: string;
}

export interface AssetFormData {
  holder_id: string;
  token_symbol: string;
  amount: string;
}
