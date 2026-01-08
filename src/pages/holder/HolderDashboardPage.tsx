// LETHEX Holder Dashboard Page
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Lucide import'ini O'CHIRIB TASHALASANGIZ HAM BO'LADI (agar barcha icon'lar URL bo'lsa)
// import { Wallet, TrendingUp, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { getAssetsByHolderId, getTransactionsByHolderId } from '@/db/api';
import type { AssetWithToken, TransactionWithDetails } from '@/types/types';

export default function HolderDashboardPage() {
  const { currentHolder, prices } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<AssetWithToken[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);

  // ... useEffect, loadDashboardData, useMemo'lar bir xil

  const stats = [
    {
      title: 'Jami Aktivlar',
      value: assets.length,
      icon: 'https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/cryptoImg/resIconBtc.svg',
      color: 'text-primary',
    },
    {
      title: 'Portfolio Qiymati (USDT)',
      value: pricesLoaded 
        ? `$${totalValueUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'Yuklanmoqda...',
      icon: 'https://raw.githubusercontent.com/yourusername/icons/main/chart-up.svg', // ✅ URL
      color: 'text-success',
    },
    {
      title: 'Portfolio Qiymati (KGS)',
      value: pricesLoaded
        ? `${totalValueKGS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KGS`
        : 'Yuklanmoqda...',
      icon: 'https://raw.githubusercontent.com/yourusername/icons/main/currency-kgs.svg', // ✅ URL
      color: 'text-success',
    },
    {
      title: 'Kutilayotgan So\'rovlar',
      value: pendingCount,
      icon: 'https://raw.githubusercontent.com/yourusername/icons/main/clock-alert.svg', // ✅ URL
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}

      {/* Stats Grid - O'ZGARTIRILGAN */}
      <div className="grid grid-cols-1 @md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card card-glow-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {/* ✅ URL icon'lar uchun img tag */}
              <img 
                src={stat.icon} 
                alt={stat.title}
                className={`h-5 w-5 ${stat.color}`}
                onError={(e) => {
                  // Agar rasm yuklanmasa
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

      {/* Quick Actions - O'ZGARTIRILGAN */}
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
                src="https://raw.githubusercontent.com/yourusername/icons/main/portfolio.svg" 
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
                src="https://raw.githubusercontent.com/yourusername/icons/main/transaction.svg" 
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
                src="https://raw.githubusercontent.com/yourusername/icons/main/history.svg" 
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