<script>
  import { fly, fade } from "svelte/transition";
  export let initialCollapse = false;
  export let label;
  let collapse = initialCollapse;
</script>

<div class="contain">
  <button class:collapsed={collapse} on:click={() => (collapse = !collapse)}>
    <span>▶</span>

    {label}
  </button>

  {#if !collapse}
    <div in:fly|local={{ y: -200 }} out:fade|local>
      <slot />
    </div>
  {/if}
</div>

<style>
  div div {
    z-index: 1;
  }
  .contain {
    overflow: hidden;
  }
  button {
    background-color: transparent;
    border: none;
    font-weight: bold;
    position: relative;
    z-index: 2;
  }
  button:hover {
    text-decoration: underline;
    underline-color: red;
  }
  button span {
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 300ms;
  }
  button.collapsed span {
    transform: rotate(0deg);
  }
</style>
