<script>
  export let buttonStyle = false;
  import { sortedSchedules } from "./schedules.js";
  import { scorePriorityForSched } from "./priorities.js";
  import {
    rankPriorities,
    mode,
    activeSched,
    scores,
    maxScore,
  } from "./ranker.js";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  function scoreSchedule(sched) {
    let score = 0;
    for (let pid in $rankPriorities) {
      let val = scorePriorityForSched(pid, sched, $rankPriorities);
      if (val) {
        score += val;
      }
    }
    $scores[sched.title] = score;
    return score;
  }

  function sortSchedules(ranked) {
    console.log("Sort them!");
    $sortedSchedules.map(scoreSchedule);
    $sortedSchedules.sort((a, b) => {
      return $scores[a.title] - $scores[b.title];
    });
    $sortedSchedules = $sortedSchedules;
  }

  $: sortSchedules($rankPriorities);
</script>

<nav class:buttonStyle>
  <h4>Schedules</h4>
  <ul>
    {#each $sortedSchedules as schedule (schedule.title)}
      <li
        class:clickable={$mode != "SCHED" || $activeSched != schedule.short}
        in:receive={{ key: schedule.short }}
        out:send={{ key: schedule.short }}
        animate:flip
        class:active={$mode == "SCHED" && $activeSched == schedule.short}
        style={`--color:${schedule.color}`}
      >
        <button
          style={`background-color:${schedule.color}`}
          on:click={() => {
            $activeSched = schedule.short;
            $mode = "SCHED";
          }}
        >
          {schedule.short}: {schedule.title}
        </button>

        {#if $scores[schedule.title]}
          <div class="badge">
            {(100 - (100 * $scores[schedule.title]) / $maxScore).toFixed(0)}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    margin-top: 64px;
  }
  ul {
    list-style: none;
  }
  li {
    margin-bottom: 15px;
  }
  li button {
    width: 100%;
    color: white;
    text-shadow: 1px 1px solid black;
    border: none;
  }
  ul {
    border-left: 1px solid #888;
    padding-left: 0;
  }
  li {
    border-right: 3px solid transparent;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    background-color: var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
  }
  li.active {
    font-weight: bold;
    border-color: var(--color);
    border-left: 3px solid var(--color);
    margin-left: -1px;
  }
  .buttonStyle li {
    border-radius: 5px;
    border: 1px solid #888;
  }
  .buttonStyle ul {
    border-left: none;
  }
  .badge {
    border-radius: 50%;
    background-color: white;
    color: var(--color);
    font-weight: bold;
    font-size: 24px;
    height: 32px;
    width: 32px;
    display: grid;
    place-content: center;
  }
</style>
