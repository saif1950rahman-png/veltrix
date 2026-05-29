import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Shield } from "lucide-react";
import { luxuryCars } from "../data";

interface ContactProps {
  testDriveVehicle: string;
  setTestDriveVehicle: (v: string) => void;
  testDriveDate: string;
  setTestDriveDate: (d: string) => void;
  testDriveLocation: string;
  setTestDriveLocation: (l: string) => void;
  testDriveSuccess: boolean;
  setTestDriveSuccess: (s: boolean) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
}

export default function ContactHubSection({
  testDriveVehicle,
  setTestDriveVehicle,
  testDriveDate,
  setTestDriveDate,
  testDriveLocation,
  setTestDriveLocation,
  testDriveSuccess,
  setTestDriveSuccess,
  playSound,
}: ContactProps) {
  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#040406] to-[#030305] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono tracking-[0.4em] text-gold uppercase font-bold">Launch coordinates</span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-widest uppercase">
            Global network
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Coordinates listing (4 cols) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              <p className="text-xs font-mono text-gold tracking-widest uppercase">AIR-HANDOVER TERMINALS HQ:</p>
              
               {[
                { city: "Zurich Air Hangar Hub", desc: "Terminal 4B, private aircraft vector. Secure armored bays.", tel: "+41 (44) 998-0021" },
                { city: "Monaco Marine Port Terminal", desc: "Quai Rainier III, Luxury super-car biometric handovers.", tel: "+377 (93) 002-3321" },
                { city: "Singapore High-Prestige Vault", desc: "Singapore Subterrain Core, level 10.", tel: "+65 (6) 880-9900" },
                { city: "Beverly Hills Launch Pad", desc: "Crescent Drive executive showroom and tracking suites.", tel: "+1 (310) 555-0199" },
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ x: 5, borderColor: "rgba(223, 180, 108, 0.35)" }}
                  key={idx} 
                  className="p-4 rounded-xl bg-white/2 border border-[#1F2A37]/35 bg-[#161C24] hover:bg-[#1E3A8A]/15 transition-all space-y-2 cursor-default"
                >
                  <p className="font-display text-lg text-white tracking-widest uppercase">{item.city}</p>
                  <p className="text-xs text-slate-400 font-body">{item.desc}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-gold font-bold pt-1">
                    <span>SECURE PHONE UPLINK:</span>
                    <span>{item.tel}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Signal tag */}
            <div className="p-4 rounded-xl border border-dashed border-white/10 text-center space-y-1">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Encrypted Satellite Signal:</p>
              <p className="font-mono text-xs text-white selection:bg-vel-blue/30">executive@veltrixmotors.com</p>
            </div>

          </div>

          {/* Consultation reservation form center (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl glass-panel border border-[#1F2A37]/40 p-6 sm:p-8 flex flex-col justify-between bg-[#111820] relative shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            
            <div className="space-y-6">
              
              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <h4 className="text-xl font-display text-white tracking-widest uppercase">Book a Test Drive</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Connect with our team to arrange an exclusive drive</p>
              </div>

              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  {testDriveSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ type: "spring", stiffness: 120, damping: 15 }}
                      className="p-6 rounded-2xl bg-gold/10 border border-gold/30 text-center space-y-4 shadow-[0_0_20px_rgba(223,180,108,0.12)]"
                    >
                      <CheckCircle className="w-12 h-12 text-gold mx-auto animate-bounce" />
                      <p className="font-display text-lg tracking-widest text-white uppercase">RESERVATION TRANSMITTED</p>
                      <p className="text-xs font-mono text-slate-300 leading-relaxed">
                        Your biometric flight coordinates for a private demo of <strong className="text-white">{testDriveVehicle}</strong> have been secured for dispatch at <strong className="text-white">{testDriveLocation}</strong>. Our courier will call you securely.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTestDriveSuccess(false)}
                        className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-mono text-white tracking-widest uppercase hover:bg-white/15 cursor-pointer block mx-auto"
                      >
                        File another reservation
                      </motion.button>
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
                        setTestDriveSuccess(true);
                      }}
                      className="space-y-4 font-mono text-[11px] text-left"
                    >
                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-widest block font-bold select-none">Select Model:</label>
                        <select 
                          value={testDriveVehicle}
                          onChange={(e) => setTestDriveVehicle(e.target.value)}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#1C6BFF] transition-all"
                        >
                          {luxuryCars.map((car) => (
                            <option key={car.id} value={`${car.brand} ${car.model}`}>{car.brand} {car.model}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-widest block font-bold select-none">Preferred Date:</label>
                        <input
                          type="date"
                          required
                          value={testDriveDate}
                          onChange={(e) => setTestDriveDate(e.target.value)}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#1C6BFF] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-widest block font-bold select-none">PickUp Location:</label>
                        <select 
                          value={testDriveLocation}
                          onChange={(e) => setTestDriveLocation(e.target.value)}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#1C6BFF] transition-all"
                        >
                          <option value="Zurich Aviation Hangars">Zurich Aviation Hangars</option>
                          <option value="Monaco Marine Port">Monaco Marine Port</option>
                          <option value="Singapore Vault Subterrain">Singapore Vault Subterrain</option>
                          <option value="Beverly Hills Heli-Launch">Beverly Hills Heli-Launch</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-widest block font-bold select-none">Contact Phone:</label>
                        <input
                          type="tel"
                          placeholder="+41 (XX) XXX-XXXX"
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#1C6BFF] transition-all"
                          required
                        />
                      </div>

                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 0 25px rgba(223, 180, 108, 0.45)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-gold via-white to-gold text-black font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer font-mono shadow-[0_0_20px_rgba(223,180,108,0.2)]"
                      >
                        Book Test Drive
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* Tactical Satellite HUD Map (4 cols) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 rounded-3xl bg-[#111820] border border-[#1F2A37]/40 relative overflow-hidden flex flex-col justify-between p-6 h-full shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
          >
            
            <div className="space-y-2 border-b border-white/5 pb-2 text-left">
              <p className="text-[10px] font-mono text-gold uppercase tracking-widest font-semibold">Digital Grid Map Mode</p>
              <h4 className="text-lg font-display text-white tracking-widest">TACTICAL SATELLITE HUD</h4>
            </div>

            {/* Styled clean luxury Vector SVG Map rendering global nodes */}
            <div className="relative w-full h-56 my-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center p-3 overflow-hidden">
              
              {/* Simulated radar sweeps */}
              <div className="absolute w-24 h-24 rounded-full border border-gold/15 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-gold/10 animate-ping pointer-events-none" style={{ animationDuration: '5s' }} />

              <svg className="w-full h-full opacity-60 text-slate-600" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outlines representation of continents */}
                <path d="M10 20C15 15 30 18 35 22C40 26 45 15 55 12C65 9 80 18 90 20M110 30C120 25 150 15 160 22C170 29 180 32 190 35M20 70C25 80 40 90 45 85C50 80 60 95 70 82C80 69 90 88 100 80M120 75C130 85 160 90 170 80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Zurich node */}
                <circle cx="85" cy="22" r="3.5" fill="#dfb46c" className="animate-pulse" />
                <line x1="85" y1="22" x2="85" y2="40" stroke="#dfb46c" strokeWidth="0.5" />
                <text x="85" y="47" fill="#dfb46c" fontSize="5" fontFamily="monospace" textAnchor="middle">ZURICH HQ</text>

                {/* Monaco node */}
                <circle cx="92" cy="29" r="3" fill="#dfb46c" />
                <text x="100" y="31" fill="#fff" fontSize="4.5" fontFamily="monospace">MONACO</text>

                {/* Singapore node */}
                <circle cx="150" cy="72" r="3.5" fill="#dfb46c" className="animate-pulse" />
                <text x="150" y="82" fill="#dfb46c" fontSize="5" fontFamily="monospace" textAnchor="middle">SG VAULT</text>

                {/* Beverly Hills node */}
                <circle cx="32" cy="42" r="3" fill="#dfb46c" />
                <text x="12" y="38" fill="#fff" fontSize="4" fontFamily="monospace">LOS ANGELES</text>
              </svg>

              {/* Coordinates overlay metrics */}
              <div className="absolute bottom-4 left-4 font-mono text-[8px] text-slate-500 space-y-0.5 pointer-events-none text-left">
                <p>GPS ALTITUDE: Orbital 88,420M</p>
                <p>SECURE: Multiphasic Encrypted</p>
              </div>

            </div>

            {/* Tactical feed index table */}
            <div className="p-4 rounded-xl bg-white/2 border border-[#1F2A37]/35 bg-[#161C24] space-y-1.5 font-mono text-[9px] text-slate-400 text-left cursor-default">
              <div className="flex justify-between">
                <span>SATELLITE FREQUENCY INDEX</span>
                <span className="text-white">12.82 GHz</span>
              </div>
              <div className="flex justify-between">
                <span>GPS BIOMETRIC CHASSIS LOCK</span>
                <span className="text-emerald-400 font-bold">ARMED / SECURED</span>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
