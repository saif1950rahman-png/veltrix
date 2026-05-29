import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Lenis from "lenis";

// Custom components
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import InventorySection from "./components/InventorySection";
import ShowroomSection from "./components/ShowroomSection";
import WhyUsSection from "./components/WhyUsSection";
import FinancingSection from "./components/FinancingSection";
import ContactHubSection from "./components/ContactHubSection";
import Footer from "./components/Footer";
import CompareModal from "./components/CompareModal";
import Chatbot from "./components/Chatbot";

// Shared data and types
import { luxuryCars } from "./data";
import { PremiumCar, CarColor } from "./types";

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(3000000);

  // Custom Interactivity
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<PremiumCar[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  // Sound Engine Status (Acoustic Drive)
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Loading Screen Toggle
  const [isLoading, setIsLoading] = useState(true);

  // Default customizer target to the newly integrated BMW M5 Competition
  const defaultM5 = luxuryCars.find((car) => car.id === "bmw-m5-competition") || luxuryCars[0];

  // Interactive Showroom customization parameters
  const [customizerCar, setCustomizerCar] = useState<PremiumCar>(defaultM5);
  const [customizerColor, setCustomizerColor] = useState<CarColor>(defaultM5.colors[0]);
  const [customizerCarbon, setCustomizerCarbon] = useState<string>(defaultM5.carbonFiberOptions[0]);
  const [customizerWheels, setCustomizerWheels] = useState<string>("21'' Monoblock Forged Aero-Splat");
  const [showroomAngle, setShowroomAngle] = useState(0);

  // Testimonial Autoplay Carousel index
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Bespoke Financing Inputs
  const [financePrice, setFinancePrice] = useState<number>(2400000);
  const [downPayment, setDownPayment] = useState<number>(480000); // 20% default
  const [interestRate, setInterestRate] = useState<number>(2.4); // Elite Tier APR
  const [loanTerm, setLoanTerm] = useState<number>(36);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Test drive reservation metrics
  const [testDriveVehicle, setTestDriveVehicle] = useState<string>("Veltrix Apex");
  const [testDriveDate, setTestDriveDate] = useState("");
  const [testDriveLocation, setTestDriveLocation] = useState("Zurich Aviation Hangars");
  const [testDriveSuccess, setTestDriveSuccess] = useState(false);

  // Initialize buttery-smooth Lenis scroll system with active RAF loop
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious cinematic cubic ease
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync section anchors with active tab offsets
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      const sections = ["home", "inventory", "showroom", "why-us", "financing", "contact"];
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            let label = "Home";
            if (sectionId === "inventory") label = "Browse Cars";
            else if (sectionId === "showroom") label = "Showroom";
            else if (sectionId === "why-us") label = "Heritage";
            else if (sectionId === "financing") label = "Financing";
            else if (sectionId === "contact") label = "Inquire";
            setActiveTab(label);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading]);

  // Sync pricing configurations on customization modifications
  useEffect(() => {
    setFinancePrice(customizerCar.price);
    setDownPayment(Math.floor(customizerCar.price * 0.2));
  }, [customizerCar]);

  // Audio synthesis module
  const playSound = (type: "startup" | "click" | "engine" | "success" | "hover") => {
    if (!isSoundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "hover") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.006, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === "success") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else if (type === "startup" || type === "engine") {
        // High-end V12 Engine Simulation Synth
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        oscSub.type = "triangle";

        osc.connect(filter);
        oscSub.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(45, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.8);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.2);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 2.0);

        oscSub.frequency.setValueAtTime(22, ctx.currentTime);
        oscSub.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.2);
        oscSub.frequency.linearRampToValueAtTime(37, ctx.currentTime + 0.8);
        oscSub.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.2);
        oscSub.frequency.exponentialRampToValueAtTime(27, ctx.currentTime + 2.0);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.8);
        filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 1.2);
        filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 2.0);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

        osc.start();
        oscSub.start();
        osc.stop(ctx.currentTime + 2.2);
        oscSub.stop(ctx.currentTime + 2.2);
      }
    } catch (e) {
      // Audio sandbox safeguards
    }
  };

  const triggerToast = (msg: string) => {
    setInfoToast(msg);
    playSound("success");
    setTimeout(() => {
      setInfoToast(null);
    }, 3800);
  };

  const toggleWishlist = (carId: string) => {
    playSound("click");
    if (wishlist.includes(carId)) {
      setWishlist((prev) => prev.filter((id) => id !== carId));
      triggerToast("Removed from portfolio.");
    } else {
      setWishlist((prev) => [...prev, carId]);
      triggerToast("Added to portfolio.");
    }
  };

  const toggleCompare = (car: PremiumCar) => {
    playSound("click");
    if (compareList.some((c) => c.id === car.id)) {
      setCompareList((prev) => prev.filter((c) => c.id !== car.id));
      triggerToast("Removed from comparisons.");
    } else {
      if (compareList.length >= 2) {
        triggerToast("Select up to two models.");
        return;
      }
      setCompareList((prev) => [...prev, car]);
      triggerToast("Added to comparisons.");
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-x-hidden selection:bg-vel-blue/30 selection:text-vel-blue">
      
      {/* Dynamic Pop Messages Toast */}
      <AnimatePresence>
        {infoToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -30, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[999] flex items-center gap-3 bg-[#111820] border border-[#1F2A37] px-6 py-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <div className="w-5 h-5 rounded-full bg-[#1E3A8A]/20 flex items-center justify-center border border-[#1E3A8A]/40">
              <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-ping" />
            </div>
            <span className="text-xs font-mono tracking-widest text-[#E5E7EB] uppercase">{infoToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic bootstrap system loader */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Loader 
            onComplete={() => {
              setIsLoading(false);
              setTimeout(() => playSound("startup"), 100);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Main Showcase Layout (Visible once loading completes) */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative bg-[#0B0F14]"
        >
          {/* Ambient Multi-million Dollar Luxury Color Aura */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Soft Blue Ambient Glow */}
            <div className="absolute top-[10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[rgba(30,58,138,0.12)] blur-[160px] animate-pulse" style={{ animationDuration: '9s' }} />
            {/* Warm Spotlight Tint */}
            <div className="absolute top-[35%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-[rgba(194,65,12,0.08)] blur-[140px]" />
            {/* Soft Blue Ambient Glow 2 */}
            <div className="absolute top-[60%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[rgba(30,58,138,0.10)] blur-[150px]" style={{ animationDuration: '12s' }} />
            {/* Neutral Light Fog */}
            <div className="absolute top-[80%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-[rgba(255,255,255,0.04)] blur-[150px] animate-pulse" style={{ animationDuration: '14s' }} />
          </div>

          {/* Header sticky bar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            compareList={compareList}
            setIsCompareOpen={setIsCompareOpen}
            isSoundOn={isSoundOn}
            setIsSoundOn={setIsSoundOn}
            playSound={playSound}
            onRequestReplayLoader={() => setIsLoading(true)}
          />

          {/* Epic Main Sections streaming with active Framer Motion enters */}
          <HeroSection 
            playSound={playSound} 
            setActiveTab={setActiveTab} 
          />
          
          <StatsSection />
          
          <InventorySection
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            compareList={compareList}
            toggleCompare={toggleCompare}
            setCustomizerCar={setCustomizerCar}
            setCustomizerColor={setCustomizerColor}
            setCustomizerCarbon={setCustomizerCarbon}
            triggerToast={triggerToast}
            playSound={playSound}
            setActiveTab={setActiveTab}
          />

          <ShowroomSection
            customizerCar={customizerCar}
            setCustomizerCar={setCustomizerCar}
            customizerColor={customizerColor}
            setCustomizerColor={setCustomizerColor}
            customizerCarbon={customizerCarbon}
            setCustomizerCarbon={setCustomizerCarbon}
            customizerWheels={customizerWheels}
            setCustomizerWheels={setCustomizerWheels}
            showroomAngle={showroomAngle}
            setShowroomAngle={setShowroomAngle}
            triggerToast={triggerToast}
            playSound={playSound}
          />

          <WhyUsSection
            testimonialIndex={testimonialIndex}
            setTestimonialIndex={setTestimonialIndex}
            playSound={playSound}
          />

          <FinancingSection
            financePrice={financePrice}
            setFinancePrice={setFinancePrice}
            downPayment={downPayment}
            setDownPayment={setDownPayment}
            interestRate={interestRate}
            setInterestRate={setInterestRate}
            loanTerm={loanTerm}
            setLoanTerm={setLoanTerm}
            triggerToast={triggerToast}
            playSound={playSound}
          />

          <ContactHubSection
            testDriveVehicle={testDriveVehicle}
            setTestDriveVehicle={setTestDriveVehicle}
            testDriveDate={testDriveDate}
            setTestDriveDate={setTestDriveDate}
            testDriveLocation={testDriveLocation}
            setTestDriveLocation={setTestDriveLocation}
            testDriveSuccess={testDriveSuccess}
            setTestDriveSuccess={setTestDriveSuccess}
            playSound={playSound}
          />

          <Footer
            newsletterEmail={newsletterEmail}
            setNewsletterEmail={setNewsletterEmail}
            newsletterSubscribed={newsletterSubscribed}
            setNewsletterSubscribed={setNewsletterSubscribed}
            playSound={playSound}
            setActiveTab={setActiveTab}
          />

          {/* Staged comparisons dashboard Modal overlay */}
          <AnimatePresence>
            {isCompareOpen && (
              <CompareModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                compareList={compareList}
                toggleCompare={toggleCompare}
                setCompareList={setCompareList}
                playSound={playSound}
              />
            )}
          </AnimatePresence>

          {/* Intelligent advisor AI console chatbot overlay */}
          <Chatbot isSoundOn={isSoundOn} />

        </motion.div>
      )}

    </div>
  );
}
