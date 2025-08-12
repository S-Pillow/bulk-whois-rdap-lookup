import React from "react";
import { motion } from "framer-motion";

function SecurityOrb({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          duration: 20,
        }}
        className="absolute h-64 w-64 rounded-full bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600 opacity-60 blur-2xl"
      />

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.05 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          duration: 4,
        }}
        className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-background border-2 border-primary shadow-2xl backdrop-blur-md"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 15,
          }}
          className="absolute inset-0 m-auto h-24 w-24 rounded-full border-t-4 border-primary border-dashed"
        />
        <div className="text-primary text-xs font-semibold">SECURE</div>
      </motion.div>
    </div>
  );
}

export default SecurityOrb;
