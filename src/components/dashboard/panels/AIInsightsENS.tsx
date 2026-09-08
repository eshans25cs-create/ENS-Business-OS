import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const AIInsightsENS = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI thinking time
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const insights = [
    { type: 'positive', title: 'Sales Trend Anomaly', message: 'Revenue is up 15% compared to typical Tuesdays. Your "Premium Widget" is driving the growth.', icon: TrendingUp },
    { type: 'warning', title: 'Expense Alert', message: 'Utility expenses are 20% higher than the 3-month average. Check for inefficiencies.', icon: AlertCircle },
    { type: 'success', title: 'Payment Success Rate', message: 'UPI payment success rate is 99.2% today, optimal performance.', icon: CheckCircle },
    { type: 'info', title: 'Inventory Prediction', message: 'Based on current velocity, "Basic Gadget" will run out of stock in 4 days.', icon: Zap }
  ];

  const getColor = (type: string) => {
    switch(type) {
      case 'positive': return 'text-[#0A84FF] bg-[rgba(10,132,255,0.1)] border-[#0A84FF]';
      case 'warning': return 'text-[#FFD700] bg-[rgba(255,215,0,0.1)] border-[#FFD700]';
      case 'success': return 'text-[#00C896] bg-[rgba(0,200,150,0.1)] border-[#00C896]';
      default: return 'text-[#F0F4FF] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]';
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="bg-[rgba(6,15,32,0.85)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 backdrop-blur min-h-full">
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-[#0A84FF] to-[#00C896] rounded-xl mr-4 shadow-[0_0_15px_rgba(10,132,255,0.4)]">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F0F4FF]">ENS Business Intelligence</h2>
            <p className="text-sm text-[#6B7FA3]">AI-powered insights for your operations</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] mr-4"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/4"></div>
                  <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className={`flex p-4 rounded-xl border ${getColor(insight.type)} bg-opacity-20`}
                >
                  <div className="mr-4 mt-1">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsENS;
