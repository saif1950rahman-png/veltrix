import React from "react";
import { motion } from "motion/react";
import { BRAND_STATS } from "../data";

const luxuryThemes = [
  {
    text: "group-hover:text-amber-400 text-amber-200 filter drop-shadow-[0_0_12px_rgba(223,180,108,0.4)]",
    line: "bg-gradient-to-r from-amber-500 via-gold to-yellow-200",
    bgGlow: "rgba(223,180,108,0.06)"
  },
  {
    text: "group-hover:text-blue-400 text-blue-200 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]",
    line: "bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-400",
    bgGlow: "rgba(59,130,246,0.06)"
  },
  {
    text: "group-hover:text-emerald-400 text-emerald-200 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    line: "bg-gradient-to-r from-emerald-600 via-green-300 to-emerald-400",
    bgGlow: "rgba(16,185,129,0.06)"
  },
  {
    text: "group-hover:text-purple-400 text-purple-200 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]",
    line: "bg-gradient-to-r from-purple-600 via-fuchsia-300 to-purple-400",
    bgGlow: "rgba(168,85,247,0.06)"
  }
];

export default function StatsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  return (
    <section className="py-16 bg-[#111820] border-y border-[#1F2A37]/30 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(223,180,108,0.03),transparent_75%)] pointer-events-none" />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {BRAND_STATS.map((stat, idx) => {
          const theme = luxuryThemes[idx % luxuryThemes.length];
          return (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              style={{
                background: `radial-gradient(circle at center, ${theme.bgGlow}, transparent 70%)`
              }}
              className="text-center p-6 rounded-2xl border border-white/2 hover:border-white/10 transition-all duration-500 group relative backdrop-blur-sm cursor-default"
            >
              <p className={`text-4.5xl sm:text-6xl font-display tracking-widest transition-all duration-500 ${theme.text}`}>
                {stat.value}
              </p>
              <div className="flex justify-center py-2.5">
                <motion.div 
                  initial={{ width: "30%" }}
                  whileInView={{ width: "15%" }}
                  whileHover={{ width: "65%" }}
                  transition={{ duration: 0.4 }}
                  className={`h-[2px] rounded-full mx-auto ${theme.line}`} 
                />
              </div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase select-none group-hover:text-white transition-colors duration-300">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
