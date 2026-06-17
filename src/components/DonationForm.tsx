import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Shield, AlertCircle, ArrowRight, ArrowLeft, Check, 
  HelpCircle, Sparkles, Landmark, ChevronDown 
} from "lucide-react";
import { createDonationIntentAndRoom } from "../services/chatService";

export interface DonationTier {
  id: string;
  amount: number;
  impactLabel: string;
  description: string;
  fullImpactText: string;
  icon: string;
}

export const DONATION_TIERS: DonationTier[] = [
  {
    id: "meals",
    amount: 150,
    impactLabel: "Emergency Daily Meals",
    description: "Provide hot daily nutrient meals to child survivors and displaced families.",
    fullImpactText: "Provide high-energy hot meals for people facing severe food crisis.",
    icon: "🍲"
  },
  {
    id: "water",
    amount: 500,
    impactLabel: "Clean Drinking Water",
    description: "Provide sweet drinkable water transport tank shipments.",
    fullImpactText: "Provides raw drinkable clean water directly to camps.",
    icon: "💧"
  },
  {
    id: "shelter",
    amount: 1500,
    impactLabel: "Essential Family shelter",
    description: "Supply thick winter insulation bedding, solar lights, and solid canvas tarps.",
    fullImpactText: "Equips a vulnerable family with immediate weather-proof field shelters.",
    icon: "⛺"
  },
  {
    id: "medical",
    amount: 3000,
    impactLabel: "Trauma Emergency Kits",
    description: "Equip local volunteer medical clinics on the ground with surgical and burn kits.",
    fullImpactText: "Provides field hospitals with essential surgical supplies to treat injured civilians.",
    icon: "🩺"
  }
];

interface DonationFormProps {
  onIntentCreated?: (roomId: string) => void;
  frequency: "one-time" | "monthly";
  selectedTierId: string;
  setSelectedTierId: (id: string) => void;
  customAmount: string;
  setCustomAmount: (val: string) => void;
  isCustomMode: boolean;
  setIsCustomMode: (mode: boolean) => void;
  selectedCause?: string;
}

export default function DonationForm({ 
  onIntentCreated, 
  frequency,
  selectedTierId,
  setSelectedTierId,
  customAmount,
  setCustomAmount,
  isCustomMode,
  setIsCustomMode,
  selectedCause = "Emergency Relief Corridor"
}: DonationFormProps) {
  const [step, setStep] = useState<number>(1);
  const [country, setCountry] = useState<string>("India");
  
  // Donor Fields
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [donorMessage, setDonorMessage] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [consentCheck, setConsentCheck] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const getDonationAmount = (): number => {
    if (isCustomMode) {
      return Number(customAmount) || 0;
    }
    const tier = DONATION_TIERS.find(t => t.id === selectedTierId);
    return tier ? tier.amount : 0;
  };

  const getImpactDescription = (amount: number): string => {
    if (amount <= 0) return "Please choose an amount to start helping.";
    if (amount < 150) {
      return `Will support hot dry ration packs for families in ground coordinate corridors.`;
    }
    if (amount >= 150 && amount < 500) {
      return `Provides fresh daily warm meals for 3 children facing immediate starvation risk.`;
    }
    if (amount >= 500 && amount < 1500) {
      // Clean drinking water
      return `Delivers clean chlorinated potable sweet water supplies to field communities.`;
    }
    if (amount >= 1500 && amount < 3000) {
      // Shelter
      return `Provides full family winter camps, heavy protective tarps, mattresses, and blankets.`;
    }
    return `Funds emergency surgical trauma kits, surgical tools, dressings, and medical fluids.`;
  };

  const handleSelectTier = (id: string) => {
    setSelectedTierId(id);
    setIsCustomMode(false);
    setErrorText("");
  };

  const handleCustomMode = () => {
    setIsCustomMode(true);
    setSelectedTierId("");
    setErrorText("");
  };

  const validateStep1 = () => {
    const amt = getDonationAmount();
    if (amt < 50) {
      setErrorText("The minimum support value is ₹50.");
      return;
    }
    setErrorText("");
    setStep(2);
  };

  const handleSubmitIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!anonymous && !donorName.trim()) {
      setErrorText("Please specify donor name or toggle Anonymous supporter.");
      return;
    }

    if (!donorPhone.trim()) {
      setErrorText("A valid phone number is required to coordinate the handoff process.");
      return;
    }

    if (!consentCheck) {
      setErrorText("You must accept the verification consent to protect civilian giving.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const parsedAmount = getDonationAmount();
      const generatedRoomId = await createDonationIntentAndRoom({
        // Use a generated or dummy UID since we don't force strict donors to sign up initially
        donorUid: "donor-" + Math.floor(100000 + Math.random() * 900000),
        donorName: anonymous ? "Anonymous Supporter" : donorName.trim(),
        phone: donorPhone.trim(),
        email: donorEmail.trim(),
        country,
        cause: selectedCause,
        amount: parsedAmount,
        anonymous,
        message: donorMessage.trim()
      });

      // Persist active donation room coordinates locally in case browser drops or tab closes
      try {
        localStorage.setItem("bait_active_donor_room_id", generatedRoomId);
        localStorage.setItem("bait_active_donor_amount", String(parsedAmount));
        localStorage.setItem("bait_active_donor_cause", selectedCause);
      } catch (locErr) {
        console.warn("Storage write blocked:", locErr);
      }

      if (onIntentCreated) {
        onIntentCreated(generatedRoomId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Unable to register support intent. Check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="donation-tool-card">
      
      {/* Upper step tag */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <span className="text-xs font-black text-[#EA580C] tracking-widest uppercase font-sans">
          Step {step} of 2: {step === 1 ? "Choose support amount" : "Your Registry Details"}
        </span>
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-6 bg-[#EA580C]" : "w-1.5 bg-slate-200"}`} 
            />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: QUANTITY SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[10px] text-[#EA580C] font-black uppercase tracking-widest block">Selected Cause</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1 capitalize">
                  {selectedCause}
                </h3>
              </div>

              {/* Country & Currency details block */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="relative">
                  <label className="text-[9.5px] font-black text-neutral-500 uppercase tracking-wider block mb-1">
                    Your location country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold outline-none appearance-none cursor-pointer focus:border-[#EA580C]"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States (USD)</option>
                      <option value="United Kingdom">United Kingdom (GBP)</option>
                      <option value="Canada">Canada (CAD)</option>
                      <option value="United Arab Emirates">UAE (AED)</option>
                      <option value="Saudi Arabia">Saudi Arabia (SAR)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[9.5px] font-black text-neutral-500 uppercase tracking-wider block mb-1">
                    Remittance Unit
                  </label>
                  <div className="w-full bg-[#EA580C]/5 border border-[#EA580C]/20 text-[#EA580C] px-3.5 py-2.5 text-xs rounded-xl font-black text-center">
                    ₹ INR (Indian Rupee)
                  </div>
                </div>
              </div>

              {/* Donation Tiers Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block font-sans">
                  Sponsorship Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DONATION_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleSelectTier(tier.id)}
                      className={`p-4 rounded-2xl border text-left flex justify-between items-center transition relative overflow-hidden cursor-pointer ${
                        selectedTierId === tier.id && !isCustomMode
                          ? "border-[#EA580C] bg-orange-50/20 shadow-xs font-semibold ring-1 ring-[#EA580C]"
                          : "border-slate-200 hover:bg-slate-50/50 bg-white"
                      }`}
                    >
                      <div>
                        <div className="text-[9.5px] text-[#EA580C] font-black uppercase tracking-wider">{tier.impactLabel}</div>
                        <div className="text-lg font-black text-slate-900 mt-1 font-sans">₹{tier.amount.toLocaleString()}</div>
                      </div>
                      <span className="text-xl">{tier.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <button
                type="button"
                onClick={handleCustomMode}
                className={`w-full p-4 rounded-2xl border text-right font-sans flex items-center justify-between transition cursor-pointer ${
                  isCustomMode
                    ? "border-[#EA580C] bg-orange-50/10 ring-1 ring-[#EA580C]"
                    : "border-slate-200 hover:bg-slate-50/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-[#0F172A] text-xs font-black uppercase tracking-wide block">Custom Amount Input</span>
                  <span className="text-[9px] text-[#EA580C] font-black uppercase block bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">Min. ₹50</span>
                </div>
                {isCustomMode ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="font-extrabold text-[#EA580C] text-sm">₹</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Amount"
                      className="bg-transparent text-slate-900 font-black text-sm text-right w-24 outline-none border-b border-[#EA580C] px-1 py-0.5"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="text-xs transition font-black uppercase text-[#EA580C] hover:underline">Specify custom value</span>
                )}
              </button>

              {/* Impact summary frame */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 items-start shadow-3xs">
                <div className="bg-orange-50 border border-orange-100 text-[#EA580C] p-2.5 rounded-xl shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Ground Impact Projection</h4>
                  <p className="text-slate-800 text-xs mt-1 leading-relaxed font-sans font-medium">
                    {getImpactDescription(getDonationAmount())}
                  </p>
                </div>
              </div>

              {errorText && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 font-bold font-sans">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <button
                type="button"
                onClick={validateStep1}
                className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white font-sans font-black uppercase text-xs tracking-wider py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Proceed to Donation Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: DETAILS ENTRY */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Donation Contact Registry</h3>
                <p className="text-xs text-neutral-500 mt-1 font-sans">
                  Enter your credentials to link with our verified manual support coordinators. Official wiring instructions undergo real-time ledger recording.
                </p>
              </div>

              <form onSubmit={handleSubmitIntent} className="space-y-4">
                {/* Anonymous supporter toggle */}
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => {
                      setAnonymous(e.target.checked);
                      if (e.target.checked) setDonorName("Anonymous Supporter");
                      else setDonorName("");
                    }}
                    className="rounded border-slate-300 text-[#EA580C] focus:ring-[#EA580C] h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Remain Anonymous</span>
                    <span className="text-[10px] text-neutral-400 block font-sans">Your support receipt remains private on our verified directory.</span>
                  </div>
                </label>

                {!anonymous && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Adnan Khan"
                      className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans font-medium focus:ring-1 focus:ring-[#EA580C]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">
                      Direct Whatsapp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="e.g. +91 90892 48102"
                      className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans font-medium focus:ring-1 focus:ring-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="e.g. adnan@gmail.com"
                      className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans font-medium focus:ring-1 focus:ring-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1">
                    Special Message or Allocation Notes (Optional)
                  </label>
                  <textarea
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    placeholder="e.g. Please dedicate specifically for fresh milk containers..."
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 text-xs font-sans font-medium focus:ring-1 focus:ring-[#EA580C] min-h-[70px]"
                  />
                </div>

                {/* Verification consent check */}
                <label className="flex items-start gap-2.5 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentCheck}
                    onChange={(e) => setConsentCheck(e.target.checked)}
                    className="rounded border-slate-300 text-[#EA580C] mt-0.5"
                  />
                  <span className="text-[10.5px] text-neutral-500 font-sans leading-relaxed">
                    I understand this is a manual donation intent. To protect civilian funds and maintain statutory records, I will receive official bank coordinates inside our verified volunteer live chat and upload my transaction screenshot.
                  </span>
                </label>

                {errorText && (
                  <div className="bg-red-50 border border-red-100 text-red-605 p-3 rounded-xl text-xs flex items-center gap-2 font-bold font-sans">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrorText(""); }}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-black uppercase text-xs py-3.5 rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="col-span-2 bg-[#EA580C] hover:bg-[#c2410c] text-white font-black uppercase text-xs tracking-wider py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:bg-slate-400"
                  >
                    {isSubmitting ? "Generating Support Room..." : "Start donation"}
                  </button>
                </div>
              </form>

              {/* Safe statement */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-sans mt-1 text-center">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Bait Al-Rahma manual verification prevents mock PII leaks.</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
