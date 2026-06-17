import React from "react";
import { ShieldCheck, Calendar, Navigation, Mail, Phone, MapPin } from "lucide-react";

export default function TrustSection() {
  return (
    <div className="bg-white border border-neutral-150 rounded-2xl p-6 md:p-8 space-y-8 font-sans">
      
      {/* Bento Trust Image and Text Overlay Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-neutral-100 pb-8">
        <div className="lg:col-span-5 relative min-h-[220px] rounded-xl overflow-hidden shadow-xs group bg-[#F8FAFC]">
          <img 
            src="/images/arab-volunteers-packing-aid.jpg" 
            alt="Arab and Middle Eastern volunteers packing aid relief supplies" 
            className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent flex items-end p-4">
            <span className="text-white text-[10px] font-mono tracking-wide uppercase font-bold drop-shadow-sm bg-neutral-900/50 backdrop-blur-xs px-2 py-1 rounded border border-white/10">
              Live Ground Coordination: SP-09 Cargo Hub
            </span>
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-orange-50/70 border border-orange-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#EA580C] w-max">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Guaranteed Safe Allocation Channel</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A] leading-tight">
            Direct-to-Recipient Logistics and Aid Ground Packing
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans">
            Our dedicated team coordinates material distribution directly near local camps and shelter networks in the Middle East. Every supply parcel is checked, verified, and mapped precisely to prevent friction.
          </p>
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🤝</span>
            <div>
              <p className="text-xs font-bold text-amber-900 font-sans leading-relaxed">
                “Your support is guided through verified volunteer chat and official payment details only.”
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed text-neutral-600">
        
        {/* Column 1: Organization Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#0F172A] text-[11px] uppercase tracking-wider block">
              Bait Al-Rahma Trust Organization
            </span>
          </div>
          <p className="font-sans font-normal leading-relaxed text-neutral-500">
            We are a registered Section 8 charitable non-governmental agency dedicated entirely to providing warm nutrition meals, clean double-layer winter shelter, and antiseptic pediatric surgical remedies inside humanitarian crisis points.
          </p>
          <span className="block font-mono text-[9px] text-emerald-600 uppercase font-semibold tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-max border border-emerald-100">
            FCRA Reg No. 194829104 • Delhi Charity Council
          </span>
        </div>

        {/* Column 2: Operational Code & Audits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#0F172A] text-[11px] uppercase tracking-wider block">
              Operational Code & Audits
            </span>
          </div>
          <p className="font-sans font-normal leading-relaxed text-neutral-500">
            All transactions are strictly mapped to dynamic allocation reference codes. Outflow receipts are verified directly by certified third-party financial auditors before ground cargo dispatching takes place. Live operations coordination: SP-09 Corridor.
          </p>
        </div>

        {/* Column 3: Contact & Inquiries */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#0F172A] text-[11px] uppercase tracking-wider block">
              Contact & Inquiries
            </span>
          </div>
          <p className="font-sans font-normal leading-relaxed text-neutral-500">
            Have questions regarding statutory certificates, foreign remittances tax exemption slips, or custom food-truck sponsorships? Connect with Sarah in our live chat or contact us:
          </p>
          <div className="space-y-1.5 text-[10px] text-neutral-700 font-mono">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>support@bait-al-rahma.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>+91 11 4182 9104 / +91 11 4829 0921</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-neutral-500">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Delhi Central Humanitarian Complex, Floor 4, Suite 8A, India</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
