import { writable, derived } from "svelte/store";
import { priorities } from "./priorities.js";

export let mode = writable("OVERVIEW");
export let activeSched = writable("1");
export let activePri = writable("block-length");

let rankPrioritiesDictionary = {};
for (let p of priorities) {
  rankPrioritiesDictionary[p.id] = {
    relevance: 0,
    ideal: p.defaultIdeal,
  };
}
export let scores = writable({});
export let rankPriorities = writable(rankPrioritiesDictionary);
export let maxScore = derived([scores], ([scores]) => {
  return Math.max(...Object.values(scores));
});
