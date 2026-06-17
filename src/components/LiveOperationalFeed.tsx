import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Radio, MapPin, Eye, Clock } from "lucide-react";

// Image imports representation passed from parent
interface LiveFeedProps {
  hungryBoyImg: string;
  refugeeMealsImg: string;
  hopefulGirlImg: string;
  foodAidImg: string;
}

interface FeedSlide {
  id: number;
  image: string;
  camLabel: string;
  location: string;
  titleEng: string;
  titleAr: string;
  descEng: string;
  descAr: string;
}

export default function LiveOperationalFeed({ 
  hungryBoyImg, 
  refugeeMealsImg, 
  hopefulGirlImg, 
  foodAidImg 
}: LiveFeedProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");

  const slides: FeedSlide[] = [
    {
      id: 1,
      image: hungryBoyImg,
      camLabel: "FEED_CAM_01 / NORTH_CORRIDOR",
      location: "Beit Lahia Buffer Zone Area / شمال غزة",
      titleEng: "EMERGENCY NUTRITIONAL RATIONING",
      titleAr: "توزيع حصص غذائية طارئة للأطفال",
      descEng: "Ground volunteers direct vital nutrition units and high-calorie broth with protective warmth layers to starving children.",
      descAr: "يقوم المتطوعون بتوزيع الوجبات الغذائية والحصص التغذوية المدعمة للأطفال الفارين من ويلات الجوع والبرد."
    },
    {
      id: 2,
      image: refugeeMealsImg,
      camLabel: "FEED_CAM_02 / SOUTHERN_CAMP_KITCHENS",
      location: "Deir al-Balah Transit Tents / دير البلح غزة",
      titleEng: "RESTORING FRESH CAMP SUBSISTENCE",
      titleAr: "طهي وتوزيع الوجبات الساخنة اليومية",
      descEng: "Daily direct delivery lines manage critical ingredients, sustaining up to 1,200 displaced toddler minds.",
      descAr: "المطابخ الإغاثية تعمل على مدار الساعة لتقديم وجبات الأرز الساخنة والشوربة المقوية لمواجهة قرصة شتاء المخيمات."
    },
    {
      id: 3,
      image: hopefulGirlImg,
      camLabel: "FEED_CAM_03 / FRESH_WATER_DESALINATION",
      location: "Khan Younis Sanitation Corridors / خان يونس غزة",
      titleEng: "CHLORINE-DESALINATION TANKERS",
      titleAr: "تأمين صهاريج ومحطات مياه الشرب النظيفة",
      descEng: "Sustained fresh sweet water trucking delivers sterile drinking hydration directly, avoiding lethal waterborne circles.",
      descAr: "تسيير شاحنات وصهاريج المياه العذبة يومياً لوقف انتشار الأوبئة وتأمين مياه الشرب الصالحة لأسر الطفولة."
    },
    {
      id: 4,
      image: foodAidImg,
      camLabel: "FEED_CAM_04 / MEDICAL_TRIAGE_DISPATCH",
      location: "Central Paramedic Volunteer Outpost / عيادة الإسعاف المركزي",
      titleEng: "CLINICAL MEDICINE & SUTURES",
      titleAr: "تأمين المستلزمات الطبية لإصابات الأطفال",
      descEng: "Dedicated mobile doctor networks coordinate vital sutures and sterile gauze packets directly inside tent compounds.",
      descAr: "شراء وتأمين عبوات المسكنات الآمنة للأطفال وخيوط الطوارئ والشاش المعقم لدعم عيادات الإيواء الميدانية."
    }
  ];

  // Auto transition every 5 seconds to simulate rolling CCTV stream
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Update ticking time in real time or coordinate tracker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getUTCHours().toString().padStart(2, "0") + ":" + 
                     now.getUTCMinutes().toString().padStart(2, "0") + ":" + 
                     now.getUTCSeconds().toString().padStart(2, "0") + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = slides[currentSlideIndex];

  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-950 overflow-hidden select-none">
      {/* Visual background slide transition with Ken-Burns scale animation effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={activeSlide.image}
            alt="Humanitarian Live Dispatch Feed"
            className="w-full h-full object-cover object-center scale-[1.02] filter brightness-[0.42] contrast-105"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cyber overlay elements creating a very visual CCTV atmosphere */}
      <div className="absolute inset-0 bg-neutral-950/20 pointer-events-none" />
      
      {/* Dynamic scanline overlay effect for high video feedback style */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-25 pointer-events-none" />

      {/* Live Cam Telemetry Hud Line */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-[10px] sm:text-xs font-mono z-20 select-none bg-neutral-950/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-extrabold tracking-widest text-red-500 animate-pulse text-[9.5px]">
            🔴 LIVE REFUGEE SOLIDARITY FEED
          </span>
          <span className="text-neutral-400 hidden sm:inline">|</span>
          <span className="text-white font-bold hidden sm:inline">{activeSlide.camLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded text-[9.5px]">
            <Radio className="w-3 h-3 text-emerald-400" />
            60 FPS STREAM
          </span>
          <span className="text-neutral-300 font-bold flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/10">
            <Clock className="w-3 h-3 text-sky-400" />
            {currentTime}
          </span>
        </div>
      </div>

      {/* Corner coordinate overlay */}
      <div className="absolute top-16 left-4 z-20 text-white font-mono text-[9.5px] bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-white/5 space-y-0.5 pointer-events-none">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Coordinates: {activeSlide.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8.5px] text-neutral-405 font-sans pl-5">
          <span>Active Operations Ground Link — SP-09 Corridor</span>
        </div>
      </div>

      {/* Bottom overlay with Arabic and English narrative subtitles */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col justify-end">
        <div className="max-w-4xl space-y-3 p-4 md:p-6 rounded-xl bg-neutral-950/70 border border-white/10 backdrop-blur-md text-white">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-1 text-sky-400 font-bold tracking-wider text-[10px] uppercase font-sans">
              <Eye className="w-3.5 h-3.5" />
              <span>Current Focus Area</span>
            </div>
            <div className="text-[10px] text-[#A64D32] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-black font-sans uppercase">
              RELIABLE DISPATCH ROUTE ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Action Subtitle */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest block font-sans">
                {activeSlide.titleEng}
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans font-medium">
                {activeSlide.descEng}
              </p>
            </div>

            {/* Magnificent Arabic Subtitle */}
            <div className="space-y-1.5 text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4" dir="rtl">
              <span className="text-[11px] text-amber-500 font-extrabold tracking-wide block">
                {activeSlide.titleAr}
              </span>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif font-bold">
                {activeSlide.descAr}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
