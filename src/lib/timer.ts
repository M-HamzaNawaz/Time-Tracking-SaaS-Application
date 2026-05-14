// A running timer is considered stale (e.g. the user closed their browser
// without stopping it) once it has been open longer than this. Stale timers
// are auto-closed with their duration capped at this value.
export const STALE_TIMER_HOURS = 12;
export const STALE_TIMER_SECONDS = STALE_TIMER_HOURS * 60 * 60;
