<script>
  export let schedule;
  import { showAllBlocks } from "./extra_state.js";
</script>

<div class="wrap">
  <button
    class:active={$showAllBlocks}
    on:click={() => ($showAllBlocks = !$showAllBlocks)}
  >
    ▶
  </button>
  <div class="block-summary">
    {#each schedule.blocks.filter((b) => b.academic) as block, n}
      {#if $showAllBlocks || n == 0}
        <b>{block.name}</b>
        <div class="time-row">
          {#if block.name == "Choice" && schedule.meta.choiceOverlay}
            {#each schedule.meta.choiceOverlay as choice}
              <div class="day">
                {#if choice}
                  <div
                    class="meeting"
                    style={`--duration:${choice / 3}px;--color:${block.color}`}
                  >
                    {choice}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
            {#each schedule.days as day}
              <div class="day">
                {#each day.blocks.filter((b) => b.block.name == block.name) as dayblock}
                  <div
                    class="meeting"
                    style={`--duration:${dayblock.duration / 3}px;--color:${
                      block.color
                    }`}
                  >
                    {dayblock.duration}
                  </div>
                {/each}
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .wrap {
    display: flex;
  }
  button {
    margin-top: 1em;
    background-color: none;
    border: none;
    transform: rotate(0deg);
    transition: transform 300ms;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    display: grid;
    place-content: center;
  }
  button.active {
    transform: rotate(90deg);
  }
  .block-summary {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto;
    max-width: 800px;
  }

  .time-row {
    display: flex;
  }
  .time-row .day {
    display: flex;
    margin: 3px;
    width: 1em;
    align-self: flex-end;
    justify-self: center;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid #ccc;
  }
  .time-row .meeting {
    width: 0.5em;
    height: var(--duration);
    background-color: var(--color);
    color: var(--color);
    border: 2px solid #777;
    border-radius: 3px;
    overflow: hidden;
  }
  .time-row .meeting:hover {
    color: black;
    overflow: initial;
  }
  b {
    place-self: end;
  }
</style>
