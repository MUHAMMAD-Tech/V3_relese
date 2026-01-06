// LETHEX Holder Portfolio Page
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { getAssetsByHolder, getAllTokens } from '@/db/api';
import { useAppStore } from '@/store/appStore';
import type { Asset, Token } from '@/types/types';

export default function HolderPortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const { currentHolder, prices } = useAppStore();

  useEffect(() => {
    loadData();
  }, [currentHolder]);

  const loadData = async () => {
    if (!currentHolder) {
      console.log('❌ currentHolder yo\'q');
      return;
    }
    
    console.log('🔄 Portfolio ma\'lumotlari yuklanmoqda...');
    console.log('📋 Holder ID:', currentHolder.id);
    console.log('👤 Holder nomi:', currentHolder.name);
    
    setLoading(true);
    const [assetsData, tokensData] = await Promise.all([
      getAssetsByHolder(currentHolder.id),
      getAllTokens(),
    ]);
    
    console.log('📊 Assets data:', assetsData);
    console.log('🪙 Tokens data:', tokensData.length, 'tokens');
    
    setAssets(assetsData);
    setTokens(tokensData);
    setLoading(false);
    
    console.log(`✅ Portfolio yuklandi: ${assetsData.length} ta asset`);
  };

  const getTokenPrice = (symbol: string): number => {
    const priceData = prices[symbol.toLowerCase()];
    return priceData?.price_usdt || 0;
  };

  const calculateValue = (amount: string | number, symbol: string): number => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount * getTokenPrice(symbol);
  };

  const getTotalPortfolioValue = (): number => {
    return assets.reduce((total, asset) => {
      return total + calculateValue(asset.amount, asset.token_symbol);
    }, 0);
  };

  const getTokenInfo = (symbol: string): Token | undefined => {
    return tokens.find(t => t.symbol === symbol);
  };

  // Check if prices are loaded
  const pricesLoaded = Object.keys(prices).length > 0;
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Holder Portfolio - Prices:', prices);
    console.log('🔍 Holder Portfolio - Prices loaded:', pricesLoaded);
    console.log('🔍 Holder Portfolio - Prices count:', Object.keys(prices).length);
  }, [prices, pricesLoaded]);

  if (!currentHolder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Holder ma'lumotlari topilmadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Sizning raqamli aktivlaringiz va ularning qiymati
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
          </div>
          <Skeleton className="h-64 w-full bg-muted" />
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
            <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Jami qiymat (USDT)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricesLoaded ? (
                  <>
                    <p className="text-3xl xl:text-4xl font-bold text-primary">
                      ${getTotalPortfolioValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Real vaqtda yangilanadi
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-10 w-48 bg-muted mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Narxlar yuklanmoqda...
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Jami qiymat (KGS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricesLoaded ? (
                  <>
                    <p className="text-3xl xl:text-4xl font-bold text-foreground">
                      {(getTotalPortfolioValue() * 87).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      1 USDT = 87 KGS
                    </p>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-10 w-48 bg-muted mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Narxlar yuklanmoqda...
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Aktivlar ({assets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">Aktivlar mavjud emas</p>
                  <p className="text-sm text-muted-foreground">
                    Admin tomonidan sizga aktivlar tayinlanmagan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => {
                    const token = getTokenInfo(asset.token_symbol);
                    const price = getTokenPrice(asset.token_symbol);
                    const value = calculateValue(asset.amount, asset.token_symbol);
                    const valueKGS = value * 87;

                    return (
                      <div
                        key={asset.id}
                        className="flex flex-col @md:flex-row @md:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {token?.logo_url ? (
                            <img
                              src={token.logo_url}
                              alt={token.name}
                              className="w-12 h-12 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">
                                {asset.token_symbol.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg">
                              {asset.token_symbol}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {token?.name || asset.token_symbol}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {pricesLoaded ? (
                                `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${asset.token_symbol}`
                              ) : (
                                'Narx yuklanmoqda...'
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-foreground text-lg">
                            {(typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount).toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: (typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount) < 1 ? 8 : 2 
                            })} {asset.token_symbol}
                          </p>
                          {pricesLoaded ? (
                            <>
                              <p className="text-sm text-primary font-semibold">
                                ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {valueKGS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Narx yuklanmoqda...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Update Info */}
          <Card className="border-border bg-card">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Narxlar har soniyada yangilanadi</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
