import React, { useState } from "react";
import { Calendar, Sun, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

interface SponsorshipFrequencyFormProps {
  onRedirectToChat: (messagePrefix: string) => void;
}

export default function SponsorshipFrequencyForm({ onRedirectToChat }: SponsorshipFrequencyFormProps) {
  const [frequency, setFrequency] = useState<"daily" | "monthly">("daily");
  
  // Pre-set budgets for quick picking
  const dailyOptions = [
    { label: "Sponsor 1 Child's Hot Meal", amount: 150, text: "Provides fresh flatbread, warm nutrient porridge for 1 toddler daily." },
    { label: "Provide Daily Water & Soup", amount: 350, text: "Provides 15 liters of chlorinated mineral water and warm broth daily." },
    { label: "Full Daily Support Pack", amount: 750, text: "Sponsors complete nutrition, sanitary wipes, and warm jacket daily." },
  ];

  const monthlyOptions = [
    { label: "1 Month Clean Water Corridor", amount: 4500, text: "Secures solar desalination water trucking access for 1 displaced family." },
    { label: "1 Month Double-Layer Shelter", amount: 10500, text: "Sponsors insulated heavy wool winter canvas tent and thermal blankets." },
    { label: "1 Month Medical Care Corridor", amount: 22500, text: "Funds life-saving outpatient surgery materials, stitches & kids rehydration." },
  ];

  const currentOptions = frequency === "daily" ? dailyOptions : monthlyOptions;
  
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const getCurrentAmount = () => {
    if (isCustom) {
      return customAmount ? `₹${Number(customAmount).toLocaleString()}` : "Selected amount";
    }
    return `₹${currentOptions[selectedOptionIdx].amount.toLocaleString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isCustom ? (customAmount ? `₹${customAmount}` : "Custom Amount") : `₹${currentOptions[selectedOptionIdx].amount}`;
    const planName = frequency === "daily" ? "Daily Solidarity Plan" : "Monthly Humanitarian Plan";
    const selectedText = isCustom ? "Custom Sponsorship Plan" : currentOptions[selectedOptionIdx].label;
    
    // Construct focused chat message prefix
    const messageText = `Hello! I would like to sponsor under the **${planName}** at **${finalAmount}/${frequency === "daily" ? "day" : "month"}** for the program: "${selectedText}". Please guide me with your official bank coordinates and wire tax-exemption files!`;
    
    onRedirectToChat(messageText);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden font-sans text-slate-800">
      
      {/* Header Tabs */}
      <div className="bg-slate-50 border-b border-slate-100 p-1 flex">
        <button
          type="button"
          onClick={() => {
            setFrequency("daily");
            setIsCustom(false);
            setSelectedOptionIdx(0);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            frequency === "daily"
              ? "bg-[#EA580C] text-white shadow-3xs"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Sun className="w-4 h-4 shrink-0" />
          <span>Sponsor Daily • تبرع يومي</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFrequency("monthly");
            setIsCustom(false);
            setSelectedOptionIdx(0);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            frequency === "monthly"
              ? "bg-[#1E3A8A] text-white shadow-3xs"
              : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Sponsor Monthly • تبرع شهري</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            {frequency === "daily" ? "Daily Contribution Plan" : "Monthly Solidarity Plan"}
          </span>
          <p className="text-[11px] text-neutral-500 leading-normal font-medium">
            Choose a preset package or enter your custom budget. Clicking continue redirects you to our verified live chat room guidelines.
          </p>
        </div>

        {/* Preset Radio list */}
        <div className="space-y-2">
          {currentOptions.map((opt, idx) => (
            <label
              key={idx}
              className={`block p-3 rounded-xl border transition cursor-pointer text-left ${
                !isCustom && selectedOptionIdx === idx
                  ? frequency === "daily"
                    ? "border-[#EA580C] bg-orange-50/20"
                    : "border-[#1E3A8A] bg-blue-50/15"
                  : "border-slate-200 hover:bg-slate-50/60"
              }`}
              onClick={() => {
                setSelectedOptionIdx(idx);
                setIsCustom(false);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sponsor-option"
                    checked={!isCustom && selectedOptionIdx === idx}
                    onChange={() => {}}
                    className={`h-3.5 w-3.5 accent-[#EA580C]`}
                  />
                  <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                </div>
                <span className={`text-xs font-mono font-black ${frequency === "daily" ? "text-[#EA580C]" : "text-[#1E3A8A]"}`}>
                  ₹{opt.amount.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-bold">/{frequency === "daily" ? "day" : "mo"}</span>
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-normal mt-1 pl-5 font-sans">
                {opt.text}
              </p>
            </label>
          ))}

          {/* Custom amount picker */}
          <div
            className={`p-3 rounded-xl border transition ${
              isCustom 
                ? frequency === "daily" 
                  ? "border-[#EA580C] bg-orange-50/20" 
                  : "border-[#1E3A8A] bg-blue-50/15"
                : "border-slate-200"
            }`}
          >
            <label 
              className="flex items-center gap-2 cursor-pointer pb-2"
              onClick={() => setIsCustom(true)}
            >
              <input
                type="radio"
                name="sponsor-option"
                checked={isCustom}
                onChange={() => {}}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs font-bold text-slate-900">Enter Custom Budget Plan</span>
            </label>

            {isCustom && (
              <div className="pl-5 pt-1.5 flex gap-2 items-center">
                <span className="text-xs font-extrabold text-slate-500">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="flex-1 text-xs p-2 bg-white border border-slate-250 rounded focus:outline-none focus:border-[#EA580C] font-mono font-bold"
                  min="100"
                  required
                />
                <span className="text-[10px] font-bold text-slate-550">/{frequency === "daily" ? "day" : "month"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-[10.5px] text-red-700 leading-normal flex gap-1.5 items-start">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>
            <b>Error 404: System Error</b> — Secure direct processing gateway offline. Please contact our team via the live chat to manually coordinate your support registry.
          </span>
        </div>
      </form>
    </div>
  );
}
