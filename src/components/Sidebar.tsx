import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MessageSquare, 
  BarChart3,
  UserCog,
  LogOut,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../lib/store/authStore';

interface NavItem {
  to?: string;
  icon: React.ElementType;
  label: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

const getNavItems = (isAdmin: boolean): NavItem[] => {
  const baseItems: NavItem[] = [
    { to: '/', icon: LayoutDashboard, label: 'Panel Principal' },
    { to: '/clients', icon: Users, label: 'Clientes' },
    { to: '/communications', icon: MessageSquare, label: 'Comunicaciones' },
    { to: '/reports', icon: BarChart3, label: 'Reportes' },
  ];

  const adminItems: NavItem[] = [
    { to: '/products', icon: Package, label: 'Productos' },
    { to: '/agent-management', icon: UserCog, label: 'Gestión de Asesores' },
    { 
      icon: Settings, 
      label: 'Configuración',
      isExpanded: false,
      children: [
        { to: '/config/products', icon: Package, label: 'Productos' },
        { to: '/config/message-templates', icon: FileText, label: 'Plantillas de Mensajes' },
      ]
    },
  ];

  return isAdmin ? [...baseItems, ...adminItems] : baseItems;
};

export function Sidebar({ onClose }: { onClose: () => void }) {
  const { signOut, isAdmin, profile } = useAuthStore();
  const [navItems, setNavItems] = useState<NavItem[]>(getNavItems(isAdmin()));
  
  const toggleSubmenu = (index: number) => {
    const updatedItems = [...navItems];
    updatedItems[index] = {
      ...updatedItems[index],
      isExpanded: !updatedItems[index].isExpanded
    };
    setNavItems(updatedItems);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-3 py-4 flex flex-col h-full">
      {/* User Info */}
      <div className="px-4 py-3 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-300">{profile?.email}</p>
        <span className="mt-1 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          {isAdmin() ? 'Administrador' : 'Asesor'}
        </span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={item.label + index}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                    {item.isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {item.isExpanded && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to || '#'}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 text-sm rounded-lg ${
                                isActive
                                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`
                            }
                          >
                            <child.icon className="w-4 h-4 mr-3" />
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.to || '#'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
