"use client";

import { useEffect, useState } from "react";
import {
  isMarpoSoundEnabled,
  playMarpoSound,
  setMarpoSoundEnabled,
} from "@/lib/marpo-sound";

export default function MarpoSoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isMarpoSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !enabled;

    setEnabled(next);
    setMarpoSoundEnabled(next);

    if (next) {
      playMarpoSound("success");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/10"
    >
      {enabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
    </button>
  );
}