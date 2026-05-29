import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  playSound: (type: "startup" | "click" | "engine" | "success" | "hover") => void;
  setActiveTab: (tab: string) => void;
}

export default function HeroSection({ playSound, setActiveTab }: HeroSectionProps) {
  // Real Speedometer cockpit simulator states
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(800);
  const [gear, setGear] = useState("P");
  const [boost, setBoost] = useState(0.0);
  const [gForceX, setGForceX] = useState(0.0);
  const [gForceY, setGForceY] = useState(0.0);
  const [isManual, setIsManual] = useState(false);
  const [checkeredFlag, setCheckeredFlag] = useState(true);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [driveMode, setDriveMode] = useState<"EFFICIENT POWER" | "M1 COMPETITION" | "M2 TRACK CLIMAX">("M2 TRACK CLIMAX");
  const [isBooting, setIsBooting] = useState(true);
  const [isSportMode, setIsSportMode] = useState(true);
  const [isMetric, setIsMetric] = useState(true);
  const [timeStr, setTimeStr] = useState("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Interaction refs for physics loop to read high frequency inputs safely
  const isManualRef = React.useRef(false);
  const accelPressedRef = React.useRef(false);
  const brakePressedRef = React.useRef(false);
  const manualGearRef = React.useRef(1);
  const manualSpeedRef = React.useRef(0);
  const manualRpmRef = React.useRef(800);
  const isSportModeRef = React.useRef(true);

  // Sync state variables to refs
  useEffect(() => {
    isManualRef.current = isManual;
  }, [isManual]);

  useEffect(() => {
    isSportModeRef.current = isSportMode;
  }, [isSportMode]);

  useEffect(() => {
    if (driveMode === "EFFICIENT POWER") {
      setIsSportMode(false);
    } else {
      setIsSportMode(true);
    }
  }, [driveMode]);

  const shiftUp = () => {
    if (!isManual) return;
    playSound("click");
    if (manualGearRef.current < 6) {
      manualGearRef.current += 1;
      // Drop RPM
      manualRpmRef.current = Math.max(1200, manualRpmRef.current * 0.72);
      // exhaust acoustics crack blip trigger
      playSound("engine");
    }
  };

  const shiftDown = () => {
    if (!isManual) return;
    playSound("click");
    if (manualGearRef.current > 1) {
      manualGearRef.current -= 1;
      // Blip/spike RPM for beautiful rev matching
      manualRpmRef.current = Math.min(7300, manualRpmRef.current + 1800);
      playSound("engine");
    }
  };

  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    // Simulation states
    let state: "LAUNCH" | "ACCEL" | "REDLINE_HOLD" | "SHIFTING" | "BRAKE" | "IDLE" = "LAUNCH";
    let activeGear = 1;
    let currentSpeed = 0;
    let currentRpm = 800;
    let launchTimer = 0;
    let holdTimer = 0;
    let shiftTimer = 0;
    let targetBoost = 0;
    let currentBoost = 0;

    // Spring physics vars
    let springSpeed = 0;
    let springSpeedVelocity = 0;
    let springRpm = 800;
    let springRpmVelocity = 0;
    let bootTime = 0;
    let isBootingLocal = true;

    const topSpeeds = [45, 80, 125, 175, 230, 295];
    const minSpeeds = [0, 45, 80, 125, 175, 230];

    // Trigger ignition sound at startup
    playSound("startup");

    const runLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (isBootingLocal) {
        bootTime += dt;
        if (bootTime < 1.0) {
          // Sweep up to max (320, 8000)
          const t = bootTime / 1.0;
          const ease = t * t * (3 - 2 * t);
          currentSpeed = ease * 320;
          currentRpm = ease * 8000;
          targetBoost = ease * 2.2;
          setGear("SYS");
        } else if (bootTime < 2.0) {
          // Sweep down to idle (0, 800)
          const t = (bootTime - 1.0) / 1.0;
          const ease = t * t * (3 - 2 * t);
          currentSpeed = 320 - ease * 320;
          currentRpm = 8000 - ease * 7200;
          targetBoost = 2.2 - ease * 2.2;
          setGear("CHK");
        } else {
          isBootingLocal = false;
          setIsBooting(false);
          bootTime = 0;
          // Transition directly to launch
          currentSpeed = 0;
          currentRpm = 800;
          targetBoost = 0;
        }

        // Keep springs instantly matches during boot sweep
        springSpeed = currentSpeed;
        springRpm = currentRpm;
      } else {
        if (isManualRef.current) {
          // --- MANUAL COCKPIT CONTROLS ---
          setCheckeredFlag(false);
          const gearIdx = manualGearRef.current;
          const currentGearTopSpeed = topSpeeds[gearIdx - 1];
          const currentGearMinSpeed = minSpeeds[gearIdx - 1];

          if (accelPressedRef.current) {
            // Increase speed
            const gearPower = 1.35 - (gearIdx * 0.1);
            const accelerationForce = (55 / gearIdx) * gearPower;
            currentSpeed = Math.min(currentGearTopSpeed, currentSpeed + accelerationForce * dt);
            
            // Boost increases
            targetBoost = 1.83 - (gearIdx * 0.08);

            // G force
            setGForceX(Number((Math.sin(time * 0.005) * 0.05).toFixed(2)));
            setGForceY(Number((0.95 / gearIdx).toFixed(2)));
          } else if (brakePressedRef.current) {
            // Braking
            currentSpeed = Math.max(0, currentSpeed - 95 * dt);
            targetBoost = 0;
            setGForceY(-1.2);
            setGForceX(0);

            // Auto-downshift if speed falls below current gear minimum
            if (currentSpeed < currentGearMinSpeed && gearIdx > 1) {
              manualGearRef.current = gearIdx - 1;
              // Rev match blip
              currentRpm = 4500;
              playSound("click");
            }
          } else {
            // Coasting drag
            currentSpeed = Math.max(0, currentSpeed - 8 * dt);
            targetBoost = 0;
            setGForceY(0);
            setGForceX(0);
          }

          // Lock RPM coupling based on speed
          if (currentSpeed === 0) {
            if (accelPressedRef.current) {
              currentRpm = 1200 + Math.random() * 100;
            } else {
              currentRpm = 800; // idling
            }
          } else {
            const fraction = (currentSpeed - currentGearMinSpeed) / (currentGearTopSpeed - currentGearMinSpeed || 1);
            const calculatedRpm = 1800 + Math.max(0, Math.min(1, fraction)) * (7200 - 1800);
            currentRpm += (calculatedRpm - currentRpm) * 15 * dt;
          }

          // Clip RPM to redline mechanical limit
          if (currentRpm > 7300) {
            currentRpm = 7300 + Math.sin(time * 0.1) * 80; // bounce
          }

          setGear("M" + gearIdx);

        } else {
          // --- AUTO PILOT TRACK TRIAL RUN ---
          if (state === "LAUNCH") {
            setGear("LC");
            setCheckeredFlag(true);
            // Rev and hold for launch control
            if (currentRpm < 4250) {
              currentRpm += 3500 * dt;
            } else {
              currentRpm = 4250 + Math.sin(time * 0.08) * 120; // launch bounce!
            }
            currentSpeed = 0;
            targetBoost = 1.65;
            setGForceY(0);
            setGForceX(0);

            launchTimer += dt;
            if (launchTimer > 2.0) {
              state = "ACCEL";
              activeGear = 1;
              setGear("D1");
              playSound("engine");
            }
          } 
          else if (state === "ACCEL") {
            setCheckeredFlag(false);
            const gearPower = 1.35 - (activeGear * 0.1);
            const topSpd = topSpeeds[activeGear - 1];
            const minSpd = minSpeeds[activeGear - 1];

            // Heavy acceleration
            const rate = (60 / activeGear) * gearPower;
            currentSpeed = Math.min(topSpd, currentSpeed + rate * dt);

            // Sync RPM
            const frac = (currentSpeed - minSpd) / (topSpd - minSpd || 1);
            const targetRpm = 2000 + frac * (7200 - 2000);
            currentRpm += (targetRpm - currentRpm) * 15 * dt;

            targetBoost = 1.83 - (activeGear * 0.08);
            setGForceY(Number((1.1 / activeGear).toFixed(2)));
            setGForceX(Number((Math.sin(time * 0.003) * 0.06).toFixed(2)));

            // Shift threshold
            if (currentRpm >= 7100) {
              if (activeGear < 6) {
                state = "SHIFTING";
                shiftTimer = 0;
                setGear("S" + activeGear);
                playSound("click");
              } else {
                state = "REDLINE_HOLD";
                holdTimer = 0;
              }
            }
          }
          else if (state === "SHIFTING") {
            targetBoost = 0.4;
            currentRpm -= (currentRpm * 0.35) * 12 * dt; // quick gear clutch shift drop
            shiftTimer += dt;
            if (shiftTimer > 0.16) {
              activeGear += 1;
              setGear("D" + activeGear);
              state = "ACCEL";
              playSound("click");
            }
          }
          else if (state === "REDLINE_HOLD") {
            currentSpeed = 295 + Math.sin(time * 0.03) * 1.5;
            currentRpm = 7100 + Math.sin(time * 0.1) * 90;
            targetBoost = 1.1;
            setGForceY(0.05);
            setGForceX(0);

            holdTimer += dt;
            if (holdTimer > 2.5) {
              state = "BRAKE";
            }
          }
          else if (state === "BRAKE") {
            // Hard track brakes!
            currentSpeed = Math.max(0, currentSpeed - 85 * dt);
            targetBoost = 0;
            setGForceY(-1.2 - Math.random() * 0.05);
            setGForceX(Number((Math.sin(time * 0.01) * 0.08).toFixed(2)));

            // Adaptive downshift down to idle stops
            const currentGearMinSpeed = minSpeeds[activeGear - 1];
            if (currentSpeed < currentGearMinSpeed && activeGear > 1) {
              activeGear -= 1;
              setGear("D" + activeGear);
              currentRpm = 4500; // spike blip for downshift rev match
              playSound("click");
            } else {
              const topSpd = topSpeeds[activeGear - 1];
              const minSpd = minSpeeds[activeGear - 1];
              const frac = (currentSpeed - minSpd) / (topSpd - minSpd || 1);
              const targetRpm = 1200 + frac * (4500 - 1200);
              currentRpm += (targetRpm - currentRpm) * 10 * dt;
            }

            if (currentSpeed === 0) {
              state = "IDLE";
              holdTimer = 0;
            }
          }
          else if (state === "IDLE") {
            setGear("P");
            currentRpm += (800 - currentRpm) * 6 * dt;
            currentSpeed = 0;
            targetBoost = 0;
            setGForceX(0);
            setGForceY(0);

            holdTimer += dt;
            if (holdTimer > 1.8) {
              state = "LAUNCH";
              launchTimer = 0;
              currentRpm = 800;
            }
          }
        }
      }

      // Spring smoothed metrics
      if (!isBootingLocal) {
        // High elastic spring when Sport Mode is enabled vs more linear smooth damping in efficient
        const tension = isSportModeRef.current ? 340 : 180;
        const damping = isSportModeRef.current ? 15 : 24;

        const speedForce = (currentSpeed - springSpeed) * tension;
        springSpeedVelocity += (speedForce - springSpeedVelocity * damping) * dt;
        springSpeed += springSpeedVelocity * dt;

        const rpmForce = (currentRpm - springRpm) * tension;
        springRpmVelocity += (rpmForce - springRpmVelocity * damping) * dt;
        springRpm += springRpmVelocity * dt;
      }

      // Sync refs for manual values
      manualSpeedRef.current = currentSpeed;
      manualRpmRef.current = currentRpm;

      // Smooth boost using simple interpolation
      currentBoost += (targetBoost - currentBoost) * 10 * dt;

      // Set state trackers (clip to zero)
      setSpeed(Math.max(0, Math.round(springSpeed)));
      setRpm(Math.max(0, Math.round(springRpm)));
      setBoost(Number(currentBoost.toFixed(2)));

      frameId = requestAnimationFrame(runLoop);
    };

    frameId = requestAnimationFrame(runLoop);

    // Subtle vibration on speed dial via GSAP
    gsap.to(".speed-glowing-ring", {
      scale: 1.02,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Draw shift LEDs: Green, Yellow, Orange, Red
  const renderShiftLights = () => {
    const maxRpm = 7300;
    const activeRpm = rpm - 4000;
    const totalLEDs = 8;
    if (activeRpm < 0) return <div className="h-1.5 mb-1" />; // spacer

    const activatedCount = Math.min(totalLEDs, Math.ceil((activeRpm / (maxRpm - 4000)) * totalLEDs));
    const isRedlineFlashing = rpm >= 7000;

    return (
      <div className="flex gap-1 justify-center mb-1">
        {[...Array(totalLEDs)].map((_, i) => {
          const id = i + 1;
          const isActive = id <= activatedCount;
          
          let colorClass = "bg-neutral-800";
          if (isActive) {
            if (isRedlineFlashing) {
              colorClass = i % 2 === 0 ? "bg-[#0b6fff] shadow-[0_0_8px_#0b6fff]" : "bg-[#dfb46c] shadow-[0_0_8px_#dfb46c] animate-pulse";
            } else {
              if (id <= 2) colorClass = "bg-[#10b981] shadow-[0_0_6px_#10b981]"; // Green
              else if (id <= 4) colorClass = "bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"; // Yellow
              else if (id <= 6) colorClass = "bg-[#f97316] shadow-[0_0_6px_#f97316]"; // Orange
              else colorClass = "bg-[#dfb46c] shadow-[0_0_8px_#dfb46c]"; // Gold instead of Red
            }
          }

          return (
            <span 
              key={i} 
              className={`w-3.5 h-1.5 rounded-sm transition-all duration-75 ${colorClass}`} 
            />
          );
        })}
      </div>
    );
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      
      {/* Background Image Backdrops */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-[#030303] z-10" />
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=2000"
          alt="Veltrix Cyber-Chassis"
          className="w-full h-full object-cover"
        />
        {/* Animated Neon Matrix Ambient grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#0b6fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08] z-2 animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Ambient Studio Lighting (Glow Simulators) */}
      <div className="absolute top-20 left-1/4 w-[45%] h-[200px] bg-vel-blue/15 rounded-full blur-[140px] pointer-events-none z-1 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-1/4 w-[40%] h-[250px] bg-gold/10 rounded-full blur-[160px] pointer-events-none z-1 animate-pulse" style={{ animationDuration: '5s' }} />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Content Headline & CTAs */}
        <div className="w-full lg:w-[49%] space-y-6 text-left">
          
          {/* Status badge */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-vel-blue animate-ping" />
            <p className="text-[10px] font-mono tracking-widest text-vel-blue uppercase">
              VELTRIX APEX ORDER ALLOCATIONS OPEN
            </p>
          </motion.div>

          {/* Epic Display Typography */}
          <div className="overflow-hidden space-y-1">
            <motion.h1 
              initial={{ y: 80, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-display leading-[0.9] text-white tracking-wide uppercase"
            >
              OWN THE FUTURE <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold via-white to-gold filter drop-shadow-[0_0_25px_rgba(223,180,108,0.35)] font-extrabold">
                OF DRIVING
              </span>
            </motion.h1>
          </div>

          {/* Tagline text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-xl text-slate-300 font-body text-base lg:text-lg leading-relaxed"
          >
            We engineer hyper-prestige coordinates of speed and carbon architecture. Welcome to the private sovereign fleet of <strong className="text-white">Veltrix Motors</strong>, custom commissioned in Zurich.
          </motion.p>

          {/* CTA Interactive buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
          >
            <motion.a
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 0 30px rgba(223, 180, 108, 0.45)"
              }}
              whileTap={{ scale: 0.98 }}
              href="#inventory"
              onClick={() => {
                playSound("startup");
                setActiveTab("Browse Cars");
              }}
              className="px-8 py-4.5 bg-gradient-to-tr from-gold to-black text-white font-mono text-xs tracking-[0.2em] uppercase rounded-xl border border-gold/40 text-center relative group overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                Browse Cars <ArrowRight className="w-4.5 h-4.5 text-[#1C6BFF]" />
              </span>
            </motion.a>

            <motion.a
              whileHover={{ 
                scale: 1.03,
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              href="#contact"
              onClick={() => {
                playSound("click");
                setActiveTab("Inquire");
              }}
              className="px-8 py-4.5 bg-white/5 text-slate-200 hover:text-white font-mono text-xs tracking-[0.2em] uppercase rounded-xl transition-all border border-white/10 text-center cursor-pointer"
            >
              Book Test Drive
            </motion.a>
          </motion.div>

          {/* Floating HUD Stat Cards inside Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-10"
          >
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(0, 229, 255, 0.3)" }}
              className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md transition-all"
            >
              <p className="text-2xl font-display text-white tracking-widest">1,900 HP</p>
              <p className="text-[10px] text-vel-blue uppercase tracking-widest font-mono">Solid-State Output</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(223, 180, 108, 0.4)" }}
              className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md transition-all"
            >
              <p className="text-2xl font-display text-white tracking-widest">0-60 in 1.43s</p>
              <p className="text-[10px] text-gold uppercase tracking-widest font-mono">Apex Simulation</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5, borderColor: "rgba(255, 255, 255, 0.2)" }}
              className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md col-span-2 sm:col-span-1 transition-all"
            >
              <p className="text-2xl font-display text-white tracking-widest">185 Clients</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Bespoke Commissions</p>
            </motion.div>
          </motion.div>

        </div>

        {/* Dynamic speedometer graphical HUD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, type: "spring", delay: 0.5 }}
          className="w-full lg:w-[49%] flex flex-col items-center justify-center relative select-none"
        >
          
          {/* Main Bezel Housing of BMW Gauge Panel */}
          <div className="relative w-full max-w-2xl aspect-[2.2/1] flex items-center justify-center rounded-3xl border border-white/10 bg-[#040608] shadow-[0_0_80px_rgba(0,0,0,0.95),inset_0_4px_30px_rgba(255,255,255,0.03)] p-2 group overflow-hidden">
            
            {/* Ambient Radial Vignette & HUD Glow */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,107,255,0.06)_0%,transparent_70%)] pointer-events-none transition-opacity duration-300 ${isSportMode ? "opacity-30" : "opacity-100"}`} />
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.08)_0%,transparent_70%)] pointer-events-none transition-opacity duration-300 ${isSportMode ? "opacity-100" : "opacity-0"}`} />
            
            {/* Live Micro-flicker screen illumination overlay */}
            <div className="absolute inset-0 opacity-[0.015] bg-white pointer-events-none mix-blend-overlay animate-pulse" style={{ animationDuration: '0.12s' }} />

            {/* Core BMW Digital Gauge Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 280">
              <defs>
                {/* SVG Style block for custom performance-tuned animations */}
                <style>{`
                  @keyframes laneScroll {
                    from { stroke-dashoffset: 12; }
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes pulseRedline {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.85; filter: drop-shadow(0 0 10px #E10600); }
                  }
                  @keyframes subtleRotate {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(1deg); }
                  }
                `}</style>

                {/* Carbon Fiber Fabric Texture Pattern */}
                <pattern id="carbonFabric" width="6" height="6" patternUnits="userSpaceOnUse">
                  <rect width="6" height="6" fill="#05070a" />
                  <path d="M0 3 L6 3 M3 0 L3 6" stroke="#0b0f14" strokeWidth="1" opacity="0.3" />
                  <path d="M0 0 L6 6 M6 0 L0 6" stroke="#101720" strokeWidth="0.8" opacity="0.1" />
                </pattern>

                {/* Micro-Pixel OLED Screen Pattern Overlay */}
                <pattern id="hudScreenGrid" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="4" height="4" fill="none" />
                  <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.012)" strokeWidth="0.4" />
                  <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.012)" strokeWidth="0.4" />
                </pattern>

                {/* Brushed Silver Cap center core */}
                <radialGradient id="brushedCap" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="60%" stopColor="#9CA3AF" />
                  <stop offset="100%" stopColor="#374151" />
                </radialGradient>

                {/* Speed indicator gradients: Normal BMW (Deep Electric Blue -> Ice Blue) vs Sport (Orange -> Fiery Red) */}
                <linearGradient id="normalSpeedGrad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0b6fff" />
                  <stop offset="50%" stopColor="#00d5ff" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                <linearGradient id="sportSpeedGrad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF9500" />
                  <stop offset="65%" stopColor="#FF3B30" />
                  <stop offset="100%" stopColor="#E10600" />
                </linearGradient>

                {/* Fuel & Temperature gradients */}
                <linearGradient id="fuelGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF453A" />
                  <stop offset="30%" stopColor="#FFD60A" />
                  <stop offset="100%" stopColor="#30D158" />
                </linearGradient>

                {/* Curved Glass Sheen Reflection Mask */}
                <linearGradient id="glassSheenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="45%" stopColor="rgba(255,255,255,0.008)" />
                  <stop offset="85%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Plate with Carbon texture */}
              <rect width="600" height="280" fill="url(#carbonFabric)" rx="24" />

              {/* High-definition grid matrix layer for technical dashboard depth */}
              <rect width="600" height="280" fill="url(#hudScreenGrid)" rx="24" className="pointer-events-none" />

              {/* Outer Screen Board Bezel Border */}
              <rect width="600" height="280" rx="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <rect width="594" height="274" x="3" y="3" rx="21" fill="none" stroke="rgba(0,0,0,0.9)" strokeWidth="2.5" />

              {/* Futuristic cockpit grid backplane alignment guidelines */}
              <line x1="30" y1="150" x2="570" y2="150" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="300" y1="40" x2="300" y2="240" stroke="rgba(255,255,255,0.015)" strokeWidth="1" strokeDasharray="2, 6" />

              {/* Subtle parallel bezel trims of gauges for genuine machined aluminum styling */}
              <path 
                d="M 230,225 L 95,225 A 20,20 0 0,1 77,213 L 44,145 A 20,20 0 0,1 44,130 L 102,81 A 20,20 0 0,1 118,75 L 230,75" 
                fill="none" 
                stroke="rgba(255,255,255,0.02)" 
                strokeWidth="0.8" 
              />
              <path 
                d="M 370,225 L 505,225 A 20,20 0 0,0 523,213 L 556,145 A 20,20 0 0,0 556,130 L 498,81 A 20,20 0 0,0 482,75 L 370,75" 
                fill="none" 
                stroke="rgba(255,255,255,0.02)" 
                strokeWidth="0.8" 
              />


              {/* ================= SEQUENTIAL SHIFT LIGHTS indicator ================= */}
              <g id="shiftLEDArray" transform="translate(0, 10)">
                {(() => {
                  const ledPositions = [210, 235, 260, 285, 315, 340, 365, 390];
                  return ledPositions.map((xPos, idx) => {
                    const thresholdRpm = [2200, 3500, 4800, 5800, 6500, 7000, 7300, 7600][idx];
                    const active = rpm >= thresholdRpm;
                    
                    // LED Colors: Green (Green-Division), Amber (Mid-torque), Red (Redline alert), Blue (High rev match shifts)
                    let color = "rgba(255,255,255,0.02)";
                    let glowFilter = "none";
                    if (active) {
                      if (idx < 3) {
                        color = "#10B981"; // LED Green
                        glowFilter = "drop-shadow(0 0 6px rgba(16,185,129,0.85))";
                      } else if (idx < 5) {
                        color = "#F59E0B"; // LED Amber
                        glowFilter = "drop-shadow(0 0 7px rgba(245,158,11,0.85))";
                      } else if (idx < 7) {
                        color = "#EF4444"; // LED Red
                        glowFilter = "drop-shadow(0 0 8px rgba(239,68,68,0.9))";
                      } else {
                        // agresive blink-on-shift point at redline
                        const blink = Math.floor(Date.now() / 70) % 2 === 0;
                        color = blink ? "#3B82F6" : "#EF4444"; 
                        glowFilter = blink 
                          ? "drop-shadow(0 0 14px rgba(59,130,246,0.95))" 
                          : "drop-shadow(0 0 14px rgba(239,68,68,0.95))";
                      }
                    }
                    
                    return (
                      <g key={`shift-led-${idx}`}>
                        {/* Shifter lens casing bezel */}
                        <circle cx={xPos} cy="18" r="4.5" fill="#0d1117" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                        <circle 
                          cx={xPos} 
                          cy="18" 
                          r={active ? "3" : "1.8"} 
                          fill={color} 
                          style={{
                            filter: glowFilter,
                            transition: "fill 0.05s ease, r 0.05s ease"
                          }}
                        />
                      </g>
                    );
                  });
                })()}
                {/* Micro indicators text */}
                <text x="300" y="29" textAnchor="middle" className="fill-slate-500 font-mono text-[6.5px] uppercase tracking-widest opacity-80">
                  {rpm >= 7000 ? "/// SHIFT NOW ///" : "M SEQUENTIAL SHIFT INDICATOR"}
                </text>
              </g>


              {/* ================= HIGH RES LANE ASSIST AND HUD PATHS ================= */}
              
              {/* Dynamic Perspective Road Track Lanes showing scrolling velocity coordinates */}
              <g className="opacity-90">
                {/* Perspective horizon guide lanes */}
                <line x1="160" y1="210" x2="260" y2="175" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />
                <line x1="440" y1="210" x2="340" y2="175" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />
                
                {/* Adaptive scrolling lane marker - speed controls scrolling rate dynamically with CSS inline variable */}
                <path 
                  d="M 300,215 L 300,175" 
                  stroke="rgba(255,255,255,0.15)" 
                  strokeWidth="1.6" 
                  strokeDasharray="4, 8" 
                  strokeLinecap="round"
                  style={{
                    animation: speed > 2 
                      ? `laneScroll ${Math.max(0.05, 1.8 - (speed / 135))}s linear infinite` 
                      : "none"
                  }}
                />
              </g>

              
              {/* ================= LEFT SPEED BOOMERANG GAUGE ================= */}
              
              {/* Left Inactive backing track */}
              <path 
                d="M 230,220 L 95,220 A 15,15 0 0,1 82,211 L 49,143 A 15,15 0 0,1 49,132 L 106,84 A 15,15 0 0,1 117,80 L 230,80" 
                fill="none" 
                stroke="rgba(255,255,255,0.04)" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />

              {/* Volumetric ambient backglow beneath active trace segment for high-depth OLED premium flare */}
              <motion.path 
                d="M 230,220 L 95,220 A 15,15 0 0,1 82,211 L 49,143 A 15,15 0 0,1 49,132 L 106,84 A 15,15 0 0,1 117,80 L 230,80" 
                fill="none" 
                stroke={isSportMode ? "#EF4444" : "#00d5ff"} 
                strokeWidth="15" 
                strokeLinecap="round"
                opacity="0.14"
                animate={{ pathLength: speed / 320 }}
                transition={{ type: "spring", stiffness: 85, damping: 16 }}
                style={{
                  filter: "blur(6px)"
                }}
              />

              {/* Highlight active trace segment based on current speed */}
              <motion.path 
                d="M 230,220 L 95,220 A 15,15 0 0,1 82,211 L 49,143 A 15,15 0 0,1 49,132 L 106,84 A 15,15 0 0,1 117,80 L 230,80" 
                fill="none" 
                stroke={isSportMode ? "url(#sportSpeedGrad)" : "url(#normalSpeedGrad)"} 
                strokeWidth="6" 
                strokeLinecap="round"
                animate={{ pathLength: speed / 320 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                style={{
                  filter: isSportMode 
                    ? "drop-shadow(0 0 6px rgba(225,6,0,0.7))" 
                    : "drop-shadow(0 0 6px rgba(11,211,255,0.75))"
                }}
              />

              {/* Outer ticks track background */}
              <path 
                d="M 230,223 L 95,223 A 18,18 0 0,1 79,212 L 46,144 A 18,18 0 0,1 46,131 L 103,82 A 18,18 0 0,1 116,77 L 230,77" 
                fill="none" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="3.5" 
                strokeDasharray="2, 5" 
                strokeLinecap="round" 
              />

              {/* Outstanding Gilded Active glowing ticks */}
              <motion.path 
                d="M 230,223 L 95,223 A 18,18 0 0,1 79,212 L 46,144 A 18,18 0 0,1 46,131 L 103,82 A 18,18 0 0,1 116,77 L 230,77" 
                fill="none" 
                stroke={isSportMode ? "#FF3B30" : "#40e0ff"} 
                strokeWidth="3.8" 
                strokeDasharray="2, 5" 
                strokeLinecap="round"
                animate={{ pathLength: speed / 320 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                style={{
                  filter: isSportMode 
                    ? "drop-shadow(0 0 3px #FF3B30)" 
                    : "drop-shadow(0 0 3px #00e5ff)"
                }}
              />


              {/* ================= RIGHT RPM BOOMERANG GAUGE ================= */}
              
              {/* Right Inactive backing track */}
              <path 
                d="M 370,220 L 505,220 A 15,15 0 0,0 518,211 L 551,143 A 15,15 0 0,0 551,132 L 494,84 A 15,15 0 0,0 483,80 L 370,80" 
                fill="none" 
                stroke="rgba(255,255,255,0.04)" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />

              {/* Volumetric ambient backglow beneath active RPM segment for high-depth OLED premium flare */}
              <motion.path 
                d="M 370,220 L 505,220 A 15,15 0 0,0 518,211 L 551,143 A 15,15 0 0,0 551,132 L 494,84 A 15,15 0 0,0 483,80 L 370,80" 
                fill="none" 
                stroke={isSportMode ? "#EF4444" : "#00d5ff"} 
                strokeWidth="15" 
                strokeLinecap="round"
                opacity="0.14"
                animate={{ pathLength: rpm / 8000 }}
                transition={{ type: "spring", stiffness: 95, damping: 16 }}
                style={{
                  filter: "blur(6px)"
                }}
              />

              {/* Active RPM Glowing path */}
              <motion.path 
                d="M 370,220 L 505,220 A 15,15 0 0,0 518,211 L 551,143 A 15,15 0 0,0 551,132 L 494,84 A 15,15 0 0,0 483,80 L 370,80" 
                fill="none" 
                stroke={isSportMode ? "url(#sportSpeedGrad)" : "url(#normalSpeedGrad)"} 
                strokeWidth="6" 
                strokeLinecap="round"
                animate={{ pathLength: rpm / 8000 }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                style={{
                  filter: isSportMode 
                    ? "drop-shadow(0 0 6px rgba(225,6,0,0.65))" 
                    : "drop-shadow(0 0 5px rgba(11,211,255,0.7))"
                }}
              />

              {/* Outer ticks track background for RPM */}
              <path 
                d="M 370,223 L 505,223 A 18,18 0 0,0 521,212 L 554,144 A 18,18 0 0,0 554,131 L 497,82 A 18,18 0 0,0 484,77 L 370,77" 
                fill="none" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="3.5" 
                strokeDasharray="2, 5" 
                strokeLinecap="round" 
              />

              {/* Active RPM glowing elements ticks */}
              <motion.path 
                d="M 370,223 L 505,223 A 18,18 0 0,0 521,212 L 554,144 A 18,18 0 0,0 554,131 L 497,82 A 18,18 0 0,0 484,77 L 370,77" 
                fill="none" 
                stroke={isSportMode ? "#FF3B30" : "#40e0ff"} 
                strokeWidth="3.8" 
                strokeDasharray="2, 5" 
                strokeLinecap="round"
                animate={{ pathLength: rpm / 8000 }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                style={{
                  filter: isSportMode 
                    ? "drop-shadow(0 0 3px #FF3B30)" 
                    : "drop-shadow(0 0 3px #00e5ff)"
                }}
              />


              {/* ================= DOCK SPEED & RPM SCALE VALUES LABELS ================= */}
              
              {/* Speed Scale Ticks Labels */}
              {(() => {
                const labelsPool = isMetric 
                  ? [0, 40, 80, 120, 160, 200, 240, 280, 320]
                  : [0, 25, 50, 75, 100, 125, 150, 175, 200];
                
                const labelsCoords = [
                  { x: 212, y: 211 },  // 0 speed label
                  { x: 160, y: 211 },
                  { x: 118, y: 202 },
                  { x: 74, y: 172 },
                  { x: 67, y: 133 },
                  { x: 88, y: 106 },
                  { x: 132, y: 94 },
                  { x: 178, y: 94 },
                  { x: 222, y: 94 }
                ];
                
                return labelsPool.map((lbl, idx) => {
                  const targetSpeedMetricVal = isMetric ? lbl : Math.round(lbl / 0.621371);
                  const isActive = speed >= targetSpeedMetricVal && !isBooting;
                  const c = labelsCoords[idx];
                  
                  let txtColorClass = "fill-slate-500 font-medium";
                  if (isActive) {
                    txtColorClass = isSportMode ? "fill-[#FF453A] font-extrabold" : "fill-white font-extrabold";
                  }
                  
                  return (
                    <text 
                      key={`spd-lbl-${idx}`} 
                      x={c.x} 
                      y={c.y + 3} 
                      textAnchor="middle" 
                      className={`text-[9px] select-none uppercase tracking-tighter transition-colors duration-100 ${txtColorClass}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {lbl}
                    </text>
                  );
                });
              })()}

              {/* RPM Scale Ticks Labels */}
              {(() => {
                const rpmCoords = [
                  { x: 388, y: 211 },  // 1 label
                  { x: 440, y: 211 },  // 2 label
                  { x: 482, y: 202 },  // 3 label
                  { x: 526, y: 172 },  // 4 label
                  { x: 533, y: 133 },  // 5 label
                  { x: 512, y: 106 },  // 6 label
                  { x: 468, y: 94 },   // 7 label
                  { x: 422, y: 94 },   // 8 label
                  { x: 378, y: 94 }    // 9 label
                ];
                
                return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((lbl, idx) => {
                  const isActive = rpm >= (lbl * 1000) && !isBooting;
                  const c = rpmCoords[idx];
                  
                  let txtColorClass = "fill-slate-500 font-medium";
                  if (isActive) {
                    if (lbl >= 7) {
                      txtColorClass = "fill-[#E10600] font-black animate-pulse";
                    } else {
                      txtColorClass = isSportMode ? "fill-[#FF453A] font-extrabold" : "fill-white font-extrabold";
                    }
                  } else if (lbl >= 7) {
                    txtColorClass = "fill-[#E10600]/40 font-semibold";
                  }
                  
                  return (
                    <text 
                      key={`rpm-lbl-${idx}`} 
                      x={c.x} 
                      y={c.y + 3} 
                      textAnchor="middle" 
                      className={`text-[9px] select-none tracking-tighter transition-colors duration-100 ${txtColorClass}`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {lbl}
                    </text>
                  );
                });
              })()}


              {/* ================= HUD DIGITAL STATS IN THE BOTTOM ROW ================= */}
              
              {/* Left Side: FUEL INDICATOR */}
              <g transform="translate(100, 240)" className="opacity-90">
                <text x="0" y="8" className="fill-slate-400 font-semibold text-[8px]" textAnchor="start">1</text>
                <text x="-25" y="8" className="fill-slate-500 font-medium text-[8px]" textAnchor="middle">1/2</text>
                <text x="-50" y="8" className="fill-slate-500 font-medium text-[8px]" textAnchor="end">0</text>
                
                {/* Fuel lines with sleek premium filling colors */}
                <line x1="-50" y1="14" x2="0" y2="14" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" />
                <motion.line 
                  x1="-50" 
                  y1="14" 
                  x2="-10" 
                  y2="14" 
                  stroke="url(#fuelGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  style={{ filter: "drop-shadow(0 0 3px rgba(48,209,88,0.4))" }}
                />
                
                {/* Gas pump symbol path */}
                <g opacity="0.6">
                  <path d="M -60,6 L -58,6 A 1,1 0 0,1 -57,7 L -57,11 H -61 C -61.5,11 -62,10.5 -62,10 V 7 A 1,1 0 0,1 -61,6 Z" fill="none" stroke="white" strokeWidth="0.8" />
                  <path d="M -57,8 H -56 A 0.5,0.5 0 0,1 -55.5,8.5 V 10" fill="none" stroke="white" strokeWidth="0.8" />
                </g>
                <text x="-62" y="1.5" className="fill-slate-400 font-mono text-[7px]" textAnchor="end">98% CALIB</text>
              </g>

              {/* Right Side: ENGINE WATER TIME CODES GAUGE */}
              <g transform="translate(450, 240)" className="opacity-90">
                <text x="50" y="8" className="fill-slate-500 font-medium text-[8px]" textAnchor="start">130 °C</text>
                <text x="25" y="8" className="fill-slate-500 font-medium text-[8px]" textAnchor="middle">90</text>
                <text x="0" y="8" className="fill-slate-400 font-semibold text-[8px]" textAnchor="end">50</text>
                
                {/* Water temperature lines */}
                <line x1="0" y1="14" x2="50" y2="14" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" />
                <motion.line 
                  x1="0" 
                  y1="14" 
                  x2="32" 
                  y2="14" 
                  stroke={isSportMode ? "#EF4444" : "#00d5ff"} 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  style={{
                    filter: isSportMode 
                      ? "drop-shadow(0 0 3px rgba(239,68,68,0.4))" 
                      : "drop-shadow(0 0 3px rgba(0,213,255,0.4))"
                  }}
                />
                
                {/* Temp thermometer icon */}
                <g opacity="0.6">
                  <path d="M -10,14 V 6 A 1.5,1.5 0 1,1 -7,6 V 14 Z" fill="none" stroke="white" strokeWidth="0.8" />
                  <line x1="-12" y1="10" x2="-8" y2="10" stroke="white" strokeWidth="0.8" />
                  <line x1="-12" y1="12" x2="-8" y2="12" stroke="white" strokeWidth="0.8" />
                </g>
                <text x="62" y="1.5" className="fill-slate-400 font-mono text-[7px]" textAnchor="start">SYS T: NORMAL</text>
              </g>


              {/* ================= COMPASS & TRACK RADAR CENTRAL MODULE ================= */}
              
              {/* Telemetry coordinate G-Force grid radar surrounding chevron */}
              <g transform="translate(300, 168)" className="opacity-40">
                <circle cx="0" cy="8" r="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                <circle cx="0" cy="8" r="28" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="3, 5" />
                <line x1="-34" y1="8" x2="34" y2="8" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                <line x1="0" y1="-26" x2="0" y2="42" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                {/* Micro guidelines */}
                <text x="0" y="-12" className="fill-slate-500 font-mono text-[5px] font-bold" textAnchor="middle">1.0 G</text>
                <text x="0" y="34" className="fill-slate-500 font-mono text-[5px] font-bold" textAnchor="middle">2.0 G</text>
              </g>

              {/* Red Digital Direction Navigation Chevron Arrow exactly matching the BMW image target */}
              <g transform="translate(300, 168)" className="opacity-95 shadow-md">
                <polygon points="0,-7 -6,5 0,1 6,5" fill="#E10600" style={{ filter: "drop-shadow(0 0 3px rgba(225,6,0,0.85))" }} />
                <line x1="0" y1="1" x2="0" y2="18" stroke="#E10600" strokeWidth="0.8" opacity="0.6" />
              </g>

              {/* Live interactive inertia G-force indicator ball mapping live lateral movements */}
              <g transform="translate(300, 176)">
                <motion.circle 
                  cx={gForceX * 16} 
                  cy={gForceY * 16} 
                  r="2.5" 
                  fill={isSportMode ? "#EF4444" : "#00E5FF"}
                  style={{
                    filter: isSportMode ? "drop-shadow(0 0 5px #EF4444)" : "drop-shadow(0 0 5px #00E5FF)",
                    transition: "cx 0.08s ease, cy 0.08s ease"
                  }}
                />
              </g>

              {/* Compass heading markers */}
              <g transform="translate(300, 176)" className="opacity-90">
                <text x="0" y="-38" textAnchor="middle" className="fill-white font-mono text-[7px] font-bold">N</text>
                <text x="38" y="2" textAnchor="start" className="fill-slate-500 font-mono text-[6px]">E</text>
                <text x="-38" y="2" textAnchor="end" className="fill-slate-500 font-mono text-[6px]">W</text>
                <text x="0" y="42" textAnchor="middle" className="fill-slate-500 font-mono text-[6px]">S</text>
              </g>


              {/* ================= BRANDED CAR DESIGN HEADER LOGO AND SCREEN STATE ================= */}
              
              {/* BMW ///M5 Core logo insignia exactly centered top */}
              <g transform="translate(284, 45)" className="opacity-95">
                {/* Signature three slanted colored racing lines */}
                <rect x="0" y="3" width="3" height="11" fill="#21A0D2" transform="skewX(-20)" />
                <rect x="4.5" y="3" width="3" height="11" fill="#122A88" transform="skewX(-20)" />
                <rect x="9" y="3" width="3" height="11" fill="#E10600" transform="skewX(-20)" />
                {/* M5 Lettering */}
                <text x="16" y="13" className="fill-white font-sans font-black text-[13px] tracking-tight italic">M5</text>
              </g>


              {/* ================= HIGH INTERACTIVE SPEEDS AND GEAR COUNTERS SYSTEM ================= */}
              {(() => {
                const displaySpeedValue = isMetric ? speed : Math.round(speed * 0.621371);
                const displayUnitValue = isMetric ? "km/h" : "mph";
                
                return (
                  <g>
                    {isBooting ? (
                      <g>
                        {/* System Boot loader progress text */}
                        <text x="300" y="115" textAnchor="middle" className="fill-[#FF9500] font-mono text-[8px] uppercase tracking-[0.3em] font-semibold animate-pulse">
                          SYSTEM CHECK IN PROGRESS
                        </text>
                        <text x="300" y="142" textAnchor="middle" className="fill-white font-sans text-lg font-black tracking-widest uppercase">
                          M-PERFORMANCE
                        </text>
                      </g>
                    ) : (
                      <g>
                        {/* LEFT DIGITAL INNER DISPLAY: SPEED READOUT */}
                        <g transform="translate(190, 142)">
                          <text 
                            x="0" 
                            y="0" 
                            textAnchor="middle" 
                            className="fill-white text-[48px] font-sans font-black select-none tracking-tighter drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]"
                          >
                            {displaySpeedValue}
                          </text>
                          <text 
                            x="38" 
                            y="-6" 
                            textAnchor="start" 
                            className="fill-slate-400 font-semibold font-mono text-[9px] uppercase tracking-wide opacity-50"
                          >
                            {displayUnitValue}
                          </text>
                        </g>

                        {/* RIGHT DIGITAL INNER DISPLAY: CURRENT GEAR TRANSMISSION */}
                        <g transform="translate(410, 142)">
                          <text 
                            x="0" 
                            y="0" 
                            textAnchor="middle" 
                            className={`text-[48px] font-sans font-black select-none tracking-tighter transition-colors duration-200 ${isSportMode ? "fill-[#E10600] drop-shadow-[0_0_12px_rgba(225,6,0,0.25)]" : "fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]"}`}
                          >
                            {gear}
                          </text>
                          <text 
                            x="-38" 
                            y="-6" 
                            textAnchor="end" 
                            className="fill-slate-400 font-semibold font-mono text-[9px] uppercase tracking-wide opacity-50"
                          >
                            gear
                          </text>
                        </g>

                        {/* Speed limit graphic circle in the bottom left inside */}
                        <g transform="translate(182, 192)" className="opacity-95">
                          <circle cx="11" cy="11" r="10" stroke="#FF3B30" strokeWidth="2.5" fill="white" />
                          <text x="11" y="14.5" textAnchor="middle" className="fill-black font-sans font-black text-[9px]">20</text>
                          <text x="11" y="27" textAnchor="middle" className="fill-slate-400 font-mono text-[6px] tracking-widest uppercase font-medium">limit</text>
                        </g>

                        {/* 1/min x 1000 scale specification on bottom right inside */}
                        <g transform="translate(415, 192)" className="opacity-75">
                          <text x="0" y="14" textAnchor="middle" className="fill-slate-400 font-mono text-[7px] uppercase tracking-[0.1em]">
                            1/min x1000
                          </text>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* Curved Glass Sheen Reflection Overlay for premium physical cockpit feel */}
              <path d="M 30,50 Q 300,10 570,50 Q 550,230 300,260 Q 50,230 30,50 Z" fill="url(#glassSheenGrad)" className="opacity-[0.25] pointer-events-none" />
              
            </svg>

            {/* Bottom Cockpit status lines exactly matching image readouts */}
            {/* Clock GMT, Range 110mi, 4WD active, +18.5 °C temp */}
            <div className="absolute bottom-5 left-10 right-10 flex items-center justify-between z-10 text-[9px] font-mono tracking-widest text-slate-400 uppercase select-none font-bold">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-white">
                  {/* Fuel logo visual */}
                  <span className="text-amber-500">⛽</span> 110 mi
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  {timeStr}
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-[8.5px] uppercase text-slate-500">
                <span className={boost >= 1.5 ? "text-[#E10600] font-semibold" : ""}>BOOST: {boost} BAR</span>
                <span>•</span>
                <span>LAT: {gForceX}G</span>
                <span>•</span>
                <span>LONG: {gForceY}G</span>
              </div>

              <div className="flex items-center gap-3 text-white">
                <span className="text-[#00e5ff] font-extrabold pb-0.5 tracking-[0.2em]">4WD</span>
                <span className="text-slate-600">|</span>
                <span>+18.5 °C</span>
              </div>
            </div>

          </div>

          {/* Interactive Instrument Deck */}
          <div className="w-full max-w-sm mt-4 p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-white/5 space-y-4">
            {/* Mode selection tagger */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500 select-none uppercase tracking-widest text-[9px]">COCKPIT CONFIG:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsMetric(!isMetric);
                    }}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                      isMetric 
                      ? "bg-white/10 border-white/25 text-white" 
                      : "bg-white/3 border-transparent text-slate-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    {isMetric ? "KM/H" : "MPH"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsSportMode(!isSportMode);
                    }}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                      isSportMode 
                      ? "bg-[#E10600]/15 border-[#E10600]/60 text-[#E10600] shadow-[0_0_8px_rgba(225,6,0,0.3)]" 
                      : "bg-white/3 border-transparent text-slate-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    /// M SPORT
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500 select-none uppercase tracking-widest text-[9px]">DRIVE TYPE:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsManual(false);
                    }}
                    className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      !isManual ? "bg-vel-blue/15 border border-vel-blue/50 text-vel-blue shadow-[0_0_10px_rgba(0,229,255,0.1)]" : "bg-white/2 hover:bg-white/5 border border-transparent text-slate-400"
                    }`}
                  >
                    AUTOPILOT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsManual(true);
                    }}
                    className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      isManual ? "bg-gold/15 border border-gold/50 text-gold shadow-[0_0_10px_rgba(223,180,108,0.1)]" : "bg-white/2 hover:bg-white/5 border border-transparent text-slate-400"
                    }`}
                  >
                    MANUAL DRIVE
                  </button>
                </div>
              </div>
            </div>

            {isManual ? (
              <div className="space-y-4 text-center animate-fade-in">
                
                {/* Active telemetry dials */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono select-none">
                  <div className="p-2 rounded bg-neutral-900 border border-white/5 text-left">
                    <p className="text-slate-500 uppercase text-[8px]">BOOST PRESSURE:</p>
                    <p className="text-white font-bold text-xs">{boost} BAR</p>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-white/5 text-right">
                    <p className="text-slate-500 uppercase text-[8px]">ACTIVE TARGET G:</p>
                    <p className="text-[#00e5ff] font-bold text-xs">{gForceY} G</p>
                  </div>
                </div>

                {/* Shifting Paddles & pedals control row */}
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Shift Down paddle left */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9, backgroundColor: "rgba(255, 0, 85, 0.25)" }}
                      onClick={shiftDown}
                      className="w-12 h-16 rounded-l-xl bg-neutral-900 border-l-3 border border-white/10 border-l-rose-600 flex flex-col items-center justify-between py-2 text-rose-500 font-mono text-base font-black tracking-widest cursor-pointer select-none"
                    >
                      <span>-</span>
                      <span className="text-[7px] text-slate-500 leading-none">DOWN</span>
                    </motion.button>
                  </div>

                  {/* Interactive pedal controllers */}
                  <div className="flex-1 flex justify-center gap-4 py-1">
                    {/* Brake pedal */}
                    <div className="flex flex-col items-center">
                      <motion.button
                        className="w-12 h-16 rounded bg-neutral-900 border border-t-4 border-t-slate-550 border-white/10 flex items-center justify-center font-mono text-[9px] text-slate-400 select-none cursor-pointer"
                        onMouseDown={() => { brakePressedRef.current = true; setIsBraking(true); }}
                        onMouseUp={() => { brakePressedRef.current = false; setIsBraking(false); }}
                        onMouseLeave={() => { brakePressedRef.current = false; setIsBraking(false); }}
                        onTouchStart={(e) => { e.preventDefault(); brakePressedRef.current = true; setIsBraking(true); }}
                        onTouchEnd={() => { brakePressedRef.current = false; setIsBraking(false); }}
                        style={{
                          transform: isBraking ? "scale(0.92)" : "scale(1)",
                          borderColor: isBraking ? "#dfb46c" : "rgba(255,255,255,0.1)",
                          boxShadow: isBraking ? "0 0 10px rgba(223,180,108,0.3)" : "none"
                        }}
                      >
                        BRAKE
                      </motion.button>
                    </div>

                    {/* Throttle Accelerator pedal */}
                    <div className="flex flex-col items-center">
                      <motion.button
                        className="w-10 h-20 rounded bg-neutral-900 border border-t-4 border-t-vel-blue border-white/10 flex items-center justify-center font-mono text-[9px] text-[#00e5ff] select-none cursor-pointer"
                        onMouseDown={() => { accelPressedRef.current = true; setIsAccelerating(true); }}
                        onMouseUp={() => { accelPressedRef.current = false; setIsAccelerating(false); }}
                        onMouseLeave={() => { accelPressedRef.current = false; setIsAccelerating(false); }}
                        onTouchStart={(e) => { e.preventDefault(); accelPressedRef.current = true; setIsAccelerating(true); }}
                        onTouchEnd={() => { accelPressedRef.current = false; setIsAccelerating(false); }}
                        style={{
                          transform: isAccelerating ? "scale(0.92)" : "scale(1)",
                          borderColor: isAccelerating ? "#00e5ff" : "rgba(255,255,255,0.1)",
                          boxShadow: isAccelerating ? "0 0 15px rgba(0,229,255,0.3)" : "none"
                        }}
                      >
                        GAS
                      </motion.button>
                    </div>

                  </div>

                  {/* Shift Up paddle right */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9, backgroundColor: "rgba(0, 229, 255, 0.25)" }}
                      onClick={shiftUp}
                      className="w-12 h-16 rounded-r-xl bg-neutral-900 border-r-3 border border-white/10 border-r-vel-blue flex flex-col items-center justify-between py-2 text-[#00e5ff] font-mono text-base font-black tracking-widest cursor-pointer select-none"
                    >
                      <span>+</span>
                      <span className="text-[7px] text-slate-500 leading-none">UP</span>
                    </motion.button>
                  </div>

                </div>

                <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
                  Hold GAS to speed up. Tap UP / DOWN paddles to shift. Hold BRAKE to decelerate.
                </p>

              </div>
            ) : (
              <div className="space-y-2 text-center py-1.5 animate-fade-in font-mono text-[10px]">
                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-white/2 border border-white/5 select-none">
                  <span className="text-slate-550 text-[9px]">DYNAMIC TELEMETRY:</span>
                  <span className="text-[#00e5ff] font-bold tracking-wider animate-pulse text-[9px] uppercase">
                    ACTIVE LAP RUN
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="text-left bg-neutral-900 p-2 rounded border border-white/5">
                    <p className="text-slate-550 uppercase text-[8px]">DRAG COEFFICIENT:</p>
                    <p className="text-white font-bold text-xs">0.24 Cd</p>
                  </div>
                  <div className="text-right bg-neutral-900 p-2 rounded border border-white/5">
                    <p className="text-slate-550 uppercase text-[8px]">LONGITUDINAL FORCE:</p>
                    <p className="text-[#00e5ff] font-bold text-xs">{gForceY} G</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selectable BMW M Performance Mode Preset switches */}
            <div className="flex gap-1.5 pt-1.5 border-t border-white/5 justify-center overflow-x-auto no-scrollbar">
              {["EFFICIENT POWER", "M1 COMPETITION", "M2 TRACK CLIMAX"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setDriveMode(mode as any);
                  }}
                  className={`px-2 py-1 rounded text-[8px] font-mono tracking-wide uppercase transition-colors shrink-0 cursor-pointer ${
                    driveMode === mode
                      ? "bg-white/10 text-white font-bold border border-white/10"
                      : "bg-white/2 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode.replace(" COMPETITION", "").replace(" TRACK CLIMAX", "").replace(" POWER", "")}
                </button>
              ))}
            </div>

          </div>

          {/* Active system telemetry HUD indicator */}
          <div className="mt-4 flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl text-[10px] font-mono text-slate-300 shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vel-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vel-blue"></span>
            </span>
            ACTIVE HYPERCAR COCKPIT STREAM
          </div>

        </motion.div>

      </div>

      {/* Downward slide micro indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-75 select-none text-center">
        <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-slate-400">Glide Downward</span>
        <div className="w-5 h-9 rounded-full border border-white/20 p-1">
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: -1, ease: "easeInOut" }}
            className="w-1.5 h-2 bg-vel-blue rounded-full mx-auto" 
          />
        </div>
      </div>

    </section>
  );
}
