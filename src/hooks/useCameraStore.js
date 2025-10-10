import { create } from "zustand";

export const useCameraStore = create((set) => ({
  position: [0, 0, 0],
  direction: [0, 0, -1],
  setPosition: (pos) => set({ position: pos }),
  setDirection: (dir) => set({ direction: dir }),
}));