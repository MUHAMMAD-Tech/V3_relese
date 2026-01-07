// LETHEX Admin Layout Component
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Header } from '@/components/common/Header';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Wallet,
  CheckCircle,
  History,
  DollarSign,
  Menu,
  LogOut,
  LayoutDashboard,
  PieChart,
} from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('admin.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.settings'), href: '/admin/settings', icon: Settings },
    { name: t('admin.holders'), href: '/admin/holders', icon: Users },
    { name: t('admin.assets'), href: '/admin/assets', icon: Wallet },
    { name: 'Active Assets', href: '/admin/active-assets', icon: PieChart },
    { name: t('admin.approvals'), href: '/admin/approvals', icon: CheckCircle },
    { name: t('admin.history'), href: '/admin/history', icon: History },
    { name: t('admin.commissions'), href: '/admin/commissions', icon: DollarSign },
  ];

  const handleLogout = async () => {
    try {
      console.log('🚪 Admin chiqish boshlandi...');
      
      await signOut();
      
      console.log('✅ Admin chiqish muvaffaqiyatli');
      toast.success('Tizimdan chiqdingiz');
      
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

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold gradient-text">Lethex</h1>
            <p className="text-xs text-muted-foreground mt-1">Admin paneli</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLinks />
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 px-4 py-2 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{t('auth.login')}</p>
              <p className="text-sm font-semibold text-foreground">Admin</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
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
          <h1 className="text-xl font-bold gradient-text">LETHEX</h1>
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
                    <h1 className="text-2xl font-bold gradient-text">LETHEX</h1>
                    <p className="text-xs text-muted-foreground mt-1">Admin paneli</p>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-2">
                    <NavLinks />
                  </nav>

                  {/* User Info & Logout */}
                  <div className="p-4 border-t border-border">
                    <div className="mb-3 px-4 py-2 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{t('auth.login')}</p>
                      <p className="text-sm font-semibold text-foreground">Admin</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleLogout}
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
