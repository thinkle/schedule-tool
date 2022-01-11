<script>
  import { fly, fade } from "svelte/transition";
  import Priority from "./Priority.svelte";
  import Ranker from "./Ranker.svelte";
  import ScheduleNav from "./ScheduleNav.svelte";
  import PriorityScores from "./PriorityScores.svelte";
  import { schedules } from "./schedules.js";
  import { priorities } from "./priorities.js";
  import { rankPriorities, mode, activePri, activeSched } from "./ranker.js";
  let step = 0;

  let npriorities = 0;
  $: npriorities = priorities.filter(
    (p) => $rankPriorities[p.id].relevance > 0
  ).length;
</script>

<section>
  {#if step > 0}<button class="prev" on:click={() => (step -= 1)}>Prev</button
    >{/if}
  {#if step <= npriorities}
    <button class="next" on:click={() => (step += 1)}>Next</button>
  {/if}
  {#if step == 0}
    <h2>Deciding on Schedules starts with setting priorities...</h2>
    <p>Choose the factors you want to consider below.</p>
    {#if npriorities >= 1 && step == 0}
      <div class="next-hint">
        When you're done, click next!
        <span class="arrow">↑</span>
      </div>
    {/if}
    <div class="instructions">
      {#if npriorities <= 1}
        <p in:fly={{ x: -50 }}>
          First, check the {#if npriorities}boxes{:else}box{/if} next to the {#if npriorities}factors{:else}factor{/if}
          you care most about.
        </p>
      {/if}
      {#if npriorities > 1}
        <p in:fly={{ x: -50 }}>
          <em
            >You can use the up arrow to increase the priority of items you
            would like to weight more heavily in your calculation.</em
          >
        </p>
      {/if}
      <span class="arrow">↓</span>
    </div>
    {#each priorities as priority}
      <div class="row">
        <h2>
          {priority.desc.proName}
          {#if priority.desc.conName}
            vs. {priority.desc.conName}
          {/if}
        </h2>
        <div class="ranker"><Ranker pid={priority.id} /></div>
      </div>
    {/each}
  {/if}
  {#if step > 0 && step <= npriorities}
    <p>
      Now let's step through each of your {priorities.filter(
        (p) => $rankPriorities[p.id].relevance > 0
      ).length} priorities one at a time... for each priority, select an
      <b>ideal value</b> and then click next.
    </p>
    <p>On step {step} of {npriorities}</p>

    {#each priorities.filter((p) => $rankPriorities[p.id].relevance > 0) as priority, n}
      {#if n == step - 1}
        <Priority {priority} highlightIdeal={true} />
      {/if}
    {/each}
  {/if}
  {#if step > npriorities && npriorities >= 1}
    <p>Nice! You're done ranking your priorities.</p>
    <p>
      Now take a look at the schedules recommended based on your priorities. You
      can adjust priorities to see the order of schedules recommended shuffle
      around.
    </p>
    <p><b>Click on a schedule to jump to it!</b></p>
    <div class="center">
      <ScheduleNav buttonStyle={true} />
    </div>
  {/if}
</section>

<style>
  .center {
    width: 200px;
    margin: auto;
  }
  .row:nth-child(even) {
    background-color: #efefef;
  }
  .row:nth-child(odd) {
    background-color: #fefefe;
  }
  .row {
    display: flex;
    min-height: 50px;
    padding-bottom: 6px;
    padding-top: 6px;
    align-items: center;
    justify-content: space-between;
  }
  .instructions {
    display: flex;
    margin-left: auto;
    flex-direction: column;
    max-width: 300px;
    margin-top: 12px;
  }
  p {
    margin: 0;
    margin-bottom: 8px;
  }
  .arrow {
    font-size: 200%;
    text-align: right;
  }
  section {
    position: relative;
    padding-top: 42px;
    --center-label-width: 400px;
  }
  button.next {
    position: absolute;
    right: 5px;
    top: 5px;
  }
  button.prev {
    position: absolute;
    left: 5px;
    top: 5px;
  }
  .next-hint {
    width: 250px;
    text-align: right;
    margin-left: auto;
    margin-right: 20px;
  }
  h2 {
    margin: 0;
  }
  .instructions .arrow {
    position: relative;
    top: -16px;
  }

  .ranker {
    width: min(40vw, 240px);
    margin-left: auto;
    display: flex;
    justify-content: flex-end;
  }
  .row h2 {
    max-width: min(60vw, 100% - 240px);
  }
</style>
