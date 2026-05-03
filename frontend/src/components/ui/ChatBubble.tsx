import React from 'react';
import { motion } from 'framer-motion';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp?: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-center my-4"
      >
        <div className="px-4 py-2 rounded-full bg-black/5 text-xs font-medium text-foreground/50 tracking-wide">
          {message.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${
          isAI
            ? 'bg-white/80 border border-black/5 text-foreground rounded-tl-sm'
            : 'bg-gradient-warm text-white rounded-tr-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        {message.timestamp && (
          <span className={`text-[10px] absolute -bottom-5 ${isAI ? 'left-2 text-foreground/40' : 'right-2 text-primary/60'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            {message.timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
};
