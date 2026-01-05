// LETHEX Global State Store - Zustand
import { create } from 'zustand';
import type { TokenWhitelist, Holder, PriceCache } from '@/types/types';
import { getAllTokens } from '@/db/api';
import { priceService } from '@/services/priceService';

interface AppState {
  // Token data
  tokens: TokenWhitelist[];
  prices: PriceCache;
  pricesLoading: boolean;
  
  // Current holder (for holder dashboard)
  currentHolder: Holder | null;
  
  // Actions
  loadTokens: () => Promise<void>;
  updatePrices: () => Promise<void>;
  setCurrentHolder: (holder: Holder | null) => void;
  clearCurrentHolder: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tokens: [],
  prices: {},
  pricesLoading: false,
  currentHolder: null,

  // Load all tokens from database
  loadTokens: async () => {
    try {
      const tokens = await getAllTokens();
      set({ tokens });
      console.log('✅ Tokenlar yuklandi:', tokens.length);
    } catch (error) {
      console.error('❌ Tokenlarni yuklashda xatolik:', error);
      set({ tokens: [] }); // Set empty array on error
    }
  },

  // Update prices from CoinGecko
  updatePrices: async () => {
    const { tokens, pricesLoading } = get();
    
    if (pricesLoading || tokens.length === 0) {
      return;
    }

    set({ pricesLoading: true });

    try {
      // Get all coingecko IDs
      const coingeckoIds = tokens.map(t => t.coingecko_id);
      
      // Fetch prices
      const priceData = await priceService.fetchPrices(coingeckoIds);
      
      // Map coingecko IDs back to symbols
      const prices: PriceCache = {};
      for (const token of tokens) {
        const priceInfo = priceData[token.coingecko_id];
        if (priceInfo) {
          prices[token.symbol.toLowerCase()] = {
            ...priceInfo,
            symbol: token.symbol,
          };
        }
      }

      set({ prices, pricesLoading: false });
    } catch (error) {
      console.error('Error updating prices:', error);
      set({ pricesLoading: false });
    }
  },

  // Set current holder for holder dashboard
  setCurrentHolder: (holder: Holder | null) => {
    set({ currentHolder: holder });
    // Store in sessionStorage for persistence
    if (holder) {
      sessionStorage.setItem('lethex_holder', JSON.stringify(holder));
    } else {
      sessionStorage.removeItem('lethex_holder');
    }
  },

  // Clear current holder (logout)
  clearCurrentHolder: () => {
    set({ currentHolder: null });
    sessionStorage.removeItem('lethex_holder');
  },
}));

// Initialize holder from sessionStorage on app load
const storedHolder = sessionStorage.getItem('lethex_holder');
if (storedHolder) {
  try {
    const holder = JSON.parse(storedHolder);
    useAppStore.setState({ currentHolder: holder });
  } catch (error) {
    console.error('Error parsing stored holder:', error);
    sessionStorage.removeItem('lethex_holder');
  }
}
