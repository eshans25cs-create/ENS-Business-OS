import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, FileText, IndianRupee, Clock } from 'lucide-react';
import { useBillingStore, type ExpenseCategory } from '../../../store/billingStore';
import { useBusinessStore } from '../../../store/businessStore';
import { useAuthStore } from '../../../store/authStore';

const CATEGORIES: ExpenseCategory[] = ['Rent', 'Utilities', 'Salaries', 'Inventory', 'Maintenance', 'Marketing', 'Taxes', 'Insurance', 'Logistics', 'Equipment', 'Other'];

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1000;
    const incrementTime = 16;
    const step = (end - start) / (duration / incrementTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>₹{displayValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>;
};

const ExpenseManager = () => {
  const { currentUser } = useAuthStore();
  const { getCurrentBusiness } = useBusinessStore();
  const currentBusiness = getCurrentBusiness(currentUser?.id);
  const { expenses: storeExpenses, addExpense } = useBillingStore();

  const businessExpenses = storeExpenses.filter(e => e.businessId === currentBusiness.id);

  const [formData, setFormData] = useState<{ title: string; amount: string; category: ExpenseCategory }>({
    title: '',
    amount: '',
    category: CATEGORIES[0]
  });

  const totalExpense = businessExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    addExpense({
      businessId: currentBusiness.id,
      name: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: Date.now(),
      description: formData.category,
    });
    
    setFormData({ title: '', amount: '', category: CATEGORIES[0] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-full bg-[rgba(6,15,32,0.85)] text-[#F0F4FF] rounded-xl border border-[rgba(255,255,255,0.08)]">
      
      {/* Left Column: Form */}
      <motion.div 
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="lg:col-span-1 bg-[#0D152D] rounded-xl border border-white/5 p-6 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="w-5 h-5 text-[#0A84FF]" />
          <h2 className="text-xl font-bold">Add Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#6B7FA3] mb-1.5">Expense Title</label>
            <motion.input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#070D1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0A84FF] focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all"
              placeholder="e.g. Office Supplies"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          <div>
            <label className="block text-sm text-[#6B7FA3] mb-1.5">Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7FA3]" />
              <motion.input 
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-[#070D1E] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0A84FF] focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all"
                placeholder="0.00"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#6B7FA3] mb-1.5">Category</label>
            <motion.select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as ExpenseCategory})}
              className="w-full bg-[#070D1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0A84FF] focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all appearance-none"
              whileFocus={{ scale: 1.01 }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </motion.select>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-2 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0A84FF]/20"
          >
            <PlusCircle className="w-4 h-4" />
            Save Expense
          </motion.button>
        </form>
      </motion.div>

      {/* Right Column: Summary & List */}
      <motion.div 
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="lg:col-span-2 flex flex-col gap-6"
      >
        {/* Summary Bar */}
        <div className="bg-[#0D152D] rounded-xl border border-white/5 p-6 shadow-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-[#6B7FA3] text-sm font-medium mb-1">Total Expenses</h3>
              <div className="text-3xl font-bold text-white font-mono">
                <AnimatedCounter value={totalExpense} />
              </div>
            </div>
            <FileText className="w-6 h-6 text-[#00C896]" />
          </div>
          
          {/* Animated Breakdown Bar */}
          <div className="h-2 w-full bg-[#070D1E] rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-[#0A84FF]"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '35%' }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-[#00C896]"
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '25%' }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-[#FFD700]"
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-[#6B7FA3]">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0A84FF]"></span> Rent/Ops</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00C896]"></span> Salary</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFD700]"></span> Other</div>
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="bg-[#0D152D] rounded-xl border border-white/5 p-6 shadow-xl flex-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FFD700]" />
            Recent Expenses
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {businessExpenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10, boxShadow: "0px 0px 0px rgba(10,132,255,0)" }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    boxShadow: ["0px 0px 15px rgba(10,132,255,0.4)", "0px 0px 0px rgba(10,132,255,0)"]
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.05,
                    boxShadow: { duration: 1 }
                  }}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#070D1E] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0D152D] border border-white/5 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-[#6B7FA3]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{expense.name}</h4>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="text-[#0A84FF] bg-[#0A84FF]/10 px-1.5 py-0.5 rounded">{expense.category}</span>
                        <span className="text-[#6B7FA3]">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#FF3B5C]">
                    -₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {businessExpenses.length === 0 && (
              <div className="text-center text-[#6B7FA3] py-8">
                No expenses recorded yet. Use the form on the left to add one!
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default ExpenseManager;
