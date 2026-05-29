import React from "react";
import { motion } from "motion/react";
import { X, SlidersHorizontal, Trash2 } from "lucide-react";
import { PremiumCar } from "../types";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: PremiumCar[];
  toggleCompare: (car: PremiumCar) => void;
  setCompareList: (list: PremiumCar[]) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  compareList,
  toggleCompare,
  setCompareList,
  playSound,
}: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-4xl w-full rounded-3.5xl p-6 relative space-y-6 bg-[#0B0F14] border border-[#1F2A37]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Absolute exit button */}
        <button
          onClick={() => {
            playSound("click");
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 focus:outline-none cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title area */}
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-display tracking-widest text-white uppercase">PRECISION ADVANCED COMPARATOR</h3>
          <p className="text-xs font-mono text-[#E5E7EB] uppercase tracking-widest">Staged array limits: {compareList.length} of 2 occupied</p>
        </div>

        {compareList.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
            <p className="text-sm font-mono text-slate-400">Your telemetry staged comparison is currently empty.</p>
            <p className="text-[10px] text-slate-505 uppercase max-w-sm mx-auto">Please return to the main inventory panel and tap the lightning button beside luxury cars to inspect them side-by-side.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {compareList.map((car) => (
              <motion.div 
                layout
                key={car.id} 
                className="p-5 rounded-2xl bg-[#111820] border border-[#1F2A37]/35 relative flex flex-col justify-between"
              >
                
                {/* Remove button */}
                <button
                  onClick={() => toggleCompare(car)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-gold p-1.5 cursor-pointer"
                  title="Erase from matrix"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={car.image} 
                      alt={car.brand} 
                      className="w-24 h-16 object-cover rounded-xl border border-white/10" 
                    />
                    <div>
                      <p className="text-[10px] font-mono text-gold uppercase">{car.brand} Motors</p>
                      <p className="text-xl font-display text-white mt-0.5 tracking-widest uppercase">{car.model}</p>
                    </div>
                  </div>

                  {/* Technical values table */}
                  <div className="space-y-2.5 pt-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-550">Base Valve Cost:</span>
                      <span className="text-white font-bold">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-550">Acceleration Core:</span>
                      <span className="text-gold font-bold">{car.specifications.acceleration}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-550">Energy Source:</span>
                      <span className="text-white">{car.specifications.engine}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-550">Power Coefficient:</span>
                      <span className="text-[#E5E7EB] font-bold">{car.specifications.power}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-550">Peak Vel-Max:</span>
                      <span className="text-white font-bold">{car.specifications.topSpeed}</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action tray */}
        {compareList.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setCompareList([]);
                playSound("click");
              }}
              className="px-5 py-2.5 bg-white/5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-white/10 text-slate-300 cursor-pointer"
            >
              Clear Comparators
            </button>
            <button
              onClick={() => {
                playSound("click");
                onClose();
              }}
              className="px-5 py-2.5 bg-gradient-to-tr from-gold to-vel-blue rounded-xl text-xs font-mono tracking-widest text-white uppercase shadow-md cursor-pointer"
            >
              Close Grid Analysis
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
