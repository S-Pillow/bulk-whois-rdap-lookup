import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

function HomePage() {
  // Cursor blink effect
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    if (cursor) {
      setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
      }, 500);
    }
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      {/* Particles background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://assets.codepen.io/13471/small-stars.svg')] bg-cover" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 px-4"
      >
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2 relative">
          Forge Forward
          <span id="cursor" className="opacity-100 transition-opacity duration-500">_</span>
          <div className="absolute left-1/2 -bottom-3 w-20 h-1 bg-emerald-400 transform -translate-x-1/2 rounded animate-underline" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-lg sm:text-xl text-gray-300"
        >
          The Future Favors the Bold. Vibe. Create. Forge Forward.
        </motion.p>
        <div className="mt-8">
          <Link to="/tools">
            <Button 
              size="lg" 
              className="bg-emerald-400 text-slate-900 hover:bg-emerald-300 gap-2 px-8 py-6 text-xl rounded-full shadow-[0_4px_15px_rgba(52,211,153,0.4)] hover:shadow-[0_6px_20px_rgba(52,211,153,0.6)] transform hover:scale-105 transition-all duration-300"
            >
              Explore Tools <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;
