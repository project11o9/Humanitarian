import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Heart, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Flame, Check, HelpCircle
} from "lucide-react";

// 10 high-quality images representing aid packages, clean water, medical care and people helping Arab families
const BACKGROUND_IMAGES = [
  "/images/arab-volunteers-packing-aid.jpg",
  "/images/arab-hero-relief.jpg",
  "/images/arab-elderly-relief.jpg",
  "/images/arab-family-relief.jpg",
  "/images/arab-education-support.jpg",
  "/images/arab-hygiene-supplies.jpg",
  "/images/arab-food-support.jpg",
  "/images/arab-water-support.jpg",
  "/images/arab-medical-aid.jpg",
  "/images/arab-shelter-support.jpg"
];

// Rich, high-end descriptive captions to highlight our on-ground efforts and make images feel extremely alive
const IMAGE_CAPTIONS = [
  { title: "EMERGENCY SUPPLY LOGISTICS", desc: "Bait Al-Rahma volunteers packing and cataloging urgent food relief packages." },
  { title: "ACTIVE GROUND ASSISTANCE HEROES", desc: "Vibrant coordination of medical gear, daily hot meals, and secure distribution." },
  { title: "ELDERLY REASSURANCE & MEDICINE", desc: "Ensuring life-saving medical attention and warm blankets reach honorable elders." },
  { title: "FAMILY SHELTER & SECURITY", desc: "Building durable winterized shelters and robust safe spaces for Arab children." },
  { title: "EDUCATIONAL EMPOWERMENT & SUPPORTS", desc: "Providing clean stationery kits, desks, and schools to secure tomorrow." },
  { title: "RELIABLE CLEAN HYGIENE CHANNELS", desc: "Delivering sterile supplies, purification shields, and baby kits in target communities." },
  { title: "COMMUNITY NOURISHMENT PROJECTS", desc: "Prepped nutrition meals prepared for distribution to thousands of affected families." },
  { title: "CLEAN DRINKING WATER DEPLOYMENT", desc: "Deploying high-volume tankers and filters to deliver sweet water in dry fields." },
  { title: "INTENSIVE PEDIATRIC MEDICAL CARE", desc: "Facilitating intensive medical checkups, pediatric aids, and ambulance operations." },
  { title: "SAFE RECOVERY & SHELTERS", desc: "Reconstructing housing nodes and restoring sanitary community corridors." }
];

export default function VolunteerLogin() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Slideshow state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [progressVal, setProgressVal] = useState(0);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smooth progress bar and transition system
  useEffect(() => {
    // Reset progress when image changes
    setProgressVal(0);
    const intervalTime = 4000;
    const stepTime = 100;
    const stepValue = (stepTime / intervalTime) * 100;

    const progressTimer = setInterval(() => {
      setProgressVal((prev) => {
        if (prev >= 100) {
          setActiveImageIndex((prevIdx) => (prevIdx + 1) % BACKGROUND_IMAGES.length);
          return 0;
        }
        return prev + stepValue;
      });
    }, stepTime);

    return () => clearInterval(progressTimer);
  }, [activeImageIndex]);

  // Securely redirect to volunteer workspace if authenticated and active
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role !== "donor" && profile.status === "active") {
        navigate("/volunteer");
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      try {
        // 1. Try logging in with the credentials
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const firebaseUser = userCredential.user;

        // Fetch or auto-create Firestore user profile context
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          const assignedRole = trimmedEmail.includes("finance") ? "finance" : "volunteer";
          const autoProfile = {
            uid: firebaseUser.uid,
            name: trimmedEmail.split("@")[0].toUpperCase() + " COORDINATOR",
            email: trimmedEmail,
            role: assignedRole,
            status: "active",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          await setDoc(profileRef, autoProfile);
        }

        setSuccessMsg("Success! Secure credentials matched.");
        setTimeout(() => {
          navigate("/volunteer");
        }, 800);

      } catch (authError: any) {
        // 2. If user does not exist, AUTO-CREATE their login inside Firebase Auth on the fly!
        if (
          authError.code === "auth/user-not-found" || 
          authError.code === "auth/invalid-credential" ||
          authError.code === "auth/wrong-password" ||
          authError.code === "auth/invalid-email" ||
          authError.code === "auth/user-disabled"
        ) {
          // Attempt on-the-fly registration to make manual set up unnecessary
          try {
            setSuccessMsg("Setting up your secure volunteer credentials in Firebase...");
            const registerCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            const newUser = registerCredential.user;

            const assignedRole = trimmedEmail.includes("finance") ? "finance" : "volunteer";
            const autoProfile = {
              uid: newUser.uid,
              name: trimmedEmail.split("@")[0].toUpperCase() + " COORDINATOR",
              email: trimmedEmail,
              role: assignedRole,
              status: "active",
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", newUser.uid), autoProfile);
            setSuccessMsg(`Welcome aboard! Account automatically created as ${assignedRole.toUpperCase()}.`);
            
            setTimeout(() => {
              navigate("/volunteer");
            }, 800);

          } catch (createError: any) {
            console.error("Auto registration failed: ", createError);
            setErrorMsg("Incorrect credentials. Could not self-register, check your password length.");
          }
        } else {
          throw authError; // propagate other errors (like network error)
        }
      }

    } catch (err: any) {
      console.error("Login failure: ", err);
      let friendlyError = "Authentication failed. Please verify credentials.";
      if (err.code === "auth/invalid-email") {
        friendlyError = "The format of the email coordinates is incorrect.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "The credentials code should be at least 6 characters in length.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="volunteer_login_fluid_viewport" 
      className="min-h-screen w-full relative flex flex-col lg:flex-row items-stretch justify-stretch bg-[#020617] font-sans overflow-hidden"
    >
      
      {/* LEFT PANE: GORGEOUS, ULTRA-VIBRANT FULL-BLEED INTERACTIVE RELIEF GALLERY (Visible on large viewports, custom backdrop overlay) */}
      <div className="hidden lg:flex lg:col-span-1 lg:w-[60%] shrink-0 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden border-r border-slate-900">
        
        {/* Slideshow background layers */}
        <div className="absolute inset-0 z-0">
          {BACKGROUND_IMAGES.map((url, index) => (
            <img
              key={url}
              src={url}
              alt="Bait Al-Rahma Vibrant Showcase"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1200ms] ease-in-out ${
                index === activeImageIndex 
                  ? "opacity-[0.80] scale-100 filter saturate-125 contrast-[1.10] brightness-90 animate-pulse-slow" 
                  : "opacity-0 scale-105 pointer-events-none"
              }`}
            />
          ))}
          {/* Ambient overlays - elegant warm shadow to keep text safe and colors bursting */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/80" />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-color" />
        </div>

        {/* Brand Header overlay */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 fill-current text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-white tracking-widest block uppercase">BAIT AL-RAHMA</span>
              <span className="text-[9px] text-[#F97316] font-extrabold uppercase block tracking-wider">Ground Operations Desk</span>
            </div>
          </div>
          
          <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
            Vibrant Live Feeds
          </span>
        </div>

        {/* Center Spotlight Banner */}
        <div className="relative z-10 my-auto max-w-xl space-y-4">
          <span className="text-[10px] bg-orange-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest inline-block">
            FEATURED GROUND MISSION
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
            {IMAGE_CAPTIONS[activeImageIndex].title}
          </h1>
          <p className="text-sm text-slate-250 leading-relaxed font-medium">
            {IMAGE_CAPTIONS[activeImageIndex].desc}
          </p>

          {/* Interactive Slide dots indicator with visual progress bar */}
          <div className="pt-4 space-y-2">
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-100 ease-linear rounded-full" 
                style={{ width: `${progressVal}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold">MISSION IN FOCUS: {activeImageIndex + 1} OF 10</span>
              <span className="text-orange-400">SECURE DISPATCH ACTIVE</span>
            </div>
            <div className="flex gap-1.5 pt-1.5">
              {BACKGROUND_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeImageIndex ? "w-10 bg-orange-500" : "w-2.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`View mission image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 text-[11px] text-slate-400 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <span>Coordinating distribution across 14 emergency relief zones.</span>
          <span className="font-mono text-orange-400">STATUS: ON-SITE DEPLOYMENT</span>
        </div>

      </div>

      {/* RIGHT PANE: SECURE VOLUNTEER AUTH WORKSPACE PANEL (Centered form, glassmorphism setup) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-14 relative z-10 bg-slate-950">
        
        {/* Absolute Background image overlay for Mobile/Tablet viewports where left pane is hidden */}
        <div className="absolute inset-0 lg:hidden z-0">
          {BACKGROUND_IMAGES.map((url, index) => (
            <img
              key={url}
              src={url}
              alt="Mobile Background"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
                index === activeImageIndex ? "opacity-[0.38] scale-100 filter brightness-[0.70] saturate-125" : "opacity-0 pointer-events-none"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/85 to-[#020617]/95" />
        </div>

        {/* Central interactive Card */}
        <div className="w-full max-w-sm relative z-10 space-y-6">
          
          {/* Logo return link */}
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-[10px] uppercase font-black tracking-widest text-[#94A3B8] hover:text-white transition bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm shadow-black"
            >
              ← Return to Donor Portal
            </button>
          </div>

          {/* Secure Login block */}
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border-4 border-slate-900/60 flex flex-col justify-center space-y-6 leading-normal relative overflow-hidden">
            
            {/* Top orange corner accent decoration to make it visually popping */}
            <div className="absolute top-0 right-0 h-2 w-24 bg-gradient-to-l from-orange-500 to-amber-400" />

            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border-2 border-orange-100 shadow-inner">
                <Heart className="w-6 h-6 fill-current text-orange-600 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center justify-center gap-1.5">
                  <span>Volunteer Portal</span>
                  <Sparkles className="w-4.5 h-4.5 text-orange-500 animate-bounce" />
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-[260px] mx-auto mt-0.5">
                  Enter your assigned credentials. Accounts are securely matched and synced on-the-fly.
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Status alerts */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold rounded-xl flex items-start gap-2.5 shadow-3xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-xl flex items-start gap-2.5 shadow-3xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[9.5px] font-black uppercase text-slate-500 tracking-wider">
                  Operational Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="volunteer@bait-alrahma.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm border border-slate-200 outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] rounded-2xl bg-slate-50 text-slate-800 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[9.5px] font-black uppercase text-slate-500 tracking-wider">
                  Secret Entry Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm border border-slate-200 outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] rounded-2xl bg-slate-50 text-slate-800 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Quick Login Hint Helper */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[10px] text-slate-500 space-y-1">
                <span className="font-extrabold uppercase text-[8px] text-slate-400 block tracking-wider">🌟 IN-BROWSER QUICK DISPATCH</span>
                <p>Emails containing <span className="font-bold text-orange-600">"finance"</span> setup financial clearance. Others auto-configure as active logistics <span className="font-bold text-slate-600">volunteers</span>.</p>
              </div>

              {/* Submission Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#EA580C] hover:bg-[#c2410c] disabled:bg-neutral-350 text-white transition font-black uppercase tracking-widest text-[11px] cursor-pointer shadow-md select-none mt-4 outline-none hover:translate-y-[-1px] active:translate-y-[1px] transform-gpu"
              >
                <span>{isSubmitting ? "Linking Firebase..." : "Sign In & Connect Portal"}</span>
                <ArrowRight className="w-4 h-4 text-orange-200" />
              </button>

            </form>

            {/* Trust badge with security check mark */}
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-widest text-center border-t border-slate-100 pt-4.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>SECURE FIRESTORE CONTEXT LINKED</span>
            </div>

          </div>

          {/* Quick FAQ info panel at the bottom */}
          <div className="text-center text-[11px] text-slate-400 bg-[#0F172A]/80 backdrop-blur border border-slate-800 p-4 rounded-2xl">
            <p className="font-bold text-[#E2E8F0]">Are you a donor instead?</p>
            <p className="mt-1">Return to main page and start a support conversation directly with no sign up needed.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
