import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Shield, User, Bot, Volume2, VolumeX } from "lucide-react";
import { ChatMessage } from "../types";

export default function Chatbot({ isSoundOn }: { isSoundOn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "Welcome, esteemed guest. I am your **Veltrix Concierge**. I am fully authorized to guide your custom commissioning, discuss our hybrid V12 powerplants, and arrange carbon-weave allocations. \n\nHow may I elevate your journey today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const playSound = (type: "send" | "receive" | "click") => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "send") {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === "receive") {
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      // Ignore audio context blocks
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    playSound("send");
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Create simple history from the last 6 messages
      const historyForApi = messages
        .filter((m) => m.id !== "init")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyForApi,
        }),
      });

      const data = await res.json();
      playSound("receive");

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.reply || "I apologize, our secure satellite uplink is experiencing latency near Monaco. Please repeat your query, sir.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot API Call fail:", err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: "Our deep-space global network is operating under high bandwidth security. Let me detail our classic lineup:\n\n- **Veltrix Apex** (Electric Hypercar, starting at $2,400,000)\n- **Veltrix Phantom** (Sovereign V12 Sedan, $450,000)\n\nWhat customization options can I load for you locally, sir?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggested = (query: string) => {
    playSound("click");
    handleSendMessage(query);
  };

  return (
    <>
      {/* Absolute Trigger button bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            playSound("click");
            setIsOpen(!isOpen);
          }}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-gold to-vel-blue rounded-full text-white shadow-[0_0_20px_rgba(11,111,255,0.4)] hover:shadow-[0_0_35px_rgba(223,180,108,0.5)] transition-all duration-300 group focus:outline-none"
        >
          {isOpen ? (
            <X className="w-6 h-6 transform rotate-90 transition-transform duration-300" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 flex h-3.9 w-3.9">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vel-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-vel-blue"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Futuristic Floating Chat Terminal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[92vw] sm:w-[420px] h-[580px] rounded-2.5xl glass-panel-neon shadow-[0_0_40px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Elite Top Header bar */}
          <div className="p-4 bg-black/60 border-b border-vel-blue/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vel-dark to-slate-900 border border-vel-blue flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-vel-blue animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display tracking-widest text-lg text-white">VELTRIX CONCIERGE</h3>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[10px] text-vel-blue/80 uppercase tracking-widest font-mono">Bespoke Advisory AI</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                playSound("click");
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Secure System Level Indicator Banner */}
          <div className="bg-vel-blue/10 border-b border-vel-blue/10 px-4 py-1.5 flex items-center justify-between text-[9px] text-vel-blue uppercase tracking-widest font-mono">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-vel-blue" /> Satellite Uplink Secured
            </span>
            <span>V2.6 Active</span>
          </div>

          {/* Messages Streams Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-gradient-to-b from-black/80 to-vel-dark/90">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isAssistant 
                      ? "bg-slate-955 border-vel-blue/30 text-vel-blue" 
                      : "bg-gold/10 border-gold/30 text-gold"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className="flex flex-col gap-1">
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isAssistant 
                        ? "bg-white/5 border border-white/5 text-slate-100 rounded-tl-none font-sans" 
                        : "bg-gradient-to-tr from-gold/15 to-vel-dark border border-gold/30 text-white rounded-tr-none font-sans"
                    }`}>
                      {/* Robust styling render for helper text headings, lists */}
                      <p className="whitespace-pre-line">
                        {message.content.split("\n").map((line, i) => {
                          if (line.startsWith("- **")) {
                            const trimmed = line.replace("- **", "").trim();
                            const [boldPart, rest] = trimmed.split("**");
                            return (
                              <span key={i} className="block pl-3 text-slate-200 mt-1">
                                • <strong className="text-vel-blue">{boldPart}</strong>{rest}
                              </span>
                            );
                          }
                          if (line.includes("**")) {
                            // Split line dynamically for bold blocks
                            const parts = line.split("**");
                            return (
                              <span key={i} className="block mt-1">
                                {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong className="text-vel-blue" key={pIdx}>{p}</strong> : p)}
                              </span>
                            );
                          }
                          return <span key={i} className="block mt-1">{line}</span>;
                        })}
                      </p>
                    </div>
                    <span className={`text-[9px] text-slate-400 font-mono ${isAssistant ? "text-left" : "text-right"}`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-vel-blue/30 text-vel-blue flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="text-slate-400 text-xs tracking-wider uppercase font-mono">Analyzing Telemetry</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-vel-blue rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-vel-blue rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 bg-vel-blue rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Bespoke Suggested Prompts Option (if not loading) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-black/60 border-t border-white/5 space-y-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Prestige Actions:</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <button
                  onClick={() => selectSuggested("Can I finance via crypto and what is the rate?")}
                  className="shrink-0 text-[10px] bg-vel-blue/10 border border-vel-blue/30 text-vel-blue px-2.5 py-1 rounded-full hover:bg-vel-blue/30 transition-all duration-200"
                >
                  ₿ Crypto Financing
                </button>
                <button
                  onClick={() => selectSuggested("Compare Veltrix Apex vs Lamborghini Revuelto")}
                  className="shrink-0 text-[10px] bg-gold/10 border border-gold/30 text-gold px-2.5 py-1 rounded-full hover:bg-gold/30 transition-all duration-200"
                >
                  ⚡ Hypercar Comparison
                </button>
                <button
                  onClick={() => selectSuggested("How do I request a custom carbon-weave color slots for Apex SUV?")}
                  className="shrink-0 text-[10px] bg-white/5 border border-white/10 text-white px-2.5 py-1 rounded-full hover:bg-white/15 transition-all duration-200"
                >
                  🎨 Custom Commission
                </button>
              </div>
            </div>
          )}

          {/* Input text form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-black/80 border-t border-white/5 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Transmit confidential inquiry..."
              disabled={isLoading}
              className="flex-1 bg-white/5 hover:bg-white/8 border border-white/15 focus:border-vel-blue/80 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-450 font-sans transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold to-vel-blue flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer focus:outline-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
