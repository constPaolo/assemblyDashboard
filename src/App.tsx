import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderPage } from '@/pages/OrderPage';
import { StockPage } from '@/pages/StockPage';
import { DeliveryNotesPage } from '@/pages/DeliveryNotesPage';
import { NewDeliveryNotePage } from '@/pages/NewDeliveryNotePage';
import { TeamPage } from '@/pages/TeamPage';
import { SettingsPage } from '@/pages/SettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell>
        <Routes>
          <Route path="/" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/delivery-notes" element={<DeliveryNotesPage />} />
          <Route path="/delivery-notes/new" element={<NewDeliveryNotePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
