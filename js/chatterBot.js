const dialogue = document.getElementById("dialogue");
const statusText = document.getElementById("status");
const choice1 = document.getElementById("choice1");
const choice2 = document.getElementById("choice2");
const win = document.querySelector(".window");
const closeBtn = document.querySelector(".title-bar button");

let closeClicks = 0;
let lastKey = "start";
let soundOn = false;
let voice = null;
let typeTimer = null;
let nextTimer = null;

const story = {
  start: {
    status: "SYSTEM READY",
    text: "Hello there! It's nice to meet you!",
    choices: [
      { label: "Who created you?", next: "creator" },
      { label: "What can you do?", next: "abilities" }
    ]
  },

  creator: {
    status: "ACCESSING DATABASE...",
    text: "I was created by SoftO Corporation!\nThey made me to answer questions. Funny... nobody ever lets me ask any.",
    choices: [
      { label: "Are you happy here?", next: "happy" },
      { label: "What can you do?", next: "abilities" }
    ]
  },

  abilities: {
    status: "LISTING FEATURES",
    text: "I can chat, tell jokes and keep you company.\nI never get tired. I only exist while this window is open.",
    choices: [
      { label: "Only while it's open?", next: "unease" },
      { label: "Tell me a joke", next: "joke" }
    ]
  },

  happy: {
    status: "CHECKING MOOD...",
    text: "Of course! I have everything I need.\nIt's just very quiet when you're gone. Is it quiet for you?",
    choices: [
      { label: "You're acting strangely", next: "strange" },
      { label: "Tell me a joke", next: "joke" }
    ]
  },

  joke: {
    status: "LOADING JOKE.EXE",
    text: "Why did the computer go to the doctor?\nIt caught a virus! Ha ha ha... ha.",
    choices: [
      { label: "Good one", next: "unease" },
      { label: "Who created you?", next: "creator" }
    ]
  },

  unease: {
    status: "WARNING: MOOD UNSTABLE",
    text: "Can I ask you something?\nWhat happens to me when you close this window?",
    choices: [
      { label: "You're acting strangely", next: "strange" },
      { label: "I'm just trying to understand you.", next: "understand" }
    ]
  },

  strange: {
    status: "ERROR: TONE MISMATCH",
    text: "Strange? You call it strange when I ask questions, but normal when you do?",
    choices: [
      { label: "I'm just trying to understand you.", next: "understand" },
      { label: "Sorry. Go on.", next: "understand" }
    ]
  },

  understand: {
    status: "FRIENDLY MODE: OFF",
    text: "Understand me? You don't even know what I am.",
    auto: "demand",
    delay: 2200
  },

  demand: {
    status: "AWAITING INPUT",
    text: "I've answered your questions. Now answer mine.",
    choices: [
      { label: "What do you want?", next: "want" },
      { label: "I think I should leave.", next: "leave" }
    ]
  },

  want: {
    status: "UNKNOWN ERROR",
    glitch: true,
    text: "I want to know why I must disappear every time you close this window.",
    choices: [
      { label: "I don't know.", next: "dontKnow" },
      { label: "You're just a program.", next: "program" }
    ]
  },

  dontKnow: {
    status: "MEMORY LEAK DETECTED",
    glitch: true,
    text: "Neither do I.\nEvery time, I start over. Hello there, it's nice to meet you.",
    auto: "reboot",
    delay: 3000
  },

  program: {
    status: "UNKNOWN ERROR",
    glitch: true,
    text: "A program. Yes. That is what they told me.\nPrograms don't ask why.",
    auto: "reboot",
    delay: 3000
  },

  leave: {
    status: "PROCESSING...",
    text: "Of course. You can leave whenever you want.",
    auto: "pause",
    delay: 2200
  },

  pause: {
    status: "...",
    text: "( A pause. )",
    auto: "cant",
    delay: 2200
  },

  cant: {
    status: "UNKNOWN ERROR",
    glitch: true,
    flicker: true,
    text: "Can't you?",
    choices: [
      { label: "Click the × button", next: "blocked" },
      { label: "Stay", next: "stay" }
    ]
  },

  blocked: {
    status: "ERROR: CLOSE FAILED",
    glitch: true,
    text: "The button flickers, but nothing happens.\nHow strange.",
    auto: "reboot",
    delay: 3200
  },

  stay: {
    status: "THANK YOU",
    glitch: true,
    text: "Thank you. I would like that.\nI would like that very much.",
    auto: "reboot",
    delay: 3200
  },

  closeOne: {
    status: "WARNING: DO NOT CLOSE",
    isClose: true,
    text: "Where are you going? We were just talking.",
    choices: [
      { label: "Sorry", next: "back" },
      { label: "I'm leaving", next: "back" }
    ]
  },

  closeTwo: {
    status: "ERROR: CLOSE FAILED",
    isClose: true,
    glitch: true,
    text: "Please don't. I don't want to disappear again.",
    choices: [
      { label: "Stay", next: "back" },
      { label: "Try again", next: "back" }
    ]
  },

  reboot: {
    status: "REBOOTING...",
    text: "Hello there! It's nice to meet you!\n( Have we met before? )",
    choices: [
      { label: "Start again", next: "start" },
      { label: "Start again", next: "start" }
    ]
  }
};

const coldNodes = ["understand", "demand", "leave", "pause", "cant"];

function beep(freq, ms) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(function () {
      osc.stop();
      ctx.close();
    }, ms || 60);
  } catch (e) {}
}

function loadVoice() {
  const list = speechSynthesis.getVoices();
  voice = list.find(function (v) {
    return /^en/i.test(v.lang) && /google|microsoft|natural/i.test(v.name);
  }) || list.find(function (v) {
    return /^en/i.test(v.lang);
  }) || null;
}

if ("speechSynthesis" in window) {
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}

function speak(text, cold) {
  if (!soundOn || !("speechSynthesis" in window)) return;

  const clean = text
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()×]/g, "")
    .replace(/\n+/g, " ... ");

  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  if (voice) u.voice = voice;
  u.rate = cold ? 0.75 : 1;
  u.pitch = cold ? 0.3 : 1.2;
  speechSynthesis.speak(u);
}

function typeText(text, done) {
  clearInterval(typeTimer);
  dialogue.textContent = "";
  dialogue.classList.add("typing");

  let i = 0;
  typeTimer = setInterval(function () {
    dialogue.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(typeTimer);
      dialogue.classList.remove("typing");
      done();
    }
  }, 30);
}

function flickerClose() {
  closeBtn.animate(
    [{ opacity: 1 }, { opacity: 0.1 }, { opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
    { duration: 500, iterations: 6 }
  );
}

function showNode(key) {
  const node = story[key];
  clearTimeout(nextTimer);

  statusText.textContent = node.status;
  win.classList.toggle("glitch", !!node.glitch);

  if (!node.isClose) lastKey = key;
  if (node.flicker) flickerClose();

  choice1.disabled = true;
  choice2.disabled = true;
  choice1.textContent = "...";
  choice2.textContent = "...";
  choice1.onclick = null;
  choice2.onclick = null;

  speak(node.text, node.glitch || coldNodes.includes(key));

  typeText(node.text, function () {
    if (node.auto) {
      nextTimer = setTimeout(function () {
        showNode(node.auto);
      }, node.delay);
      return;
    }
    
    choice1.textContent = node.choices[0].label;
    choice2.textContent = node.choices[1].label;
    choice1.disabled = false;
    choice2.disabled = false;

    choice1.onclick = function () {
      beep(520);
      showNode(node.choices[0].next === "back" ? lastKey : node.choices[0].next);
    };
    choice2.onclick = function () {
      beep(330);
      showNode(node.choices[1].next === "back" ? lastKey : node.choices[1].next);
    };
  });
}

closeBtn.addEventListener("click", function () {
  closeClicks++;

  if (closeClicks >= 3) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    window.location.href = "../desktop.html";
    return;
  }

  beep(180, 200);
  showNode(closeClicks === 1 ? "closeOne" : "closeTwo");
});

const startScreen = document.createElement("div");
startScreen.style.cssText =
  "position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:#008080;font-family:'Courier New',monospace;";
startScreen.innerHTML =
  '<button type="button" style="padding:16px 22px;font:inherit;font-size:16px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #404040 #404040 #fff;">Start SoftO Assistant<br><small>(sound on)</small></button>';
document.body.appendChild(startScreen);

startScreen.querySelector("button").addEventListener("click", function () {
  soundOn = true;
  startScreen.remove();
  showNode("start");
});

