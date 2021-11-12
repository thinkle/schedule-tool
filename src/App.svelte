<script>
  import Schedule from "./Schedule.svelte";
  import { schedule } from "./blocks";
  import Collapser from "./Collapser.svelte";
</script>

<Schedule {schedule} />
<Collapser label="debug" initialCollapse={true}>
  {JSON.stringify($schedule)}
</Collapser>

<style>
  :root {
    --labelSize: 8pt;
  }
  :global(input),
  :global(select) {
    border: none;
    padding: none;
    background-color: #f0f0e0;
  }
</style>
