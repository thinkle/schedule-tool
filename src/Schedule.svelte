<script>
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
    $schedule.days.splice(dindex + 1, 0, duplicateDay);
    console.log("Copied", dindex, "got", $schedule.days);
    $schedule = $schedule;
  }
  let blockCountList = [];
  function updateBlocks(days) {
    for (let d of days) {
      while (d.blocks.length > blockCountList.length) {
        blockCountList.push({});
      }
    }
  }

  $: updateBlocks($schedule.days);
  const EDIT = 1;
  const GRID = 2;
  const FLUID = 3;
  let editMode = EDIT;

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
</script>

<main>
  <header>
    <Collapser label="Blocks">
      <BlockListEditor {schedule} />
    </Collapser>
    <Collapser label="Time Editor">
      <TimeEditor {schedule} />
    </Collapser>
  </header>
  <div class="container">
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
        href="#fluid"
        class:active={editMode == FLUID}
        on:click={(e) => {
          editMode = FLUID;
          e.preventDefault();
        }}>View (Proportional)</a
      >
      <a
        href="#grid"
        class:active={editMode == GRID}
        on:click={(e) => {
          editMode = GRID;
          e.preventDefault();
        }}>View Table</a
      >
    </div>
    <div class="body">
      {#if editMode == EDIT}
        <div id="edit" in:fade>
          {#each $schedule.days as day, i}
            <div in:fly|local={{ x: -200, y: 200 }} out:fade>
              <Day
                {day}
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
          <h2>Schedule</h2>
          <table>
            <tr>
              {#each $schedule.days as day}
                <th
                  >{day.name}
                  {#if day.repeats != 1}
                    &times;{day.repeats}
                  {/if}
                </th>
              {/each}
            </tr>
            {#each blockCountList as placeholder, i}
              <tr>
                {#each $schedule.days as day}
                  {#if day.blocks[i]}
                    <td
                      style={`background-color:${day.blocks[i].block?.color}`}
                    >
                      {day.blocks[i]?.block?.name || ""}
                      <br />{getBlockTimes(day, i)}
                      <br />({getHourTime(day.blocks[i].duration)})
                    </td>
                  {:else}
                    <td>&nbsp;</td>
                  {/if}
                {/each}
              </tr>
            {/each}
          </table>
        </div>
      {:else if editMode == FLUID}
        <div class="fluid">
          {#each $schedule.days as day, dn}
            <div class="daycol">
              <header>
                {day.name}
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
  </div>
</main>

<style>
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
    background-color: #339;
    color: white;
  }
  div#edit {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    gap: 1em;
  }
  .body {
    max-height: 90vh;
    overflow-y: auto;
  }
  header {
    max-width: 350px;
  }
  .container {
    min-width: calc(100% - 360px);
  }

  /* Fluid layout */
  .fluid {
    display: flex;
    justify-content: center;
  }
  .daycol {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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
</style>
