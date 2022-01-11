<script>
  import PriorityScore from "./PriorityScore.svelte";
  import BlockSummary from "./BlockSummary.svelte";
  import TimeDistribution from "./TimeDistribution.svelte";
  export let schedule;
  import { sortedPriorities } from "./priorities.js";
  import PriorityScores from "./PriorityScores.svelte";
  import { schedules } from "./schedules.js";
  import { scores, maxScore, rankPriorities } from "./ranker.js";
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

  let mainPriorities = [];
  let otherPriorities = [];

  function sortPriorities($allP) {
    mainPriorities = $allP.filter((p) => $rankPriorities[p.id].relevance > 0);
    otherPriorities = $allP.filter((p) => !$rankPriorities[p.id].relevance);
  }

  $: sortPriorities($sortedPriorities);

  import { showPriorities, showOtherPriorities } from "./extra_state.js";
</script>

<h2>{schedule.title}</h2>
<table>
  <tbody>
    <tr>
      <th>Rotation Type</th>
      <td colspan="2">
        {#if schedule.meta.blockType == "Weekday"}
          Day-of-Week Schedule
        {:else}
          {schedule.meta.blockType} Blocks
        {/if}
      </td>
    </tr>
    <tr>
      <th>Class Schedule</th>
      <td colspan="2"><BlockSummary {schedule} /></td>
    </tr>
    {#if mainPriorities.length}
      <tr>
        <th
          class:active={$showPriorities}
          on:click={() => ($showPriorities = !$showPriorities)}
        >
          <span>▶</span>
          Priorities
        </th>
        <td>&nbsp;</td>
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
    {/if}
  </tbody>

  {#if $showPriorities && mainPriorities.length}
    <tbody in:fly|local={{ y: -100 }} out:fly|local={{ y: -100 }}>
      {#each mainPriorities as priority (priority.id)}
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
  {#if otherPriorities.length}
    <tr>
      <th
        class:active={$showOtherPriorities}
        on:click={() => ($showOtherPriorities = !$showOtherPriorities)}
      >
        <span>▶</span>
        Other Factors
      </th>
      <td colspan="2" />
    </tr>
  {/if}
  {#if otherPriorities.length && $showOtherPriorities}
    <tbody in:fly|local={{ y: -100 }} out:fly|local={{ y: -100 }}>
      {#each otherPriorities as priority (priority.id)}
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

  tr:nth-child(odd) {
    background-color: #efefef;
  }
  th,
  td {
    padding-bottom: 6px;
    padding-top: 6px;
  }
  .right {
    text-align: right;
    width: 100%;
  }
</style>
