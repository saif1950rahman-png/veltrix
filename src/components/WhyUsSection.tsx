import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Plane, 
  CreditCard, 
  Hammer, 
  UserCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Star 
} from "lucide-react";
import { WHY_CHOOSE_US_DATA, TESTIMONIALS_DATA } from "../data";

interface WhyUsSectionProps {
  testimonialIndex: number;
  setTestimonialIndex: React.Dispatch<React.SetStateAction<number>>;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
}

const cardThemes = [
  {
    icon: Shield,
    iconColor: "text-amber-400 group-hover:text-amber-350 group-hover:border-amber-400/50",
    titleColor: "group-hover:text-amber-400",
    barColor: "bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    hoverBorder: "rgba(223, 180, 108, 0.45)",
    hoverGlow: "hover:shadow-[0_0_25px_rgba(223,180,108,0.12)]",
    bgDot: "rgba(223, 180, 108, 0.05)"
  },
  {
    icon: Plane,
    iconColor: "text-sky-400 group-hover:text-sky-350 group-hover:border-sky-400/50",
    titleColor: "group-hover:text-sky-400",
    barColor: "bg-gradient-to-r from-sky-500 via-cyan-200 to-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]",
    hoverBorder: "rgba(14, 165, 233, 0.45)",
    hoverGlow: "hover:shadow-[0_0_25px_rgba(14,165,233,0.12)]",
    bgDot: "rgba(14, 165, 233, 0.05)"
  },
  {
    icon: CreditCard,
    iconColor: "text-emerald-400 group-hover:text-emerald-350 group-hover:border-emerald-400/50",
    titleColor: "group-hover:text-emerald-400",
    barColor: "bg-gradient-to-r from-emerald-500 via-teal-200 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    hoverBorder: "rgba(16, 185, 129, 0.45)",
    hoverGlow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]",
    bgDot: "rgba(16, 185, 129, 0.05)"
  },
  {
    icon: Hammer,
    iconColor: "text-purple-400 group-hover:text-purple-350 group-hover:border-purple-400/50",
    titleColor: "group-hover:text-purple-400",
    barColor: "bg-gradient-to-r from-purple-500 via-fuchsia-250 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    hoverBorder: "rgba(168, 85, 247, 0.45)",
    hoverGlow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.12)]",
    bgDot: "rgba(168, 85, 247, 0.05)"
  },
  {
    icon: UserCheck,
    iconColor: "text-rose-400 group-hover:text-rose-350 group-hover:border-rose-400/50",
    titleColor: "group-hover:text-rose-400",
    barColor: "bg-gradient-to-r from-rose-500 via-red-200 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
    hoverBorder: "rgba(244, 63, 94, 0.45)",
    hoverGlow: "hover:shadow-[0_0_25px_rgba(244,63,94,0.12)]",
    bgDot: "rgba(244, 63, 94, 0.05)"
  }
];

export default function WhyUsSection({
  testimonialIndex,
  setTestimonialIndex,
  playSound,
}: WhyUsSectionProps) {
  const [direction, setDirection] = useState(1); // -1 for left slide, 1 for right slide

  // Autoplay Testimonial carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    playSound("click");
    setDirection(-1);
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const handleNext = () => {
    playSound("click");
    setDirection(1);
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  // Custom sliding transitions for testimony quotes
  const quoteSlideVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir * 50,
      filter: "blur(8px)",
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: -dir * 50,
      filter: "blur(8px)",
      transition: { duration: 0.4, ease: "easeIn" },
    }),
  };

  return (
    <section id="why-us" className="py-24 bg-gradient-to-b from-[#040406] to-[#08080c] relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        
        {/* Heritage headers */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono tracking-[0.4em] text-gold uppercase">THE PRESTIGE ALLIANCE</span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-widest uppercase">
            WHY VELTRIX
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-body">
            Precision engineering, white-glove logistics, and custom mechanical velocity.
          </p>
        </div>

        {/* Benefits Cards lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_US_DATA.map((card, index) => {
            const theme = cardThemes[index % cardThemes.length];
            const IconComponent = theme.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -6, borderColor: theme.hoverBorder }}
                key={card.id}
                className={`group rounded-2xl bg-[#111820] p-6 border border-[#1F2A37]/30 transition-all duration-300 flex flex-col justify-between ${theme.hoverGlow}`}
                style={{
                  background: `radial-gradient(circle at 10% 10%, ${theme.bgDot}, transparent 60%), #111820`
                }}
              >
                <div className="space-y-4">
                  {/* Visual Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-[#0B0F14] border border-[#1F2A37]/25 flex items-center justify-center transition-all duration-300 ${theme.iconColor}`}>
                    <IconComponent className="w-5 h-5 animate-pulse" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <h4 className={`text-xl font-display text-white tracking-widest uppercase transition-colors duration-200 ${theme.titleColor}`}>
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-body mt-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Staged underline speed progress meter */}
                <div className="h-[2px] bg-white/5 rounded-full overflow-hidden mt-6">
                  <div className={`h-full w-1/4 group-hover:w-full transition-all duration-700 ${theme.barColor}`} />
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Cinematic Parallax visual scroll banner */}
        <div className="relative h-96 flex items-center justify-center bg-black overflow-hidden border-y border-[#1F2A37]/30 rounded-3xl group">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#0B0F14]/85 z-10 transition-colors group-hover:bg-[#0B0F14]/75 duration-75" />
            <motion.img
              initial={{ scale: 1.05 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2000"
              alt="Engine backdrop"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-20">
            <span className="text-gold text-4xl block font-mono select-none">❝</span>
            <p className="text-xl sm:text-3xl font-display text-white tracking-widest uppercase leading-snug">
              “THE CHASSIS IS A DIRECT EXTENSION OF THE INTELLECT. DRIVING CONTINUALLY REORGANIZES ONE&apos;S COGNITIVE DIMENSION.”
            </p>
            <div className="h-[2px] w-12 bg-gold mx-auto group-hover:w-24 transition-all duration-300" />
            <p className="text-[10px] font-mono tracking-[0.4em] text-slate-400 uppercase select-none">
              HANS VELTRIX — CHIEF AERODYNAMICIST
            </p>
          </div>
        </div>

        {/* Testimonials Carousel panel */}
        <div className="space-y-12 pt-6">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono tracking-[0.4em] text-vel-blue uppercase">The Sovereign Testimonials</span>
            <h2 className="text-4xl sm:text-5xl font-display text-white tracking-widest uppercase">
              TRUSTED BY UNRIVALED TITANS
            </h2>
          </div>

          <div className="max-w-3xl mx-auto relative px-4 sm:px-0">
            
            {/* Arrows */}
            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Testimonials Display sliding container */}
            <div className="p-8 sm:p-10 rounded-3xl glass-panel-neon space-y-6 relative overflow-hidden bg-[#111820] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              
              <div className="flex gap-1.5">
                {[...Array(TESTIMONIALS_DATA[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Animated Text Quotes block inside custom direction AnimatePresence */}
              <div className="min-h-[140px] relative">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    custom={direction}
                    variants={quoteSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                  >
                    <blockquote className="text-lg sm:text-2xl font-body italic text-slate-100 leading-relaxed font-light">
                      &ldquo;{TESTIMONIALS_DATA[testimonialIndex].comment}&rdquo;
                    </blockquote>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <img
                          src={TESTIMONIALS_DATA[testimonialIndex].avatar}
                          alt={TESTIMONIALS_DATA[testimonialIndex].name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-vel-blue"
                        />
                        <div>
                          <h5 className="text-lg font-display text-white tracking-widest uppercase">
                            {TESTIMONIALS_DATA[testimonialIndex].name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {TESTIMONIALS_DATA[testimonialIndex].role} &mdash; {TESTIMONIALS_DATA[testimonialIndex].location}
                          </p>
                        </div>
                      </div>

                      <div className="py-1.5 px-4 rounded-xl bg-vel-blue/10 border border-vel-blue/20">
                        <p className="text-[10px] font-mono tracking-widest text-[#00e5ff] uppercase">
                          Commissions: {TESTIMONIALS_DATA[testimonialIndex].vehicleAcquired}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Pagination Dials */}
            <div className="flex justify-center gap-2 pt-6 select-none">
              {TESTIMONIALS_DATA.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playSound("click");
                    setDirection(idx > testimonialIndex ? 1 : -1);
                    setTestimonialIndex(idx);
                  }}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    testimonialIndex === idx ? "w-8 bg-vel-blue" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
