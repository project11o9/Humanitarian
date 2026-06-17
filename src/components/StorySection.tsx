import React from "react";
import { motion } from "motion/react";
import { STORIES, TESTIMONIALS } from "../data";
import { ArrowRight, HeartHandshake, Eye, ShieldAlert, BadgeInfo } from "lucide-react";

interface StorySectionProps {
  onOpenChat: (allocationFocus: string) => void;
}

export default function StorySection({ onOpenChat }: StorySectionProps) {
  return (
    <section className="space-y-12">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <span className="text-[10.5px] font-black uppercase text-[#F97316] tracking-widest bg-amber-50 border border-amber-300/30 px-3 py-1 rounded-full inline-block">
          Voices of Survival & Dignity • قصص وشهادات
        </span>
        <h2 className="text-2xl md:text-3.5xl font-black text-[#0F172A] tracking-tight">
          Read Real Beneficiary Stories on the Ground
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 leading-relaxed font-sans font-medium">
          Every face here represents a real human life, sustained directly by families who joined the secure live support chat coordination.
        </p>
      </div>

      {/* STYLISH BENTO STORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {STORIES.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group justify-between"
          >
            {/* Image banner with Ken Burns zoom overlay */}
            <div className="relative aspect-[4/3] w-full bg-neutral-900 overflow-hidden">
              <img
                src={story.imagePath}
                alt={story.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[9.5px] text-white font-mono font-bold tracking-tight uppercase">
                  {story.urgencyLevel} Need
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[9.5px] font-mono tracking-wide">
                📍 Location: {story.location}
              </div>
            </div>

            {/* Content area */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-1.5">
                  <h3 className="text-base font-black text-[#0F172A] leading-tight font-sans">
                    {story.name}
                  </h3>
                  <span className="text-xs text-neutral-505 font-mono">Age: {story.age}</span>
                </div>
                
                <p className="text-xs text-[#0F172A]/85 italic block pl-3 border-l-2 border-[#F97316]/60 leading-relaxed py-0.5 bg-neutral-50 rounded-r">
                  {story.quote}
                </p>
                
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  {story.narrative}
                </p>
              </div>

              {/* Required materials */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <span className="text-[9.5px] uppercase font-extrabold text-neutral-400 tracking-wider">
                  Ground Delivery Focus:
                </span>
                <div className="flex flex-wrap gap-1">
                  {story.needs.map((n, i) => (
                    <span 
                      key={i} 
                      className="text-[9px] font-bold bg-[#10B981]/5 border border-[#10B981]/10 text-[#059669] px-2 py-0.5 rounded-md"
                    >
                      ✓ {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action trigger button */}
              <button
                type="button"
                onClick={() => onOpenChat(`Immediate Welfare Support for ${story.name} (${story.location})`)}
                className="w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black uppercase text-white bg-[#0F172A] hover:bg-[#1E3A8A] transition cursor-pointer select-none"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Sponsor Relief in Chat
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* REAL TESTIMONIALS SLIDER SECTION */}
      <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {TESTIMONIALS.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-3xs flex flex-col justify-between space-y-4">
            <blockquote className="space-y-2.5">
              <span className="text-[40px] leading-none text-slate-200 block font-serif h-4 font-bold select-none">“</span>
              <p className="text-xs md:text-sm text-neutral-600 italic leading-relaxed">
                {t.quote}
              </p>
              <p className="text-xs md:text-sm text-stone-700 italic font-serif font-bold text-right" dir="rtl">
                «{t.quoteAr}»
              </p>
            </blockquote>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#059669] flex items-center justify-center text-xs font-black shrink-0">
                ⭐
              </div>
              <div>
                <span className="text-[10.5px] font-black text-[#0F172A] block leading-none">{t.name}</span>
                <span className="text-[9.5px] text-neutral-500 font-sans block mt-1">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
