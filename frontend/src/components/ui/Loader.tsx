import React from 'react';
import { motion } from 'framer-motion';

export const Loader = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-3 h-3 bg-primary rounded-full"
        animate={{
          y: ["0%", "-50%", "0%"],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.15,
        }}
      />
    ))}
  </div>
);

export const Skeleton = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`bg-black/5 relative overflow-hidden rounded-xl ${className}`}
    style={style}
  >
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
      animate={{
        translateX: ["-100%", "200%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);
