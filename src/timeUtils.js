export function getHourTime(minutes) {
  minutes = Math.round(minutes);
  let hours = Math.floor(minutes / 60)
    .toString(10)
    .padStart(2, "0");
  let mins = (minutes % 60).toString(10).padStart(2, "0");
  let pm = "";
  if (hours > 12 && hours < 24) {
    hours = hours - 12;
    pm = "pm";
  }
  return `${hours}:${mins}${pm}`;
}

export function getMinutes(hourString24) {
  let [hour, minute] = hourString24.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function getBlockTimes(day, i) {
  if (!day) {
    return "";
  }
  if (!day.blocks) {
    return "";
  }
  if (day.blocks.length <= i) {
    return "";
  }
  let start = day.start || 8 * 60;
  let blockCount = 0;
  for (let block of day.blocks) {
    if (blockCount == i) {
      let end = start + block.duration;
      return `${getHourTime(start)}-${getHourTime(end)}`;
    } else {
      start += block.duration;
      start += block.passing;
      blockCount += 1;
    }
  }
}
