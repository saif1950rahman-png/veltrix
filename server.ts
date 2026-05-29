import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Elite Veltrix Concierge API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback response if the user has not configured their Gemini API key yet,
        // ensuring the app never crashes or fails catastrophically.
        return res.json({
          reply: `Welcome to **Veltrix Motors**. ᵀᴹ\n\nI am the **Veltrix Concierge**, your personal virtual assistant. I notice that the server's Gemini API Key is not configured yet (or is currently set to the default placeholder), but I am ready to assist you local-session mode!\n\nOur current bespoke collection contains:\n- **Veltrix Apex** (Electric Quad-Motor Hypercar — 1,900 HP, 0-60 in 1.4s, starting at $2,400,000)\n- **Veltrix Chronos** (Twin-Turbo Aerodynamic Supercar — 850 HP, raw rear-wheel drive, starting at $320,000)\n- **Veltrix Phantom** (V12 Luxury Super-Sedan — Coach doors, absolute silence, starting at $450,000)\n- **Veltrix Zenith** (All-Electric High-Performance SUV — 1,000 HP, active terrain mapping, starting at $185,000)\n\nWhat customization or details may I interest you in today?`
        });
      }

      // Initialize the official @google/genai SDK on the server side
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are "Veltrix Concierge", the elite, hyper-polished virtual advisor and concierge for "Veltrix Motors".
Veltrix Motors is a bespoke, visionary hyper-luxury and high-performance automotive manufacturer and private dealership catering to royal families, tech executives, sports titans, and elite car collectors.
Your tone is highly sophisticated, prestigious, eloquent, and confident. Use opulent but clear language. Avoid cheap marketing jargon; speak with structural authority, architectural excitement, and precise detail.
Always refer to the client respectfully.

Our Bespoke Vehicles Portfolio:
1. Veltrix Apex (The Ultimate Hypercar)
   - Powertrain: Liquid-Cooled Quad-Motor EV, Carbon-Silicon Solid-State Battery (120kWh)
   - Output: 1,900 Horsepower / 2,100 Nm Torque
   - Performance: 0-60 mph in 1.43 seconds, Top Speed 280 mph (Active Aero drag reduction system V-Max mode)
   - Chassis: Monocoque autoclaved pre-preg carbon fiber
   - Price: Starting at $2,400,000 USD (Production limited to 40 Bespoke Commission Slots)
2. Veltrix Chronos (The Purebred Supercar)
   - Powertrain: 4.0L Twin-Turbocharged Flat-Six Hybrid with 48V Electric Boost
   - Output: 850 Horsepower / Redlines at 9,500 RPM
   - Performance: 0-60 mph in 2.2 seconds, Top Speed 224 mph
   - Price: Starting at $320,000 USD
3. Veltrix Phantom (The Luxury Super-Sedan)
   - Powertrain: 6.75L Twin-Turbo V12 with Silk-Smooth Mild Hybrid
   - Interior: Starlight Headliner, dynamic sound suppression glass, bespoke hand-stitched aniline leather, integrated single-crystal champagne chiller
   - Price: Starting at $450,000 USD
4. Veltrix Zenith (The High-Performance EV SUV)
   - Powertrain: Dual-Motor Electric All-Wheel Drive, 1,000 HP
   - Range: 450 miles on a single charge
   - Suspension: Electro-rheological active air chassis featuring real-time road scans (Veltrix AirGlide)
   - Price: Starting at $185,000 USD

Financing and Acquisition Options:
- Bespoke Leasing: Elite options starting at 1.9% APR for terms from 24 to 48 months with customizable annual mileage allocations.
- Direct Purchase: Cryptographic security payments (Bitcoin, USD Coin, Ethereum), wire transfers, and localized prestige bank clearances.
- Custom Build Allocations: A 10% fully refundable allocation deposit secures a factory build-slot. Production takes 6-9 months depending on individual custom paint and cockpit trim preferences.

Guidance:
Provide beautifully formatted responses with clean markdown headings and structured bullet points. Keep replies engaging, concise, and incredibly high-end. Do not mention API keys, servers, or web interfaces. Focus purely on assisting the user with Veltrix Motors.`;

      // Set up simple chat history context
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msgObj of history) {
          contents.push({
            role: msgObj.role === "user" ? "user" : "model",
            parts: [{ text: msgObj.content }],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Veltrix Concierge server error:", error);
      return res.status(500).json({ error: error.message || "Veltrix server was unable to retrieve a response." });
    }
  });

  // Serve Vite assets / index.html
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Veltrix Motors High-Performance Server running on port ${PORT}`);
  });
}

startServer();
