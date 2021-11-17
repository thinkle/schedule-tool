<script context="module">
  let ref = {};
</script>

<script>
  export let schedule;
  export let timelineMode;
  export let measuringStick;
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
  </tbody>
</table>
{#if timelineMode}
  <svelte:self measuringStick={true} timelineMode={false} {schedule} />
{/if}

<style>
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
