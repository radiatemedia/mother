var Mother = require('mother');

Mother.register({
  "nap": true,
  "snack": { 1: true, 2: false, 3: true },
}, {
  "johnny": { "snack": { 2: true, 3: false }, "play": true },
  "billy": { "play": false, "chores": true }
});

Mother.of("johnny");

if (Mother.allows("nap")) {
  console.log("johnny: zzzzzzz...");
} else {
  console.log("johnny: soooo sleeepy");
}

if (Mother.allows("snack", 3)) {
  console.log("johnny: <munch> <munch> <snack>...");
} else {
  console.log("johnny: But I'm so hungry!");
}

if (Mother.allows("play")) {
  console.log("johnny: Wheeee! Playtime!");
} else {
  console.log("johnny: No chores? Sweet!");
}

Mother.of("billy");

if (Mother.allows("play")) {
  console.log("billy: Wheeee! Playtime!");
} else {
  console.log("billy: But that's not fair! Johnny gets to play!");
}

if (Mother.allows("chores")) {
  console.log("billy: Awwww! Do I hafta?");
} else {
  console.log("billy: No chores? Sweet!");
}

Mother.of(null); // actor-unaware / 'global' mode

if (Mother.allows("nap")) {
  console.log("<global>: snooze time!");
}

if (Mother.allows("snack")) {
  console.log("<global>: <snack> v1.0");
} else if (Mother.allows("snack", 2)) {
  console.log("<global>: <munch> <snack> v2.0");
} else if (Mother.allows("snack", 3)) {
  console.log("<global>: <munch> <munch> <snack> v3.0");
} else {
  console.log("<global>: <tummy-grumble>");
}

if (Mother.allows("unknown-feature")) {
  console.log("You've entered the twighlight zone...");
}
