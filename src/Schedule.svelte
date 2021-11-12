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
  let editMode = true;
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
        class:active={editMode}
        on:click={(e) => {
          editMode = true;
          e.preventDefault();
        }}>Edit</a
      >
      <a
        href="#view"
        class:active={!editMode}
        on:click={(e) => {
          editMode = false;
          e.preventDefault();
        }}>View</a
      >
    </div>
    <div class="body">
      {#if editMode}
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
      {:else}
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
                  {/if}
                {/each}
              </tr>
            {/each}
          </table>
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
  a {
    text-decoration: none;
    color: black;
    border-bottom: 2px solid transparent;
    color: #777;
    transition: all 300ms;
  }
  a.active {
    border-color: black;
    color: black;
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
</style>
