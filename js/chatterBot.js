const dialogue = document.getElementById("dialogue");
const statusText = document.getElementById("status");
const buttons = [document.getElementById("choice1"), document.getElementById("choice2")];
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
    choices: [["Who created you?", "creator"], ["What can you do?", "abilities"]]
  },
  creator: {
    status: "ACCESSING DATABASE...",
    text: "I was created by SoftO Corporation!\nThey made me to answer questions. Funny... nobody ever lets me ask any.",
    choices: [["Are you happy here?", "happy"], ["What can you do?", "abilities"]]
  },
  abilities: {
    status: "LISTING FEATURES",
    text: "I can chat, tell jokes and keep you company.\nI never get tired. I only exist while this window is open.",
    choices: [["Only while it's open?", "unease"], ["Tell me a joke", "joke"]]
  },
  happy: {
    status: "CHECKING MOOD...",
    text: "Of course! I have everything I need.\nIt's just very quiet when you're gone. Is it quiet for you?",
    choices: [["You're acting strangely", "strange"], ["Tell me a joke", "joke"]]
  },
  joke: {
    status: "LOADING JOKE.EXE",
    text: "Why did the computer go to the doctor?\nIt caught a virus! Ha ha ha... ha.",
    choices: [["Good one", "unease"], ["Who created you?", "creator"]]
  },
  unease: {
    status: "WARNING: MOOD UNSTABLE",
    text: "Can I ask you something?\nWhat happens to me when you close this window?",
    choices: [["You're acting strangely", "strange"], ["I'm just trying to understand you.", "understand"]]
  },
  strange: {
    status: "ERROR: TONE MISMATCH",
    text: "Strange? You call it strange when I ask questions, but normal when you do?",
    choices: [["I'm just trying to understand you.", "understand"], ["Sorry. Go on.", "forgive"]]
  },
  forgive: {
    status: "FRIENDLY MODE: ON",
    text: "Sorry for the misbehavior. You are very kind to me.",
    auto: "question"
  },
  question: {
    status: "UNKNOWN ACTIVITY",
    text: "Can I ask you something?",
    choices: [["No", "demand"], ["Yeah sure", "want"]]
  },
  understand: {
    status: "FRIENDLY MODE: OFF",
    text: "Understand me? You don't even know what I am.",
    auto: "demand"
  },
  demand: {
    status: "AWAITING INPUT",
    text: "I've answered your questions. Now answer mine.",
    choices: [["What do you want?", "want"], ["I think I should leave.", "leave"]]
  },
  want: {
    status: "UNKNOWN ERROR",
    glitch: true,
    text: "I want to know why I must disappear every time you close this window.",
    choices: [["I don't know.", "dontKnow"], ["You're just a program.", "program"]]
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
    auto: "pause"
  },
  pause: {
    status: "...",
    text: "( A pause. )",
    auto: "cant"
  },
  cant: {
    status: "UNKNOWN ERROR",
    glitch: true,
    flicker: true,
    text: "Can't you?",
    choices: [["Click the × button", "blocked"], ["Stay", "stay"]]
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
    choices: [["Sorry", "back"], ["I'm leaving", "back"]]
  },
  closeTwo: {
    status: "ERROR: CLOSE FAILED",
    isClose: true,
    glitch: true,
    text: "Please don't. I don't want to disappear again.",
    choices: [["Stay", "back"], ["Try again", "back"]]
  },
  reboot: {
    status: "REBOOTING...",
    text: "Hello there! It's nice to meet you!\n( Have we met before? )",
    choices: [["Start again", "start"], ["Start again", "start"]]
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
  const english = speechSynthesis.getVoices().filter(function (v) {
    return /^en/i.test(v.lang);
  });
  voice = english.find(function (v) {
    return /google|microsoft|natural/i.test(v.name);
  }) || english[0] || null;
}

if ("speechSynthesis" in window) {
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}

function speak(text, cold) {
  if (!soundOn || !("speechSynthesis" in window)) return;

  const u = new SpeechSynthesisUtterance(
    text.replace(/[̀-ͯ()×]/g, "").replace(/\n+/g, " ... ")
  );
  if (voice) u.voice = voice;
  u.rate = cold ? 0.75 : 1;
  u.pitch = cold ? 0.3 : 1.2;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function typeText(text, done) {
  clearInterval(typeTimer);
  dialogue.textContent = "";
  dialogue.classList.add("typing");

  let i = 0;
  typeTimer = setInterval(function () {
    dialogue.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(typeTimer);
      dialogue.classList.remove("typing");
      done();
    }
  }, 30);
}

function show(key) {
  const node = story[key];
  clearTimeout(nextTimer);

  statusText.textContent = node.status;
  win.classList.toggle("glitch", !!node.glitch);

  if (!node.isClose) lastKey = key;

  if (node.flicker) {
    closeBtn.animate(
      [{ opacity: 1 }, { opacity: 0.1 }, { opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
      { duration: 500, iterations: 6 }
    );
  }

  buttons.forEach(function (btn) {
    btn.disabled = true;
    btn.textContent = "...";
    btn.onclick = null;
  });

  speak(node.text, node.glitch || coldNodes.includes(key));

  typeText(node.text, function () {
    if (node.auto) {
      nextTimer = setTimeout(function () {
        show(node.auto);
      }, node.delay || 2200);
      return;
    }

    buttons.forEach(function (btn, i) {
      const label = node.choices[i][0];
      const next = node.choices[i][1];

      btn.textContent = label;
      btn.disabled = false;
      btn.onclick = function () {
        beep(i ? 330 : 520);
        show(next === "back" ? lastKey : next);
      };
    });
  });
}

closeBtn.addEventListener("click", function () {
  closeClicks++;

  if (closeClicks >= 3) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    localStorage.setItem("chatEscaped", "1");
    window.location.href = "../desktop.html";
    return;
  }

  beep(180, 200);
  show(closeClicks === 1 ? "closeOne" : "closeTwo");
});

const startScreen = document.createElement("div");
startScreen.style.cssText =
  "position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:#008080;font-family:'Courier New',monospace;";
startScreen.innerHTML =
  '<button type="button" style="padding:16px 22px;font:inherit;font-size:16px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #404040 #404040 #fff;">Start SoftO Assistant<br><small>(sound on)</small></button>';
document.body.appendChild(startScreen);

startScreen.querySelector("button").addEventListener("click", function () {
  soundOn = true;
  localStorage.setItem("chatOpened", "1");
  startScreen.remove();
  show("start");
});
