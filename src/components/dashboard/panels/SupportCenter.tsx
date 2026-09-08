import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Headphones, 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  FileQuestion, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Clock, 
  RefreshCw,
  QrCode,
  Receipt,
  FileCheck
} from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';
import { useAuthStore } from '../../../store/authStore';

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  transactionRef?: string;
  priority: 'normal' | 'high' | 'critical';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: string;
}

export default function SupportCenter() {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);

  // Search & FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Ticket Form state
  const [category, setCategory] = useState('Payment / QR Issue');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [transactionRef, setTransactionRef] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Diagnostics state
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);

  // Existing tickets list
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-9204',
      category: 'Settlement & Bank Delay',
      subject: 'Instant settlement verification for HDFC merchant account',
      priority: 'normal',
      description: 'Requesting verification of daily auto-settlement cutoff at 11:30 PM.',
      status: 'RESOLVED',
      createdAt: 'Yesterday, 4:15 PM'
    }
  ]);

  const faqs = [
    {
      question: 'How does the ENS Dynamic QR code system work?',
      answer: 'You register your UPI QR once during setup. When generating a payment, simply enter the bill amount. ENS automatically builds an instant, encrypted dynamic UPI URI with the amount locked in. The customer scans it with any UPI app (PhonePe, GPay, Paytm, BHIM, Cred, etc.) and the amount is pre-filled, preventing any customer typo or fraud.'
    },
    {
      question: 'What if a customer is debited but the payment shows Pending / Failed?',
      answer: 'Check the 12-digit UPI reference (UTR) on the customer\'s app. In 99% of cases, network bank timeouts are reversed automatically within T+1 banking hours. You can search the Bill ID in your Transactions tab to re-verify status in real-time or raise an instant ticket below with the UTR number.'
    },
    {
      question: 'How do I re-upload or update my business UPI QR code?',
      answer: 'Navigate to Settings > Business Profile. You can re-upload an updated high-resolution UPI QR image or enter your new VPA / UPI ID (e.g. yourname@okhdfcbank). All subsequent generated dynamic QRs will route funds directly to the new account.'
    },
    {
      question: 'Can I print customer receipts or bills on a thermal printer?',
      answer: 'Yes! Go to the Products & Bill tab or the Print Center. Every completed transaction produces a clean thermal-compatible receipt (80mm / 58mm) that you can print with one click or save as a digital PDF.'
    },
    {
      question: 'Is ENS compliant with NPCI UPI 2.0 guidelines?',
      answer: 'Yes, ENS operates strictly following NPCI UPI specifications. Transactions execute directly peer-to-merchant without any third-party escrow or commission cuts.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket: SupportTicket = {
        id: newTicketId,
        category,
        subject,
        transactionRef: transactionRef.trim() || undefined,
        priority,
        description,
        status: 'OPEN',
        createdAt: 'Just now'
      };

      setTickets(prev => [newTicket, ...prev]);
      setIsSubmitting(false);
      setSubmissionSuccess(newTicketId);
      setSubject('');
      setDescription('');
      setTransactionRef('');
    }, 900);
  };

  const handleRunDiagnostic = () => {
    setRunningDiagnostic(true);
    setDiagnosticComplete(false);
    setTimeout(() => {
      setRunningDiagnostic(false);
      setDiagnosticComplete(true);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* ============================================================ */}
      {/* HEADER SECTION                                               */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A6BFF]/15 border border-[#1A6BFF]/30 flex items-center justify-center text-[#1A6BFF] shadow-[0_0_15px_rgba(26,107,255,0.35)]">
            <Headphones size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#FFFFFF]">ENS Help & Support Hub</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse"></span>
                24/7 Priority Active
              </span>
            </div>
            <p className="text-xs text-[#7E8B9F] mt-0.5">
              Merchant account: <span className="text-[#F0F4FF] font-medium">{currentBusiness?.name || 'My Store'}</span> ({currentUser?.email || 'Admin'})
            </p>
          </div>
        </div>

        {/* Quick Diagnostic Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={runningDiagnostic}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B132B] border border-[rgba(255,255,255,0.1)] text-xs font-semibold text-[#F0F4FF] hover:border-[#1A6BFF]/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={runningDiagnostic ? 'animate-spin text-[#1A6BFF]' : 'text-[#7E8B9F]'} />
            <span>{runningDiagnostic ? 'Diagnosing...' : 'Run System Check'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Result Banner if triggered */}
      <AnimatePresence>
        {diagnosticComplete && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#00D26A]/10 border border-[#00D26A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#00D26A] shrink-0" />
              <div>
                <span className="font-bold text-[#FFFFFF]">System Health Check Passed:</span>{' '}
                <span className="text-[#A2B4D6]">UPI Gateway (38ms latency), Dynamic QR Engine (100% OK), Local Cache Ready.</span>
              </div>
            </div>
            <button 
              onClick={() => setDiagnosticComplete(false)} 
              className="text-[#7E8B9F] hover:text-[#FFFFFF] text-[11px] underline ml-auto"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 4 DIRECT CHANNELS CARDS                                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Channel 1: Merchant Helpline */}
        <div className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#1A6BFF]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A6BFF]/15 border border-[#1A6BFF]/30 flex items-center justify-center text-[#1A6BFF]">
                <PhoneCall size={18} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1A6BFF]/15 text-[#1A6BFF]">
                24x7 Priority
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#FFFFFF]">Merchant Helpline</h3>
            <p className="text-xs font-mono text-[#1A6BFF] mt-1 font-semibold">+91 88675 41037</p>
            <p className="text-[11px] text-[#7E8B9F] mt-1">Direct support for failed transactions & terminal issues.</p>
          </div>
          <a
            href="tel:8867541037"
            className="mt-4 w-full py-2 rounded-xl bg-[#1A6BFF]/20 hover:bg-[#1A6BFF] text-[#F0F4FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>Call Helpline</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Channel 2: WhatsApp Business Desk */}
        <div className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#00D26A]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
                <MessageSquare size={18} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00D26A]/15 text-[#00D26A]">
                Avg &lt; 2 mins
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#FFFFFF]">WhatsApp Priority</h3>
            <p className="text-xs font-mono text-[#00D26A] mt-1 font-semibold">+91 88675 41037</p>
            <p className="text-[11px] text-[#7E8B9F] mt-1">Instant photo & screenshot sharing for quick troubleshooting.</p>
          </div>
          <a
            href="https://wa.me/918867541037?text=Hi%20ENS%20Support,%20I%20need%20assistance%20with%20my%20merchant%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full py-2 rounded-xl bg-[#00D26A]/20 hover:bg-[#00D26A] text-[#F0F4FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>Open WhatsApp</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Channel 3: Email Support Desk */}
        <div className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] hover:border-[#FFD700]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                <Mail size={18} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFD700]/15 text-[#FFD700]">
                Official Desk
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#FFFFFF]">Email Support</h3>
            <p className="text-xs font-mono text-[#FFD700] mt-1 font-semibold break-all">excellentnationalsystems@gmail.com</p>
            <p className="text-[11px] text-[#7E8B9F] mt-1">For official billing statements, account changes & tax records.</p>
          </div>
          <a
            href="mailto:excellentnationalsystems@gmail.com?subject=ENS%20Merchant%20Support%20Request"
            className="mt-4 w-full py-2 rounded-xl bg-[#FFD700]/20 hover:bg-[#FFD700] hover:text-[#070D1E] text-[#F0F4FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>Send Email</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Channel 4: Security & Settlement SLA */}
        <div className="p-5 rounded-2xl bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#7E8B9F]/15 border border-[#7E8B9F]/30 flex items-center justify-center text-[#A2B4D6]">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00D26A]/15 text-[#00D26A]">
                NPCI 2.0
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#FFFFFF]">Settlement Guarantee</h3>
            <p className="text-xs text-[#A2B4D6] mt-1">T+0 Real-time Bank Settlement</p>
            <p className="text-[11px] text-[#7E8B9F] mt-1">Direct IMPS/UPI routing straight to your linked bank account.</p>
          </div>
          <div className="mt-4 py-2 px-3 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.05)] text-[11px] text-[#7E8B9F] flex items-center gap-2">
            <Activity size={12} className="text-[#00D26A]" />
            <span>99.98% UPI Success Rate</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2-COLUMN SECTION: TICKET FORM & ACTIVE TICKETS               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create Support Ticket Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
                <FileCheck size={18} className="text-[#1A6BFF]" />
                Raise Support Ticket
              </h2>
              <p className="text-xs text-[#7E8B9F] mt-0.5">Submit an issue directly to the ENS technical operations team</p>
            </div>
            <span className="text-[11px] font-mono text-[#1A6BFF] px-2.5 py-1 rounded-lg bg-[#1A6BFF]/10 border border-[#1A6BFF]/20">
              Avg SLA: 15 mins
            </span>
          </div>

          {submissionSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#00D26A]" />
                <div>
                  <p className="text-xs font-bold text-[#FFFFFF]">Ticket Created Successfully!</p>
                  <p className="text-[11px] text-[#A2B4D6]">Reference ID: <span className="font-mono text-[#00D26A] font-bold">{submissionSuccess}</span>. An ENS support engineer has been notified.</p>
                </div>
              </div>
              <button 
                onClick={() => setSubmissionSuccess(null)}
                className="text-xs text-[#7E8B9F] hover:text-[#FFFFFF] ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            
            {/* Category and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A2B4D6] mb-1.5">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs text-[#F0F4FF] focus:border-[#1A6BFF] focus:outline-none focus:ring-1 focus:ring-[#1A6BFF]"
                >
                  <option value="Payment / QR Issue">Payment / QR Code Generation</option>
                  <option value="Payment Not Credited">Payment Debited but Not Credited</option>
                  <option value="Settlement & Bank Delay">Settlement & Bank Account Query</option>
                  <option value="Thermal Receipt / Printing">Thermal Receipt / Printing Issue</option>
                  <option value="Account & Profile Settings">Account & Profile Update</option>
                  <option value="Other Technical Query">Other Technical Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A2B4D6] mb-1.5">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'high', 'critical'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
                        priority === p
                          ? p === 'critical'
                            ? 'bg-[#FF3B5C]/20 text-[#FF3B5C] border-[#FF3B5C]'
                            : p === 'high'
                            ? 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]'
                            : 'bg-[#1A6BFF]/20 text-[#1A6BFF] border-[#1A6BFF]'
                          : 'bg-[#070D1E] text-[#7E8B9F] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject and Transaction Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#A2B4D6] mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., QR timeout on payment ₹1,250"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs text-[#F0F4FF] placeholder-[#7E8B9F]/60 focus:border-[#1A6BFF] focus:outline-none focus:ring-1 focus:ring-[#1A6BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A2B4D6] mb-1.5">Bill / Ref ID <span className="text-[#7E8B9F]">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="ENS-125"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-[#F0F4FF] placeholder-[#7E8B9F]/60 focus:border-[#1A6BFF] focus:outline-none focus:ring-1 focus:ring-[#1A6BFF]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#A2B4D6] mb-1.5">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Describe what happened, error message shown on customer phone, or any relevant details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs text-[#F0F4FF] placeholder-[#7E8B9F]/60 focus:border-[#1A6BFF] focus:outline-none focus:ring-1 focus:ring-[#1A6BFF] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#7E8B9F] flex items-center gap-1.5">
                <Clock size={13} />
                Tickets are addressed in order of priority.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A6BFF] to-[#3BA0FF] hover:from-[#1558D6] hover:to-[#2F8BF5] text-white text-xs font-bold shadow-[0_0_20px_rgba(26,107,255,0.4)] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Active Tickets & System Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Tickets List */}
          <div className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#FFFFFF]">Recent Tickets</h3>
              <span className="text-xs text-[#7E8B9F]">{tickets.length} total</span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#1A6BFF]">{t.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.status === 'RESOLVED'
                        ? 'bg-[#00D26A]/15 text-[#00D26A] border border-[#00D26A]/30'
                        : t.status === 'INVESTIGATING'
                        ? 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30'
                        : 'bg-[#1A6BFF]/15 text-[#1A6BFF] border border-[#1A6BFF]/30'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#FFFFFF] line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-[#7E8B9F] line-clamp-2 mt-1">{t.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)] text-[10px] text-[#7E8B9F]">
                    <span>Category: {t.category}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Troubleshooting Guide Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A6BFF]/10 via-[#0D152D] to-[#070D1E] border border-[#1A6BFF]/20">
            <h4 className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5 mb-2">
              <AlertCircle size={14} className="text-[#1A6BFF]" />
              Quick Cashier Checklist
            </h4>
            <ul className="text-[11px] text-[#A2B4D6] space-y-1.5 pl-1">
              <li>• Always verify customer receives green checkmark on their app before dispatching goods.</li>
              <li>• If the QR expires after 5 minutes, click <strong>"New Payment"</strong> to refresh instantly.</li>
              <li>• Keep your thermal printer connected via USB or browser print dialog for receipts.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* FREQUENTLY ASKED QUESTIONS (SEARCHABLE ACCORDION)            */}
      {/* ============================================================ */}
      <div className="bg-[#0D152D]/90 border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-lg backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
              <FileQuestion size={18} className="text-[#00D26A]" />
              Merchant Knowledge Base & FAQs
            </h2>
            <p className="text-xs text-[#7E8B9F] mt-0.5">Quick self-service answers to standard payment and operation queries</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8B9F]" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#070D1E] border border-[rgba(255,255,255,0.08)] text-xs text-[#F0F4FF] placeholder-[#7E8B9F]/60 focus:border-[#1A6BFF] focus:outline-none"
            />
          </div>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#7E8B9F]">
              No matching help articles found for "{searchQuery}". You can raise a ticket above for custom assistance.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-xl bg-[#070D1E]/80 border border-[rgba(255,255,255,0.04)] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-[#FFFFFF]">{faq.question}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-[#7E8B9F] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#1A6BFF]' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-1 text-xs text-[#A2B4D6] leading-relaxed border-t border-[rgba(255,255,255,0.03)]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
