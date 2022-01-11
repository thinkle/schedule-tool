import { writable } from "svelte/store";

export let sched_mode = writable(0);
export let ppm = writable(2);
export let showPriorities = writable(true);
export let showOtherPriorities = writable(false);
export let showAllBlocks = writable(false);
