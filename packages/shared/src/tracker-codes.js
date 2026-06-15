"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRACKER_METADATA = exports.ALL_TRACKER_CODES = exports.TRACKER_CODES = void 0;
/**
 * Canonical tracker identifiers. Adding a new tracker = add a code here,
 * create a backend module + frontend widget, register both, then map it to
 * subscription plans via the PlanTracker join table.
 */
exports.TRACKER_CODES = {
    SALAH: 'salah',
    ADHKAR: 'adhkar',
    QURAN: 'quran',
    EXERCISE: 'exercise',
    WATER: 'water',
    JUNK_FREE: 'junk_free',
    FOOD_LOG: 'food_log',
    WEIGHT: 'weight',
    REFLECTION: 'reflection',
};
exports.ALL_TRACKER_CODES = Object.values(exports.TRACKER_CODES);
exports.TRACKER_METADATA = {
    [exports.TRACKER_CODES.SALAH]: {
        label: 'Salah — Prayer',
        description: 'Five daily prayers + Sunnah & extras.',
        defaultEnabled: true,
    },
    [exports.TRACKER_CODES.ADHKAR]: {
        label: 'Adhkar — Daily Remembrance',
        description: 'Morning and evening adhkar.',
        defaultEnabled: true,
    },
    [exports.TRACKER_CODES.QURAN]: {
        label: 'Quran — Daily Recitation',
        description: 'Pages read today.',
        defaultEnabled: true,
    },
    [exports.TRACKER_CODES.EXERCISE]: {
        label: 'Exercise & Walking',
        description: 'Daily exercise and step count.',
        defaultEnabled: true,
    },
    [exports.TRACKER_CODES.WATER]: {
        label: 'Water Intake',
        description: 'Goal: 10 glasses (250 ml each).',
        defaultEnabled: true,
    },
    [exports.TRACKER_CODES.JUNK_FREE]: {
        label: 'Junk-Free Today',
        description: 'No fried food, sugary drinks, or packaged snacks.',
        defaultEnabled: false,
    },
    [exports.TRACKER_CODES.FOOD_LOG]: {
        label: 'Food Log',
        description: 'Meals + calories.',
        defaultEnabled: false,
    },
    [exports.TRACKER_CODES.WEIGHT]: {
        label: 'Weekly Weigh-In',
        description: 'Track weight every Sunday.',
        defaultEnabled: false,
    },
    [exports.TRACKER_CODES.REFLECTION]: {
        label: "Today's Reflection",
        description: 'My letter to Allah.',
        defaultEnabled: true,
    },
};
//# sourceMappingURL=tracker-codes.js.map