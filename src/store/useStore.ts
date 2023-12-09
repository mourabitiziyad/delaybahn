import { create } from "zustand";
import { Stop } from "~/types/types";

export interface StoreType {
    from: Stop;
    to: Stop;
    date: Date;
    now: boolean;
    time: string;

    setFrom: (from: Stop) => void;
    setTo: (to: Stop) => void;
    setDate: (date: Date) => void;
    setNow: (now: boolean) => void;
    setTime: (time: string) => void;
    reset: () => void;
}

export const useStore = create<StoreType>((set) => ({
    from: Object(),
    to: Object(),
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
            from: Object(),
            to: Object(),
            date: undefined,
            now: true,
            time: "",
        })),
}));
