import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import PaymentPage from "./pages/PaymentPage";
import CustomizationFormPage from "./pages/CustomizationFormPage";
import CartCheckout from "./pages/CartCheckout";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// SPA redirect handler for GitHub Pages / Hostinger
const SPARedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for redirect from 404.html
    const redirectPath = sessionStorage.getItem('spa-redirect');
    if (redirectPath) {
      sessionStorage.removeItem('spa-redirect');
      const path = '/' + redirectPath.replace(/~and~/g, '&');
      navigate(path, { replace: true });
      return;
    }

    // Also check URL parameter (backup method)
    const urlParams = new URLSearchParams(location.search);
    const pathParam = urlParams.get('p');
    if (pathParam && location.pathname === '/') {
      const path = '/' + pathParam.replace(/~and~/g, '&');
      navigate(path, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

// Copy protection component
const CopyProtection = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copy/select
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P
      if (e.ctrlKey && ['c', 'a', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      // Disable F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <AuthProvider>
        <WishlistProvider>
          <CopyProtection>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SPARedirectHandler />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/payment/:id" element={<PaymentPage />} />
                  <Route path="/customization-form/:productId" element={<CustomizationFormPage />} />
                  <Route path="/cart-checkout" element={<CartCheckout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CopyProtection>
        </WishlistProvider>
      </AuthProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;

