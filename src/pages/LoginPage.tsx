// LETHEX Login Page - Unified Access Code System
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';
import { verifyAdminAccessCode, getHolderByAccessCode } from '@/db/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, updateRole } = useAuth();
  const { setCurrentHolder } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Please enter access code');
      return;
    }

    setLoading(true);

    try {
      console.log('Checking access code:', accessCode);
      
      // Step 1: Check if it's the admin access code
      const isAdmin = await verifyAdminAccessCode(accessCode);
      console.log('Admin check result:', isAdmin);

      if (isAdmin) {
        console.log('🔐 Admin login...');
        // Admin login - use Supabase Auth
        let authSuccess = false;
        
        // Try to sign in first
        console.log('📝 Admin SignIn urinish...');
        const { error: signInError } = await signIn('admin', accessCode);

        if (signInError) {
          console.log('❌ Admin SignIn xatolik:', signInError.message);
          console.log('📝 Admin SignUp urinish...');
          // If sign in fails, try to sign up (first time admin)
          const { error: signUpError } = await signUp('admin', accessCode);
          
          if (!signUpError) {
            console.log('✅ Admin SignUp muvaffaqiyatli');
            authSuccess = true;
          } else {
            console.error('❌ Admin SignUp xatolik:', signUpError.message);
            toast.error(`Admin ro'yxatdan o'tishda xatolik: ${signUpError.message}`);
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ Admin SignIn muvaffaqiyatli');
          authSuccess = true;
        }

        if (authSuccess) {
          console.log('🔄 Admin role yangilanmoqda...');
          try {
            // Update role to admin
            await updateRole('admin');
            console.log('✅ Admin role yangilandi');
            
            toast.success('Xush kelibsiz, Admin!');
            navigate('/admin/dashboard');
            return;
          } catch (roleError) {
            console.error('❌ Admin role yangilashda xatolik:', roleError);
            toast.error('Admin role yangilashda xatolik yuz berdi');
            setLoading(false);
            return;
          }
        } else {
          toast.error('Admin autentifikatsiya muvaffaqiyatsiz');
          setLoading(false);
          return;
        }
      }

      console.log('Checking as holder...');
      // Step 2: Check if it's a holder access code
      const holder = await getHolderByAccessCode(accessCode);
      console.log('Holder found:', holder);

      if (holder) {
        console.log('🔐 Holder topildi:', holder.name);
        // Holder login - authenticate with Supabase Auth
        // Use holder ID as username and access code as password
        let authSuccess = false;
        
        // Try to sign in first
        console.log('📝 SignIn urinish...');
        const { error: signInError } = await signIn(holder.id, accessCode);

        if (signInError) {
          console.log('❌ SignIn xatolik:', signInError.message);
          console.log('📝 SignUp urinish...');
          // If sign in fails, try to sign up (first time holder)
          const { error: signUpError } = await signUp(holder.id, accessCode);
          
          if (!signUpError) {
            console.log('✅ SignUp muvaffaqiyatli');
            authSuccess = true;
          } else {
            console.error('❌ SignUp xatolik:', signUpError.message);
            toast.error(`Ro'yxatdan o'tishda xatolik: ${signUpError.message}`);
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ SignIn muvaffaqiyatli');
          authSuccess = true;
        }

        if (authSuccess) {
          console.log('🔄 Role yangilanmoqda...');
          try {
            // Update role to holder and store holder info
            await updateRole('holder');
            console.log('✅ Role yangilandi');
            
            setCurrentHolder(holder);
            console.log('✅ Holder saqlandi');
            
            toast.success(`Xush kelibsiz, ${holder.name}!`);
            navigate('/holder/dashboard');
            return;
          } catch (roleError) {
            console.error('❌ Role yangilashda xatolik:', roleError);
            toast.error('Role yangilashda xatolik yuz berdi');
            setLoading(false);
            return;
          }
        } else {
          toast.error('Autentifikatsiya muvaffaqiyatsiz');
          setLoading(false);
          return;
        }
      }

      // Step 3: Invalid access code
      console.log('❌ Access code topilmadi');
      toast.error('Noto\'g\'ri kirish kodi');
    } catch (error) {
      console.error('❌ Login xatolik:', error);
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      toast.error(`Kirishda xatolik: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border bg-card card-glow">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/MUHAMMAD-Tech/Res-/refs/heads/MUHAMMAD-Tech/let/img/resLogoG.svg" 
                alt="LETHEX Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">
              Lethex
            </CardTitle>
            <CardDescription className="text-base">
              Raqamli aktivlar fondini boshqarish tizimi
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium text-foreground" gpf>
                  Kirish kodi
                </label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Kirish kodingizni kiriting"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={loading}
                  className="h-12 text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground gpf">
                  Davom etish uchun admin yoki holder kirish kodini kiriting
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin gpf" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  'Tizimga kirish'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground gpf">
              <p>Xavfsiz kirish • Real vaqtda kuzatish • Qo'lda tasdiqlash</p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground gpf"
        >
          <p>© 2025 LETHEX. Barcha huquqlar himoyalangan.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
