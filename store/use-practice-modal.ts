import { create } from "zustand";

type PracticeModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

// create is used to define a state store (centralized container for state and logic)
// set is provided by Zustand to update the state of the store
export const usePracticeModal = create<PracticeModalState>((set) => ({
    // Set's initial state as true
    isOpen: false,
    // Action functions
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));