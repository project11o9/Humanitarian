import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, HeartHandshake } from "lucide-react";

export default function AudioToneController() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.25);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Oscillators
  const drone1Ref = useRef<OscillatorNode | null>(null);
  const drone2Ref = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Stop synthesis safely
  const stopTone = () => {
    try {
      if (drone1Ref.current) { drone1Ref.current.stop(); drone1Ref.current.disconnect(); drone1Ref.current = null; }
      if (drone2Ref.current) { drone2Ref.current.stop(); drone2Ref.current.disconnect(); drone2Ref.current = null; }
      if (lfoRef.current) { lfoRef.current.stop(); lfoRef.current.disconnect(); lfoRef.current = null; }
      if (filterRef.current) { filterRef.current.disconnect(); filterRef.current = null; }
      setIsPlaying(false);
    } catch (e) {
      console.error("Failed to stop synthesis", e);
    }
  };

  // Start synthesis
  const startTone = () => {
    try {
      // 1. Create or resume AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 2. Create Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 3. Low comforting Drone 1 (Deep base hum - 85Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(85, ctx.currentTime);

      const osc1Gain = ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.6, ctx.currentTime);

      // 4. Harmonics Harmony Drone 2 (Compassionate perfect fifth - 127.5Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(127.5, ctx.currentTime);

      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.3, ctx.currentTime);

      // Low-pass filter to make it velvety and warm
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filterRef.current = filter;

      // LFO (Low-frequency oscillator) to slowly modulate the comfort swell (0.12Hz)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      // Hook up synthesis nodes
      lfo.connect(lfoGain);
      lfoGain.connect(osc1Gain.gain); // Modulates volume dynamically

      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);

      osc1Gain.connect(filter);
      osc2Gain.connect(filter);
      
      filter.connect(masterGain);

      // Start all sound-wave generators
      osc1.start(0);
      osc2.start(0);
      lfo.start(0);

      drone1Ref.current = osc1;
      drone2Ref.current = osc2;
      lfoRef.current = lfo;

      setIsPlaying(true);
    } catch (e) {
      console.error("Synthesizer could not boot up:", e);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startTone();
    }
  };

  // Sync volume slider on the fly
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume * 0.4, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      stopTone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-neutral-900/90 text-white p-3.5 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full">
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-lg ${isPlaying ? "bg-emerald-600 animate-pulse text-white" : "bg-neutral-800 text-neutral-400"}`}>
          <HeartHandshake className="w-4 h-4 shrink-0" />
        </div>
        <div>
          <span className="font-bold text-neutral-100 block tracking-tight">
            Listen to the Ground Drone Atmosphere
          </span>
          <span className="text-[10px] text-neutral-400 block" dir="rtl">
            صوت تضامني — Comforting acoustic camp hum tone
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
        {/* Toggle Tone button */}
        <button
          onClick={toggleSound}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            isPlaying 
              ? "bg-[#007DBC] hover:bg-[#006aa7] text-white" 
              : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          }`}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
              Mute Camp Tone / كتم
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              Play Camp Tone / تشغيل
            </>
          )}
        </button>

        {/* Volume Bar */}
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
          <span className="text-[10px] text-neutral-550 font-mono">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 md:w-24 accent-[#007DBC] bg-neutral-700 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
