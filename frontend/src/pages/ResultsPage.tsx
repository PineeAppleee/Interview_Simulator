import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Trophy, Target, Award, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResultsPage = () => {
  const navigate = useNavigate();
  
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
    <div className="h-full flex flex-col gap-6 pb-8">
      <header className="flex justify-between items-center bg-gradient-warm text-white px-8 py-10 rounded-3xl shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 opacity-10 scale-150 translate-x-1/4 -translate-y-1/4">
          <Trophy className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1 uppercase tracking-wider text-sm">Interview Completed</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Senior Frontend Developer</h1>
          <div className="flex items-center gap-4 text-white/90">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 45 Minutes</span>
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> 8 Questions</span>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
          <span className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Overall Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-bold">4.2</span>
            <span className="text-xl text-white/70 font-medium">/ 5</span>
          </div>
        </div>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Strengths / Weaknesses */}
        <div className="flex flex-col gap-6">
          <motion.div variants={item}>
            <GlassCard className="h-full bg-green-500/5 border-green-500/10">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Key Strengths
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  "Strong understanding of React component lifecycle.",
                  "Excellent communication of complex state management concepts.",
                  "Good problem-solving approach to performance optimization."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-foreground/80 leading-relaxed text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
          
          <motion.div variants={item}>
            <GlassCard className="h-full bg-orange-500/5 border-orange-500/10">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Areas for Improvement
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  "Could provide more concrete examples of Webpack configuration.",
                  "Hesitated when explaining Service Workers lifecycle."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                    <span className="text-foreground/80 leading-relaxed text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        {/* Breakdown */}
        <motion.div variants={item} className="flex flex-col">
          <GlassCard className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Skill Breakdown
            </h3>
            
            <div className="flex flex-col gap-6 flex-1 justify-center">
              {[
                { label: "Technical Knowledge", score: 4.5, color: "bg-blue-500" },
                { label: "Communication", score: 4.0, color: "bg-green-500" },
                { label: "Problem Solving", score: 4.2, color: "bg-purple-500" },
                { label: "System Design", score: 3.8, color: "bg-orange-500" },
              ].map((skill, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-foreground/80">{skill.label}</span>
                    <span className="text-foreground">{skill.score} / 5.0</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(skill.score / 5) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                      className={`h-full rounded-full ${skill.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-black/5">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
};
