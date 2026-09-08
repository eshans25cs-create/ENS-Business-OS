import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, QrCode, Receipt, ArrowUpDown,
  Wallet, TrendingUp, Printer, Settings, LogOut,
  Package, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { id: 'qr', icon: <QrCode size={20} />, label: 'Generate QR' },
  { id: 'billing', icon: <Receipt size={20} />, label: 'Create Bill', roles: ['BUSINESS_ADMIN', 'BRANCH_MANAGER', 'ENS_ADMIN'] },
  { id: 'transactions', icon: <ArrowUpDown size={20} />, label: 'Transactions', roles: ['BUSINESS_ADMIN', 'BRANCH_MANAGER', 'ENS_ADMIN'] },
  { id: 'expenses', icon: <Wallet size={20} />, label: 'Expenses', roles: ['BUSINESS_ADMIN', 'ENS_ADMIN'] },
  { id: 'profit', icon: <TrendingUp size={20} />, label: 'Profit & Reports', roles: ['BUSINESS_ADMIN', 'ENS_ADMIN'] },
  { id: 'products', icon: <Package size={20} />, label: 'Products', roles: ['BUSINESS_ADMIN', 'ENS_ADMIN'] },
  { id: 'print', icon: <Printer size={20} />, label: 'Print Center', roles: ['BUSINESS_ADMIN', 'BRANCH_MANAGER', 'ENS_ADMIN'] },
  { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface FloatingNavigationProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

export default function FloatingNavigation({ activePanel, onPanelChange }: FloatingNavigationProps) {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const userRole = currentUser?.role || 'CASHIER';

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center py-5 gap-1"
      style={{
        width: '64px',
        background: 'rgba(6,15,32,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ENS Logo */}
      <div className="mb-4 mt-1">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPanelChange('home')}
          className="cursor-pointer"
          style={{ filter: 'drop-shadow(0 0 8px rgba(10,132,255,0.5))' }}
        >
          <img
            src="/ens-logo.jpg"
            alt="ENS"
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              objectFit: 'cover',
              border: '1px solid rgba(10,132,255,0.4)',
            }}
          />
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-8 h-[1px] mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1 items-center w-full px-2">
        {visibleItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <div key={item.id} className="relative w-full flex items-center justify-center">
              <motion.button
                onClick={() => onPanelChange(item.id)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(10,132,255,0.2)' : 'transparent',
                  color: isActive ? '#0A84FF' : '#6B7FA3',
                  border: isActive ? '1px solid rgba(10,132,255,0.4)' : '1px solid transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(10,132,255,0.15)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: '#0A84FF' }}
                  />
                )}
              </motion.button>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-14 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none"
                    style={{
                      background: 'rgba(6,15,32,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F0F4FF',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.label}
                      <ChevronRight size={10} className="text-[#6B7FA3]" />
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                      style={{ background: 'rgba(6,15,32,0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-[1px] mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* User avatar */}
      <motion.div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black cursor-pointer mb-1"
        style={{ background: 'rgba(10,132,255,0.15)', color: '#0A84FF', border: '1px solid rgba(10,132,255,0.2)' }}
        onHoverStart={() => setHoveredItem('user')}
        onHoverEnd={() => setHoveredItem(null)}
        whileHover={{ scale: 1.05 }}
      >
        {(currentUser?.fullName?.charAt(0) || 'U').toUpperCase()}

        <AnimatePresence>
          {hoveredItem === 'user' && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="absolute left-14 z-50 px-3 py-2 rounded-lg text-xs whitespace-nowrap pointer-events-none"
              style={{ background: 'rgba(6,15,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF' }}
            >
              <p className="font-semibold">{currentUser?.fullName}</p>
              <p className="text-[#6B7FA3] text-[10px]">{currentUser?.role?.replace('_', ' ')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        onHoverStart={() => setHoveredItem('logout')}
        onHoverEnd={() => setHoveredItem(null)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{ color: '#6B7FA3' }}
        title="Logout"
      >
        <LogOut size={18} />
        <AnimatePresence>
          {hoveredItem === 'logout' && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="absolute left-14 z-50 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
              style={{ background: 'rgba(255,59,92,0.15)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}
            >
              Logout
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.nav>
  );
}
