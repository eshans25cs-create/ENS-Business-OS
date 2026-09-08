import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Plus, History, Lock, Settings } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Shield, exact: true },
  { to: '/create', label: 'Create QR', icon: Plus },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/security', label: 'Security', icon: Lock },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(3,7,18,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#00F5D4] flex items-center justify-center">
          <Shield size={16} className="text-[#030712]" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-[0.12em] text-[#F8FAFC]">CYBER SURETY</span>
          <p className="text-[9px] tracking-[0.2em] text-[#94A3B8] -mt-0.5">SMART UPI PAYMENTS</p>
        </div>
      </NavLink>

      {/* Links - desktop */}
      <div className="hidden md:flex items-center gap-1">
        {links.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                isActive
                  ? 'text-[#00C6FF] bg-[#00C6FF]/10'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
              }`}
            >
              <Icon size={13} />
              {label}
            </NavLink>
          );
        })}
      </div>

      {/* Create QR CTA */}
      <NavLink
        to="/create"
        className="px-4 py-2 rounded-xl text-xs font-bold tracking-[0.1em] uppercase bg-gradient-to-r from-[#00C6FF] to-[#00F5D4] text-[#030712] hover:shadow-lg hover:shadow-[#00C6FF]/25 transition-all hidden sm:flex items-center gap-1.5"
      >
        <Plus size={13} />
        CREATE QR
      </NavLink>
    </motion.nav>
  );
}
