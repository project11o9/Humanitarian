import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

export default function LoadingScreen({ message = "Loading secure trust data..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full mx-4 flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#EA580C] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#EA580C] animate-pulse" />
          </div>
        </div>
        <div>
          <span className="font-sans font-black text-sm tracking-tight text-[#0F172A] uppercase block">
            Bait Al-Rahma Trust
          </span>
          <p className="text-xs text-neutral-500 font-medium font-sans mt-1">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
