import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, Zap, SlidersHorizontal } from "lucide-react";
import { luxuryCars } from "../data";
import { PremiumCar } from "../types";

interface InventorySectionProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  compareList: PremiumCar[];
  toggleCompare: (car: PremiumCar) => void;
  setCustomizerCar: (car: PremiumCar) => void;
  setCustomizerColor: (color: any) => void;
  setCustomizerCarbon: (carbon: string) => void;
  triggerToast: (msg: string) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
  setActiveTab: (tab: string) => void;
}

export default function InventorySection({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  maxPrice,
  setMaxPrice,
  wishlist,
  toggleWishlist,
  compareList,
  toggleCompare,
  setCustomizerCar,
  setCustomizerColor,
  setCustomizerCarbon,
  triggerToast,
  playSound,
  setActiveTab,
}: InventorySectionProps) {
  // Compute cars
  const filteredCars = luxuryCars.filter((car) => {
    const categoryMatch = selectedCategory === "All" || car.category === selectedCategory;
    const searchMatch =
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase());
    const priceMatch = car.price <= maxPrice;
    return categoryMatch && searchMatch && priceMatch;
  });

  return (
    <section id="inventory" className="py-24 bg-gradient-to-b from-[#030303] to-[#0a0a0f] relative z-10">
      
      {/* Light Overlay simulation */}
      <div className="absolute top-0 right-0 w-[40%] h-[300px] bg-gradient-to-l from-vel-blue/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header section with Framer Motion triggers */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5"
        >
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.4em] text-gold uppercase block">Select Vehicle</span>
            <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wider uppercase leading-none">
              AVAILABLE <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold via-white to-gold filter drop-shadow-[0_0_15px_rgba(223,180,108,0.2)]">
                MODELS
              </span>
            </h2>
            <p className="text-sm font-body text-slate-400 max-w-xl">
              Bespoke high-performance vehicles, engineered and custom-crafted for elite collectors.
            </p>
          </div>

          {/* Price sliders and search filter UI */}
          <div className="space-y-4 w-full lg:w-auto">
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="tracking-widest uppercase">MAXIMUM PRICE:</span>
                <span className="text-gold font-bold">${(maxPrice / 1000000).toFixed(2)}M USD</span>
              </div>
              <input
                type="range"
                min="150000"
                max="3000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full lg:w-80 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            {/* Interactive Search Query */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-80 bg-[#111820] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1C6BFF] transition-all font-mono"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>

          </div>
        </motion.div>

        {/* Categories Navigation Filter Pills */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto scrollbar-none pb-2 select-none"
        >
          {["All", "Supercars", "SUV", "Electric", "Sedans"].map((category) => (
            <button
              key={category}
              onClick={() => {
                playSound("click");
                setSelectedCategory(category);
              }}
              className={`px-6 py-3 rounded-xl text-[10px] tracking-widest font-mono uppercase shrink-0 transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-gradient-to-tr from-gold/20 to-white/5 border border-gold text-gold shadow-[0_0_15px_rgba(223,180,108,0.15)]"
                  : "bg-white/3 border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Grid stream with AnimatePresence */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {filteredCars.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20 bg-white/2 border border-dashed border-white/10 rounded-3xl space-y-4"
              >
                <Zap className="w-12 h-12 text-gold mx-auto animate-bounce" />
                <p className="font-display text-2xl tracking-widest text-white uppercase">NO VEHICLES MATCH RANGE</p>
                <p className="text-xs font-mono text-slate-400">Expand your custom price search cap or query string.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setMaxPrice(3000000);
                    playSound("click");
                  }}
                  className="mt-4 px-5 py-2.5 bg-white/10 rounded-lg text-xs font-mono text-white tracking-widest uppercase hover:bg-white/15 cursor-pointer"
                >
                  Reset Calibration Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredCars.map((car, index) => {
                  const isFavorite = wishlist.includes(car.id);
                  const isStaged = compareList.some((c) => c.id === car.id);
                  return (
                    <motion.div
                      layout
                      key={car.id}
                      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 90, 
                        damping: 18,
                        delay: index * 0.05 
                      }}
                      whileHover={{ y: -8, borderColor: "rgba(223, 180, 108, 0.45)", boxShadow: "0 10px 30px rgba(223, 180, 108, 0.12)" }}
                      className="group rounded-2.5xl glass-panel relative overflow-hidden flex flex-col justify-between border border-white/5 transition-all duration-500 reflect-hover bg-[#161C24]"
                    >
                      {/* Featured ribbon marker */}
                      {car.featured && (
                        <span className="absolute top-4 left-4 z-20 px-3.5 py-1 bg-gradient-to-r from-gold to-[#f2dec2] rounded-full text-[9px] tracking-widest uppercase font-mono font-black text-black shadow-md shadow-gold/20">
                          FEATURED
                        </span>
                      )}

                      {/* Overlap Favorites Heart indicator */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => toggleWishlist(car.id)}
                        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-slate-350 hover:text-gold transition-colors focus:outline-none cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-gold text-gold" : ""}`} />
                      </motion.button>

                      {/* Image Preview backdrop with luxury zooming on scale hover */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-b from-[#111820] to-[#0B0F14] select-none">
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/80 via-transparent to-transparent opacity-80" />
                      </div>

                      {/* Text content card */}
                      <div className="p-6 space-y-4">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className={`text-[10px] font-mono tracking-widest uppercase font-bold ${
                              car.category === "Supercars" ? "text-amber-450 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]" :
                              car.category === "SUV" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]" :
                              car.category === "Electric" ? "text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.25)]" :
                              "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]"
                            }`}>
                              {car.year} • {car.category}
                            </p>
                            <h3 className="text-2xl font-display text-white tracking-widest uppercase mt-1">
                              {car.brand} <span className="text-slate-400">{car.model}</span>
                            </h3>
                          </div>
                          <p className="text-xl font-display tracking-widest text-[#f5ecd7] group-hover:text-gold transition-colors duration-300">
                            ${car.price.toLocaleString()}
                          </p>
                        </div>

                        <p className="text-xs text-slate-350 line-clamp-2 h-8 font-body">
                          {car.tagline}. {car.detailedDescription}
                        </p>

                        {/* Specs overview metrics */}
                        <div className="grid grid-cols-3 gap-2 bg-[#111820]/85 border border-[#1F2A37]/30 p-3 rounded-xl font-mono text-[10px] text-slate-450 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
                          <div className="text-center border-r border-white/5">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">0-60 MPH</p>
                            <p className="font-bold text-amber-450 mt-0.5 text-xs drop-shadow-[0_0_4px_rgba(223,180,108,0.15)]">{car.specifications.acceleration}</p>
                          </div>
                          <div className="text-center border-r border-white/5">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">POWER</p>
                            <p className="font-bold text-sky-400 mt-0.5 text-xs drop-shadow-[0_0_4px_rgba(59,130,246,0.15)]">{car.specifications.power}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">TOP SPEED</p>
                            <p className="font-bold text-emerald-400 mt-0.5 text-xs drop-shadow-[0_0_4px_rgba(16,185,129,0.15)]">{car.specifications.topSpeed}</p>
                          </div>
                        </div>

                      </div>

                      {/* Custom footer actions items button */}
                      <div className="p-6 pt-0 border-t border-white/5 bg-black/20 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSound("engine");
                            setCustomizerCar(car);
                            setCustomizerColor(car.colors[0]);
                            setCustomizerCarbon(car.carbonFiberOptions[0]);
                            triggerToast("Loaded into Showroom.");
                            setActiveTab("Showroom");
                          }}
                          className="flex-1 py-3.5 bg-gradient-to-tr from-white/5 to-white/10 hover:from-gold hover:to-gold/80 hover:text-black text-slate-200 font-mono text-[10px] tracking-widest uppercase rounded-xl border border-white/10 hover:border-gold transition-all duration-300 text-center cursor-pointer"
                        >
                          Configure
                        </button>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => toggleCompare(car)}
                          className={`px-3.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                            isStaged
                              ? "bg-gold/15 border-gold text-gold shadow-[0_0_15px_rgba(223,180,108,0.25)]"
                              : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10 hover:border-white/20"
                          }`}
                          title="Stash in comparative matrix"
                        >
                          <Zap className="w-4 h-4" />
                        </motion.button>
                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
