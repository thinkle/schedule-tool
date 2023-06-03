<script>
  import { getHourTime } from "./timeUtils.js";
  import { addBlock } from "./blocks.js";

  export let schedule;
  function updateS() {
    $schedule = $schedule;
  }
  function calculateBlockTotals(days) {
    academicTime = 0;
    const dayProportions = [];
    let totalDays = 0;
    days.map((d) => (totalDays += d.repeats));
    console.log(`${totalDays} total days`);
    for (let b of $schedule.blocks) {
      b.total = 0;
    }
    for (let d of days) {
      for (let b of d.blocks) {
        if (b.block) {
          const dayProportion = d.repeats / totalDays;
          b.block.total += b.duration * dayProportion;
          if (b.block.academic) {
            academicTime += b.duration * dayProportion;
          }
        }
      }
    }
  }

  $: calculateBlockTotals($schedule.days);

  const blockTotals = {};

  function doAddBlock() {
    addBlock($schedule.blocks);
    $schedule = $schedule;
  }

  function deleteBlock(block) {
    $schedule.blocks.splice($schedule.blocks.indexOf(block), 1);
    $schedule = $schedule;
  }
  let expand;
  let academicTime = 0;
  let colors = false;
</script>

<table class:expand class:colors>
  <thead>
    <tr>
      <th>Block</th><th colspan="3">
        <button class="dets" on:click={() => (colors = !colors)}
          >c <span class="tt small">Edit colors</span>
        </button>
        <button class="clock" on:click={() => (expand = !expand)}
          >⧗ <span class="tt small">Show time calculations</span></button
        ></th
      >
    </tr>
    <tr>
      <th>&nbsp;</th>{#if expand}<th /><th>Per Day</th><th>Per Week</th><th
          >Per Year</th
        >{/if}
    </tr>
  </thead>
  <tbody>
    {#each $schedule.blocks as block}
      <tr style={`--color:${block.color};--textcolor:${block.textcolor}`}
        ><td>
          <div>
            <span
              class="name"
              bind:textContent={block.name}
              on:input={updateS}
              contenteditable="true"
            />
            {#if colors}
              <div>
                Color: <input bind:value={block.color} type="color" />
                Text: <input bind:value={block.textcolor} type="color" />
              </div>
            {/if}
          </div>
          <button
            on:click={function () {
              deleteBlock(block);
            }}
          >
            &times;
          </button>
        </td>
        {#if expand}
          <td><input type="checkbox" bind:checked={block.academic} /></td>
          <td
            >{#if block.total}{getHourTime(block.total)}/day{/if}</td
          >
          <td
            >{#if block.total}{getHourTime(block.total * 5)}/wk{/if}</td
          >
          <td
            >{#if block.total}{getHourTime(block.total * 180)}/yr{/if}</td
          >
        {/if}
      </tr>
    {/each}
    <tr><td><button on:click={doAddBlock}>+</button></td></tr>
    {#if expand}<tr>
        <td>Academic Time</td>
        {#if expand}
          <td />
          <td
            >{#if academicTime}{getHourTime(academicTime)}/day{/if}</td
          >
          <td
            >{#if academicTime}{getHourTime(academicTime * 5)}/wk{/if}</td
          >
          <td
            >{#if academicTime}{getHourTime(academicTime * 180)}/yr{/if}</td
          >
        {/if}
      </tr>
    {/if}
  </tbody>
</table>

<style>
  tr td:nth-child(1) {
    background-color: var(--color);
    color: var(--textcolor);
    display: flex;
  }
  .name {
    flex-grow: 1;
  }
  button {
    border-radius: 50%;
    height: 1em;
    width: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  }
  th button {
    color: #888;
    margin-left: 0;
    transition: color 300ms;
  }
  .expand .clock {
    color: #222;
  }
  .colors .dets {
    color: #222;
  }
</style>
