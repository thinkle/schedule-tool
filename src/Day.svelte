<script context="module">
  var indexer = 1;
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import { getHourTime, getMinutes } from "./timeUtils.js";
  import BlockEditor from "./BlockEditor.svelte";
  export let showPassing;
  export let timelineMode;
  export let day;
  export let dayindex;

  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 300,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  const dispatch = createEventDispatcher();
  const deleteDay = () => dispatch("delete");
  const copyDay = () => dispatch("copy");
  let id = "day-" + Math.random();
  function emitChange() {
    dispatch("change");
  }
  function addBlock() {
    let lastBlock = day.blocks[day.blocks.length - 1];
    day.blocks.push({
      duration: lastBlock.duration,
      passing: lastBlock.passing,
      block: {},
    });
    emitChange();
  }

  function insertBlockBefore(n) {
    let lastBlock = day.blocks[n];
    day.blocks.splice(n, 0, {
      duration: lastBlock.duration,
      passing: lastBlock.passing,
      block: {},
      id: indexer,
    });
    indexer += 1;
    emitChange();
  }

  function moveUp(n) {
    day.blocks = [
      ...day.blocks.slice(0, n - 1), /// before
      day.blocks[n],
      day.blocks[n - 1],
      ...day.blocks.slice(n + 1),
    ];
    emitChange();
  }
  function moveDown(n) {
    day.blocks = [
      ...day.blocks.slice(0, n),
      day.blocks[n + 1],
      day.blocks[n],
      ...day.blocks.slice(n + 2),
    ];
    emitChange();
  }

  function deleteBlock(index) {
    day.blocks.splice(index, 1);
    emitChange();
  }

  let times = [];
  function calculateTimes(day) {
    times = [];
    let start = day.start || 8 * 60;
    times = [start];
    let lastTime = start;
    day.blocks.forEach((b) => {
      times.push(lastTime + b.duration);
      times.push(lastTime + b.duration + b.passing);
      lastTime = lastTime + b.passing + b.duration;
    });
    times.pop();
  }

  $: calculateTimes(day);
  function add(accumulator, a) {
    return accumulator + a;
  }

  function addIndices(blocks) {
    let indices = [];
    for (let b of blocks) {
      if (!b.id) {
        b.id = indexer;
        indexer += 1;
      } else if (b.id >= indexer) {
        indexer = b.id + 1;
      }
      if (indices.indexOf(b.id) > -1) {
        b.id = indexer;
        indexer += 1;
      }
      indices.push(b.id);
    }
    indexed = true;
  }
  let indexed = false;
  $: addIndices(day.blocks);
  let startTime = getHourTime(day.start || 8 * 60);
  $: {
    let newTime = getMinutes(startTime);
    if (newTime != day.start) {
      day.start = getMinutes(startTime);
      emitChange();
    }
  }
</script>

<div class="m">
  <header>
    <h2>
      <span contenteditable="true" bind:textContent={day.name} on:input>
        {day.name}</span
      >
    </h2>
    <h3>
      ({getHourTime(times[0])}&ndash;{getHourTime(times[times.length - 1])})
    </h3>
    <div class="flex">
      <label for={`repeats${id}`}>&times;</label>
      <input
        id={`repeats${id}`}
        bind:value={day.repeats}
        type="number"
        min="1"
        max="100"
        on:change={emitChange}
      />
    </div>
    <div class="flex">
      <label for={`starttime${id}`}>Start time</label>
      <input
        class="time-input"
        id={`starttime${id}`}
        type="time"
        bind:value={startTime}
      />
    </div>
    <div class="buttonbox">
      <button class="copy" on:click={copyDay}><span /><span /></button>
      <button on:click={deleteDay}>&times;</button>
    </div>
  </header>

  <section class:timeline={timelineMode} style={`height:${day.height}px`}>
    {#if indexed}
      {#each day.blocks as block, blockindex (block.id)}
        <div
          in:receive={{ key: block.id }}
          out:send={{ key: block.id }}
          animate:flip={{ duration: 300 }}
          class="block"
          style={`--voffset:${block.offset}px;--height:${block.height}px`}
        >
          <div class="border">
            {#if blockindex > 0}<button
                class="down"
                on:click={() => moveUp(blockindex)}>↕</button
              >
            {/if}
            <button on:click={() => insertBlockBefore(blockindex)}>+</button>
            <div class="line" />
          </div>
          <BlockEditor
            {dayindex}
            {blockindex}
            {showPassing}
            on:change={emitChange}
            on:delete={() => deleteBlock(blockindex)}
            on:input={emitChange}
          />
        </div>
      {/each}
    {/if}
    <button class="lastAdd" on:click={addBlock}>+</button>
  </section>
</div>

<style>
  .time-input {
    width: initial;
  }
  .time-input::-webkit-calendar-picker-indicator {
    filter: invert(100%);
  }
  .timeline {
    position: relative;
  }
  .timeline .block {
    position: absolute;
    top: var(--voffset);
    height: var(--height);
    display: flex;
    flex-direction: column;
  }
  .lastAdd {
    margin-left: auto;
    margin-right: auto;
  }
  .timeline .lastAdd {
    position: absolute;
    bottom: 0;
    left: calc(50% - 1em);
  }
  .copy {
    position: relative;
  }
  .copy span {
    display: inline-block;
    width: 0.7em;
    height: 1.1em;
    border: 1px solid black;
    border-radius: 2px;
    position: absolute;
    top: 4px;
    left: 7px;
  }
  .copy span:nth-child(2) {
    position: absolute;
    top: 8px;
    left: 11px;
    border-color: #333;
  }
  label {
    font-size: var(--labelSize);
  }
  h2,
  h3 {
    margin: 0;
  }
  header {
    position: sticky;
    top: 0;
    background-color: black;
    color: white;
    padding: 2px;
    z-index: 10;
  }
  header h2 {
    padding-right: 4em;
    margin: 0;
  }
  header h3 {
    font-size: small;
  }
  header .buttonbox {
    position: absolute;
    right: 0;
    top: 0;
    margin: 3px;
  }
  div.m {
    display: flex;
    flex-direction: column;
  }
  .buttonbox {
    display: flex;
  }
  button {
    height: 2em;
    width: 2em;
    border-radius: 50%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  input {
    width: 3em;
    margin-bottom: 0;
  }
  .flex {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  header input {
    background-color: #222;
    color: #fefefe;
    font-size: 80%;
  }
  .line {
    width: 100%;
    height: 0px;
    transition: border-bottom-color 300ms;
    border-bottom: 2px dotted #777;
  }
  .border:hover .line {
    border-bottom-color: rgb(153, 175, 248);
  }
  .border {
    position: relative;
    height: 0px;
    padding-top: 10px;
    padding-bottom: 10px;
    margin: 0;
  }
  .border button {
    position: absolute;
    left: calc(100% / 2 - 1em);
    top: calc(-1em + 10px);
    width: 2em;
    height: 2em;
    visibility: hidden;
  }
  .border button.up {
    left: 10px;
  }
  .border button.down {
    left: calc(100% - 2em);
  }
  .border:hover button,
  .border button:hover {
    z-index: 8;
    visibility: visible;
  }
</style>
