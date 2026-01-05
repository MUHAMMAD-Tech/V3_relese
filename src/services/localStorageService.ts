// LETHEX LocalStorage Service
// Ma'lumotlarni localStorage-da saqlash va olish

import type { PriceCache, Holder, TokenWhitelist } from '@/types/types';

const STORAGE_KEYS = {
  PRICES: 'lethex_prices',
  PRICES_TIMESTAMP: 'lethex_prices_timestamp',
  HOLDERS: 'lethex_holders',
  TOKENS: 'lethex_tokens',
  CURRENT_HOLDER: 'lethex_holder',
} as const;

// Narxlarni saqlash muddati (milliseconds)
const PRICE_CACHE_DURATION = 30 * 1000; // 30 soniya

// ============================================================================
// PRICES
// ============================================================================

export function savePrices(prices: PriceCache): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
    localStorage.setItem(STORAGE_KEYS.PRICES_TIMESTAMP, Date.now().toString());
    console.log('💾 Narxlar localStorage-ga saqlandi');
  } catch (error) {
    console.error('❌ Narxlarni saqlashda xatolik:', error);
  }
}

export function loadPrices(): PriceCache | null {
  try {
    const pricesStr = localStorage.getItem(STORAGE_KEYS.PRICES);
    const timestampStr = localStorage.getItem(STORAGE_KEYS.PRICES_TIMESTAMP);
    
    if (!pricesStr || !timestampStr) {
      console.log('📭 localStorage-da narxlar yo\'q');
      return null;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    
    // Agar narxlar juda eski bo'lsa (30 soniyadan ko'p), null qaytarish
    if (age > PRICE_CACHE_DURATION) {
      console.log('⏰ localStorage-dagi narxlar eski (', Math.round(age / 1000), 's)');
      return null;
    }
    
    const prices = JSON.parse(pricesStr) as PriceCache;
    console.log('✅ Narxlar localStorage-dan yuklandi (', Math.round(age / 1000), 's eski)');
    return prices;
  } catch (error) {
    console.error('❌ Narxlarni yuklashda xatolik:', error);
    return null;
  }
}

export function clearPrices(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    localStorage.removeItem(STORAGE_KEYS.PRICES_TIMESTAMP);
    console.log('🗑️ Narxlar localStorage-dan o\'chirildi');
  } catch (error) {
    console.error('❌ Narxlarni o\'chirishda xatolik:', error);
  }
}

// ============================================================================
// HOLDERS
// ============================================================================

export function saveHolders(holders: Holder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOLDERS, JSON.stringify(holders));
    console.log('💾 Holderlar localStorage-ga saqlandi:', holders.length);
  } catch (error) {
    console.error('❌ Holderlarni saqlashda xatolik:', error);
  }
}

export function loadHolders(): Holder[] | null {
  try {
    const holdersStr = localStorage.getItem(STORAGE_KEYS.HOLDERS);
    
    if (!holdersStr) {
      console.log('📭 localStorage-da holderlar yo\'q');
      return null;
    }
    
    const holders = JSON.parse(holdersStr) as Holder[];
    console.log('✅ Holderlar localStorage-dan yuklandi:', holders.length);
    return holders;
  } catch (error) {
    console.error('❌ Holderlarni yuklashda xatolik:', error);
    return null;
  }
}

export function clearHolders(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HOLDERS);
    console.log('🗑️ Holderlar localStorage-dan o\'chirildi');
  } catch (error) {
    console.error('❌ Holderlarni o\'chirishda xatolik:', error);
  }
}

// ============================================================================
// TOKENS
// ============================================================================

export function saveTokens(tokens: TokenWhitelist[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    console.log('💾 Tokenlar localStorage-ga saqlandi:', tokens.length);
  } catch (error) {
    console.error('❌ Tokenlarni saqlashda xatolik:', error);
  }
}

export function loadTokens(): TokenWhitelist[] | null {
  try {
    const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
    
    if (!tokensStr) {
      console.log('📭 localStorage-da tokenlar yo\'q');
      return null;
    }
    
    const tokens = JSON.parse(tokensStr) as TokenWhitelist[];
    console.log('✅ Tokenlar localStorage-dan yuklandi:', tokens.length);
    return tokens;
  } catch (error) {
    console.error('❌ Tokenlarni yuklashda xatolik:', error);
    return null;
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    console.log('🗑️ Tokenlar localStorage-dan o\'chirildi');
  } catch (error) {
    console.error('❌ Tokenlarni o\'chirishda xatolik:', error);
  }
}

// ============================================================================
// CURRENT HOLDER
// ============================================================================

export function saveCurrentHolder(holder: Holder): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_HOLDER, JSON.stringify(holder));
    console.log('💾 Current holder localStorage-ga saqlandi:', holder.name);
  } catch (error) {
    console.error('❌ Current holder-ni saqlashda xatolik:', error);
  }
}

export function loadCurrentHolder(): Holder | null {
  try {
    const holderStr = localStorage.getItem(STORAGE_KEYS.CURRENT_HOLDER);
    
    if (!holderStr) {
      return null;
    }
    
    const holder = JSON.parse(holderStr) as Holder;
    console.log('✅ Current holder localStorage-dan yuklandi:', holder.name);
    return holder;
  } catch (error) {
    console.error('❌ Current holder-ni yuklashda xatolik:', error);
    return null;
  }
}

export function clearCurrentHolder(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_HOLDER);
    console.log('🗑️ Current holder localStorage-dan o\'chirildi');
  } catch (error) {
    console.error('❌ Current holder-ni o\'chirishda xatolik:', error);
  }
}

// ============================================================================
// CLEAR ALL
// ============================================================================

export function clearAllCache(): void {
  clearPrices();
  clearHolders();
  clearTokens();
  clearCurrentHolder();
  console.log('🗑️ Barcha cache localStorage-dan o\'chirildi');
}
