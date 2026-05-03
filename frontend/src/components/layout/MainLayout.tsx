import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">
      {/* Abstract Background Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 relative z-10 overflow-y-auto h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto h-full flex flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
