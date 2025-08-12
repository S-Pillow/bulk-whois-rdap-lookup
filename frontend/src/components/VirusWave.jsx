import React from "react";
import { motion } from "framer-motion";

function VirusWave({ className = "" }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="w-full h-full opacity-50"
      >
        <motion.path
          fill="url(#virusGradient)"
          fillOpacity="0.5"
          d="
            M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,181.3C840,181,960,139,1080,106.7C1200,75,1320,53,1380,42.7L1440,32
            L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          animate={{
            pathLength: [0.8, 1, 0.8],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <defs>
          <linearGradient id="virusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default VirusWave;
