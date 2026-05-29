import React from "react";
import { motion } from "motion/react";
import { luxuryCars } from "../data";

interface FinancingProps {
  financePrice: number;
  setFinancePrice: (price: number) => void;
  downPayment: number;
  setDownPayment: (dp: number) => void;
  interestRate: number;
  setInterestRate: (rate: number) => void;
  loanTerm: number;
  setLoanTerm: (term: number) => void;
  triggerToast: (msg: string) => void;
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
}

export default function FinancingSection({
  financePrice,
  setFinancePrice,
  downPayment,
  setDownPayment,
  interestRate,
  setInterestRate,
  loanTerm,
  setLoanTerm,
  triggerToast,
  playSound,
}: FinancingProps) {

  // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const calculateEMI = () => {
    const P = financePrice - downPayment;
    const R = (interestRate / 100) / 12;
    const N = loanTerm;

    if (P <= 0) return 0;
    if (R === 0) return Math.round(P / N);

    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    return Math.round(emi);
  };

  return (
    <section id="financing" className="py-24 bg-gradient-to-b from-[#08080c] to-[#040406] relative z-10">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section header */}
        <div className="text-center space-y-3 animate-fade-in">
          <span className="text-xs font-mono tracking-[0.4em] text-gold uppercase">Payment Calculator</span>
          <h2 className="text-4xl sm:text-6xl font-display text-white tracking-widest uppercase">
            Calculate Payment
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-body">
            Estimate monthly payments tailored for your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Sliders left (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 glass-panel border border-[#1F2A37]/35 p-6 sm:p-8 rounded-3xl space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] bg-[#111820]"
          >
            
            {/* Quick Car presets options */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
              {luxuryCars.slice(0, 4).map((car) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  key={car.id}
                  onClick={() => {
                    playSound("click");
                    setFinancePrice(car.price);
                    setDownPayment(Math.floor(car.price * 0.2));
                  }}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-[9px] tracking-wide transition-all cursor-pointer ${
                    financePrice === car.price
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/2 border-white/5 text-slate-450 hover:text-white"
                  }`}
                >
                  Preset: {car.model} (${(car.price/1000).toFixed(0)}k)
                </motion.button>
              ))}
            </div>

            {/* Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between font-mono text-xs text-slate-350">
                <span className="uppercase tracking-widest">Vehicle Price:</span>
                <span className="text-gold font-bold">${financePrice.toLocaleString()} USD</span>
              </div>
              <input
                type="range"
                min="150000"
                max="3000000"
                step="25000"
                value={financePrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFinancePrice(val);
                  if (downPayment > val) setDownPayment(Math.floor(val * 0.2));
                }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            {/* Down Payment Slider */}
            <div className="space-y-3">
              <div className="flex justify-between font-mono text-xs text-slate-350">
                <span className="uppercase tracking-wide">Down Payment:</span>
                <span className="text-gold font-bold">${downPayment.toLocaleString()} USD</span>
              </div>
              <input
                type="range"
                min="30000"
                max={financePrice - 10000}
                step="10000"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            {/* Two col bottom selector (APR + Months) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Interest rate */}
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-xs text-slate-300">
                  <span className="uppercase tracking-widest">Interest Rate (APR):</span>
                  <span className="text-white font-bold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="1.4"
                  max="8.4"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 font-semibold select-none">
                  <span>1.4% TIER 1 APR</span>
                  <span>8.4% STANDARD APR</span>
                </div>
              </div>

              {/* Loan Amortization term months */}
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-xs text-slate-200">
                  <span className="uppercase tracking-widest">Lease Term:</span>
                  <span className="text-gold font-bold">{loanTerm} Months</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 36, 48, 60].map((term) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={term}
                      onClick={() => {
                        playSound("click");
                        setLoanTerm(term);
                      }}
                      className={`py-2 rounded-xl border text-[10px] font-mono transition-shadow cursor-pointer ${
                        loanTerm === term
                          ? "bg-gold/15 border-gold text-gold font-bold"
                          : "bg-white/2 border-white/5 hover:bg-white/5 text-slate-400"
                      }`}
                    >
                      {term} Months
                    </motion.button>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>

          {/* EMI Readout panel card right (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 text-center lg:text-left h-full"
          >
            
            <div className="p-8 rounded-3.5xl border border-gold/20 bg-[#161C24] relative overflow-hidden shadow-[0_0_45px_rgba(223,180,108,0.12)] flex flex-col justify-between h-96">
              
              <div className="absolute inset-0 bg-gold opacity-[0.015] [background-size:16px_16px] bg-[radial-gradient(#dfb46c_1px,transparent_1px)]" />
              <div className="absolute -right-20 -bottom-20 w-52 h-52 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10 text-left">
                <span className="text-[10px] font-mono text-gold tracking-[0.3em] uppercase block">PRE-APPROVAL ESTIMATE</span>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Estimated monthly lease payment based on your chosen term and custom down payment adjustments:
                </p>
              </div>

              <div className="relative z-10 text-left my-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">ESTIMATED MONTHLY PAYMENT:</span>
                <span className="text-5xl sm:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-400 tracking-widest font-black block mt-1 filter drop-shadow-[0_0_15px_rgba(223,180,108,0.4)]">
                  ${calculateEMI().toLocaleString()}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-bold">
                    AT {interestRate}% APR TIER
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 0 25px rgba(223, 180, 108, 0.4)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => triggerToast(`Encrypted lease pre-approval filed. Our Zurich executive underwriters will dispatch clearance.`)}
                  className="w-full py-4.5 bg-gradient-to-r from-gold via-white to-gold text-black font-mono text-xs tracking-widest uppercase rounded-xl shadow-md cursor-pointer font-black"
                >
                  Calculate Price
                </motion.button>
                <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider font-semibold select-none">
                  Subject to approval.
                </p>
              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
