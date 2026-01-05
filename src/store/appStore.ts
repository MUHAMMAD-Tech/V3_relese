// LETHEX Global State Store - Zustand
import { create } from 'zustand';
import type { TokenWhitelist, Holder, PriceCache } from '@/types/types';
import { getAllTokens } from '@/db/api';
import { priceService } from '@/services/priceService';
import * as localStorageService from '@/services/localStorageService';

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
  // Initial state - narxlarni localStorage-dan yuklash
  tokens: localStorageService.loadTokens() || [],
  prices: localStorageService.loadPrices() || {},
  pricesLoading: false,
  currentHolder: localStorageService.loadCurrentHolder(),

  // Load all tokens from database
  loadTokens: async () => {
    try {
      // Avval localStorage-dan yuklash
      const cachedTokens = localStorageService.loadTokens();
      if (cachedTokens && cachedTokens.length > 0) {
        set({ tokens: cachedTokens });
        console.log('✅ Tokenlar localStorage-dan yuklandi:', cachedTokens.length);
      }
      
      // Keyin database-dan yangilash
      const tokens = await getAllTokens();
      set({ tokens });
      localStorageService.saveTokens(tokens);
      console.log('✅ Tokenlar database-dan yuklandi va saqlandi:', tokens.length);
    } catch (error) {
      console.error('❌ Tokenlarni yuklashda xatolik:', error);
      set({ tokens: [] });
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

      // Narxlarni state va localStorage-ga saqlash
      set({ prices, pricesLoading: false });
      localStorageService.savePrices(prices);
      console.log('✅ Narxlar yangilandi va saqlandi');
    } catch (error) {
      console.error('❌ Narxlarni yangilashda xatolik:', error);
      set({ pricesLoading: false });
    }
  },

  // Set current holder for holder dashboard
  setCurrentHolder: (holder: Holder | null) => {
    set({ currentHolder: holder });
    // Store in localStorage for persistence
    if (holder) {
      localStorageService.saveCurrentHolder(holder);
    } else {
      localStorageService.clearCurrentHolder();
    }
  },

  // Clear current holder (logout)
  clearCurrentHolder: () => {
    set({ currentHolder: null });
    localStorageService.clearCurrentHolder();
  },
}));
