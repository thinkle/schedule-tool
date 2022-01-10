<script>
  export let schedule;
  export let size = 200;
  export let percent = 0;
  export let bgColor = "cornflowerblue";
  export let fgColor = "orange";

  let totalDuration = 0;
  for (let b of schedule.blocks) {
    totalDuration += b.total;
  }
  let blockWedges = [];
  let last = 0;
  for (let b of schedule.blocks) {
    let width = b.total / totalDuration;
    blockWedges.push({ start: last, end: last + width, color: b.color, b });
    last = last + width;
  }

  $: viewBox = `0 0 ${size} ${size}`;
  $: radius = size / 2;
  $: halfCircumference = Math.PI * radius;

  function shorten(name) {
    if (name.length == 1) {
      return name;
    } else if (name.indexOf("dvis") > -1) {
      return "Adv";
    } else {
      return name.substr(0, 3);
    }
  }
  function bringToTop(e) {
    e.target.ownerSVGElement.appendChild(e.target);
  }
</script>

<svg width={size + 100} height={size + 50} {viewBox}>
  <circle r={radius} cx={radius} cy={radius} fill={bgColor} />
  {#if true}
    {#each blockWedges as w}
      <!-- see https://svelte.dev/repl/ff600ab31ded4035aa706b5633dc1a45?version=3.42.4-->

      <circle
        r={radius / 2}
        cx={radius}
        cy={radius}
        fill="transparent"
        stroke={w.color}
        stroke-width={radius}
        stroke-dasharray={`${(w.end - w.start) * halfCircumference} ${
          halfCircumference * 2
        }`}
        transform-origin="center"
        transform={`rotate(${360 * w.start})`}
      />
      <g on:mouseenter={bringToTop}>
        <text
          text-anchor="middle"
          x={radius +
            Math.cos(((w.start + w.end) / 2) * Math.PI * 2) * (radius * 1)}
          y={radius +
            Math.sin(((w.start + w.end) / 2) * Math.PI * 2) * (radius * 0.88)}
        >
          {shorten(w.b.name)}
        </text>
        <text
          text-anchor="middle"
          x={radius +
            Math.cos(((w.start + w.end) / 2) * Math.PI * 2) * (radius * 0.5)}
          y={radius +
            Math.sin(((w.start + w.end) / 2) * Math.PI * 2) * (radius * 0.5)}
        >
          {Math.round(w.b.total).toFixed(0)}
        </text>
      </g>
    {/each}
  {/if}
</svg>

<style>
  g:hover text {
    font-weight: bold;
    font-size: 120%;
    z-index: 3;
  }
</style>
