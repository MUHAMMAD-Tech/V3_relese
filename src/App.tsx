import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from 'sonner';
import { useAppStore } from '@/store/appStore';
import routes from './routes';

const App: React.FC = () => {
  const { loadTokens, updatePrices } = useAppStore();

  useEffect(() => {
    // Load tokens on app start with error handling
    loadTokens().catch(error => {
      console.error('❌ Tokenlarni yuklashda xatolik:', error);
    });

    // Start price update interval (30 seconds for better performance)
    // Note: 1 second was causing too many re-renders and UI interruptions
    const priceInterval = setInterval(() => {
      updatePrices().catch(error => {
        console.error('❌ Narxlarni yangilashda xatolik:', error);
      });
    }, 30000); // 30 seconds

    // Initial price fetch with error handling
    updatePrices().catch(error => {
      console.error('❌ Dastlabki narxlarni olishda xatolik:', error);
    });

    return () => clearInterval(priceInterval);
  }, [loadTokens, updatePrices]);

  const renderRoutes = (routeList: typeof routes) => {
    return routeList.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={route.element}>
            {route.children.map((child, childIndex) => (
              <Route key={childIndex} path={child.path} element={child.element} />
            ))}
          </Route>
        );
      }
      return <Route key={index} path={route.path} element={route.element} />;
    });
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <Router>
          <AuthProvider>
            <RouteGuard>
              <IntersectObserver />
              <Routes>{renderRoutes(routes)}</Routes>
              <Toaster position="top-right" richColors />
            </RouteGuard>
          </AuthProvider>
        </Router>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
