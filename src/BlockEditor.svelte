<script>
  export let dayindex;
  export let blockindex;
  import { schedule } from "./blocks";
  import { getBlockTimes } from "./timeUtils";
  import { createEventDispatcher } from "svelte";
  export let showPassing;
  import { fly, fade } from "svelte/transition";
  const dispatch = createEventDispatcher();
  const deleteBlock = () => dispatch("delete");

  let block;

  $: try {
    block = $schedule.days[dayindex].blocks[blockindex];
  } catch (err) {
    console.log("Weird no block");
    block = null;
  }
  function update() {
    console.log("Update", block);
    $schedule.days[dayindex].blocks[blockindex] = block;
    $schedule = $schedule;
  }
  let id = `d${dayindex}-b${blockindex}`;
  let active;
</script>

{#if block}
  <div
    class:active
    class="block"
    style={`--color:${block?.block?.color || "white"};--textcolor:${
      block?.block?.textcolor || "black"
    }`}
    on:click={() => (active = true)}
    on:mouseout={() => (active = false)}
    on:blur={() => (active = false)}
  >
    <button on:click={deleteBlock} class="deleteButton">&times;</button>
    <header>{getBlockTimes($schedule.days[dayindex], blockindex)}</header>
    <div class="flex">
      <div>
        <label for={`b${id}`}>Block</label><select
          bind:value={block.block}
          on:change
          id={`b${id}`}
        >
          <option value={undefined}>-</option>
          {#each $schedule.blocks as b}
            <option value={b}>{b.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for={`d${id}`}>Duration:</label><input
          id={`d${id}`}
          bind:value={block.duration}
          on:change={update}
          type="number"
        />
      </div>
    </div>
  </div>
  {#if showPassing}
    <div class="passing" in:fly|local={{ y: -50 }} out:fade|local>
      <label for={`p${id}`}>Passing time:</label>
      <input
        bind:value={block.passing}
        on:change={update}
        type="number"
        id={`p${id}`}
      />
    </div>
  {/if}
{/if}

<style>
  div {
    overflow: hidden;
  }
  div:hover,
  div.active {
    overflow: visible;
    position: relative;
    z-index: 5;
  }
  .flex {
    display: flex;
  }
  header {
    text-align: center;
    font-size: var(--labelSize);
  }
  div {
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 2px;
  }
  .passing {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
  }
  div.block {
    background-color: var(--color);
    color: var(--textcolor);
    border-color: black;
    position: relative;
    height: 100%;
  }
  label {
    font-size: var(--labelSize);
  }
  input {
    width: 3em;
  }
  select {
    font-size: 10pt;
  }
  .deleteButton {
    position: absolute;
    right: 1px;
    top: 1px;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
