import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { User, Shield, Bell, Save } from 'lucide-react';

export const SettingsPage = () => {
  const user = useAuthStore(state => state.user);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast('Settings saved successfully', 'success');
    }, 800);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto w-full pb-8">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-foreground/60 mt-1">Manage your account preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-md rounded-2xl text-primary font-medium shadow-sm border border-black/5">
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 rounded-2xl text-foreground/70 transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 rounded-2xl text-foreground/70 transition-colors">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Personal Information</h3>
            
            <div className="flex flex-col gap-5">
              <Input 
                label="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <Input 
                label="Email Address" 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              
              <div className="mt-4 pt-6 border-t border-black/5 flex justify-end">
                <Button onClick={handleSave} isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
