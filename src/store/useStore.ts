import { create } from "zustand";

export interface StoreType {
    from: string;
    to: string;
    date: Date;
    now: boolean;
    time: string;

    setFrom: (from: string) => void;
    setTo: (to: string) => void;
    setDate: (date: Date) => void;
    setNow: (now: boolean) => void;
    setTime: (time: string) => void;
    reset: () => void;
}

export const useStore = create<StoreType>((set) => ({
    from: "",
    to: "",
    date: new Date(),
    now: true,
    time: "",

    setFrom: (from) => set(() => ({ from })),
    setTo: (to) => set(() => ({ to })),
    setDate: (date) => set(() => ({ date })),
    setNow: (now) => set(() => ({ now, date: new Date() })),
    setTime: (time) => set(() => ({ time })),
    reset: () =>
        set(() => ({
            from: "",
            to: "",
            date: undefined,
            now: true,
            time: "",
        })),
}));
