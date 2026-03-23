'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
  title: string;
  content: string;
}

export function InfoTooltip({ title, content }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-1.5 align-middle">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
        aria-label={`Info about ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-popover text-popover-foreground rounded-xl border border-border shadow-xl backdrop-blur-md"
          >
            <p className="text-xs font-bold mb-1 text-primary uppercase tracking-wider">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {content}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
