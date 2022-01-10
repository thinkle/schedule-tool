<script>
  import PriorityScore from "./PriorityScore.svelte";
  import BlockSummary from "./BlockSummary.svelte";
  import TimeDistribution from "./TimeDistribution.svelte";
  export let schedule;
  import { sortedPriorities } from "./priorities.js";
  import PriorityScores from "./PriorityScores.svelte";
  import { schedules } from "./schedules.js";
  import { scores, maxScore } from "./ranker.js";
  import { fly } from "svelte/transition";
  import { mode, activePri } from "./ranker.js";
  function sortSchedule(schedule) {
    let blocks = schedule.blocks;
    blocks.sort((a, b) => {
      if (a.name.length == 1 && b.name.length > 1) {
        return -1;
      } else if (a.name.length > 1 && b.name.length == 1) {
        return 1;
      }
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }
    });
  }

  $: sortSchedule(schedule);
  import { showPriorities } from "./extra_state.js";
</script>

<h2>{schedule.title}</h2>
<table>
  <tr>
    <th>Rotation Type</th>
    <td>
      {#if schedule.meta.blockType == "Weekday"}
        Day-of-Week Schedule
      {:else}
        {schedule.meta.blockType} Blocks
      {/if}
    </td>
  </tr>
  <tr>
    <th>Class Schedule</th>
    <td><BlockSummary {schedule} /></td>
  </tr>
  <tr>
    <th
      class:active={$showPriorities}
      on:click={() => ($showPriorities = !$showPriorities)}
    >
      <span>▶</span>
      Priorities
    </th>
    <td>
      {#if $scores[schedule.title]}
        <div class="right">
          Overall Score {(
            100 -
            (100 * $scores[schedule.title]) / $maxScore
          ).toFixed(0)}
        </div>
      {/if}
    </td>
  </tr>
  {#if $showPriorities}
    <tbody in:fly|local={{ y: -100 }} out:fly|local={{ y: -100 }}>
      {#each $sortedPriorities as priority (priority.id)}
        {#if priority.score}
          <tr>
            <td
              class="clickable"
              on:click={() => {
                $mode = "PRI";
                $activePri = priority.id;
              }}
            >
              {priority.desc.proName}
            </td>
            <td>
              <PriorityScores
                compact={true}
                {schedules}
                {priority}
                highlight={schedule.title}
              />
            </td>
            <td>
              <PriorityScore {schedule} {priority} />
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  {/if}
  <tr>
    <th>Time Distribution</th>
    <td><TimeDistribution {schedule} /></td>
  </tr>
</table>

<style>
  th span {
    display: inline-block;
    transition: transform 300ms;
  }
  th.active span {
    transform: rotate(90deg);
  }
  .right {
    text-align: right;
    width: 100%;
  }
</style>
