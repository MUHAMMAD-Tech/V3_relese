// LETHEX Holder Transactions Page
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowRightLeft, ShoppingCart, Banknote, AlertCircle } from 'lucide-react';
import { getAssetsByHolder, getAllTokens, createTransaction } from '@/db/api';
import { TokenSelector } from '@/components/common/TokenSelector';
import { useAppStore } from '@/store/appStore';
import type { Asset, Token } from '@/types/types';

export default function HolderTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeTab, setActiveTab] = useState('swap');
  
  // Swap state
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [submittingSwap, setSubmittingSwap] = useState(false);

  // Buy state
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [showBuySelector, setShowBuySelector] = useState(false);
  const [submittingBuy, setSubmittingBuy] = useState(false);

  // Sell state
  const [sellToken, setSellToken] = useState<Token | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [showSellSelector, setShowSellSelector] = useState(false);
  const [submittingSell, setSubmittingSell] = useState(false);

  const { currentHolder, prices } = useAppStore();

  useEffect(() => {
    loadData();
  }, [currentHolder]);

  const loadData = async () => {
    if (!currentHolder) return;
    
    setLoading(true);
    const [assetsData, tokensData] = await Promise.all([
      getAssetsByHolder(currentHolder.id),
      getAllTokens(),
    ]);
    setAssets(assetsData);
    setTokens(tokensData);
    setLoading(false);
  };

  const getAssetBalance = (symbol: string): number => {
    const asset = assets.find(a => a.token_symbol === symbol);
    return asset ? (typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount) : 0;
  };

  const getTokenPrice = (symbol: string): number => {
    const priceData = prices[symbol.toLowerCase()];
    return priceData?.price_usdt || 0;
  };

  // Swap calculations
  const calculateSwapFee = (): number => {
    const amount = parseFloat(swapAmount) || 0;
    return amount * 0.01; // 1% fee
  };

  const calculateSwapNet = (): number => {
    const amount = parseFloat(swapAmount) || 0;
    return amount - calculateSwapFee();
  };

  const calculateSwapReceived = (): number => {
    if (!fromToken || !toToken) return 0;
    const net = calculateSwapNet();
    const fromPrice = getTokenPrice(fromToken.symbol);
    const toPrice = getTokenPrice(toToken.symbol);
    if (toPrice === 0) return 0;
    return (net * fromPrice) / toPrice;
  };

  const handleSwapPercentage = (percentage: number) => {
    if (!fromToken) {
      toast.error('Avval token tanlang');
      return;
    }
    const balance = getAssetBalance(fromToken.symbol);
    const amount = (balance * percentage) / 100;
    setSwapAmount(amount.toString());
  };

  const handleSwapSubmit = async () => {
    if (!currentHolder || !fromToken || !toToken) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const amount = parseFloat(swapAmount);
    if (!amount || amount <= 0) {
      toast.error('Iltimos, to\'g\'ri miqdor kiriting');
      return;
    }

    const balance = getAssetBalance(fromToken.symbol);
    if (amount > balance) {
      toast.error('Balans yetarli emas');
      return;
    }

    setSubmittingSwap(true);
    const result = await createTransaction(
      currentHolder.id,
      'swap',
      {
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        amount: amount.toString(),
        fee: calculateSwapFee().toString(),
        net_amount: calculateSwapNet().toString(),
      }
    );

    if (result) {
      toast.success('Swap so\'rovi yuborildi. Admin tasdiqini kuting.');
      setFromToken(null);
      setToToken(null);
      setSwapAmount('');
      loadData();
    } else {
      toast.error('Swap so\'rovini yuborishda xatolik');
    }
    setSubmittingSwap(false);
  };

  const handleBuySubmit = async () => {
    if (!currentHolder || !buyToken) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const amount = parseFloat(buyAmount);
    if (!amount || amount <= 0) {
      toast.error('Iltimos, to\'g\'ri miqdor kiriting');
      return;
    }

    setSubmittingBuy(true);
    const result = await createTransaction(
      currentHolder.id,
      'buy',
      {
        to_token: buyToken.symbol,
        amount: amount.toString(),
        net_amount: amount.toString(),
      }
    );

    if (result) {
      toast.success('Buy so\'rovi yuborildi. Admin tasdiqini kuting.');
      setBuyToken(null);
      setBuyAmount('');
    } else {
      toast.error('Buy so\'rovini yuborishda xatolik');
    }
    setSubmittingBuy(false);
  };

  const handleSellSubmit = async () => {
    if (!currentHolder || !sellToken) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) {
      toast.error('Iltimos, to\'g\'ri miqdor kiriting');
      return;
    }

    const balance = getAssetBalance(sellToken.symbol);
    if (amount > balance) {
      toast.error('Balans yetarli emas');
      return;
    }

    setSubmittingSell(true);
    const result = await createTransaction(
      currentHolder.id,
      'sell',
      {
        from_token: sellToken.symbol,
        amount: amount.toString(),
        net_amount: amount.toString(),
      }
    );

    if (result) {
      toast.success('Sell so\'rovi yuborildi. Telegram orqali admin bilan bog\'laning.');
      setSellToken(null);
      setSellAmount('');
    } else {
      toast.error('Sell so\'rovini yuborishda xatolik');
    }
    setSubmittingSell(false);
  };

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
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Tranzaksiyalar</h1>
        <p className="text-muted-foreground mt-2">
          Swap, Buy va Sell so'rovlarini yuborish
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full bg-muted" />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="swap" className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  <span className="hidden @md:inline">Swap</span>
                </TabsTrigger>
                <TabsTrigger value="buy" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden @md:inline">Buy</span>
                </TabsTrigger>
                <TabsTrigger value="sell" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  <span className="hidden @md:inline">Sell</span>
                </TabsTrigger>
              </TabsList>

              {/* Swap Tab */}
              <TabsContent value="swap" className="space-y-6 mt-6">
                <div className="space-y-4">
                  {/* From Token */}
                  <div className="space-y-2">
                    <Label>Qaysi tokendan</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setShowFromSelector(true)}
                    >
                      {fromToken ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {fromToken.logo_url && (
                              <img src={fromToken.logo_url} alt={fromToken.name} className="w-6 h-6 rounded-full" />
                            )}
                            <div className="text-left">
                              <p className="font-semibold">{fromToken.symbol}</p>
                              <p className="text-xs text-muted-foreground">{fromToken.name}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Balans: {getAssetBalance(fromToken.symbol).toFixed(8)}
                          </p>
                        </div>
                      ) : (
                        'Token tanlang'
                      )}
                    </Button>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="swap-amount">Miqdor</Label>
                    <Input
                      id="swap-amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                    />
                    {fromToken && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwapPercentage(25)}
                        >
                          25%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwapPercentage(50)}
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwapPercentage(75)}
                        >
                          75%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwapPercentage(100)}
                        >
                          100%
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* To Token */}
                  <div className="space-y-2">
                    <Label>Qaysi tokenga</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setShowToSelector(true)}
                    >
                      {toToken ? (
                        <div className="flex items-center gap-2">
                          {toToken.logo_url && (
                            <img src={toToken.logo_url} alt={toToken.name} className="w-6 h-6 rounded-full" />
                          )}
                          <div className="text-left">
                            <p className="font-semibold">{toToken.symbol}</p>
                            <p className="text-xs text-muted-foreground">{toToken.name}</p>
                          </div>
                        </div>
                      ) : (
                        'Token tanlang'
                      )}
                    </Button>
                  </div>

                  {/* Preview */}
                  {fromToken && toToken && swapAmount && parseFloat(swapAmount) > 0 && (
                    <Card className="border-border bg-secondary/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Swap ma'lumotlari</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tranzaksiya to'lovi (1%):</span>
                          <span className="font-semibold">{calculateSwapFee().toFixed(8)} {fromToken.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sof miqdor:</span>
                          <span className="font-semibold">{calculateSwapNet().toFixed(8)} {fromToken.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxminiy olinadi:</span>
                          <span className="font-semibold text-primary">{calculateSwapReceived().toFixed(8)} {toToken.symbol}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    onClick={handleSwapSubmit}
                    disabled={submittingSwap || !fromToken || !toToken || !swapAmount || parseFloat(swapAmount) <= 0}
                  >
                    {submittingSwap ? 'Yuborilmoqda...' : 'Swap so\'rovini yuborish'}
                  </Button>
                </div>
              </TabsContent>

              {/* Buy Tab */}
              <TabsContent value="buy" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setShowBuySelector(true)}
                    >
                      {buyToken ? (
                        <div className="flex items-center gap-2">
                          {buyToken.logo_url && (
                            <img src={buyToken.logo_url} alt={buyToken.name} className="w-6 h-6 rounded-full" />
                          )}
                          <div className="text-left">
                            <p className="font-semibold">{buyToken.symbol}</p>
                            <p className="text-xs text-muted-foreground">{buyToken.name}</p>
                          </div>
                        </div>
                      ) : (
                        'Token tanlang'
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buy-amount">Miqdor</Label>
                    <Input
                      id="buy-amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleBuySubmit}
                    disabled={submittingBuy || !buyToken || !buyAmount || parseFloat(buyAmount) <= 0}
                  >
                    {submittingBuy ? 'Yuborilmoqda...' : 'Buy so\'rovini yuborish'}
                  </Button>
                </div>
              </TabsContent>

              {/* Sell Tab */}
              <TabsContent value="sell" className="space-y-6 mt-6">
                <Card className="border-warning bg-warning/10">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-warning mb-1">Telegram orqali bog'laning<Button
  className="flex items-center justify-center rounded-full p-0 overflow-hidden hover:opacity-90 transition-opacity"
  style={{
    width: '45px',
    height: '45px',
    background: 'transparent',
    border: 'none',
    padding: 0,
    minWidth: '45px',
  }}
  onClick={() => window.open('https://t.me/youradminusername', '_blank')}
  title="Telegram Admin"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 124 124"
    fill="none"
    style={{ width: '45px', height: '45px' }}
  >
    <defs>
      <linearGradient id="telegramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF00FF" />
        <stop offset="100%" stopColor="#00D4FF" />
      </linearGradient>
    </defs>
    <rect width="124" height="124" rx="62" fill="url(#telegramGradient)" />
    <path
      d="M19.375 36.7818V100.625C19.375 102.834 21.1659 104.625 23.375 104.625H87.2181C90.7818 104.625 92.5664 100.316 90.0466 97.7966L26.2034 33.9534C23.6836 31.4336 19.375 33.2182 19.375 36.7818Z"
      fill="white"
    />
    <circle cx="63.2109" cy="37.5391" r="18.1641" fill="black" />
    <rect
      opacity="0.4"
      x="81.1328"
      y="80.7198"
      width="17.5687"
      height="17.3876"
      rx="4"
      transform="rotate(-45 81.1328 80.7198)"
      fill="#FDBA74"
    />
  </svg>
</Button></p>
                        <p className="text-muted-foreground">
                          Sell so'rovini yuborganingizdan keyin, admin bilan Telegram orqali bog'lanishingiz kerak.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setShowSellSelector(true)}
                    >
                      {sellToken ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {sellToken.logo_url && (
                              <img src={sellToken.logo_url} alt={sellToken.name} className="w-6 h-6 rounded-full" />
                            )}
                            <div className="text-left">
                              <p className="font-semibold">{sellToken.symbol}</p>
                              <p className="text-xs text-muted-foreground">{sellToken.name}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Balans: {getAssetBalance(sellToken.symbol).toFixed(8)}
                          </p>
                        </div>
                      ) : (
                        'Token tanlang'
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sell-amount">Miqdor</Label>
                    <Input
                      id="sell-amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSellSubmit}
                    disabled={submittingSell || !sellToken || !sellAmount || parseFloat(sellAmount) <= 0}
                  >
                    {submittingSell ? 'Yuborilmoqda...' : 'Sell so\'rovini yuborish'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Token Selectors */}
      <TokenSelector
        open={showFromSelector}
        onOpenChange={setShowFromSelector}
        onSelect={(token) => {
          setFromToken(token);
          setShowFromSelector(false);
        }}
      />

      <TokenSelector
        open={showToSelector}
        onOpenChange={setShowToSelector}
        onSelect={(token) => {
          setToToken(token);
          setShowToSelector(false);
        }}
        excludeSymbol={fromToken?.symbol}
      />

      <TokenSelector
        open={showBuySelector}
        onOpenChange={setShowBuySelector}
        onSelect={(token) => {
          setBuyToken(token);
          setShowBuySelector(false);
        }}
      />

      <TokenSelector
        open={showSellSelector}
        onOpenChange={setShowSellSelector}
        onSelect={(token) => {
          setSellToken(token);
          setShowSellSelector(false);
        }}
      />
    </div>
  );
}
