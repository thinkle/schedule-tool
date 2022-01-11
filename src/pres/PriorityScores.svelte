<script>
  export let compact = false;
  export let schedules;
  export let priority;
  export let highlight = null;
  export let highlightIdeal = false;
  import { rankPriorities } from "./ranker.js";
  let highlightedScore = null;
  let scored = schedules.map((s) => ({
    score: priority.score(s),
    schedule: s,
  }));
  let max = Math.max(...scored.map((s) => s.score));
  let min = Math.min(...scored.map((s) => s.score));
  let range = max - min;
  scored.sort((a, b) => b.score - a.score);
  let last_offset = 1000000;
  let height = 40;
  let i = 0;

  function getOffset(score) {
    return (400 * (score - min)) / range;
  }

  for (let s of scored) {
    s.offset = getOffset(s.score);
    if (last_offset - s.offset < 40) {
      s.voffset = scored[i - 1].voffset + 40;
      if (s.voffset + 40 > height) {
        height = s.voffset + 40;
      }
    } else {
      s.voffset = 0;
    }
    last_offset = s.offset;
    i += 1;
    if (s.schedule.title == highlight) {
      highlightedScore = s.score;
    }
  }
</script>

{#if !compact}
  {#if $rankPriorities[priority.id].relevance}
    {#if priority.binaryScore}
      <div class="center" class:highlightLabel={highlightIdeal}>
        Ideal Value:
        <br />
        <label>
          <input
            name="score"
            type="radio"
            value={0}
            bind:group={$rankPriorities[priority.id].ideal}
          />
          {priority.desc.conName || "No"}
        </label>
        <label>
          <input
            name="score"
            type="radio"
            value={1}
            bind:group={$rankPriorities[priority.id].ideal}
          />
          {priority.desc.proName || "Yes"}
        </label>
      </div>
    {:else}
      <label class="center" class:highlightLabel={highlightIdeal}>
        <span>Ideal value:</span>
        <input
          type="range"
          step={(priority.binaryScore && 1) || 0.1}
          min={scored[scored.length - 1].score}
          max={scored[0].score}
          bind:value={$rankPriorities[priority.id].ideal}
        />
        <input type="number" bind:value={$rankPriorities[priority.id].ideal} />
        <span class="unit">{priority.scoreUnit}</span>
      </label>
    {/if}
  {/if}
{/if}
<div class="scoreboard-container">
  {#if !compact}
    <div class="min">
      {#if priority.desc.conName}
        {priority.desc.conName}
      {:else}
        Not {priority.desc.proName}
      {/if}
    </div>
  {/if}
  <div
    class="scoreboard"
    class:highlight
    class:full={!compact}
    class:compact
    style={`--height:${height}px`}
  >
    {#if $rankPriorities[priority.id].relevance}
      <div
        class="goal score"
        style={`--offset:${getOffset($rankPriorities[priority.id].ideal)}px`}
      />
    {/if}
    {#each scored as scored, i}
      <div
        class="score"
        class:highlight={scored.schedule.title == highlight}
        style={`
        --color:${scored.schedule.color};
        --voffset:${scored.voffset}px;
        --offset:${scored.offset}px;
      `}
      >
        <h4>
          {scored.schedule.short}
          <span>
            {scored.schedule.title}<br />
            {#if priority.binaryScore}
              {#if scored.score}
                ✓
              {:else}
                ☐
              {/if}
            {:else}
              {scored.score.toFixed(1)}
            {/if}
            {priority.scoreUnit}
          </span>
        </h4>
      </div>{/each}
    <div class="scale">
      <div class="lowest">
        {#if priority.binaryScore}
          ☐
        {:else}
          {scored[scored.length - 1].score.toFixed(1)}
        {/if}
      </div>
      <div class="unit">
        {priority.scoreUnit}
      </div>
      <div class="highest">
        {#if priority.binaryScore}
          ✓
        {:else}
          {scored[0].score.toFixed(1)}
        {/if}
      </div>
    </div>
  </div>

  {#if !compact}
    <div class="max">
      {#if priority.desc.proName}
        {priority.desc.proName}
      {:else}
        Pro
      {/if}
    </div>
  {/if}
</div>

<style>
  .scoreboard-container {
    display: flex;
    margin: auto;
    justify-content: center;
  }
  .min {
    text-align: center;
  }
  .max {
    text-align: center;
  }
  .min,
  .max {
    width: auto;
    height: var(--height);
    background-color: #eee;
    color: #232;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 25px;
    padding-right: 25px;
  }
  .scoreboard {
    width: 400px;
    height: 40px;
    border: 1px solid #eee;
    position: relative;
    align-self: center;
    justify-self: center;
    box-sizing: border-box;
    margin-bottom: 40px;
  }
  .scoreboard.full {
    height: var(--height);
    transition: height 300ms;
  }
  .scoreboard .score {
    position: absolute;
    left: calc(var(--offset) - 20px);
    width: 40px;
    height: 40px;
    background-color: var(--color, blue);
    color: white;
    border-radius: 50%;
    display: grid;
    place-content: center;
    z-index: 3;
    top: calc(0.1 * var(--voffset));
    transition: top 300ms;
  }
  .score.highlight {
    z-index: 99;
  }
  .scoreboard.full .score {
    top: var(--voffset);
  }
  h4 {
    width: 2em;
    position: relative;
  }
  h4:hover span {
    display: block;
    position: absolute;
    left: 2em;
    top: 0;
    width: 400px;
    background-color: #333a;
    padding: 15px;
  }

  h4 span {
    display: none;
  }
  .scale {
    position: absolute;
    bottom: -40px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .highlight.compact .score {
    opacity: 0.3;
    font-weight: thin;
    transform: scale(80%);
  }
  .highlight.compact .score.highlight {
    opacity: 1;
    transform: scale(120%);
  }
  .scoreboard .score.goal {
    background-color: transparent;
    border-radius: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 20px solid green;
    border-bottom: none;
    width: 0;
    height: 0;
    z-index: 50;
    pointer-events: none;
  }
  .scoreboard .score.goal::after {
    content: " ";
    display: block;
    position: absolute;
    left: -50px;
    top: -20px;
    width: 100px;
    height: 40px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(34, 218, 80, 0.392),
      transparent
    );
    pointer-events: none;
  }
  .scoreboard.full .score.goal::after {
    height: var(--height);
  }
  .highlight.compact .score.goal {
    opacity: 1;
  }
  .center {
    width: var(--center-label-width);
    margin: auto;
  }
  .highlightLabel {
    border: 8px solid yellow;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 5px;
    margin-top: 5px;
    font-weight: bold;
    font-size: 120%;
  }
  label.center {
    display: grid;
    grid-template-areas: "label range" "number unit";
  }
  label span {
    place-self: start end;
  }
  label input {
    place-self: start end;
  }
  label input[type="range"] {
    place-self: center;
  }
  label input[type="number"] {
    width: 4em;
  }
  label .unit {
    font-size: small;
    place-self: end start;
  }
</style>
