<script>
  import { rankPriorities } from "./ranker.js";
  export let pid;
  export let compact = false;
  let factorIn = false;
  $: importance = $rankPriorities[pid].relevance;
  $: factorIn = importance > 0;

  function changeFactor(e) {
    console.log("Change!");
    if (factorIn) {
      $rankPriorities[pid].relevance = 0;
    } else {
      for (let id in $rankPriorities) {
        if ($rankPriorities[id].relevance) {
          $rankPriorities[id].relevance += 1;
        }
      }
      $rankPriorities[pid].relevance = 1;
    }
  }

  function getOrdinal(val) {
    let values = Object.values($rankPriorities).map((v) => Number(v.relevance));
    values.sort((a, b) => b - a);

    let n = values.indexOf(val) + 1;
    if (n == 1) {
      return "1st";
    }
    if (n % 10 == 2) {
      return n + "nd";
    }
    if (n % 10 == 3 && n != 13) {
      return n + "rd";
    }
    return n + "th";
  }

  function changeRank(delta) {
    $rankPriorities[pid].relevance += delta;
  }
</script>

<label class="ranker">
  <input type="checkbox" on:change={changeFactor} checked={factorIn} />
  {#if !factorIn}
    {#if !compact}<span>Include in Ranking</span>{/if}
  {:else}
    <span class={`number place-${getOrdinal(importance, $rankPriorities)}`}
      >{getOrdinal(importance, $rankPriorities)}
      <small>({importance}pt)</small>
    </span>
    <button on:click={() => changeRank(1)}>▲</button>
    <button on:click={() => changeRank(-1)}>▼</button>
  {/if}
</label>

<style>
  label {
    max-width: 240px;
    display: grid;
    grid-template-areas:
      "check number plus"
      "check number minus";
  }
  label input {
    grid-area: check;
    align-self: center;
  }
  label span {
    grid-area: number;
    align-self: center;
  }
  label span.number {
    width: 3em;
    height: 3em;
    border-radius: 3px;
    border: 1px solid #eee;
    place-content: center;
    transition: background-color 300ms;
    display: grid;
    color: white;
    font-weight: bold;
  }

  label span.number small {
    font-weight: normal;
  }
  button {
    background-color: transparent;
    color: inherit;
    border: none;
  }
  label button:nth-child(1) {
    grid-area: plus;
  }
  label button:nth-child(2) {
    grid-area: minus;
  }
  .number {
    background-color: #546e7a;
  }
  .place-1st {
    background-color: #00c85e;
  }
  .place-2nd {
    background-color: #ffd600;
  }
  .place-3rd {
    background-color: #ff6d00;
  }
  .place-4th {
    background-color: #bf360c;
  }
  .place-5th {
    background-color: #6200ea;
  }
  .place-6th {
    background-color: #0d47a1;
  }
  .place-7th {
    background-color: #0277bd;
  }
</style>
