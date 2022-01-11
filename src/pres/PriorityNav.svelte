<script>
  import Ranker from "./Ranker.svelte";
  import { sortedPriorities } from "./priorities.js";
  import { rankPriorities, activePri, mode } from "./ranker.js";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });
  function sortPriorities(ranks) {
    $sortedPriorities.sort(function (a, b) {
      if (ranks[a.id].relevance > ranks[b.id].relevance) {
        return -1;
      } else if (ranks[a.id].relevance < ranks[b.id].relevance) {
        return 1;
      } else {
        return 0;
      }
    });
    $sortedPriorities = $sortedPriorities;
  }

  $: sortPriorities($rankPriorities);
</script>

<nav>
  <h4>Priorities</h4>
  <ul>
    {#each $sortedPriorities as p (p.id)}
      <li
        in:receive={{ key: p.id }}
        out:send={{ key: p.id }}
        animate:flip
        class:clickable={p.id != $activePri || $mode == "PRI"}
        class:active={p.id == $activePri && $mode == "PRI"}
      >
        <button
          on:click={() => {
            $activePri = p.id;
            $mode = "PRI";
          }}
        >
          {p.title || p.desc.proName}
        </button>
        <Ranker pid={p.id} compact={true} />
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    margin-top: 64px;
  }
  nav li {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  button {
    width: 100%;
  }
  input {
    width: 4em;
  }
  ul {
    border-right: 1px solid #888;
    padding-left: 0;
    padding-right: 0;
  }
  .active {
    border: 2px solid black;
    border-right: 3px solid var(--active-pref-color);
    margin-right: -1px;
    background-color: var(--active-pref-color);
    color: white;
  }
  .active button,
  .active input {
    color: white;
  }
  li {
    background-color: transparent;
    border: none;
    border: 2px solid #aaa;
    border-right: 2px solid transparent;
  }

  button,
  input {
    background-color: transparent;
    border: none;
  }
</style>
