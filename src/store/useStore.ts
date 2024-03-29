import { Journeys } from "hafas-client";
import { create } from "zustand";
import { Stop } from "~/types/types";

export interface StoreType {
    from: Stop;
    to: Stop;
    date: Date;
    now: boolean;
    time: string;
    transportTypes: {
        nationalExpress: boolean;
        national: boolean;
        regionalExpress: boolean;
        regional: boolean;
        suburban: boolean;
        bus: boolean;
        ferry: boolean;
        subway: boolean;
        tram: boolean;
        taxi: boolean;
    }

    setFrom: (from: Stop) => void;
    setTo: (to: Stop) => void;
    setDate: (date: Date) => void;
    setNow: (now: boolean) => void;
    setTime: (time: string) => void;
    setTransportTypes: (transportTypes: {
        nationalExpress: boolean;
        national: boolean;
        regionalExpress: boolean;
        regional: boolean;
        suburban: boolean;
        bus: boolean;
        ferry: boolean;
        subway: boolean;
        tram: boolean;
        taxi: boolean;
    }) => void;
    reset: () => void;
}

export const useStore = create<StoreType>((set) => ({
    from: Object(),
    to: Object(),
    date: new Date(),
    now: true,
    time: "",
    transportTypes: {
        nationalExpress: true,
        national: true,
        regionalExpress: true,
        regional: true,
        suburban: true,
        bus: true,
        ferry: true,
        subway: true,
        tram: true,
        taxi: true,
    },
    setTransportTypes: (transportTypes) => set(() => ({ transportTypes })),
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

export interface JourneyStoreType {
    journey: Journeys;
    setJourney: (journey: Journeys) => void;
    reset: () => void;
}

export const useJourneyStore = create<JourneyStoreType>((set) => ({
    journey: [],
    setJourney: (journey: Journeys) => set(() => ({ journey })),
    reset: () => set(() => ({ journey: undefined })),
}));

export interface JourneyDelaysType {
    depId: string;
    depName: string | null;
    arrId: string;
    arrName: string | null;
    trainType: string;
    avgDelay: number | null;
    minDelay: number | null;
    maxDelay: number | null;
    numOfTrips: number | null;
    numOfCancellations: number | null;     
}
export interface DelayStoreType {
    delays: JourneyDelaysType[];
    setDelays: (delays: JourneyDelaysType[]) => void;
    reset: () => void;
}

export interface DelayStoreType {
    delays: JourneyDelaysType[]; // Update the type to always be an array
    setDelays: (delays: JourneyDelaysType[]) => void;
    reset: () => void;
}

export const useDelayStore = create<DelayStoreType>((set) => ({
    delays: [],
    setDelays: (delays) => set((state) => {
        const uniqueDelays = delays.filter((delay) => !state.delays.some((d) => d.depId === delay.depId && d.arrId === delay.arrId && d.trainType === delay.trainType));
        return { delays: [...state.delays, ...uniqueDelays] };
    }),
    reset: () => set(() => ({ delays: [] })),
}));