/**
 * Canonical tracker identifiers. Adding a new tracker = add a code here,
 * create a backend module + frontend widget, register both, then map it to
 * subscription plans via the PlanTracker join table.
 */
export declare const TRACKER_CODES: {
    readonly SALAH: "salah";
    readonly ADHKAR: "adhkar";
    readonly QURAN: "quran";
    readonly EXERCISE: "exercise";
    readonly WATER: "water";
    readonly JUNK_FREE: "junk_free";
    readonly FOOD_LOG: "food_log";
    readonly WEIGHT: "weight";
    readonly REFLECTION: "reflection";
};
export type TrackerCode = (typeof TRACKER_CODES)[keyof typeof TRACKER_CODES];
export declare const ALL_TRACKER_CODES: TrackerCode[];
export declare const TRACKER_METADATA: Record<TrackerCode, {
    label: string;
    description: string;
    defaultEnabled: boolean;
}>;
