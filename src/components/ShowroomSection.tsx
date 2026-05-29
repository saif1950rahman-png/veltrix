import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { luxuryCars } from "../data";
import { PremiumCar, CarColor } from "../types";

interface ShowroomSectionProps {
  customizerCar: PremiumCar;
  setCustomizerCar: (car: PremiumCar) => void;
  customizerColor: CarColor;
  setCustomizerColor: (color: CarColor) => void;
  customizerCarbon: string;
  setCustomizerCarbon: (carbon: string) => void;
  customizerWheels: string;
  setCustomizerWheels: (wheels: string) => void;
  showroomAngle: number;
  setShowroomAngle: (angle: number) => void;
  triggerToast: (msg: string) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
}

export default function ShowroomSection({
  customizerCar,
  setCustomizerCar,
  customizerColor,
  setCustomizerColor,
  customizerCarbon,
  setCustomizerCarbon,
  customizerWheels,
  setCustomizerWheels,
  showroomAngle,
  setShowroomAngle,
  triggerToast,
  playSound,
}: ShowroomSectionProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<"studio" | "sketchfab">("studio");

  // Dynamic visual parameters to simulate angle rotations
  const rotateShowroomLeft = () => {
    playSound("click");
    setShowroomAngle((showroomAngle + 45) % 360);
  };

  const rotateShowroomRight = () => {
    playSound("click");
    setShowroomAngle((showroomAngle - 45 + 360) % 360);
  };

  const totalEstimatedCost = customizerCar.price + (customizerColor.priceBonus || 0);

  return (
    <section id="showroom" className="py-24 bg-gradient-to-b from-[#0a0a0f] to-[#040406] relative z-10">
      
      {/* Dynamic ambient back lighting glow matching the custom selected paint hex colored lacquer! */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-[360px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 opacity-20"
        style={{
          background: `radial-gradient(circle, ${customizerColor.hex} 0%, transparent 65%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section title */}
        <div className="text-center space-y-3 pb-4">
          <span className="text-xs font-mono tracking-[0.4em] text-gold uppercase">Studio Configuration</span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-widest uppercase">
            INTERACTIVE <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold via-white to-gold filter drop-shadow-[0_0_15px_rgba(223,180,108,0.2)] font-extrabold">SHOWROOM</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-body">
            Select or modify physical properties of our bespoke fleet. Direct telemetry updates will recalculate physical value estimations instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Showcase visual card layout left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Viewport with smooth rotational scale */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-video rounded-3.5xl border border-[#1F2A37]/35 bg-[#111820] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-0 group"
            >
              
              {/* Floating Media Selection Swapper */}
              <div className="absolute top-4 right-4 z-30 flex bg-black/85 backdrop-blur-md rounded-lg border border-white/10 p-0.5 shadow-lg">
                <button
                  onClick={() => {
                    playSound("click");
                    setActiveMediaTab("studio");
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono rounded-md uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeMediaTab === "studio"
                      ? "bg-[#dfb46c] text-black font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Studio Sim
                </button>
                <button
                  onClick={() => {
                    playSound("click");
                    setActiveMediaTab("sketchfab");
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono rounded-md uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 border-l border-white/10 ${
                    activeMediaTab === "sketchfab"
                      ? "bg-red-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  Sketchfab 3D
                </button>
              </div>

              {activeMediaTab === "studio" ? (
                <>
                  {/* Spinning Tech graphics inside showcase background */}
                  <div className="absolute inset-x-0 bottom-0 py-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center border-t border-white/3 z-10 pointer-events-none">
                    <div className="flex items-center gap-6 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5 uppercase font-bold text-[#1E3A8A]">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-ping" />
                        Chassis Color: {customizerColor.name}
                      </span>
                      <span>|</span>
                      <span className="uppercase">Carbon: {customizerCarbon}</span>
                      <span>|</span>
                      <span className="uppercase">ANGLE: {showroomAngle}°</span>
                    </div>
                  </div>

                  {/* Dynamic Image renderer simulating rotation and 3D angle transforms */}
                  <motion.div 
                    key={`${customizerCar.id}-${showroomAngle}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 0.95, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full h-full max-h-[280px] flex items-center justify-center relative select-none p-6"
                    style={{
                      transform: `rotate(${showroomAngle / 15}deg)`
                    }}
                  >
                    <img
                      src={customizerCar.image}
                      alt={customizerCar.model}
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,229,255,0.15)]"
                    />
                  </motion.div>

                  {/* Angle rotation dashboard overlays */}
                  <div className="absolute inset-y-0 left-4 flex items-center z-20">
                    <motion.button
                      whileHover={{ scale: 1.15, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={rotateShowroomLeft}
                      className="w-10 h-10 rounded-full border border-white/10 bg-black/60 flex items-center justify-center text-white focus:outline-none cursor-pointer"
                      title="Rotate Camera Left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="absolute inset-y-0 right-4 flex items-center z-20">
                    <motion.button
                      whileHover={{ scale: 1.15, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={rotateShowroomRight}
                      className="w-10 h-10 rounded-full border border-white/10 bg-black/60 flex items-center justify-center text-white focus:outline-none cursor-pointer"
                      title="Rotate Camera Right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full relative" style={{ minHeight: "360px" }}>
                  {/* Watermark notice */}
                  <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-mono tracking-widest text-[#dfb46c] uppercase">
                    BMW M5 Competition (F90) 3D Model by Ddiaz Design
                  </div>
                  <iframe
                    title="2021 BMW M5 Competition"
                    src="https://sketchfab.com/models/29a4c136369c4c23ba780287a9349c25/embed?autostart=1&preload=1&ui_theme=dark&ui_controls=1&transparent=1"
                    className="w-full h-full border-0 absolute inset-0"
                    style={{ minHeight: "360px" }}
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking="true"
                    execution-while-out-of-viewport="true"
                    execution-while-not-rendered="true"
                    web-share="true"
                  ></iframe>
                </div>
              )}

            </motion.div>

            {/* Micro specs grids indicators below display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#161C24] border border-[#1F2A37]/35 p-4 rounded-xl text-center">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">DRIVE CORE</p>
                <p className="text-xs font-display text-white mt-1 uppercase tracking-wide">{customizerCar.specifications.engine}</p>
              </div>
              <div className="bg-[#161C24] border border-[#1F2A37]/35 p-4 rounded-xl text-center">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">AERODYNAMICS WEAVE</p>
                <p className="text-xs font-display text-white mt-1 uppercase tracking-wide">{customizerCarbon}</p>
              </div>
              <div className="bg-[#161C24] border border-[#1F2A37]/35 p-4 rounded-xl text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">DYNAMIC RANGE</p>
                <p className="text-xs font-display text-white mt-1 uppercase tracking-wide">{customizerCar.specifications.range || "Carbon Aero V-Max"}</p>
              </div>
            </div>

          </div>

          {/* Interactive options dashboard controls right (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-panel border border-white/5 p-6 rounded-3xl space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            >
              
              {/* Option step 1 */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gold uppercase tracking-widest">Step 01: Select Model</p>
                <div className="grid grid-cols-2 gap-2">
                  {luxuryCars.slice(0, 4).map((car) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={car.id}
                      onClick={() => {
                        playSound("engine");
                        setCustomizerCar(car);
                        setCustomizerColor(car.colors[0]);
                        setCustomizerCarbon(car.carbonFiberOptions[0]);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        customizerCar.id === car.id
                          ? "bg-[#dfb46c]/10 border-gold"
                          : "bg-white/3 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{car.brand}</span>
                      <span className="text-sm font-display text-white tracking-widest mt-1">{car.model}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Option step 2 Color select */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-gold uppercase tracking-widest">Step 02: Select Color</p>
                <div className="flex flex-wrap gap-2">
                  {customizerCar.colors.map((color) => (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={color.name}
                      onClick={() => {
                        playSound("click");
                        setCustomizerColor(color);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        customizerColor.name === color.name
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/3 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      {color.priceBonus > 0 && (
                        <span className="text-emerald-450 font-bold ml-1">+${(color.priceBonus / 1000).toFixed(0)}k</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Option step 3 Carbon fiber */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Step 03: Carbon Option</p>
                <div className="space-y-1.5">
                  {customizerCar.carbonFiberOptions.map((carbon) => (
                    <motion.button
                      whileHover={{ x: 3 }}
                      key={carbon}
                      onClick={() => {
                        playSound("click");
                        setCustomizerCarbon(carbon);
                      }}
                      className={`w-full p-2.5 rounded-xl border font-mono text-[10px] text-left transition-all flex justify-between items-center cursor-pointer ${
                        customizerCarbon === carbon
                          ? "bg-gold/5 border-gold/45 text-gold"
                          : "bg-white/3 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{carbon}</span>
                      {customizerCarbon === carbon && <Check className="w-3.5 h-3.5 text-gold" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Option step 4 Wheels */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Step 04: Select Wheels</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Monoblock Forged Aero-Splat",
                    "Shattered Graphite Track Spoke",
                  ].map((wheel) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={wheel}
                      onClick={() => {
                        playSound("click");
                        setCustomizerWheels(wheel);
                      }}
                      className={`p-2 rounded-xl border font-mono text-[9px] text-left transition-all cursor-pointer ${
                        customizerWheels === wheel
                          ? "bg-gold/5 border-gold/40 text-gold"
                          : "bg-white/2 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {wheel}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sum Price details readout box */}
              <div className="p-4 rounded-2xl bg-black/80 border border-white/5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Base Price</span>
                  <span>${customizerCar.price.toLocaleString()}</span>
                </div>
                {customizerColor.priceBonus > 0 && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Paint Option</span>
                    <span className="text-emerald-400 font-bold">+${customizerColor.priceBonus.toLocaleString()}</span>
                  </div>
                )}
                <div className="h-[1px] bg-white/5" />
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                  <span className="uppercase text-white font-bold select-none text-[10px]">ESTIMATED PRICE</span>
                  <span className="text-lg font-display text-gold tracking-wider font-bold">
                    ${totalEstimatedCost.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Primary call action */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 35px rgba(223, 180, 108, 0.45)"
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => triggerToast("Build slot reserved!")}
                className="w-full py-4.5 bg-gradient-to-r from-gold via-white to-gold text-black font-mono text-[10.5px] tracking-widest uppercase rounded-xl transition-all duration-300 transform cursor-pointer font-black shadow-[0_0_20px_rgba(223,180,108,0.2)]"
              >
                Reserve Build Slot
              </motion.button>

            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
