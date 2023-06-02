<script>
  import LinkShortener from './LinkShortener.svelte';

  import ScheduleTable from "./ScheduleTable.svelte";
  import { tick } from "svelte";
  import { fly, fade } from "svelte/transition";
  export let schedule;
  import Day from "./Day.svelte";
  import { getHourTime, getBlockTimes } from "./timeUtils.js";
  import TimeEditor from "./TimeEditor.svelte";
  import BlockListEditor from "./BlockListEditor.svelte";
  import Collapser from "./Collapser.svelte";

  function updateDay() {
    $schedule = $schedule;
  }

  function moveDayEarlier(index) {
    $schedule.days = [
      ...$schedule.days.slice(0, index - 1),
      $schedule.days[index],
      $schedule.days[index - 1],
      ...$schedule.days.slice(index + 1),
    ];
    console.log("Moved", index, "now we got", $schedule.days);
    $schedule = $schedule;
  }

  function removeDay(day) {
    const dindex = $schedule.days.indexOf(day);
    $schedule.days.splice(dindex, 1);
    $schedule = $schedule;
  }

  function getNextName(word) {
    const numMatch = word.match(/(?<num>\d+)$/);
    if (numMatch?.groups?.num) {
      let num = Number(numMatch?.groups?.num) + 1;
      let result = word.replace(/\d+$/, num);
      console.log(result);
      return result;
    }
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const checkOrder = [3, 0, 1, 2, 4];
    const transformers = [
      (d) => d,
      (d) => d.substr(0, 3),
      (d) => (d == "Thursday" ? "Th" : d.substr(0, 1)),
      (d) => d.substr(0, 2),
    ];
    for (let transformer of transformers) {
      for (let dn of checkOrder) {
        let d = days[dn];
        let matchString = transformer(d);
        if (word.match(matchString)) {
          const nextDayIndex = (dn + 1) % days.length;
          return word.replace(matchString, transformer(days[nextDayIndex]));
        }
      }
    }
    const leters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    return word + "-2";
  }
  /*  console.log(getNextName("Day 1"));
  console.log(getNextName("Monday"));
  console.log(getNextName("Day 4"));
  console.log(getNextName("Wed"));
  console.log(getNextName("Tu"));
  console.log(getNextName("W"));
  console.log(getNextName("F"));
*/
  function copyDay(day) {
    const dindex = $schedule.days.indexOf(day);
    let duplicateDay = {};
    duplicateDay.name = getNextName($schedule.days[dindex].name);
    duplicateDay.repeats = 1;
    duplicateDay.blocks = $schedule.days[dindex].blocks.map((b) => ({ ...b }));
    duplicateDay.start = day.start;
    $schedule.days.splice(dindex + 1, 0, duplicateDay);
    console.log("Copied", dindex, "got", $schedule.days);
    $schedule = $schedule;
  }

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
    $schedule = $schedule;
  }

  $: calculateOffsets($schedule, ppm);
  const EDIT = 1;
  const GRID = 2;
  const FLUID = 3;
  let alreadyMounted = false;
  let editMode = EDIT;
  function mounted(node) {
    console.log("Mounted", node, "check out", location.search);
    if (location.search.search(/view/) > -1) {
      editMode = GRID;
      timelineMode = true;
    } else if (location.search.search(/grid/) > -1) {
      editMode = GRID;
      timelineMode = false;
    } else if (location.search.search(/edit/) > -1) {
      editMode = EDIT;
    }
    alreadyMounted = true;
  }

  function updateLocation() {
    if (!alreadyMounted) {
      console.log("Not mounted yet, do not update");
      return;
    }
    console.log("UPDATE LOCATION", editMode);
    let mode = "edit";
    if (editMode == GRID) {
      mode = "grid";
    }
    if (editMode == FLUID) {
      mode = "view";
    }
    history.replaceState("", "", `?${mode}${location.hash}`);
  }

  $: updateLocation(editMode);

  function getHeight(block, s) {
    let maxDuration = 0;
    for (let d of s.days) {
      let dur = 0;
      for (let b of d.blocks) {
        dur += b?.duration || 0;
        dur += b?.passing || 0;
      }
      if (dur > maxDuration) {
        maxDuration = dur;
      }
    }
    return 100 * (block.duration / maxDuration);
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify($schedule));
  }

  let copyContainer;
  async function copyToClipbord() {
    let changedTimeline = false;
    if (timelineMode) {
      timelineMode = false;
      changedTimeline = true;
      await tick();
      console.log("Timeline mode is off");
    }
    console.log(copyContainer);
    let blob = new Blob([copyContainer.innerHTML], { type: "text/html" });
    const item = new ClipboardItem({ "text/html": blob });
    navigator.clipboard.write([item]);
    console.log("Copied!");
    if (changedTimeline) {
      timelineMode = true;
    }
  }

  let showPassing;
  let timelineMode;
  let ppm = 3;
  let showoptions = true;
</script>

<button
  style="grid-area:topfarleft;place-self: center left;"
  on:click={() => (showoptions = !showoptions)}
>
  {#if !showoptions}
    ⋮
  {:else}
    ◂ Hide panel
  {/if}
</button>
{#if showoptions}
  <header use:mounted>
    <Collapser label="Settings">
      <div class="flex">
        {#if editMode == EDIT}
          <input id="sp" type="checkbox" bind:checked={showPassing} />
          <label for="sp">Show passing</label>
        {/if}
      </div>
      <div>
        <div class="flex">
          <input id="tm" type="checkbox" bind:checked={timelineMode} />
          <label for="tm">Timeline</label>
        </div>
        {#if timelineMode}
          <input type="range" bind:value={ppm} step="0.1" min="0.5" max="9" />
        {/if}
      </div>
    </Collapser>
    <Collapser label="Blocks">
      <BlockListEditor {schedule} />
    </Collapser>
    <Collapser label="Time Editor">
      <TimeEditor {schedule} />
    </Collapser>
  </header>
{/if}

<div class="tabs">
  <a
    href="#edit"
    class:active={editMode == EDIT}
    on:click={(e) => {
      editMode = true;
      e.preventDefault();
    }}>Edit</a
  >
  <a
    href="#grid"
    class:active={editMode == GRID}
    on:click={(e) => {
      editMode = GRID;
      e.preventDefault();
    }}>View</a
  >
</div>
<div class="body">
  {#if editMode == EDIT}
    <div id="edit" in:fade>
      {#each $schedule.days as day, i}
        <div in:fly|local={{ x: -200, y: 200 }} out:fade class="day-container">
          {#if i > 0}
            <button class="swap" on:click={() => moveDayEarlier(i)}>↔</button>
          {/if}
          <Day
            {day}
            {showPassing}
            {timelineMode}
            dayindex={i}
            on:change={updateDay}
            on:input={updateDay}
            on:copy={copyDay(day)}
            on:delete={removeDay(day)}
          />
        </div>
      {/each}
    </div>
  {:else if editMode == GRID}
    <div id="view" in:fade>
      <div class="flex-rev-top">
        <div class="controls">
          <LinkShortener></LinkShortener>
          <button on:click={copyToClipbord}
            >Copy schedule <br />to clipboard</button
          >
          <button on:click={copyJson}> Copy JSON </button>
          <label>
            <input id="tm" type="checkbox" bind:checked={timelineMode} />
            Timeline
          </label>
        </div>
        <div class="schedule">
          <h2
            style="text-align:center"
            contenteditable
            bind:textContent={$schedule.title}
          >
            Schedule
          </h2>
          <div bind:this={copyContainer}>
            <h2 style="text-align:center;" class="hide">
              <a href={window.location.href}>{$schedule.title}</a>
            </h2>
            <ScheduleTable {timelineMode} {schedule} pixelsPerMinute={ppm} />
          </div>
        </div>
      </div>
    </div>
  {:else if editMode == FLUID}
    <div class="fluid">
      {#each $schedule.days as day, dn}
        <div class="daycol">
          <header>
            {day.name}
            {#if day.repeats != 1}
              &times;{day.repeats}
            {/if}
          </header>
          {#each day.blocks as block, bn}
            <div
              class="blockrow"
              style={`--height:${getHeight(block, $schedule)};--color:${
                block?.block?.color
              }`}
            >
              {block?.block?.name || "?"}
              <span class="times">{getBlockTimes(day, bn)}</span>
              <span class="dur">({getHourTime(block.duration)})</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tabs {
    grid-area: topleft;
  }
  .day-container {
    position: relative;
  }
  .day-container .swap {
    position: absolute;
    left: -1.5em;
    top: 50px;
    border-radius: 50%;
    width: 1em;
    height: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  table,
  h2 {
    margin: auto;
  }
  td {
    border: 1px solid #777;
    border-collapse: true;
    padding: 5px;
  }
  .tabs {
    border-bottom: 1px solid #999;
    margin-bottom: 2px;
    padding-bottom: 2px;
  }
  .tabs a {
    padding: 2px;
    border: 1px solid #999;
    border-bottom: none;
  }

  a {
    text-decoration: none;
    color: black;
    border-bottom: 2px solid transparent;
    color: #777;
    transition: all 300ms;
  }

  .tabs a.active {
    border-color: #222;
    background-color: #335;
    color: white;
  }
  div#edit {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    gap: 2em;
  }
  .body {
    overflow-y: auto;
    grid-area: main;
  }
  header {
    /* max-width: 350px; */
    grid-area: sidepanel;
  }
  .container {
    min-width: calc(100% - 360px);
    margin: auto;
    grid-area: main;
  }

  /* Fluid layout */
  .fluid {
    display: flex;
    justify-content: center;
    gap: 5px;
  }
  .daycol {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .daycol header {
    text-align: center;
    background-color: black;
    color: white;
    padding: 4px;
    margin: 2px;
  }
  .blockrow {
    height: calc(0.8vh * var(--height));
    min-height: 40px;
    background-color: var(--color);
    margin: 2px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
  }
  .fluid .times {
    font-size: 8pt;
  }
  .fluid .dur {
    font-size: 8pt;
  }
  .flex {
    display: flex;
    gap: 5px;
  }

  .hide {
    display: none;
  }
  .flex-rev-top {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
  }
  .flex-rev-top .schedule {
    margin: auto;
  }
</style>
