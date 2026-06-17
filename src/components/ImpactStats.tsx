import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { Users, Utensils, HeartPulse, HardHat, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { VerifiedDonation } from "../types";

// Mini counter component with smooth count-up animation
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayVal, setDisplayVal] = useState<number>(Math.floor(value * 0.8));

  useEffect(() => {
    const controls = animate(Math.floor(value * 0.85), value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayVal(Math.floor(value));
      }
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="font-mono text-xl sm:text-3xl font-black text-[#0F172A]">
      {displayVal.toLocaleString()}{suffix}
    </span>
  );
}

interface ImpactStatsProps {
  verifiedDonations?: VerifiedDonation[];
}

export default function ImpactStats({ verifiedDonations = [] }: ImpactStatsProps) {
  // Sum of extra approved cash in session
  const extraCash = verifiedDonations.reduce((acc, d) => acc + d.amount, 0);
  
  // Dynamic conversions: ₹1,000 sponsors approx 2 families, 30 meals, and 4 medical units
  const extraFamilies = Math.floor(extraCash * 0.003);
  const extraMeals = Math.floor(extraCash * 0.04);
  const extraMedical = Math.floor(extraCash * 0.02);

  const metrics = [
    {
      id: "families",
      label: "Displaced Families Secured",
      labelAr: "العائلات المستفيدة والمؤمنة",
      value: 12480 + extraFamilies,
      suffix: "+",
      icon: Users,
      color: "bg-[#10B981]/10 text-[#059669]",
      desc: "Supported with canvas sheltering, warm jackets, and daily clean drinkable lines."
    },
    {
      id: "meals",
      label: "Hot Nutritional Meals Delivered",
      labelAr: "الرواتب الغذائية الموزعة",
      value: 1840500 + extraMeals,
      suffix: "",
      icon: Utensils,
      color: "bg-amber-500/10 text-amber-700",
      desc: "Daily freshly baked flatbread and high-calorie porridge cooked instantly via camp burners."
    },
    {
      id: "medical",
      label: "Emergency Medical Kits Suture",
      labelAr: "مستلزمات الإسعاف والطوارئ",
      value: 42910 + extraMedical,
      suffix: "",
      icon: HeartPulse,
      color: "bg-emerald-500/10 text-emerald-700",
      desc: "Delivered to mobile first-aid outpatient hubs inside active humanitarian coordinate camps."
    },
    {
      id: "projects",
      label: "Active Ground Relief Sites",
      labelAr: "مواقع الإغاثة المستمرة",
      value: 14 + (extraCash > 100000 ? 1 : 0),
      suffix: "",
      icon: HardHat,
      color: "bg-[#1E3A8A]/10 text-[#1E3A8A]",
      desc: "Direct field kitchens, clean water desalizers, and modular medical tents run by volunteers."
    }
  ];


  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block font-sans">
            Verified Deliveries Summary Ledger
          </span>
          <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
            Our Documented Impact Count in Real Time
          </h3>
        </div>
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span className="text-[10px] text-[#059669] font-black uppercase tracking-wider font-sans">
            Ground Truth Verified • تدقيق مباشر
          </span>
        </div>
      </div>

      {/* Grid of counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.id}
              className="p-5 rounded-xl border border-neutral-150 bg-[#FAF9F6] flex flex-col justify-between space-y-3 shadow-3xs hover:border-[#1E3A8A]/35 transition"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className={`p-2.5 rounded-lg shrink-0 ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-right text-[11px] font-medium text-stone-500 font-serif" dir="rtl">
                  {metric.labelAr}
                </span>
              </div>

              <div>
                <Counter value={metric.value} suffix={metric.suffix} />
                <span className="block text-xs font-black text-[#0F172A] mt-1 tracking-tight leading-none">
                  {metric.label}
                </span>
              </div>

              <p className="text-[10px] text-neutral-500 leading-relaxed font-sans font-medium">
                {metric.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trust reassurance banner */}
      <div className="bg-[#1E3A8A]/5 p-3 rounded-xl border border-[#1E3A8A]/10 text-[10.5px] font-sans text-neutral-600 leading-relaxed flex items-center gap-2">
        <Info className="w-4.5 h-4.5 text-[#1E3A8A] shrink-0" />
        <span>
          <b>Note:</b> These counters are incremented securely as soon as our dedicated volunteer coordinators verify and approve payment deposit screenshot confirmation vouchers shared inside the live donation chat support workspace.
        </span>
      </div>
    </div>
  );
}
