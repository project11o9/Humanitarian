import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerPortal from "./pages/VolunteerPortal";
import DonationForm from "./components/DonationForm";
import LiveChat from "./components/LiveChat";
import StorySection from "./components/StorySection";
import TrustSection from "./components/TrustSection";
import ActivityNotifications from "./components/ActivityNotifications";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, ShieldAlert, HeartHandshake, ShieldCheck, Download, 
  MessageSquare, ChevronRight, HelpCircle, Phone, Mail, MapPin, 
  Sparkles, Star, Bell, ArrowRight, Radio, ExternalLink, Landmark, Laptop, LayoutDashboard, Shield, AlertTriangle
} from "lucide-react";

// Real documentary visual aids
const HERO_IMAGES = [
  {
    url: "/images/arab-hero-relief.jpg",
    caption: "Arab volunteers supporting families in need with food and relief kits.",
    category: "Emergency Relief Support"
  },
  {
    url: "/images/arab-food-support.jpg",
    caption: "A meal can bring comfort to a hungry child.",
    category: "Food Support"
  },
  {
    url: "/images/arab-water-support.jpg",
    caption: "Clean water can protect a family’s health.",
    category: "Clean Water"
  },
  {
    url: "/images/arab-medical-aid.jpg",
    caption: "Medical help can bring urgent relief.",
    category: "Medical Aid"
  },
  {
    url: "/images/arab-shelter-support.jpg",
    caption: "Shelter support can give a family safety.",
    category: "Shelter Support"
  },
  {
    url: "/images/arab-family-relief.jpg",
    caption: "Small support can create real hope and comfort to mothers and children.",
    category: "Child & Family Relief"
  },
  {
    url: "/images/arab-volunteers-packing-aid.jpg",
    caption: "Your support is guided through verified volunteer coordinate logistics.",
    category: "Direct Logistics"
  },
  {
    url: "/images/arab-elderly-relief.jpg",
    caption: "Comforting care and heat-insulated winter blankets delivered to grandparents.",
    category: "Elderly Relief"
  },
  {
    url: "/images/arab-education-support.jpg",
    caption: "Supportive environments and learning spaces for young children facing hardship.",
    category: "Children Safe Space"
  },
  {
    url: "/images/arab-hygiene-supplies.jpg",
    caption: "Distribution of essential hygiene kits and sanitary water goods to protect families.",
    category: "Hygiene Distribution"
  }
];

// --- 1. PUBLIC LANDING PAGE SCREEN ---
function PublicHome() {
  const navigate = useNavigate();
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [selectedCause, setSelectedCause] = useState("Emergency General Relief Corridor");

  // State handlers for donation form presets
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedTierId, setSelectedTierId] = useState<string>("meals");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // States for reconnecting existing/prev volunteer chat sessions
  const [activeSessionRoomId, setActiveSessionRoomId] = useState<string | null>(null);
  const [activeSessionAmount, setActiveSessionAmount] = useState<string>("");
  const [activeSessionCause, setActiveSessionCause] = useState<string>("");
  const [dismissedSession, setDismissedSession] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const savedRoomId = localStorage.getItem("bait_active_donor_room_id");
      const savedAmount = localStorage.getItem("bait_active_donor_amount");
      const savedCause = localStorage.getItem("bait_active_donor_cause");
      if (savedRoomId) {
        setActiveSessionRoomId(savedRoomId);
        if (savedAmount) setActiveSessionAmount(savedAmount);
        if (savedCause) setActiveSessionCause(savedCause);
      }
    } catch (e) {
      console.warn("Storage check failed:", e);
    }
  }, []);

  const handleSelectCause = (causeTitle: string) => {
    setSelectedCause(causeTitle);
    const formElement = document.getElementById("donation-anchor-element");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleIntentCreated = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen flex flex-col font-sans antialiased selection:bg-[#EA580C]/25 selection:text-[#EA580C]">
      
      {/* Navbar Section */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 py-3.5 px-4 md:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 select-none">
            <div className="text-[#EA580C] shrink-0 p-1 bg-orange-50 rounded-xl border border-orange-100">
              <svg className="w-8 h-8 text-[#EA580C]" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 30C15 28 17 24 17.5 19H12.5V17H18V14H12.5V12H20C21.5 16.5 22.5 21 21.5 26.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32.5 30C30 28 28 24 27.5 19H32.5V17H27V14H32.5V12H25C23.5 16.5 22.5 21 23.5 26.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22.5" cy="22.5" r="2.5" fill="currentColor"/>
                <path d="M22.5 5V38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="font-sans font-black text-sm tracking-tight block text-[#0F172A] uppercase leading-none">
                Bait Al-Rahma Trust
              </span>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest block font-black font-sans mt-1">
                بيت الرحمة ٹرسٹ • Humanitarian Aid Bureau
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wide">
            {activeSessionRoomId && (
              <button
                onClick={() => navigate(`/chat/${activeSessionRoomId}`)}
                className="hidden sm:flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] px-3.5 py-2 rounded-xl transition cursor-pointer"
                title="Return to your ongoing live coordination room"
              >
                <MessageSquare className="w-4 h-4 animate-pulse text-[#EA580C]" />
                <span className="font-sans font-black text-[10.5px]">Resume Chat</span>
              </button>
            )}
            <Link
              to="/volunteer-login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-205 py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Laptop className="w-4 h-4 text-slate-600" />
              <span>Volunteer Portal</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* PERSISTENT RUNTIME SESSION RECOVERY BANNER */}
      {activeSessionRoomId && !dismissedSession && (
        <div className="bg-[#FFF7ED] border-b border-orange-100 px-4 py-3 text-slate-900 font-sans shadow-xs transition duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EA580C]"></span>
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Found an active coordination session for program <span className="text-slate-950 font-black uppercase">"{activeSessionCause || "Emergency General Relief कॉरिडोर"}"</span> amounting to <span className="text-[#EA580C] font-black">₹{Number(activeSessionAmount).toLocaleString()}</span>. Feel free to resume your secure chat.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setDismissedSession(true)}
                className="text-[10px] text-slate-400 hover:text-slate-700 font-black uppercase px-2 py-1 transition cursor-pointer"
                title="Dismiss recovery prompt for this session"
              >
                Dismiss
              </button>
              <button
                onClick={() => navigate(`/chat/${activeSessionRoomId}`)}
                className="bg-[#EA580C] hover:bg-[#c2410c] text-white text-[10.5px] font-black uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
              >
                <span>Live Chat Support →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Sliders Header */}
      <header className="relative w-full h-[390px] sm:h-[450px] md:h-[500px] lg:h-[520px] bg-slate-950 overflow-hidden text-white flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentHeroImage ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full min-w-full min-h-full object-cover object-center select-none pointer-events-none brightness-[0.45] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-6 z-20 hidden md:flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.8 rounded-xl border border-white/10 text-[10.5px] text-stone-200">
                <span className="font-extrabold uppercase text-[#EA580C] text-[9.5px] tracking-wider bg-orange-950/50 px-2 py-0.5 rounded border border-orange-900/30">
                  {img.category}
                </span>
                <span>{img.caption}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sliders Dot Navigation */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroImage(idx)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                idx === currentHeroImage ? "bg-[#EA580C] w-6" : "bg-white/40 w-2 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent z-10 pointer-events-none" />

        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-800/40">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[9.5px] text-emerald-400 font-extrabold tracking-wider font-mono">
              🟢 VOLUNTEER COORDINATORS STANDBY
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative max-w-5xl mx-auto w-full px-6 pb-10 z-20 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#EA580C]/25 border border-[#F97316]/40 text-[#F97316] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider block font-sans">
              Urgent Relief Inflow Desk
            </span>
            <span className="text-stone-300 font-medium tracking-wide select-none text-xs sm:text-sm font-serif italic" dir="rtl">
              «يريد الله بكم اليُسر ولا يريد بكم العُسر»
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none uppercase max-w-3xl font-sans">
              Support Families in Need
            </h1>
            <p className="text-xs sm:text-sm text-stone-200/90 max-w-2xl leading-relaxed font-sans font-medium">
              Your contribution can help provide food, clean water, medical aid, and shelter to families facing hardship.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <a
              href="#donation-anchor-element"
              className="bg-[#EA580C] hover:bg-[#c2410c] text-white px-7 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2.5 cursor-pointer select-none"
            >
              <HeartHandshake className="w-4.5 h-4.5 text-orange-200" />
              <span>Start Donation Support</span>
            </a>
            
            <a
              href="#stories"
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-black text-xs uppercase tracking-wider text-center transition flex justify-center items-center gap-1.5"
            >
              <span>Audit stories grid</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Primary Layout Section */}
      <main className="flex-1 py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* DUAL COLUMN SYSTEM: DONATE FORM anchor */}
          <div id="donation-anchor-element" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              <div>
                <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">humanitarian solidarity desk</span>
                <h2 className="text-2xl font-black text-slate-900 uppercase mt-1">Manual giving registry</h2>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-1">
                  Choose your contribution level on the right. Once you click <strong>"Start donation"</strong>, a dedicated secure Firestore live support room will be initiated instantly linking with BARI volunteer advisors.
                </p>
              </div>

              {/* Verified Ledger display stats */}
              <div className="bg-white border border-slate-205 p-5 rounded-3xl space-y-3 shadow-3xs">
                <span className="text-[10.5px] text-[#EA580C] font-black uppercase tracking-widest block">Statutory Non-Profit Metrics</span>
                <div className="grid grid-cols-2 gap-3 text-center font-sans">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-lg font-black text-slate-900 block">100%</span>
                    <span className="text-[9.5px] text-neutral-400 block font-bold uppercase mt-1">Direct Aid Allocation</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-lg font-black text-slate-900 block">Sec 80G</span>
                    <span className="text-[9.5px] text-neutral-400 block font-bold uppercase mt-1">Indian Tax Exemption</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-center gap-1.5 text-[10px] text-green-700 font-sans font-bold">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Verified 401(c) & FCRA Registered Ground Partner</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-start">
              <DonationForm 
                onIntentCreated={handleIntentCreated}
                frequency={frequency}
                selectedTierId={selectedTierId}
                setSelectedTierId={setSelectedTierId}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
                isCustomMode={isCustomMode}
                setIsCustomMode={setIsCustomMode}
                selectedCause={selectedCause}
              />
            </div>
          </div>

          {/* Core Programs Grid - Pick program to populate donation form */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block font-sans">Active ground programs</span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Direct Aid Restricted Channels</h2>
              <p className="text-xs text-neutral-500 font-sans">Click on any core relief corridor below to automatically restriction-allocation-select inside our coordinator intent form above.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Emergency General Relief Corridor",
                  descr: "Delivering basic foods, medicines, surgical supplies, and thermal blankets directly to camp families.",
                  bg: "🍲"
                },
                {
                  title: "Safe Drinking Water Purification",
                  descr: "Erecting large chlorinated purification water tanks and distributing filtration kits under camp facilities.",
                  bg: "💧"
                },
                {
                  title: "Winter Shelter and Beddings",
                  descr: "Distributing thick double-layer weather-proof canvas camps, wool blankets, and sleeping mattresses.",
                  bg: "⛺"
                },
                {
                  title: "Wound Clinics & Burn Trauma Kits",
                  descr: "Powering local mobile triage units and volunteer doctors on ground with surgical fluids and bandages.",
                  bg: "🩺"
                }
              ].map((program, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectCause(program.title)}
                  className={`bg-white border rounded-3xl p-5 space-y-3 hover:shadow-md cursor-pointer transition flex flex-col justify-between ${
                    selectedCause === program.title ? "border-2 border-[#EA580C] ring-1 ring-orange-100" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-2xl block">{program.bg}</span>
                    <h3 className="text-xs font-black text-slate-900 leading-tight block uppercase">{program.title}</h3>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{program.descr}</p>
                  </div>
                  <span className="text-[9.5px] text-[#EA580C] font-black uppercase tracking-wider block mt-1.5 hover:underline">Select program ➜</span>
                </div>
              ))}
            </div>
          </section>

          {/* Stories list */}
          <section id="stories" className="scroll-mt-20">
            <StorySection onOpenChat={handleSelectCause} />
          </section>

          {/* Transparency values */}
          <section id="transparency" className="scroll-mt-20">
            <TrustSection />
          </section>

        </div>
      </main>

      {/* Live notifications */}
      <ActivityNotifications />

      {/* Rebuilt clean footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-8 px-6 text-neutral-500 text-[11px] mt-12 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-sans font-medium">
          <div>
            &copy; 1999-2026 Bait Al-Rahma Initiative (BARI). Handled under strict statutory board registries.
          </div>
          <div className="flex flex-wrap gap-4 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
            <span className="text-[#EA580C]">• Verified Exemption Ledger</span>
            <span>Reg. IN-NGO/1120042</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- 2. DEDICATED DONOR CHAT ROOM WRAPPER PAGE ---
function DonorChatPage() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Brand Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 py-3 px-4 shadow-3xs shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 select-none">
            <div className="text-[#EA580C] shrink-0 p-1 bg-orange-50 rounded-lg border border-orange-100">
              <svg className="w-7 h-7 text-[#EA580C]" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 30C15 28 17 24 17.5 19H12.5V17H18V14H12.5V12H20C21.5 16.5 22.5 21 21.5 26.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32.5 30C30 28 28 24 27.5 19H32.5V17H27V14H32.5V12H25C23.5 16.5 22.5 21 23.5 26.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22.5" cy="22.5" r="2.5" fill="currentColor"/>
                <path d="M22.5 5V38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="font-sans font-black text-xs tracking-tight block text-[#0F172A] uppercase leading-none">
                Bait Al-Rahma Trust
              </span>
              <span className="text-[8.5px] text-neutral-400 font-extrabold uppercase tracking-wide block mt-0.5">Verified Donor Line</span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-[10px] text-neutral-500 font-black uppercase tracking-wide px-3.5 py-2 hover:text-[#0F172A] border border-slate-205 rounded-xl transition cursor-pointer bg-slate-50"
          >
            ← Return Home
          </Link>
        </div>
      </nav>

      {/* Chat workspace frame */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 flex flex-col justify-center">
        {roomId ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Calm volunteer assistance sidebar card */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img 
                    src="/images/arab-support-chat.jpg" 
                    alt="Calm volunteer support and helping hands" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                    <span className="text-white text-[10px] font-mono tracking-wider uppercase font-semibold">
                      Security Level: SSL/TLS Direct
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[#EA580C] text-[10px] font-black uppercase tracking-wider block font-sans">
                    Guaranteed Ground Verification
                  </span>
                  <h4 className="text-base font-black text-slate-800 leading-tight">
                    Calm Volunteer Assistance
                  </h4>
                  <p className="text-[11px] leading-relaxed text-neutral-500 font-sans">
                    You are connected to our verified, on-the-ground volunteer desk. All transactions are logged securely and verified live to ensure rapid deployment.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Verified Escrow & Remittance Desk</span>
                </div>
                <div className="text-[9.5px] text-neutral-400 leading-relaxed font-mono">
                  All chats are logged securely inside Firestore and compliant with statutory councils.
                </div>
              </div>
            </div>

            {/* Right Column: Live Chat Panel */}
            <div className="lg:col-span-8 flex flex-col">
              <LiveChat roomId={roomId} />
            </div>

          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-lg text-neutral-400 font-sans text-xs">
            No active room reference has been specified.
          </div>
        )}
      </div>

    </div>
  );
}

// --- 3. MAIN ROUTER SYSTEM ROOT ---
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/donate" element={<PublicHome />} />
          <Route path="/chat/:roomId" element={<DonorChatPage />} />
          <Route path="/volunteer-login" element={<VolunteerLogin />} />
          
          {/* Protected Volunteer back office routes */}
          <Route element={<ProtectedRoute allowedRoles={["volunteer", "finance", "admin", "super_admin"]} />}>
            <Route path="/volunteer" element={<VolunteerPortal />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
