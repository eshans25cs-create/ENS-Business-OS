import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  FileText, 
  Package, 
  Wallet, 
  Settings, 
  HelpCircle, 
  LogOut,
  Search,
  Bell,
  Sun,
  Activity,
  ChevronDown,
  Smartphone,
  Download,
  Menu,
  X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '../../store/authStore';
import { useBusinessStore } from '../../store/businessStore';
import FinancialOverview from './panels/FinancialOverview';
import QRGenerator from './panels/QRGenerator';
import CreateBill from './panels/CreateBill';
import TransactionHistory from './panels/TransactionHistory';
import ExpenseManager from './panels/ExpenseManager';
import ProfitCalculator from './panels/ProfitCalculator';
import AIInsightsENS from './panels/AIInsightsENS';
import PrintCenter from './panels/PrintCenter';
import SupportCenter from './panels/SupportCenter';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { getCurrentBusiness, businesses, createBusiness, setCurrentBusiness } = useBusinessStore();
  
  // Ensure user has their own business created if registering without one
  const currentBusiness = (() => {
    let biz = getCurrentBusiness(currentUser?.id);
    if (currentUser && currentUser.id !== 'user_demo_admin' && currentUser.id !== 'user_demo_cashier') {
      const userBiz = businesses.find(b => b.ownerId === currentUser.id);
      if (!userBiz) {
        // Auto-initialize a dedicated personal business for this new user
        const cleanName = currentUser.fullName || 'My Store';
        const defaultUpi = `${(currentUser.username || 'merchant').toLowerCase()}@upi`;
        biz = createBusiness({
          ownerId: currentUser.id,
          name: `${cleanName.toUpperCase()} STORE`,
          type: 'Smart Bazaar',
          address: 'Main Commercial Hub',
          phone: '+91 98000 00000',
          upiId: defaultUpi,
          merchantName: cleanName,
        });
      } else {
        biz = userBiz;
      }
    }
    return biz;
  })();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'create-payment' | 'transactions' | 'reports' | 'products' | 'expenses' | 'settings' | 'support'>('dashboard');

  const handleExit = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'create-payment', icon: CreditCard, label: 'Create Payment' },
    { id: 'transactions', icon: Receipt, label: 'Transactions' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'expenses', icon: Wallet, label: 'Expenses' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinancialOverview onCreatePayment={() => setActiveTab('create-payment')} onNavigateTab={(tab: any) => setActiveTab(tab)} />;
      case 'create-payment':
        return <QRGenerator />;
      case 'transactions':
        return <TransactionHistory />;
      case 'products':
        return <CreateBill />;
      case 'reports':
        return <ProfitCalculator />;
      case 'expenses':
        return <ExpenseManager />;
      case 'settings':
        return <AIInsightsENS />;
      case 'support':
        return <SupportCenter />;
      default:
        return <FinancialOverview onCreatePayment={() => setActiveTab('create-payment')} onNavigateTab={(tab: any) => setActiveTab(tab)} />;
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#070D1E] text-[#F0F4FF] overflow-hidden selection:bg-[#0A84FF] selection:text-white font-sans">
      
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* LEFT SIDEBAR (DESKTOP & MOBILE SLIDE-OUT DRAWER)            */}
      {/* ============================================================ */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-[240px] bg-[#0B132B] lg:bg-[#0B132B]/95 border-r border-[rgba(255,255,255,0.06)] flex flex-col justify-between p-4 backdrop-blur-xl transition-transform duration-300 ease-in-out pt-[max(env(safe-area-inset-top,0px),16px)] pb-[max(env(safe-area-inset-bottom,0px),16px)] ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-2 py-3 mb-5">
            <div className="flex items-center gap-2.5">
              {/* 3D Isometric Cube Icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(10,132,255,0.5)]">
                <img src="/ens-logo.jpg" alt="ENS" className="w-full h-full object-cover rounded-md" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider text-[#FFFFFF] leading-none">ENS</h1>
                <p className="text-[8px] font-bold tracking-widest text-[#0A84FF] uppercase mt-0.5">SMART TRANSACTION</p>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#7E8B9F] hover:text-white hover:bg-white/5 lg:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1A6BFF] text-white shadow-[0_0_18px_rgba(26,107,255,0.4)]'
                      : 'text-[#7E8B9F] hover:text-[#F0F4FF] hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[#7E8B9F]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card at Bottom */}
        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#0A84FF]/40 bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] flex items-center justify-center text-[#030B1A] font-bold text-xs">
                {(currentUser?.fullName?.charAt(0) || 'E').toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#00D26A] rounded-full border border-[#0B132B]"></span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#F0F4FF] truncate leading-tight">
                  {currentUser?.fullName || 'Eshan S'}
                </p>
                <p className="text-[10px] text-[#7E8B9F] truncate">Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleExit}
              title="Logout / Exit"
              className="p-1 hover:text-[#FF3B5C] text-[#7E8B9F] transition-colors cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar with Mobile Status Bar Safe Area Padding */}
        <header className="min-h-[64px] sm:min-h-[72px] px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#0B132B]/95 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between backdrop-blur-md z-10 pt-[max(env(safe-area-inset-top,0px),10px)] sm:pt-3">
          {/* Left Side: Hamburger & Store Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-[#7E8B9F] hover:text-[#F0F4FF] hover:bg-white/5 rounded-xl lg:hidden cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>

            {/* Store Branding */}
            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#FFFFFF] tracking-tight leading-none truncate max-w-[140px] sm:max-w-[220px]">
                  {currentBusiness?.name || 'ENS Store'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#1A6BFF]/20 border border-[#1A6BFF]/40 text-[#3BA0FF] text-[10px] font-semibold">
                  Business
                </span>
              </div>
              <p className="text-[10px] text-[#7E8B9F] mt-1 truncate">
                ENS Smart Transaction OS
              </p>
            </div>
          </div>

          {/* Center Search Input (Desktop only) */}
          <div className="hidden xl:flex items-center w-60 relative mx-4">
            <Search size={14} className="absolute left-3 text-[#7E8B9F]" />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus:border-[#1A6BFF] text-xs text-[#F0F4FF] placeholder-[#7E8B9F] pl-9 pr-4 py-2 rounded-xl outline-none transition-all"
            />
          </div>

          {/* Right Side: Download App, Alerts & USER DETAILS IN TOP-RIGHT CORNER */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Download Mobile App (APK) Button (Only visible on web browser, hidden inside installed app) */}
            {!(Capacitor.isNativePlatform() || 
               (typeof window !== 'undefined' && (
                 window.location.protocol === 'capacitor:' || 
                 window.location.protocol === 'file:' || 
                 window.location.hostname === 'localhost' ||
                 window.navigator.userAgent.includes('wv') ||
                 window.navigator.userAgent.includes('ENSBusinessOS')
               ))) && (
              <a
                href="/ENS-Business-OS.apk"
                download="ENS-Business-OS.apk"
                title="Download Android Mobile App (APK)"
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#0A84FF]/30 bg-[#0A84FF]/10 text-[#3BA0FF] hover:bg-[#0A84FF] hover:text-[#030B1A] transition-all text-xs font-semibold cursor-pointer select-none"
              >
                <Smartphone size={13} />
                <span className="hidden lg:inline">App</span>
                <Download size={12} />
              </a>
            )}

            {/* Notification Bell with Badge */}
            <button className="relative w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#7E8B9F] hover:text-[#F0F4FF] transition-all cursor-pointer">
              <Bell size={15} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF3B5C] rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-md">
                3
              </span>
            </button>

            {/* USER DETAILS IN TOP-RIGHT CORNER (Always visible on mobile & desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-[rgba(255,255,255,0.08)]">
              {/* User Avatar with Online Dot */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 border border-[#0A84FF]/50 bg-gradient-to-br from-[#0A84FF] to-[#3BA0FF] flex items-center justify-center text-[#030B1A] font-bold text-xs shadow-[0_0_12px_rgba(10,132,255,0.4)]">
                {(currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || 'U').toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#00D26A] rounded-full border border-[#0B132B]"></span>
              </div>

              {/* User Name & Role */}
              <div className="text-right block max-w-[70px] sm:max-w-[160px]">
                <p className="text-[11px] sm:text-xs font-bold text-[#F0F4FF] truncate leading-tight">
                  {currentUser?.fullName?.split(' ')[0] || currentUser?.username || 'Partner'}
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#3BA0FF] font-medium leading-none mt-0.5 truncate">
                  {currentUser?.role === 'BUSINESS_ADMIN' ? 'Owner' : 'User'}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleExit}
                title="Logout / Exit"
                className="p-1 sm:p-1.5 rounded-lg text-[#7E8B9F] hover:text-[#FF3B5C] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#070D1E] pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar with Safe Area Bottom Padding */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 pb-[max(env(safe-area-inset-bottom,0px),4px)] bg-[#0B132B]/95 border-t border-[rgba(255,255,255,0.08)] backdrop-blur-xl z-30 flex items-center justify-around px-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'create-payment', icon: CreditCard, label: 'QR Pay' },
            { id: 'transactions', icon: Receipt, label: 'History' },
            { id: 'expenses', icon: Wallet, label: 'Expense' },
            { id: 'reports', icon: FileText, label: 'Reports' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-[#1A6BFF]' : 'text-[#7E8B9F]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#1A6BFF]' : 'text-[#7E8B9F]'} />
                <span className="text-[10px] font-semibold mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
