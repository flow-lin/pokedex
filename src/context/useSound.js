import { useContext } from "react";
import { SoundContext } from "./soundContext.js";

export function useSound() {
  const sound = useContext(SoundContext);
  if (!sound) throw new Error("useSound must be used inside SoundProvider");
  return sound;
}
