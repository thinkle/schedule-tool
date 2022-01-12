<script>
  export let schedule;
  export let priority;
  import { scorePriorityForSched } from "./priorities.js";
  import { rankPriorities } from "./ranker.js";
  let weighted_score = null;
  let raw_score = null;
  $: weighted_score = scorePriorityForSched(
    priority.id,
    schedule,
    $rankPriorities
  );
  $: if (weighted_score) {
    raw_score = weighted_score / $rankPriorities[priority.id].relevance;
  }
</script>

<div class="container">
  <div class="rawbox">
    {priority.score && priority.score(schedule).toFixed(1)}
    {priority.scoreUnit}
  </div>
  {#if weighted_score == null}
    <small>Not weighted</small>
  {:else}
    <div class="scorebox">
      <div class="neg-score" style={`--width:${raw_score}%`} />
      <div class="score">{(100 - raw_score).toFixed(0)}</div>
    </div>
  {/if}
</div>

<style>
  .score {
    position: relative;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    text-align: right;
  }
  div.scorebox {
    width: 100px;
    height: 40px;
    background-color: green;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    color: white;
    font-weight: bold;
  }
  div.neg-score {
    position: absolute;
    right: 0;
    top: 0;
    width: var(--width);
    height: 40px;
    background-color: red;
  }
</style>
