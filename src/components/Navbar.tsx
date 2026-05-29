import React from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX, Zap, Sparkles, SlidersHorizontal } from "lucide-react";
import { PremiumCar } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  compareList: PremiumCar[];
  setIsCompareOpen: (open: boolean) => void;
  isSoundOn: boolean;
  setIsSoundOn: (on: boolean) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
  onRequestReplayLoader?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  compareList,
  setIsCompareOpen,
  isSoundOn,
  setIsSoundOn,
  playSound,
  onRequestReplayLoader,
}: NavbarProps) {
  const menuItems = [
    { id: "home", label: "Home" },
    { id: "inventory", label: "Browse Cars" },
    { id: "showroom", label: "Showroom" },
    { id: "why-us", label: "Heritage" },
    { id: "financing", label: "Financing" },
    { id: "contact", label: "Inquire" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: 0.2 
      }}
      id="navbar"
      className="fixed top-0 left-0 w-full z-45 glass-panel border-b border-white/5 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <a
          href="#home"
          onClick={() => {
            playSound("startup");
            setActiveTab("Home");
          }}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.15 }}
              className="absolute inset-x-0 bottom-0 top-0 bg-[#1C6BFF]/15 scale-75 blur-md rounded-full transition-transform" 
            />
            {/* Chrome Automotive V Emblem */}
            <motion.svg 
              whileHover={{ rotateY: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-9 h-9" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 15L45 80L50 90L55 80L85 15H70L50 62L30 15H15Z" fill="url(#logoGrad)" />
              <path d="M42 75L50 61L58 75H42Z" fill="#dfb46c" />
              <defs>
                <linearGradient id="logoGrad" x1="15" y1="15" x2="85" y2="80">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#1C6BFF" />
                  <stop offset="100%" stopColor="#0B0F14" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
          <div>
            <p className="font-display tracking-[0.2em] text-2xl text-white group-hover:text-[#E5E7EB] transition-colors duration-300">
              VELTRIX
            </p>
            <p className="text-[8px] font-mono tracking-[0.4em] text-gold">DRIVE BEYOND</p>
          </div>
        </a>

        {/* Navigation Menu */}
        <div className="hidden md:flex items-center gap-1.5">
          {menuItems.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => {
                  playSound("click");
                  setActiveTab(tab.label);
                }}
                className={`px-4 py-2 text-[10px] tracking-widest uppercase font-mono transition-all duration-300 rounded-lg relative ${
                  isActive
                    ? "text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white/5 rounded-lg border-b-2" 
                    style={{
                      borderImage: "linear-gradient(to right, #1C6BFF, #E10600) 1"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Controls block */}
        <div className="flex items-center gap-4">

          {/* Replay M5 Drift Cinematic Launch Intro */}
          <motion.button
            whileHover={{ 
              scale: 1.05,
              borderColor: "rgba(225, 6, 0, 0.45)", 
              boxShadow: "0 0 15px rgba(225, 6, 0, 0.2)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound("click");
              if (onRequestReplayLoader) {
                onRequestReplayLoader();
              }
            }}
            className="flex items-center gap-2 border border-white/5 bg-white/5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-[9px] font-mono tracking-widest uppercase transition-all duration-200 focus:outline-none cursor-pointer"
            title="Replay BMW M5 Drift Launch experience"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="hidden sm:inline">M5 DRIFT MODE</span>
            <span className="sm:hidden">M5</span>
          </motion.button>
          
          {/* Compare Staged badge */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound("click");
              setIsCompareOpen(true);
            }}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#1C6BFF] transition-colors focus:outline-none cursor-pointer"
            title="Compare staged modules"
          >
            <Zap className="w-4.5 h-4.5" />
            {compareList.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-gold text-[9px] text-[#0B0F14] flex items-center justify-center font-bold font-mono shadow-[0_0_10px_rgba(223,180,108,0.6)]"
              >
                {compareList.length}
              </motion.span>
            )}
          </motion.button>

          {/* Sound toggle button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const current = !isSoundOn;
              setIsSoundOn(current);
              if (current) {
                setTimeout(() => playSound("click"), 50);
              }
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            title={isSoundOn ? "Deactivate Acoustic Drive Synth" : "Activate Acoustic Drive Synth"}
          >
            {isSoundOn ? (
              <Volume2 className="w-4.5 h-4.5 text-[#1C6BFF] filter drop-shadow-[0_0_10px_rgba(28,107,255,0.4)]" />
            ) : (
              <VolumeX className="w-4.5 h-4.5 text-slate-500" />
            )}
          </motion.button>

          {/* Call-to-action */}
          <motion.a
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 0 25px rgba(28, 107, 255, 0.3)",
              y: -1
            }}
            whileTap={{ scale: 0.98 }}
            href="#showroom"
            onClick={() => {
              playSound("startup");
              setActiveTab("Showroom");
            }}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#1C6BFF] to-[#0B0F14] text-white font-mono text-[9px] tracking-widest uppercase rounded-lg border border-white/10 shadow-[0_0_15px_rgba(28,107,255,0.25)] transition-all text-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5E7EB]" />
            Bespoke Commission
          </motion.a>

          {/* Mobile hamburger menu */}
          <a
            href="#inventory"
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => {
              playSound("click");
              setActiveTab("Inventory");
            }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </a>

        </div>

      </div>
    </motion.nav>
  );
}
