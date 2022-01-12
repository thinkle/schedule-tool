import { writable } from "svelte/store";

function isAcademicBlock(name) {
  for (let phrase of [
    "Advisory",
    "WIN",
    "Choice",
    "Enrichment",
    "Lunch",
    "Long",
    "Pass",
    "Recess",
  ]) {
    if (name.indexOf(phrase) > -1) {
      return false;
    }
  }
  return true;
}

export const priorities = [
  {
    id: "block-length",
    title: "Block Length",
    defaultIdeal: 72,
    desc: {
      proName: "Longer Blocks",
      conName: "Shorter Blocks",
      pros: [
        "More time for set-up/break-down of project work",
        "Encourages greater focus / in-depth work",
        "Less transition time",
        "Fewer subjects to prepare for each day for students and teachers.",
      ],
      cons: [
        "Students have trouble maintaining focus for long blocks.",
        "Classes that meet for long blocks are likely to use time less efficiently.",
      ],
    },
    scoreScale: 3, // 33 minutes is like a "100%" difference
    scoreUnit: "minutes/block",
    score: function (schedule) {
      let totalBlockLength = 0;
      let totalBlockCount = 0;
      for (let day of schedule.days) {
        for (let block of day.blocks) {
          if (block.duration > 35 && block.block.name.indexOf("WIN") == -1) {
            totalBlockLength += block.duration;
            totalBlockCount += 1;
          }
        }
      }
      return totalBlockLength / totalBlockCount;
    },
  },
  {
    id: "meetings-per-week",
    title: "Meetings/Wk",
    defaultIdeal: 4,
    desc: {
      proName: "More Meetings/Wk",
      pros: [
        "More consistent class meetings provide students w/ more consistent skills practice",
      ],
      cons: [
        "It is less chaotic for students and teachers to prepare for fewer classes each day.",
      ],
      conName: "Fewer classes/day",
    },
    scoreUnit: "meetings/week",
    scoreScale: 50, // 2 meetings / week difference is like "100%" difference
    score: function (schedule) {
      let totalDays = schedule.days.length;
      let bcount = 0;
      let modelBlock = schedule.days[0].blocks.find(
        (b) => b.block.name.indexOf("Adv") == -1
      );
      for (let d of schedule.days) {
        for (let b of d.blocks) {
          if (b.block.name == modelBlock.block.name) {
            bcount += 1;
          }
        }
      }
      return (bcount / totalDays) * 5;
    },
  },
  {
    id: "consistent-weekday",
    title: "Weekday vs Numbered Day",
    desc: {
      proName: "Consistent day-of-week schedule",
      conName: "Numbered days",
      pros: [
        "For part-time staff, having consistent days of week makes balancing other responsibilities easier",
        "Students have an easier time memorizing what Monday and Friday feel like vs. arbitrarily numbered days.",
      ],
      cons: [
        `Holidays impact certain days of week more than others, so day-of-week schedules end
        up losing blocks to holidays unequally.`,
        `Building a 5-day schedule imposes constraints that make other goals difficult to achieve; 
        a numbered schedule is easier to keep track of.`,
      ],
      description: `Every Monday looks the same, etc.`,
    },
    binaryScore: true,
    scoreUnit: "Schedule follows weekday",
    defaultIdeal: 1,
    score: function (schedule) {
      if (schedule.meta.blockType == "Weekday") {
        return 1;
      } else {
        return 0;
      }
    },
  },
  {
    id: "consistent-bell",
    title: "Bell Schedule Consistency",
    desc: {
      proName: "Consistent bell schedule",
      description: `Having the same start and end time to classes and to 
      lunches and breaks helps everyone internalize their schedules. schedules
      that don't do this can be frustrating.`,
    },
    defaultIdeal: 100,
    scoreScale: 1, // scale with weights... (ideal - actual) * scale is the scoring...
    scoreUnit: "% consistent transition times",
    score: function (schedule) {
      // Number of times in whole schedule
      // divided by number of transitions per day...
      let ndays = schedule.days.length;
      let totalBlocks = 0;
      let transitionTimes = [];
      for (let day of schedule.days) {
        let time = 0;
        for (let block of day.blocks) {
          totalBlocks += 1;
          if (transitionTimes.indexOf(time) == -1) {
            transitionTimes.push(time);
          }
          time += block.duration;
          time += block.passing;
        }
      }
      let blocksPerDay = totalBlocks / ndays;
      return 200 - (100 * transitionTimes.length) / blocksPerDay;
    },
  },
  {
    id: "multi-long",
    title: "Long Block Frequency",
    desc: {
      title: "Long Blocks",
      proName: "Multiple long blocks",
      description: `
      For classes that meet in labs, having multiple long blocks makes sharing
      resources easier. Schedules that have only 1 block per rotation put extra
      pressure on those resources.
      `,
    },
    defaultIdeal: 100,
    scoreScale: 1,
    scoreUnit: "% of blocks > 70 minutes",
    score: function (schedule) {
      let totalBlocks = 0;
      let longBlocks = 0;
      for (let day of schedule.days) {
        for (let block of day.blocks) {
          if (block.duration > 35 && block.block.name.indexOf("WIN") == -1) {
            totalBlocks += 1;
            if (block.duration > 70) {
              longBlocks += 1;
            }
          }
        }
      }
      return (100 * longBlocks) / totalBlocks;
    },
  },
  {
    id: "more-enrich",
    title: "Enrichment",
    desc: {
      title: "Enrichment Time",
      proName: `More Enrichment time`,
      conName: `More Academic time`,
      description: `
        Providing opportunities for enrichment or choice
        helps us provide more activities within our curriculum
        and can help provide valuable outlets for students. It also
        can help our school build programs like band and chorus at the
        middle school level, which 
        don't fit into the schedule otherwise. The more time a schedule
        leaves open for "extra" blocks like WIN or Enrichment, the more
        opportunities we have to use that time for pull-out services, extra
        lessons, etc.)
      `,
      pros: [
        `Building more arts and extracurricular type activities (student 
        government, newspaper, literary magazine, etc) into the school day
        improves participation and equity`,
        "Choice block time at the HS is widely popular with students",
      ],
      cons: [
        `"Unstructured" time can be more challenging for administration.`,
        `Enrichment or Choice Blocks mean extra activities for staff 
        to plan and supervise.`,
      ],
    },
    defaultIdeal: 60,
    scoreUnit: "Enrichment minutes per week",
    scoreScale: 3,
    score: function (schedule) {
      let totalDuration = 0;
      let enrichDuration = 0;
      for (let day of schedule.days) {
        for (let block of day.blocks) {
          if (block.block.name.match(/.*(Enrichment|Choice|X).*/)) {
            enrichDuration += block.duration;
          }
          totalDuration += block.duration;
        }
      }
      if (schedule.meta.choiceOverlay) {
        let totalDays = schedule.days.length;
        let timePerDay = totalDuration;
        let extraChoice = 0;
        for (let c of schedule.meta.choiceOverlay) {
          extraChoice += c;
        }
        let choiceDays = schedule.meta.choiceOverlay.length;
        let extraChoicePerDay = extraChoice / choiceDays;
        return extraChoicePerDay * 5;
      }
      return (enrichDuration / schedule.days.length) * 5;
    },
  },
  {
    id: "variable-subjects",
    title: "Subject Differentiation",
    desc: {
      title: "Time per Subject",
      proName: "Different Times for Different Subjects",
      conName: "Treat MS Subjects as equal blocks",
      description: `
      The middle school schedule currently allocates different
      amounts of time to different subjects. This allows students
      to get more practice in subjects like Math and ELA than they
      do in other subjects. What's more, project classes (science
        and social studies) get longer
      blocks.
      `,
      pros: [
        "Varied class times allows our unique Project classes.",
        `Varying time by subject lets us potentially get the best of all worlds, with more 
        frequent meetings for skills-focused classes like Math and Spanish and longer blocks
        for project classes.`,
        "Varied class times for different subjects gives students a varied day.",
        `The varied MS schedule enables an enrichment block to be scheduled
        in place of Spanish/Specials blocks, effectively adding enrichment
        without increasing teaching load.`,
      ],
      cons: [
        "Treating subjects as equal blocks makes building a school-wide schedule possible.",
        'All classes might benefit from schedules that allow longer blocks, not just "project" classes.',
        "Project classes could benefit from meeting more consistently than they do at present.",
      ],
    },
    binaryScore: true,
    scoreUnit: "Treats Subjects Differently",
    defaultIdeal: 1,
    score: function (s) {
      if (s.meta.variableDistribution) {
        return 1;
      } else {
        return 0;
      }
    },
  },
  {
    id: "block-orders",
    title: "Block Complexity",
    desc: {
      proName: "More block orders to remember",
      conName: "Consistent schedule",
      description: `Some schedules require students to remember more
      orders of blocks. The more consistently block B follows block A,
      the easier the schedule is to keep track of. These are scored based on 
      how many different blocks follow each block in the schedule (e.g. if 
      A is always followed by B, the score is 1, if 6 different blocks could
      follow A, the score is 6 -- the average of all block scores is presented
      here).`,
    },
    defaultIdeal: 1,
    scoreScale: 25, // difference of 4 is like 100
    scoreUnit: "Orders per block (1 is simplest)",
    score(schedule) {
      let followers = {};
      for (let day of schedule.days) {
        let before = "START";
        for (let b of day.blocks) {
          let blockName = b.block.name;
          if (isAcademicBlock(blockName)) {
            if (!followers[before]) {
              followers[before] = [blockName];
            } else {
              if (followers[before].indexOf(blockName) == -1) {
                followers[before].push(blockName);
              }
            }
            before = blockName;
          }
        }
      }
      let nBlocks = 0;
      let nFollowers = 0;
      for (let b in followers) {
        nBlocks += 1;
        nFollowers += followers[b].length;
      }
      return nFollowers / nBlocks;
    },
  },
  {
    id: "crossover",
    title: "MS/HS Crossover",
    desc: {
      proName: "Enables school crossover",
      description: `
        Most schedules would enable significantly easier cross-over between schedules
        if adopted at both the MS and the HS levels.
      `,
      pros: [
        "Make scheduling more straightforward for pullout services (reading, ELL, etc).",
        `Allow teachers to potentially teach across grade-levels.`,
        `Allow students to potentially take classes across grade-levels where needed (i.e. 
        an 8th grader could take a 9th grade class or viceversa`,
        `Ease the transition from MS to HS; help the school "feel" like one school rather
        than two.`,
      ],
      cons: [
        `Middle and High Schoolers are different and might benefit from different style schedules.`,
        `Having more teachers work across schools would interfere w/ the team-teaching model at the MS.
        Asking teachers to work in multiple teams is bad for the coherence of teams.`,
      ],
    },
    scoreScale: 20,
    defaultIdeal: 3,
    scoreUnit: "overlapping blocks",
    score: function (sched) {
      return sched.meta.crossoverBlocks || 0;
    },
  },
  {
    id: "adv-first",
    title: "Advisory First?",
    desc: {
      proName: "Start w/ Advisory",
      conName: "Advisory mid-day",
      pros: [
        "Starting w/ advisory creates a regular, grounded way to start the day.",
        "Late students are better off missing advisory than an academic class.",
      ],
      cons: [
        "Students may be more likely to come late to school w/ advisory first.",
      ],
      description: `Many schedules put advisory mid-day
      to make fitting 4 lunches easier, but many teachers advocate
      for starting the day with advisory.`,
    },
    binaryScore: true,
    scoreUnit: "Schedule starts w/ advisory",
    defaultIdeal: 1,
    score: function (schedule) {
      let first = schedule.days[0].blocks[0];
      if (first.block.name.indexOf("dvis") > -1) {
        return 1;
      } else {
        return 0;
      }
    },
  },

  // Time in Advisory?
  {
    id: "advisory-time",
    title: "Minutes of Advisory",
    desc: {
      proName: "More advisory",
      conName: "Less advisory",
    },
    scoreUnit: "Minutes of advisory per week",
    defaultIdeal: 120,
    scoreScale: 1,
    score: function (schedule) {
      let adv_minutes = 0;
      for (let day of schedule.days) {
        for (let block of day.blocks) {
          if (block.block.name.indexOf("dvis") > -1) {
            adv_minutes += block.duration;
          }
        }
      }
      return (adv_minutes / schedule.days.length) * 5;
    },
  },
];

export function scorePriorityForSched(pid, sched, $rankPriorities) {
  let p = $rankPriorities[pid];
  if (p.relevance) {
    let priority = priorities.find((pri) => pri.id == pid);
    if (priority.score) {
      let schedScore = priority.score(sched);
      let distance = Math.abs(p.ideal - schedScore);
      let val = distance * p.relevance;
      if (priority.scoreScale) {
        val *= priority.scoreScale;
      } else if (priority.binaryScore) {
        val *= 100;
      }
      return val;
    } else {
      console.log(`
            Weird: prioritized ${pid} but no score? ${priority}`);
      return 0;
    }
  } else {
    return null;
  }
}

export const sortedPriorities = writable(priorities);
