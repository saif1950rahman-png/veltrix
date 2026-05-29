import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

interface FooterProps {
  newsletterEmail: string;
  setNewsletterEmail: (email: string) => void;
  newsletterSubscribed: boolean;
  setNewsletterSubscribed: (subscribed: boolean) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
  setActiveTab: (tab: string) => void;
}

export default function Footer({
  newsletterEmail,
  setNewsletterEmail,
  newsletterSubscribed,
  setNewsletterSubscribed,
  playSound,
  setActiveTab,
}: FooterProps) {
  return (
    <footer className="bg-black border-t border-white/10 lg:pt-24 pt-16 pb-12 relative z-10 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 text-left">
          
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 15L45 80L50 90L55 80L85 15H70L50 62L30 15H15Z" fill="#dfb46c" />
                <path d="M42 75L50 61L58 75H42Z" fill="#0b6fff" />
              </svg>
              <div>
                <p className="font-display tracking-[0.2em] text-xl text-white">VELTRIX MOTORS</p>
                <p className="text-[8px] tracking-[0.4em] text-vel-blue">DRIVE BEYOND</p>
              </div>
            </div>
            <p className="text-slate-400 font-body leading-relaxed text-xs">
              Zurich high luxury automotive design studio. Commissioning legal road-going spaceships with custom kinetic composites since 2012.
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
              SYSTEM CONSOLE GPS: 47.3769° N, 8.5417° E
            </p>
          </div>

          {/* Navigation link blocks (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-bold text-white tracking-widest text-[11px] uppercase pb-2 border-b border-white/5">DIRECTORY</p>
            <ul className="space-y-3 font-mono text-[11px]">
              {[
                { label: "Home", id: "home", tab: "Home" },
                { label: "Browse Cars", id: "inventory", tab: "Browse Cars" },
                { label: "Showroom", id: "showroom", tab: "Showroom" },
                { label: "Heritage", id: "why-us", tab: "Heritage" },
                { label: "Financing", id: "financing", tab: "Financing" },
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => {
                      playSound("click");
                      setActiveTab(link.tab);
                    }}
                    className="text-slate-400 hover:text-vel-blue transition-colors flex items-center gap-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-vel-blue">❯</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal columns (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-bold text-white tracking-widest text-[11px] uppercase pb-2 border-b border-white/5">REGISTRIES</p>
            <ul className="space-y-3 font-mono text-[11px] text-slate-400">
              <li><span className="hover:text-gold transition-colors cursor-pointer">Geneva Air Handover Accord</span></li>
              <li><span className="hover:text-gold transition-colors cursor-pointer">Monaco Sovereignty Port Laws</span></li>
              <li><span className="hover:text-gold transition-colors cursor-pointer">Chassis Cryptographic Keys</span></li>
              <li><span className="hover:text-gold transition-colors cursor-pointer">Bespoke Carbon Warranties</span></li>
              <li><span className="hover:text-gold transition-colors cursor-pointer">Executive Concierge Rules</span></li>
            </ul>
          </div>

          {/* Executive newsletter email box (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-bold text-white tracking-widest text-[11px] uppercase pb-2 border-b border-white/5">EXECUTIVE NEWSLETTER INTAKE</p>
            <p className="text-[11px] font-body text-slate-400 leading-relaxed">
              Bespoke telemetry allocation reports, private yacht dispatch inventories, and racing telemetry updates. Locked and private.
            </p>

            <div className="relative min-h-[50px] pt-2">
              <AnimatePresence mode="wait">
                {newsletterSubscribed ? (
                  <motion.div 
                    key="subscribed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-[#00e5ff] font-bold text-[10px] uppercase tracking-wider"
                  >
                    <CheckCircle className="w-4.5 h-4.5 text-vel-blue" />
                    SATELLITE SIGNAL CONNECTED // ENCRYPTED
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      playSound("success");
                      setNewsletterSubscribed(true);
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        type="email"
                        placeholder="satellite@vault.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 pl-10 text-[11px] text-white focus:outline-none focus:border-[#1E3A8A] transition-colors font-mono"
                        required
                      />
                      <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#1E3A8A", color: "#F8FAFC" }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                      title="Uplink email"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Footnotes copyright markers */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-[9.5px] text-slate-500 font-mono tracking-widest uppercase">
          <p>© 2026 VELTRIX MOTOR ARCHITECTS INC. ALL PRESTIGE PRESERVED.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Sat Security Protocols</span>
            <span>//</span>
            <span className="hover:text-white transition-colors cursor-pointer">Bespoke Encryption Rules</span>
            <span>//</span>
            <span className="hover:text-white transition-colors cursor-pointer">Zurich Labs</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
