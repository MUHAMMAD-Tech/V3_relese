// LETHEX Holder Layout Component
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore } from '@/store/appStore';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/common/Header';
import { toast } from 'sonner';
import { getHolderById } from '@/db/api';
import {
  Wallet,
  ArrowRightLeft,
  History,
  Menu,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function HolderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentHolder, clearCurrentHolder, setCurrentHolder } = useAppStore();
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load holder data from auth session
  useEffect(() => {
    const loadHolderData = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      // If holder data is already loaded, skip
      if (currentHolder) {
        setLoading(false);
        return;
      }

      // Extract holder ID from email (format: {holder_id}@miaoda.com)
      const email = user.email || '';
      const holderId = email.replace('@miaoda.com', '');

      if (holderId && holderId !== 'admin') {
        try {
          const holder = await getHolderById(holderId);
          if (holder) {
            setCurrentHolder(holder);
          } else {
            console.error('Holder topilmadi:', holderId);
            toast.error('Holder ma\'lumotlari topilmadi');
          }
        } catch (error) {
          console.error('Holder yuklashda xatolik:', error);
          toast.error('Holder ma\'lumotlarini yuklashda xatolik');
        }
      }

      setLoading(false);
    };

    loadHolderData();
  }, [user, profile, currentHolder, setCurrentHolder]);

  const navigation = [
    { name: t('admin.dashboard'), href: '/holder/dashboard', icon: LayoutDashboard },
    { name: t('portfolio.portfolio'), href: '/holder/portfolio', icon: Wallet },
    { name: t('transactions.transactions'), href: '/holder/transactions', icon: ArrowRightLeft },
    { name: t('admin.history'), href: '/holder/history', icon: History },
  ];

  const handleExit = async () => {
    try {
      console.log('🚪 Chiqish boshlandi...');
      
      // Clear holder data from app state
      clearCurrentHolder();
      
      // Sign out from Supabase Auth
      await signOut();
      
      console.log('✅ Chiqish muvaffaqiyatli');
      toast.success('Tizimdan chiqdingiz');
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('❌ Chiqishda xatolik:', error);
      toast.error('Chiqishda xatolik yuz berdi');
    }
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  // Show loading state while holder data is being loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
<img  src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/img/resLogoG.svg" className="logh" />
            <h1 className="text-2xl font-bold gradient-text">Lethex</h1>
            <p className="text-xs text-muted-foreground mt-1">Fund Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLinks />
          </nav>

          {/* User Info & Exit */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 px-4 py-2 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{t('auth.login')}</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {currentHolder?.name || 'Holder'}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExit}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.exit')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-end p-4 border-b border-border bg-card">
          <Header />
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
<img  src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/img/resLogoG.svg" className="logh" />
          <h1 className="hww text-xl font-bold gradient-text">ethex</h1>
          <div className="flex items-center gap-2">
            <Header />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b border-border">
<img  src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/img/resLogoG.svg" className="logh"/>
                  <h1 className="text-2xl font-bold gradient-text">Lethex</h1>
                  <p className="text-xs text-muted-foreground mt-1">Fund Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  <NavLinks />
                </nav>

                {/* User Info & Exit */}
                <div className="p-4 border-t border-border">
                  <div className="mb-3 px-4 py-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Logged in as</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {currentHolder?.name || 'Holder'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExit}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.exit')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 xl:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
