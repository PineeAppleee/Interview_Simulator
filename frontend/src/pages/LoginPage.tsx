import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({ id: '1', name: 'Alex Developer', email });
      addToast('Welcome back!', 'success');
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/10 blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-warm mx-auto mb-6 flex items-center justify-center shadow-xl shadow-primary/20 text-white font-bold text-2xl">
            AI
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome to SimuView</h1>
          <p className="text-foreground/60">Sign in to your premium interview platform</p>
        </motion.div>

        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
            />
            
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-foreground/30 group-hover:border-primary transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-sm bg-primary scale-0 group-hover:scale-100 transition-transform" />
                </div>
                <span className="text-sm text-foreground/70">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary font-medium hover:underline">Forgot Password?</a>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-4 h-12 text-lg">
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-foreground/60 mt-4">
              Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Sign up</a>
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
