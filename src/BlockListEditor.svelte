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
            academicTime += b.duration;
          }
        }
      }
    }
  }

  $: calculateBlockTotals($schedule.days);

  const blockTotals = {};

  function doAddBlock() {
    console.log("addBlock", $schedule.blocks);
    addBlock($schedule.blocks);
    $schedule = $schedule;
  }

  function deleteBlock(block) {
    $schedule.blocks.splice($schedule.blocks.indexOf(block), 1);
    $schedule = $schedule;
  }
  let expand;
  let academicTime = 0;
</script>

<table class:expand>
  <thead>
    <tr>
      <th>Block</th><th colspan="3"
        ><button class="clock" on:click={() => (expand = !expand)}>⧗</button
        ></th
      >
    </tr>
    <tr>
      <th>&nbsp;</th>{#if expand}<th>Per Day</th><th>Per Week</th><th
          >Per Year</th
        >{/if}
    </tr>
  </thead>
  <tbody>
    {#each $schedule.blocks as block}
      <tr style={`--color:${block.color}`}
        ><td>
          <input type="checkbox" bind:checked={block.academic} />
          <span
            class="name"
            bind:textContent={block.name}
            on:input={updateS}
            contenteditable="true"
          />
          <button
            on:click={function () {
              deleteBlock(block);
            }}
          >
            &times;
          </button>
        </td>
        {#if expand}
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
  .clock {
    color: #888;
    margin-left: 0;
    transition: color 300ms;
  }
  .expand .clock {
    color: #222;
  }
</style>
