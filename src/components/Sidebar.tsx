import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MessageSquare, 
  BarChart3,
  UserCog,
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../lib/store/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Panel Principal' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/products', icon: Package, label: 'Productos' },
  { to: '/communications', icon: MessageSquare, label: 'Comunicaciones' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
  { to: '/agent-management', icon: UserCog, label: 'Gestión de Asesores', adminOnly: true },
];

export function Sidebar({ onClose }: { onClose: () => void }) {
  const { signOut } = useAuthStore();
  // TODO: Replace with actual admin check from auth
  const isAdmin = true;

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-3 py-4 flex flex-col h-full">
      <nav className="flex-1">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}