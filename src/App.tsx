import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { Communications } from './pages/Communications';
import { Reports } from './pages/Reports';
import { AgentManagement } from './pages/AgentManagement';
import { NotificationCenter } from './components/NotificationCenter';
import { UserAvatar } from './components/UserAvatar';
import { Toaster } from 'sonner';
import { Menu, X, LayoutDashboard, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pending_alerts')
        .select('*')
        .order('alert_level', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const handleNotificationClick = async (notification: any) => {
    try {
      // Update notification status
      await supabase
        .from('client_alerts')
        .update({ alert_status: 'read' })
        .eq('id', notification.id);

      // Navigate to client details
      // TODO: Implement navigation to client details
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('client_alerts')
        .update({ alert_status: 'read' })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg lg:hidden"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between relative">
            {/* Left spacer */}
            <div className="w-24" />
            
            {/* Centered title */}
            <h1 className="text-xl font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
              Probolsas CRM
            </h1>
            
            {/* Right controls */}
            <div className="flex items-center space-x-4">
              <NotificationCenter
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
              />
              <UserAvatar />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto touch-scroll pb-16 lg:pb-0">
          <div className="mobile-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/products" element={<Products />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/agent-management" element={<AgentManagement />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="mobile-nav">
          <NavItem to="/" icon={LayoutDashboard} label="Inicio" />
          <NavItem to="/clients" icon={Users} label="Clientes" />
          <NavItem to="/communications" icon={MessageSquare} label="Chat" />
          <NavItem to="/reports" icon={BarChart3} label="Reportes" />
        </nav>
      </div>
    </div>
  );
}

// Mobile navigation item component
function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex flex-col items-center space-y-1 ${
        isActive ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </NavLink>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;