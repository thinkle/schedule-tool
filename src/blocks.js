import { writable } from "svelte/store";
import LZ from "lz-string";
const blockNames = [
  "Advisory",
  "Lunch",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
];
const colors = [
  "#c5cae9", // indigo
  "#e0f2f1", // teal
  "#ffccbc", // deep orange
  "#f1f8e9", // light green
  "#ffebee", // red
  "#f9fbe7", // lime
  "#d1c4e9", // deep purple
  "#e3f2fd", // blue
  "#efebe9", // brown
  "#f3e5f5", // purple
  "#fce4ec", // pink
  "#e1f5fe", // light blue
  "#fff3e0", // orange
];

export function addBlock(blocks) {
  var newBlock = {};
  if (blocks.length) {
    var lastBlock = blocks[blocks.length - 1];
    if (blockNames.indexOf(lastBlock.name) > -1) {
      newBlock.name = blockNames[blockNames.indexOf(lastBlock.name) + 1];
    }
    if (colors.indexOf(lastBlock.color) > -1) {
      newBlock.color = colors[colors.indexOf(lastBlock.color) + 1];
    }
  }
  if (!newBlock.name) {
    newBlock.name = blockNames[blocks.length];
  }
  if (!newBlock.color) {
    newBlock.color = colors[blocks.length];
  }
  blocks.push(newBlock);
}

function makeSchedule(
  nblocks = 9,
  ndays = 1,
  bpd = 6,
  duration = 60,
  passing = 5
) {
  let blocks = [];
  let days = [];

  for (let i = 0; i < nblocks; i++) {
    let name = blockNames[i];
    let color = colors[i];
    blocks.push({
      name,
      color,
    });
  }

  for (let i = 0; i < ndays; i++) {
    let dayblocks = [];
    for (let ii = 0; ii < bpd; ii++) {
      dayblocks.push({ duration, passing });
    }
    days.push({ name: `Day ${i + 1}`, repeats: 1, blocks: dayblocks });
  }
  return writable({
    blocks,
    days,
    title: "Schedule",
  });
}

export let schedule = makeSchedule();

function parseHash() {
  if (location.hash) {
    if (location.hash.substr(1, 3) == "~v2") {
      var data = JSON.parse(LZ.decompressFromBase64(location.hash.substr(4)));
    } else {
      console.log("Old hash (not compressed)");
      var data = JSON.parse(atob(location.hash.substr(1)));
    }
    for (let d of data.days) {
      for (let b of d.blocks) {
        let realBlock = data.blocks.find(
          (block) => JSON.stringify(block) == JSON.stringify(b.block)
        );
        b.block = realBlock;
      }
    }
    schedule.set(data);
  }
}
parseHash();

function getColor(existingColors) {
  for (let c of colors) {
    if (existingColors.indexOf(c) == -1) {
      return c;
    }
  }
  console.log("Rando color!");
  return `hsl(${Math.floor(Math.random() * 360)}deg,${Math.floor(
    50 + Math.random() * 50
  )}%,85%)`;
}

function checkColors($schedule) {
  let update = false;
  let existingColors = $schedule.blocks.map((b) => b?.color).filter((c) => c);
  console.log("Got colors", existingColors);
  for (let block of $schedule.blocks) {
    if (!block.color) {
      block.color = getColor(existingColors);
      update = true;
    }
  }
  if (update) {
    schedule.set($schedule);
  }
}

schedule.subscribe((v) => {
  checkColors(v);
  const compressed = LZ.compressToBase64(JSON.stringify(v));
  location.hash = "~v2" + compressed;
});

window.addEventListener("hashchange", () => {
  parseHash();
});
