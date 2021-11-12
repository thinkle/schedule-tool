import { writable } from "svelte/store";

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
  });
}

export let schedule = makeSchedule();

if (location.hash) {
  console.log("Got me a hash!");
  console.log("Got hash...");
  let data = JSON.parse(atob(location.hash.substr(1)));
  console.log("Got:", data);
  for (let d of data.days) {
    for (let b of d.blocks) {
      let realBlock = data.blocks.find(
        (block) => JSON.stringify(block) == JSON.stringify(b.block)
      );
      console.log("Found real block", realBlock);
      b.block = realBlock;
    }
  }
  schedule.set(data);
}

schedule.subscribe((v) => {
  console.log("Update hash!");
  location.hash = btoa(JSON.stringify(v));
});
