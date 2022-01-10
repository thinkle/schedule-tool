<script>
  import Priority from "./Priority.svelte";

  import ProcessOverview from "./ProcessOverview.svelte";

  import SchedulePresentation from "./SchedulePresentation.svelte";

  import PriorityNav from "./PriorityNav.svelte";
  import Ranker from "./Ranker.svelte";
  import ScheduleNav from "./ScheduleNav.svelte";

  import PriorityScores from "./PriorityScores.svelte";
  import { schedules } from "./schedules.js";
  import { priorities } from "./priorities.js";
  import { rankPriorities, mode, activePri, activeSched } from "./ranker.js";

  $: if (!$rankPriorities[$activePri].relevance) {
    $rankPriorities[$activePri].relevance = 0;
  } else if ($rankPriorities[$activePri].relevance == true) {
    $rankPriorities[$activePri].relevance = 1;
  }
</script>

<main>
  {#if $mode != "OVERVIEW"}
    <PriorityNav />
    <ScheduleNav />
  {:else}
    <nav />
    <nav />
  {/if}
  <section
    style={`--color:${
      ($mode == "SCHED" &&
        schedules.find((s) => s.short == $activeSched).color) ||
      "var(--active-pref-color)"
    };
      ${($mode == "SCHED" && "--right-pad:20px") || "--left-pad:20px"}
    `}
  >
    <div>
      <ul class="tabs">
        <button
          class:active={$mode == "OVERVIEW"}
          on:click={() => {
            $mode = "OVERVIEW";
          }}
        >
          Overview</button
        >
        <button
          class:active={$mode == "SCHED"}
          on:click={() => {
            $mode = "SCHED";
          }}>Schedules</button
        >
        <button
          class:active={$mode == "PRI"}
          on:click={() => {
            $mode = "PRI";
          }}>Priorities</button
        >
      </ul>
      {#if $mode == "OVERVIEW"}
        <ProcessOverview />
      {/if}
      {#if $mode == "PRI"}
        {#each priorities as priority}
          {#if priority?.id == $activePri}
            <div key={priority.id}>
              <Priority {priority} />
            </div>
          {/if}
        {/each}
      {/if}
      {#if $mode == "SCHED"}
        {#each schedules as schedule}
          {#if schedule.short == $activeSched}
            <div key={schedule.title}>
              <SchedulePresentation {schedule} />
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </section>
</main>

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
    transition: background-color 300ms;
  }
  section > div {
    background-color: white;
    margin: 10px;
    border-radius: 15px;
    margin: 20px;
    padding-left: calc(40px + var(--left-pad, 0));
    padding-right: calc(40px + var(--right-pad, 0));
  }
  .bar {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    align-items: center;
  }
</style>
