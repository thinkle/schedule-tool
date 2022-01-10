<script>
  export let schedule;
  import ScheduleTable from "../ScheduleTable.svelte";
  import Summary from "./Summary.svelte";
  import { writable } from "svelte/store";
  import { sched_mode, ppm } from "./extra_state.js";
  const SUMMARY = 0;
  const GRID = 1;
  const TL = 2;

  let sched = writable(schedule);
  function calculateOffsets(s, pixelsPerMinute) {
    //const pixelsPerBlock = 100 + (showPassing & 20 || 0);
    console.log("Recalculate offsets!", pixelsPerMinute);
    for (let d of s.days) {
      let voffset = 0;
      for (let b of d.blocks) {
        b.offset = voffset;
        voffset += b.duration * pixelsPerMinute;
        b.height = b.duration * pixelsPerMinute;
        voffset += b.passing * pixelsPerMinute;
      }
      d.height = voffset;
    }
    $sched = $sched;
  }

  $: calculateOffsets($sched, $ppm);
</script>

<nav>
  <button
    class:active={$sched_mode == SUMMARY}
    on:click={() => ($sched_mode = SUMMARY)}
  >
    Summary
  </button>
  <button
    class:active={$sched_mode == GRID}
    on:click={() => ($sched_mode = GRID)}
  >
    Grid
  </button>
  <button class:active={$sched_mode == TL} on:click={() => ($sched_mode = TL)}>
    Timeline
  </button>
</nav>
{#if $sched_mode == SUMMARY}
  <Summary {schedule} />
{:else if $sched_mode == TL}
  Stretch: <input type="range" bind:value={$ppm} min="1" max="4" step="0.05" />
  <ScheduleTable
    pixelsPerMinute={$ppm}
    timelineMode={true}
    compactMode={true}
    schedule={sched}
  />
{:else}
  <ScheduleTable
    pixelsPerMinute={$ppm}
    timelineMode={false}
    compactMode={true}
    schedule={writable(schedule)}
  />
{/if}

<style>
  .pro-con {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  .pro-con ul {
    max-width: 40em;
  }
  button {
    color: #777;
  }
  .active {
    background-color: black;
    color: white;
  }
  main {
    display: grid;
    grid-template-areas: "left center right";
    grid-auto-columns: 200px auto 200px;
    gap: 20px;
    --center-label-width: 150px;
    --active-pref-color: #222;
    --left-pad: 0px;
    --right-pad: 0px;
  }
  main *:nth-child(1) {
    grid-area: left;
  }
  main *:nth-child(2) {
    grid-area: right;
  }
  main *:nth-child(3) {
    grid-area: center;
  }
  label.center {
    margin-bottom: 24px;
    margin-left: auto;
    margin-right: auto;
    width: var(--center-label-width);
  }
  label.center input {
    width: 100%;
  }
  section {
    background-color: var(--color);
    padding-left: var(--left-pad);
    margin-left: calc(-1 * var(--left-pad));
    padding-left: var(--right-pad);
    margin-right: calc(-1 * var(--right-pad));
  }
  section > div {
    background-color: white;
    margin: 10px;
    border-radius: 15px;
    margin: 20px;
    padding-left: calc(40px + var(--left-pad, 0));
    padding-right: calc(40px + var(--right-pad, 0));
  }
</style>
