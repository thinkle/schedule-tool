<script>
  export let priority;
  export let highlightIdeal = false;
  import Ranker from "./Ranker.svelte";

  import PriorityScores from "./PriorityScores.svelte";
  import { schedules } from "./schedules.js";

  import { rankPriorities, activePri } from "./ranker.js";
</script>

<div class="bar">
  <h3>
    <span class="title">{priority.title}</span>
    {priority?.desc?.proName}
    {#if priority?.desc?.conName}
      vs. {priority?.desc?.conName}{/if}
  </h3>
  <Ranker pid={priority.id} />
</div>
<p>{priority.desc.description || ""}</p>
<div class="pro-con">
  {#if priority.desc.cons && priority.desc.cons.length}
    <div>
      <h3>
        {#if priority.desc.conName}
          Pro {priority.desc.conName}
        {:else}
          Con
        {/if}
      </h3>
      <ul>
        {#each priority.desc.cons as con}
          <li>{con}</li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if priority.desc.pros && priority.desc.pros.length}
    <div>
      <h3>Pro {priority.desc.proName}</h3>

      <ul>
        {#each priority.desc.pros as pro}
          <li>{pro}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
{#if priority.score}
  <PriorityScores {priority} {schedules} {highlightIdeal} />
{/if}

<style>
  .pro-con {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  .pro-con ul {
    max-width: 40em;
  }

  .bar {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    align-items: center;
  }
  .title {
    font-weight: normal;
    color: #888;
  }
</style>
