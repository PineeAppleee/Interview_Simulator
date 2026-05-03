import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mic2, FileText, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Mic2, label: 'Interviews', path: '/interview' },
    { icon: FileText, label: 'Results', path: '/results' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 p-6 flex flex-col z-10">
      <div className="glass-panel w-full h-full rounded-3xl flex flex-col py-8 px-4 relative overflow-hidden shadow-soft">
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center text-white font-bold shadow-lg">
            AI
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">SimuView</span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative overflow-hidden
                ${isActive ? 'text-primary font-medium' : 'text-foreground/60 hover:text-foreground hover:bg-black/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-2xl z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 z-10 ${isActive ? 'text-primary' : ''}`} />
                  <span className="z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile / Logout */}
        <div className="mt-auto pt-8 border-t border-black/5 flex flex-col gap-2">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
