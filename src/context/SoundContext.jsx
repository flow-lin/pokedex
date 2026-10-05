import { useCallback, useEffect, useState } from "react";
import { SoundContext } from "./soundContext.js";

function playChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const notes = [659.25, 880, 1174.66];

  notes.forEach((frequency, index) => {
    const startAt = context.currentTime + index * 0.075;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    volume.gain.setValueAtTime(0.0001, startAt);
    volume.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.24);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.25);
  });

  window.setTimeout(() => context.close(), 550);
}

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("pokedex-mini-sound") !== "off";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pokedex-mini-sound", soundEnabled ? "on" : "off");
    } catch {
      // Sound still works for this visit if browser storage is unavailable.
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((enabled) => !enabled);
  }, []);

  const playCuteSound = useCallback(() => {
    if (soundEnabled) playChime();
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playCuteSound }}>
      {children}
    </SoundContext.Provider>
  );
}

