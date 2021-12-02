<script>
  import Schedule from "./Schedule.svelte";
  import { schedule } from "./blocks";
  import Collapser from "./Collapser.svelte";
  let about = false;
</script>

<div class="grid">
  <div class="links">
    <a
      href="#about"
      on:click={(e) => {
        about = true;
        e.preventDefault();
      }}>About</a
    >
    <a href="/?edit">Start Fresh</a>
  </div>
  <div class="modal" class:show={about} on:click={() => (about = false)}>
    <div class="about">
      <h2>Tom's Schedule Tool</h2>
      <p>Welcome to my schedule tool.</p>
      <p>
        Just copy the URL (Control-L, Control-C) to share your schedule idea
        width someone.
      </p>
      <p>
        This has handy tools to edit block times, edit block names, and move
        blocks around. My hope is they are intuitive enough to use without
        instructions. If I failed on that front, let me know and I'll try to
        make improvements. Generally, you can click on things and edit them :)
      </p>
    </div>
  </div>

  <Schedule {schedule} />

  <!--<Collapser label="debug" initialCollapse={true}>
  {JSON.stringify($schedule)}
</Collapser>-->
</div>

<style>
  .grid {
    display: grid;
    grid-template-areas:
      "topfarleft topleft topright"
      "sidepanel  main main";
    /* https://stackoverflow.com/questions/19848697/css-grid-where-one-column-shrinks-to-fit-content-the-other-fills-the-remaning-s */
    grid-template-columns: minmax(27px, auto) minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    padding: 5px;
    box-sizing: border-box;
  }
  :root {
    --labelSize: 8pt;
  }
  :global(input),
  :global(select) {
    border: none;
    padding: none;
    background-color: #f0f0e0;
  }
  .modal {
    display: none;
  }
  .modal.show {
    position: fixed;
    z-index: 200;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    background-color: #22222288;
  }
  .modal .about {
    max-width: 800px;
    background-color: white;
    padding: 1em;
    line-height: 1.3;
  }
  .links {
    grid-area: topright;
  }
</style>
