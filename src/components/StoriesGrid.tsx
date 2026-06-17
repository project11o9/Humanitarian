import React, { useState } from "react";
import { motion } from "motion/react";
import { Story } from "../types";
import { Heart, Flame, ShieldAlert, MapPin, Sparkles, Check, ArrowRight } from "lucide-react";

// Local image references from our generated assets
const FAMILY_SHELTER_IMG = "/images/arab-shelter-support.jpg";
const WATER_AID_IMG = "/images/arab-water-support.jpg";
const FOOD_KITCHEN_IMG = "/images/arab-food-support.jpg";

const REAL_STORIES: Story[] = [
  {
    id: "amina-family",
    name: "Amina Al-Masri & Her Three Children",
    age: 34,
    location: "Deir al-Balah Temporary Camps",
    quote: "A family should never face war alone. When the shelling destroyed our home, we slept on bare dust. The winter kit gave my children their safety back.",
    narrative: "Amina fled her home in northern Gaza with nothing but her children's clothes. She spent three cold weeks unsheltered. Through direct NGO intervention, her family received a robust canvas winterized tent, heavy thermal blankets, and a basic solar lighting lantern.",
    urgencyLevel: "Critical",
    needs: ["Shelter Reconstruction Support", "Blankets & Floor Mats", "Warm Clothes for Children"],
    imagePath: FAMILY_SHELTER_IMG
  },
  {
    id: "yousuf-meals",
    name: "Yousuf's Struggle & Fresh Meals",
    age: 9,
    location: "Khan Younis Field Shelters",
    quote: "A child should never go to sleep hungry. Now we have hot soup and bread in the afternoon, so my tummy doesn't hurt when I try to sleep.",
    narrative: "Displaced multiple times, Yousuf and his minor cousins were surviving on dried animal feed and forage. Hot soup kitchens established by civilian donations now serve over 2,200 daily meals in Khan Younis, restoring daily nourishment to children who have been malnourished for months.",
    urgencyLevel: "High",
    needs: ["Nutrient-rich Food Parcels", "Baby Formula Ingredients", "Fortified Biscuits"],
    imagePath: FOOD_KITCHEN_IMG
  },
  {
    id: "laila-water",
    name: "Laila & Local Clean Water Desalination",
    age: 3,
    location: "Rafah Outer Distribution Line",
    quote: "Your contribution can help provide food, clean water, medicine, and shelter. Fresh water gives us life.",
    narrative: "Laila suffered from seawater-related waterborne infections for weeks due to damaged municipal pipes. With donations, portable water filtration tablets and daily clean water trucking lines were introduced, supporting 450 camp compounds with safe hydration.",
    urgencyLevel: "Critical",
    needs: ["Water Filtration Powders", "Sterile Storage Containers", "Hygiene Soap Kits"],
    imagePath: WATER_AID_IMG
  }
];

interface StoriesGridProps {
  onSelectStoryTheme: (projectType: string, amount: number) => void;
}

export default function StoriesGrid({ onSelectStoryTheme }: StoriesGridProps) {
  const [activeStoryId, setActiveStoryId] = useState<string>("amina-family");

  const currentStory = REAL_STORIES.find(s => s.id === activeStoryId) || REAL_STORIES[0];

  const handleSupportClick = (storyId: string) => {
    // Map story to allocation types and target amounts
    if (storyId === "amina-family") {
      onSelectStoryTheme("shelter", 2500);
    } else if (storyId === "yousuf-meals") {
      onSelectStoryTheme("kitchen", 500);
    } else {
      onSelectStoryTheme("water", 1000);
    }
  };

  return (
    <div className="space-y-12" id="impact-stories-section">
      {/* Small Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-red-950/40 border border-red-900/50 px-3.5 py-1.5 rounded-full text-xs text-red-400 font-display uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-red-400 animate-pulse text-red-400" />
          Voices from the Ground
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight leading-tight">
          Authentic Stories of Resilience
        </h2>
        <p className="text-stone-400 text-sm md:text-base leading-relaxed">
          Behind every statistic lies a human life. Meet the families surviving through extreme conflict and understand the immediate, tangible change your solidarity brings.
        </p>
      </div>

      {/* Main Story Layout: Interactive Profile Selector Left + Large Profile Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Story List Tabs */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="text-xs uppercase font-semibold text-stone-500 tracking-wider mb-1 px-1">
            Read Their Journeys
          </div>
          
          {REAL_STORIES.map((story) => {
            const isSelected = story.id === activeStoryId;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => setActiveStoryId(story.id)}
                className={`p-5 rounded-2xl border text-left text-stone-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? "border-red-500 bg-stone-900 shadow-md ring-1 ring-red-500/20" 
                    : "border-stone-800 bg-stone-950/60 hover:bg-stone-900/50"
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-600" />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 font-semibold border border-stone-800">
                      {story.location}
                    </span>
                    <h3 className="text-base font-bold text-white font-display mt-2">{story.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide shrink-0 ${
                    story.urgencyLevel === "Critical" 
                      ? "bg-red-950/50 text-red-400 border border-red-900/30" 
                      : "bg-amber-950/50 text-amber-400 border border-amber-900/30"
                  }`}>
                    {story.urgencyLevel}
                  </span>
                </div>

                <p className="text-xs text-stone-400 italic line-clamp-2 mt-3 leading-relaxed">
                  "{story.quote}"
                </p>

                <div className="flex items-center justify-between text-xs text-stone-500 mt-4 pt-3 border-t border-stone-800/60">
                  <span>Age: {story.age} years old</span>
                  <span className={`flex items-center gap-1 font-semibold ${isSelected ? "text-red-400" : "text-stone-400"}`}>
                    View full report 
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Main Detail Pane with Full Documentary Imagery */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl relative">
          
          <div className="relative h-64 md:h-72">
            <img 
              src={currentStory.imagePath} 
              alt={currentStory.name} 
              className="w-full h-full object-cover filter brightness-[0.70] contrast-[1.05]"
              referrerPolicy="no-referrer"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
            
            {/* Visual Location Tag */}
            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentStory.location}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-display text-white">
                {currentStory.name}
              </h3>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* The Quote */}
            <div className="border-l-4 border-red-600 pl-4 py-1 italic text-slate-100 text-sm md:text-base leading-relaxed">
              "{currentStory.quote}"
            </div>

            {/* Narrative description */}
            <div className="space-y-2 text-stone-300 text-xs md:text-sm leading-relaxed">
              <h4 className="font-semibold uppercase tracking-wider text-[11px] text-stone-400 font-sans">Humanitarian Context:</h4>
              <p>{currentStory.narrative}</p>
            </div>

            {/* Active Needs Checklist */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="text-[11px] font-sans font-semibold text-stone-400 uppercase tracking-wider">
                Immediate Unmet Needs (Critical Priorities):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {currentStory.needs.map((need, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-stone-300 bg-stone-950 px-3 py-2 rounded-lg border border-stone-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    <span>{need}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Call-to-Action button */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-400 max-w-sm">
                *Your direct donation in the box above will immediately prioritize procurement for families like Amina's.
              </div>
              <button
                type="button"
                onClick={() => handleSupportClick(currentStory.id)}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-display font-medium text-xs md:text-sm py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
              >
                Let's Help in {currentStory.location.split(' ')[0]}
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Inspirational Bottom Banner */}
      <div className="bg-gradient-to-r from-red-950/20 via-stone-900 to-amber-950/10 border border-stone-800 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left max-w-2xl">
          <h3 className="text-lg md:text-xl font-bold font-display text-white">
            "Your contribution can help provide food, clean water, medicine, and shelter."
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Every minute of inaction affects children on the ground. We work under extreme conditions to coordinate logistics directly with neutral, trusted relief partners. 80G tax benefit forms are emailed within 10 minutes.
          </p>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById("donation-tool-card");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white hover:bg-stone-200 text-stone-950 font-display font-semibold text-xs md:text-sm py-3.5 px-6 rounded-xl transition shrink-0 uppercase tracking-wider"
        >
          Begin Aid Process
        </button>
      </div>
    </div>
  );
}
