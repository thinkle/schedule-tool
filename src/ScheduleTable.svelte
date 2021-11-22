<script context="module">
  let ref = {};
</script>

<script>
  export let schedule;
  export let timelineMode;
  export let measuringStick;
  export let pixelsPerMinute;
  import { getHourTime, getBlockTimes } from "./timeUtils.js";

  const EDIT = 1;
  const GRID = 2;
  const FLUID = 3;
  let alreadyMounted = false;
  let editMode = EDIT;

  let blockCountList = [];
  function updateBlocks(days) {
    for (let d of days) {
      while (d.blocks.length > blockCountList.length) {
        blockCountList.push({});
      }
    }
  }
  $: updateBlocks($schedule.days);
  let colWidth;
  let tableHeight;
  let tableWidth;
  $: if (measuringStick) {
    ref.colWidth = colWidth;
    ref.tableHeight = tableHeight;
    ref.tableWidth = tableWidth;
    console.log("We measure!", ref);
  }
  $: colWidth = tableWidth / $schedule.days.length;

  let startTime = 7 * 60;
  $: try {
    startTime = $schedule.days[0].start || 8 * 60;
    console.log("We start at...", startTime);
  } catch (err) {
    console.log("No start block?");
  }
  let hourOffsets = [];
  function calculateHours() {
    console.log("Calc offsets", startTime);
    hourOffsets = [];
    let startHour = Math.floor(startTime / 60);
    console.log("start hour", startHour);
    for (let h = 0; h < 8; h++) {
      let hour = startHour + h;
      let offset = (hour * 60 - startTime) * pixelsPerMinute;
      hourOffsets.push({
        name: getHourTime(hour * 60),
        offset,
        minor: false,
      });
      for (let minor = 15; minor < 60; minor += 15) {
        hourOffsets.push({
          name: getHourTime(hour * 60 + minor),
          offset: (hour * 60 - startTime + minor) * pixelsPerMinute,
          minor: true,
        });
      }
    }
  }

  $: calculateHours(pixelsPerMinute, startTime);
</script>

<table
  class:measuringStick
  class:timeline={timelineMode}
  bind:clientWidth={tableWidth}
  bind:clientHeight={tableHeight}
  style={`--column-width:${ref.colWidth || colWidth}px;--table-height:${
    ref.tableHeight || tableHeight
  }px`}
>
  <thead>
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
  </thead>
  <tbody
    style={`--height:${Math.max(
      ...$schedule.days.map((d) => d.height)
    )}px;width:100%;`}
  >
    {#each blockCountList as placeholder, i}
      <tr>
        {#each $schedule.days as day, dn}
          {#if day.blocks[i]}
            <td
              style={`--left:${
                (100 * dn) / $schedule.days.length
              }%;background-color:${day.blocks[i].block?.color};color:${
                day.blocks[i].block?.textcolor
              };--offset:${day.blocks[i].offset}px;--height:${
                day.blocks[i].height
              }px`}
            >
              {day.blocks[i]?.block?.name || ""}
              <br />{getBlockTimes(day, i)}
              <br />({getHourTime(day.blocks[i].duration)})
            </td>
          {:else}
            <td class="empty">&nbsp;</td>
          {/if}
        {/each}
      </tr>
    {/each}
    {#if timelineMode}
      <div class="time-ruler">
        {#each hourOffsets as hour}
          <div
            class="hour"
            style={`--offset:${hour.offset}px`}
            class:minor={hour.minor}
          >
            <span>{hour.name}</span>
          </div>
        {/each}
      </div>
    {/if}
  </tbody>
</table>

{#if timelineMode}
  <svelte:self measuringStick={true} timelineMode={false} {schedule} />
{/if}

<style>
  .time-ruler {
    position: absolute;
    top: 0;
    left: -80px;
    --width: 75px;
    --height: 15px;
  }
  .time-ruler > div {
    top: var(--offset);
    position: absolute;
    z-index: 2;
  }
  .time-ruler span {
    position: relative;
    z-index: 2;
    width: var(--width);
    height: calc(2 * var(--height));
    top: calc(-1 * var(--height));
    text-align: center;
    color: white;
    display: inline-grid;
    place-content: center;
    padding-right: var(--height);
    box-sizing: border-box;
  }
  /* Arrow */
  .time-ruler div::after {
    position: absolute;
    content: " ";
    width: var(--width);
    top: calc(-1 * var(--height));
    border-bottom: var(--height) solid #444;
    border-right: var(--height) solid transparent;
    box-sizing: border-box;
    right: 0;
  }
  .time-ruler div::before {
    position: absolute;
    top: 0;
    content: " ";
    right: 0;
    width: var(--width);
    border-top: var(--height) solid #444;
    border-right: var(--height) solid transparent;
    box-sizing: border-box;
  }
  .minor {
    --height: 10px;
    --width: 65px;
  }
  .time-ruler > .minor {
    z-index: 1;
  }
  .time-ruler .minor::before {
    border-top-color: #aaa;
  }
  .time-ruler .minor::after {
    border-bottom-color: #aaa;
  }
  .time-ruler .minor {
    font-size: 75%;
  }

  table {
    margin: auto;
  }
  table,
  td {
    border: 1px solid #777;
    border-collapse: true;
    padding: 5px;
  }

  .timeline thead th {
    width: var(--column-width, 200px);
  }
  .timeline tbody {
    position: relative;
    height: var(--height);
    width: 100%;
    display: block;
  }
  .timeline tr {
    width: 100%;
    display: block;
  }
  .timeline td {
    min-height: var(--height);
  }
  .timeline td {
    overflow: hidden;
  }
  .timeline td:hover {
    overflow: visible;
    font-weight: bold;
    z-index: 10;
  }
  .timeline td {
    position: absolute;
    top: var(--offset);
    left: var(--left);
    height: var(--height);
    width: var(--column-width, 200px);
    box-sizing: border-box;
  }
  .timeline td.empty {
    visibility: hidden;
  }
  .measuringStick {
    visibility: hidden;
    position: relative;
    top: calc(-1 * var(--table-height));
    pointer-events: none;
  }
</style>
