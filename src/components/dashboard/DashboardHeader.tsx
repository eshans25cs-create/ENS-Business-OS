import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Database, Smartphone, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useBusinessStore } from '../../store/businessStore';
import { useBillingStore } from '../../store/billingStore';
import { checkPostgresStatus, type DbStatus } from '../../utils/postgresService';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const { getTodayRevenue } = useBillingStore();
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  useEffect(() => {
    checkPostgresStatus().then(setDbStatus);
    const interval = setInterval(() => {
      checkPostgresStatus().then(setDbStatus);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const revenue = currentBusiness?.id ? getTodayRevenue(currentBusiness.id) : 0;
  const firstName = currentUser?.fullName?.split(' ')[0] || 'User';
  const initials = currentUser?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const handleExit = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="min-h-[80px] px-4 md:px-8 py-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[rgba(3,11,26,0.8)] backdrop-blur-md z-20 pt-[max(env(safe-area-inset-top,0px),12px)]">
      <div>
        <h1 className="text-xl font-bold text-[#F0F4FF] tracking-wide">
          {currentBusiness?.name || 'ENS Business OS'}
        </h1>
        <p className="text-sm text-[#6B7FA3]">
          {getGreeting()}, <span className="text-[#0A84FF] font-medium">{firstName}</span>! • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* PostgreSQL Database Badge */}
        <div 
          title={dbStatus?.connected ? `Connected to PostgreSQL (${dbStatus.database})` : 'PostgreSQL: Offline fallback active. Configure .env with live DB credentials.'}
          className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            dbStatus?.connected 
              ? 'bg-[rgba(0,200,150,0.1)] border-[rgba(0,200,150,0.3)] text-[#00C896]'
              : 'bg-[rgba(255,215,0,0.08)] border-[rgba(255,215,0,0.25)] text-[#FFD700]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{dbStatus?.connected ? 'PostgreSQL Active' : 'Postgres Mode'}</span>
          <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-[#00C896] animate-pulse' : 'bg-[#FFD700]'}`} />
        </div>

        {currentUser?.role !== 'CASHIER' && (
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs text-[#6B7FA3]">Today's Revenue</span>
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[#00C896] font-bold text-lg font-mono"
            >
              ₹{revenue.toLocaleString('en-IN')}
            </motion.span>
          </div>
        )}

        <button 
          title="Notifications"
          className="relative p-2 text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#0A84FF] rounded-full"></span>
        </button>

        <div 
          title={currentUser?.fullName || 'User'}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] flex items-center justify-center text-[#030B1A] font-bold text-sm border-2 border-[rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(10,132,255,0.3)] select-none"
        >
          {initials}
        </div>

        {/* Download Mobile APK Button */}
        <a
          href="/ENS-Business-OS.apk"
          download="ENS-Business-OS.apk"
          title="Download Android Mobile App (APK)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(10,132,255,0.3)] bg-[rgba(10,132,255,0.1)] text-[#3BA0FF] hover:bg-[#0A84FF] hover:text-[#030B1A] transition-all text-xs font-semibold cursor-pointer select-none"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Download App</span>
          <Download className="w-3.5 h-3.5" />
        </a>

        {/* Top Header Exit/Logout Button */}
        <button
          onClick={handleExit}
          title="Exit / Logout (LogOut)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,59,92,0.3)] bg-[rgba(255,59,92,0.1)] text-[#FF3B5C] hover:bg-[#FF3B5C] hover:text-white transition-all text-xs font-semibold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
