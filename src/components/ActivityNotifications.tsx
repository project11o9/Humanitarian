import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, CheckCircle2, ShieldCheck, HeartHandshake, Sparkles, AlertCircle } from "lucide-react";

interface NotificationItem {
  id: string;
  text: string;
  detail: string;
  type: "donation" | "monthly" | "package" | "project";
}

const LIVE_FEEDS: NotificationItem[] = [
  {
    id: "notif-1",
    text: "A supporter pledged ₹5,000",
    detail: "Direct medical surgery kit sponsored • Verified",
    type: "donation"
  },
  {
    id: "notif-2",
    text: "Emergency food package funded",
    detail: "1,200 child calorie broth units scheduled • Ground Ops",
    type: "package"
  },
  {
    id: "notif-3",
    text: "New Monthly Solidarity donor joined",
    detail: "Recurring commitment to clean desalination fuel",
    type: "monthly"
  },
  {
    id: "notif-4",
    text: "Family canvas shelter sponsored",
    detail: "Double insulated tent allocated to Amina Al-Masri's toddlers",
    type: "package"
  },
  {
    id: "notif-5",
    text: "Supporter contributed ₹1,500",
    detail: "Nutrient baby formula pouches disbursed • Ground Dispatch",
    type: "donation"
  },
  {
    id: "notif-6",
    text: "Desalinated sweet water tanker funded",
    detail: "Khan Younis Sanitation Corridors water trucked directly",
    type: "project"
  }
];

export default function ActivityNotifications() {
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [notifIndex, setNotifIndex] = useState<number>(0);

  useEffect(() => {
    // Show first notification after 4 seconds
    const initialDelay = setTimeout(() => {
      setActiveNotification(LIVE_FEEDS[0]);
    }, 4000);

    // Rotate notifications periodically
    const rotationInterval = setInterval(() => {
      setActiveNotification(null); // Hide current briefly to permit state exit
      
      setTimeout(() => {
        const nextIndex = (notifIndex + 1) % LIVE_FEEDS.length;
        setNotifIndex(nextIndex);
        setActiveNotification(LIVE_FEEDS[nextIndex]);
      }, 800); // Small pause for exit transition
      
    }, 10000); // Pop up every 10 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(rotationInterval);
    };
  }, [notifIndex]);

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-sm pointer-events-none">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl border border-[#10B981]/20 shadow-lg p-3.5 flex gap-3 items-start cursor-pointer hover:shadow-xl transition"
            onClick={() => setActiveNotification(null)}
          >
            <div className="w-8 h-8 rounded-full bg-[#10B981]/15 text-[#059669] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[11.5px] font-black text-[#0F172A] tracking-tight block">
                  {activeNotification.text}
                </span>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded shrink-0">
                  ACTUAL AID
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-snug mt-0.5 font-medium">
                {activeNotification.detail}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[8px] text-[#10B981] font-mono uppercase font-bold">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Verified Direct Distribution Unit</span>
              </div>
            </div>

            <button 
              className="text-neutral-400 hover:text-[#0F172A] p-0.5 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
            >
              <span className="text-xs">✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
