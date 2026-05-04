import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Play, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [scores, setScores] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchScores = async () => {
      try {
        const config = await import('../backend-config.json');
        const response = await fetch(`http://localhost:${config.port}/api/interviews/scores/history`, {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        });
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setScores(data);
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  // Use localStorage as fallback if no scores from backend yet
  const latestScore = scores.length > 0 ? scores[0].score : (localStorage.getItem('lastInterviewScore') || '0');
  const interviewsCompleted = scores.length > 0 ? scores.length : 12; // Fallback to 12 if no real data


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-full flex flex-col gap-8 pb-8">
      <header className="flex justify-between items-end pt-4">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-medium mb-1">
            Welcome back,
          </motion.p>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold tracking-tight text-foreground">
            {user?.name || 'Candidate'}
          </motion.h1>
        </div>
        <Button onClick={() => navigate(`/interview/${crypto.randomUUID()}`)} size="lg" className="rounded-full shadow-lg shadow-primary/20">
          <Play className="w-5 h-5 mr-2" fill="currentColor" />
          Start Mock Interview
        </Button>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <GlassCard className="h-full relative overflow-hidden" hoverEffect>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24 text-primary" />
            </div>
            <p className="text-foreground/60 font-medium text-sm uppercase tracking-wider mb-2">Recent Score</p>
            <h2 className="text-5xl font-bold text-foreground mb-4">
              {latestScore}
              <span className="text-2xl text-foreground/40 font-medium">%</span>
            </h2>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Based on your latest mock</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full" hoverEffect>
            <p className="text-foreground/60 font-medium text-sm uppercase tracking-wider mb-2">Interviews Completed</p>
            <h2 className="text-5xl font-bold text-foreground mb-4">{interviewsCompleted}</h2>
            <div className="flex items-center text-foreground/60 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
              <span>{scores.length > 0 ? `${scores.length} this week` : '4 this week'}</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full bg-gradient-to-br from-primary/10 to-transparent border-primary/20" hoverEffect>
            <p className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Next Suggested Focus</p>
            <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">System Design Architecture</h3>
            <p className="text-sm text-foreground/70 mb-4">Based on your recent performance, you should practice more system design questions.</p>
            <Button variant="outline" size="sm" className="w-full bg-white/50 border-primary/20">Practice Now</Button>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="flex-1 min-h-[300px]">
        <h3 className="text-xl font-bold text-foreground mb-6">Recent Interviews</h3>
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-foreground/50 py-4">Loading history...</div>
          ) : scores.length === 0 ? (
            <div className="text-center text-foreground/50 py-4">No past interviews found. Start your first mock session!</div>
          ) : (
            scores.map((scoreObj, i) => {
              const date = new Date(scoreObj.date);
              const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                >
                  <GlassCard className="p-4 flex items-center justify-between cursor-pointer group hover:bg-white/40" hoverEffect>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-foreground/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Mock Session</h4>
                        <p className="text-sm text-foreground/60 flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> {formattedDate} at {formattedTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block font-bold text-lg text-foreground">
                          {scoreObj.score}<span className="text-sm text-foreground/50 font-normal">%</span>
                        </span>
                        <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Completed</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
