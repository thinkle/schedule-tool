<script>
  import ScheduleBuilder from "./ScheduleBuilder.svelte";
  import Presentation from "./pres/Presentation.svelte";
  let presentMode = false;

  if (location.search.search(/pres/) > -1) {
    presentMode = true;
  }
</script>

{#if presentMode}
  <Presentation />
{:else}
  <ScheduleBuilder />
{/if}
