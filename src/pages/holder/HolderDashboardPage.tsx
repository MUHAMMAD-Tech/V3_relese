// LETHEX Holder Dashboard Page
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/appStore';
import { getAssetsByHolderId, getTransactionsByHolderId } from '@/db/api';
import type { AssetWithToken, TransactionWithDetails } from '@/types/types';

export default function HolderDashboardPage() {
  const { currentHolder, prices } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<AssetWithToken[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);

  useEffect(() => {
    if (currentHolder) {
      loadDashboardData();
    }
  }, [currentHolder]);

  const loadDashboardData = useCallback(async () => {
    if (!currentHolder) {
      console.log('❌ currentHolder yo\'q');
      return;
    }

    console.log('🔄 Dashboard ma\'lumotlari yuklanmoqda...');
    console.log('📋 Holder ID:', currentHolder.id);
    console.log('👤 Holder nomi:', currentHolder.name);

    setLoading(true);
    try {
      const [assetsData, transactionsData] = await Promise.all([
        getAssetsByHolderId(currentHolder.id),
        getTransactionsByHolderId(currentHolder.id),
      ]);

      console.log('📊 Assets data:', assetsData);
      console.log('📜 Transactions data:', transactionsData);

      setAssets(assetsData);
      setRecentTransactions(transactionsData.slice(0, 5));

      console.log(`✅ Dashboard yuklandi: ${assetsData.length} ta asset, ${transactionsData.length} ta transaction`);
    } catch (error) {
      console.error('❌ Dashboard yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  }, [currentHolder]);

  // Memoize portfolio value calculation
  const { totalValueUSDT, totalValueKGS } = useMemo(() => {
    let totalUSDT = 0;
    let totalKGS = 0;

    if (assets.length > 0 && Object.keys(prices).length > 0) {
      for (const asset of assets) {
        const price = prices[asset.token_symbol.toLowerCase()];
        if (price) {
          const amount = parseFloat(asset.amount);
          totalUSDT += amount * price.price_usdt;
          totalKGS += amount * price.price_kgs;
        }
      }
    }

    return { totalValueUSDT: totalUSDT, totalValueKGS: totalKGS };
  }, [assets, prices]);

  // Memoize pending transactions count
  const pendingCount = useMemo(() => {
    return recentTransactions.filter(tx => tx.status === 'pending').length;
  }, [recentTransactions]);

  // Check if prices are loaded
  const pricesLoaded = Object.keys(prices).length > 0;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Holder Dashboard - Prices:', prices);
    console.log('🔍 Holder Dashboard - Prices loaded:', pricesLoaded);
    console.log('🔍 Holder Dashboard - Prices count:', Object.keys(prices).length);
  }, [prices, pricesLoaded]);

  const stats = [
    {
      title: 'Jami Aktivlar',
      value: assets.length,
      icon: 'https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconBtc.svg',
      color: 'text-primary',
      iconClass: 'icon-wallet',
    },
    {
      title: 'Portfolio Qiymati (USDT)',
      value: pricesLoaded 
        ? `$${totalValueUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'Yuklanmoqda...',
      icon: 'https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconChart.svg',
      color: 'text-success',
    },
    {
      title: 'Portfolio Qiymati (KGS)',
      value: pricesLoaded
        ? `${totalValueKGS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KGS`
        : 'Yuklanmoqda...',
      icon: 'https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconKGS.svg',
      color: 'text-success',
    },
    {
      title: 'Kutilayotgan So\'rovlar',
      value: pendingCount,
      icon: 'https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconClock.svg',
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">
          Welcome, {currentHolder?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your digital asset portfolio overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 @md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card card-glow-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {/* Icon uchun img tag */}
              <img 
                src={stat.icon} 
                alt={stat.title}
                className={`h-5 w-5 ${stat.color}`}
                onError={(e) => {
                  // Agar rasm yuklanmasa, fallback icon
                  e.target.onerror = null;
                  e.target.src = '/icons/fallback.svg';
                }}
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <div className="text-2xl xl:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            <a
              href="/holder/portfolio"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <img 
                src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconBtc.svg"
                alt="Portfolio"
                className="h-8 w-8 mx-auto mb-2"
              />
              <p className="font-semibold text-foreground">View Portfolio</p>
              <p className="text-sm text-muted-foreground mt-1">See all your assets</p>
            </a>
            <a
              href="/holder/transactions"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <img 
                src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconTransaction.svg"
                alt="Transactions"
                className="h-8 w-8 mx-auto mb-2"
              />
              <p className="font-semibold text-foreground">New Transaction</p>
              <p className="text-sm text-muted-foreground mt-1">Swap, buy, or sell</p>
            </a>
            <a
              href="/holder/history"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <img 
                src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconHistory.svg"
                alt="History"
                className="h-8 w-8 mx-auto mb-2"
              />
              <p className="font-semibold text-foreground">View History</p>
              <p className="text-sm text-muted-foreground mt-1">Transaction history</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}