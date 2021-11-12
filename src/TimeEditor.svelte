<script>
  export let schedule;
  let times = {
    durations: [],
    passingTimes: [],
  };
  $: times = getTimes($schedule);

  function getTimes() {
    let uniqueTimes = {
      passingTimes: [],
      durations: [],
    };
    for (let day of $schedule.days) {
      for (let b of day.blocks) {
        if (!uniqueTimes.durations.find((t) => t == b.duration)) {
          uniqueTimes.durations.push(b.duration);
          if (durationUpdateMap[b.duration] === undefined) {
            durationUpdateMap[b.duration] = b.duration;
          }
        }
        if (!uniqueTimes.passingTimes.find((t) => t == b.passing)) {
          uniqueTimes.passingTimes.push(b.passing);
          if (passingUpdateMap[b.passing] === undefined) {
            passingUpdateMap[b.passing] = b.passing;
          }
        }
      }
    }
    return uniqueTimes;
  }
  let durationUpdateMap = {};
  let passingUpdateMap = {};
  function updateDurations() {
    for (let day of $schedule.days) {
      for (let b of day.blocks) {
        let newDuration = durationUpdateMap[b.duration];
        if (newDuration !== undefined) {
          b.duration = newDuration;
        }
      }
    }
    $schedule = $schedule;
  }
  function updatePassing() {
    for (let day of $schedule.days) {
      for (let b of day.blocks) {
        let newDuration = passingUpdateMap[b.passing];
        if (newDuration !== undefined) {
          b.passing = newDuration;
        }
      }
    }
    $schedule = $schedule;
  }
</script>

<div>
  <h5>Block Lengths</h5>
  <ul>
    {#each times.durations as dur, i}
      <li>
        {dur} min<span>→</span><input
          type="number"
          min="0"
          bind:value={durationUpdateMap[dur]}
        />
      </li>
    {/each}
  </ul>
  <button on:click={updateDurations}>Update Lengths</button>
</div>
<div>
  <h5>Passing Times</h5>
  <ul>
    {#each times.passingTimes as p}
      <li>
        {p} minutes<span>→</span><input
          type="number"
          min="0"
          bind:value={passingUpdateMap[p]}
        />
      </li>
    {/each}
  </ul>
  <button on:click={updatePassing}>Update Passing Time</button>
</div>

<style>
  div {
    margin-bottom: 1em;
  }
  div {
    display: flex;
    flex-direction: column;
  }
  div > button {
    align-self: flex-end;
    margin-top: 2px;
    font-size: 80%;
  }
  input {
    width: 3em;
  }
  h5 {
    margin: 0;
  }
  ul {
    padding-left: 0;
    display: flex;
    flex-direction: column;
    max-width: 180px;
    margin: 0;
  }
  li {
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 2px;
  }
</style>
