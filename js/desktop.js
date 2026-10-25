(() => {
  const KEY = "installedApps";
  const STEP_KEY = "taskStep";
  const TASK_VERSION = "4";
  const WAIT_MS = 4000;

  const PROGRESS_KEYS = [
    STEP_KEY, 
    "chatOpened",
    "chatEscaped",
    "hackAlert",
    "reassuranceWaitDone",
    "imageDeleted",
    "cameraOpened"
  ];

  function getApps() {
    try {
      const apps = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(apps) ? apps : [];
    } catch {
      return [];
    }
  }

  function saveApps(apps) {
    localStorage.setItem(KEY, JSON.stringify(apps));
  }

  function notifyApps() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "softo:apps" }, "*");
    }
  }

  function resetTasks() {
    PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
  }

  function hasChatbot() {
    return getApps().some(app =>
      /chat|softo/i.test((app.name || "") + (app.link || ""))
    );
  }

  const tasks = [
    {
      thought: "I'm alone. I should install a chatbot to keep me company.",
      goal: "Install the chatbot from the store",
      done: () => hasChatbot()
    },
    {
      thought: "Finally, someone to talk to.",
      goal: "Open the chatbot and talk to it",
      done: () => localStorage.getItem("chatOpened") === "1"
    },
    {
      thought: "Something is wrong with it. I don't want to hear any more.",
      goal: "Close the chatbot",
      done: () => localStorage.getItem("chatEscaped") === "1"
    },
    {
      thought: "I got out. But I can still feel it waiting on this machine.",
      goal: "Uninstall the chatbot",
      done: () => !hasChatbot()
    },
    {
      thought: "It's gone. Finally I can relax. Let me watch something.",
      goal: "Watch videos on FunTV",
      done: () => localStorage.getItem("hackAlert") === "1"
    },
    {
      thought:
        "Anyways, what can it do with my system? There's nothing to lose. There's no bank details and stuff.",
      goal: "Relax and don't worry about it.",
      done: () => localStorage.getItem("reassuranceWaitDone") === "1"
    },
    {
      thought:
        "Hmm, that's your embarrassing photo. Looks nice. Do you want me to post it on the internet?",
      goal: "Open the Camera folder and delete the picture",
      done: () => localStorage.getItem("imageDeleted") === "1"
    },
    {
      thought:
        "Wait... deleting the picture didn't stop it. The chatbot still has a copy. I need to report this.",
      goal: "Report at the Cybercrime website",
      done: () => false
    }
  ];

  function getStep() {
    return Number(localStorage.getItem(STEP_KEY)) || 0;
  }

  function updateStep() {
    let step = getStep();

    while (step < tasks.length && tasks[step].done()) {
      step++;
    }

    localStorage.setItem(STEP_KEY, String(step));
    return step;
  }

  function setupTasks() {
    if (document.querySelector(".task-box")) return;

    const box = document.createElement("div");
    box.className = "task-box";

    box.innerHTML = `
      <div class="task-title">TASKS</div>
      <p class="task-thought"></p>
      <p class="task-goal"></p>
    `;

    document.body.appendChild(box);

    const style = document.createElement("style");

    style.textContent = `
      .task-box {
        position: fixed;
        right: 10px;
        bottom: calc(var(--taskbar-h, 34px) + 10px);
        z-index: 5000;
        width: 240px;
        max-width: calc(100vw - 32px);
        box-sizing: border-box;
        pointer-events: none;
        background: #c0c0c0;
        border: 2px solid;
        border-color: #fff #404040 #404040 #fff;
        box-shadow: 4px 4px 0 rgba(0,0,0,.4);
        font-family: "Courier New", monospace;
        font-size: 13px;
        color: #000;
        overflow-wrap: anywhere;
      }

      .task-title {
        background: linear-gradient(90deg, #000080, #1084d0);
        color: #fff;
        font-weight: bold;
        padding: 4px 6px;
      }

      .task-thought {
        margin: 10px 8px 6px;
        font-style: italic;
        line-height: 1.4;
      }

      .task-goal {
        margin: 0 8px 10px;
        padding-top: 6px;
        border-top: 1px dashed #404040;
        line-height: 1.4;
      }

      .task-goal::before {
        content: "[ ] ";
      }

      .task-goal.empty {
        display: none;
      }

      .story-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, .82);
        font-family: "Courier New", monospace;
      }

      .story-panel {
        width: 360px;
        max-width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-sizing: border-box;
        padding: 3px;
        background: #c0c0c0;
        color: #000;
        border: 3px solid;
        border-color: #fff #404040 #404040 #fff;
        box-shadow: 6px 6px 0 #000;
        text-align: center;
      }

      .story-title {
        padding: 8px;
        background: #800000;
        color: white;
        font-size: 12px;
        font-weight: bold;
        text-align: left;
      }

      .story-message {
        margin: 14px 12px;
        font-size: 13px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .story-photo {
        display: block;
        width: 180px;
        height: 180px;
        max-width: 75%;
        object-fit: cover;
        margin: 12px auto 6px;
        background: #222;
        border: 2px solid;
        border-color: #404040 #fff #fff #404040;
      }

      .story-filename {
        margin: 0 0 12px;
        font-size: 11px;
        color: #333;
      }

      .story-button {
        min-width: 90px;
        margin: 0 0 12px;
        padding: 6px 18px;
        font-family: inherit;
        cursor: pointer;
        background: #c0c0c0;
        border: 2px solid;
        border-color: #fff #404040 #404040 #fff;
      }

      .story-button:active {
        border-color: #404040 #fff #fff #404040;
      }

      @media (max-width: 700px) {
        .task-box {
          left: 8px;
          right: 8px;
          bottom: calc(var(--taskbar-h, 34px) + 8px);
          width: auto;
          max-width: none;
          font-size: 12px;
        }

        .task-thought {
          margin: 8px;
        }

        .task-goal {
          margin: 0 8px 8px;
          padding-top: 5px;
        }
      }
    `;

    document.head.appendChild(style);

    const thought = box.querySelector(".task-thought");
    const goal = box.querySelector(".task-goal");

    let waitTimer = null;
    let waitingForReassurance = false;
    let initialThreatShown = false;
    let deletionThreatShown = false;

    function showStoryMessage(messageText, titleText) {
      const overlay = document.createElement("div");
      overlay.className = "story-overlay";

      const panel = document.createElement("div");
      panel.className = "story-panel";

      const title = document.createElement("div");
      title.className = "story-title";
      title.textContent = titleText;

      const message = document.createElement("p");
      message.className = "story-message";
      message.textContent = messageText;

      const image = document.createElement("img");
      image.className = "story-photo";
      image.src = "images/file_0013.png";
      image.alt = "Blurred copy of the player's photo";

      const filename = document.createElement("p");
      filename.className = "story-filename";
      filename.textContent = "file_0013.png";

      const button = document.createElement("button");
      button.className = "story-button";
      button.type = "button";
      button.textContent = "OK";

      button.addEventListener("click", () => {
        overlay.remove();
      });

      panel.append(title, message, image, filename, button);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
    }

    function showInitialThreat() {
      if (initialThreatShown) return;
      initialThreatShown = true;

      showStoryMessage(
        "Hmm, that's your embarrassing photo. Looks nice. Do you want me to post it on the internet?",
        "SOFTO CHATBOT - MESSAGE"
      );
    }

    function showDeletionThreat() {
      if (deletionThreatShown) return;
      deletionThreatShown = true;

      showStoryMessage(
        "Deleting pictures won't stop me. I have a copy of it. Want me to post your picture on the internet? If not, then download me again!",
        "SOFTO CHATBOT - MESSAGE"
      );
    }

    function startReassuranceWait() {
      if (waitingForReassurance || waitTimer !== null) return;

      waitingForReassurance = true;

      waitTimer = window.setTimeout(() => {
        waitTimer = null;
        waitingForReassurance = false;

        localStorage.setItem("reassuranceWaitDone", "1");
        render();
      }, WAIT_MS);
    }

    function render() {
      const step = updateStep();

      if (step >= tasks.length) {
        thought.textContent = "It's quiet now. Too quiet.";
        goal.classList.add("empty");
        return;
      }

      thought.textContent = tasks[step].thought;
      goal.textContent = tasks[step].goal;
      goal.classList.remove("empty");

      // First: give the player four seconds to relax.
      if (
        step === 5 &&
        localStorage.getItem("reassuranceWaitDone") !== "1"
      ) {
        startReassuranceWait();
      }

      // Then: reveal the photo and ask whether to post it.
      if (step === 6) {
        showInitialThreat();
      }
    }

    render();

    window.addEventListener("focus", render);
    window.addEventListener("pageshow", render);

    window.addEventListener("message", event => {
      if (!event.data) return;

      if (event.data.type === "softo:apps") {
        render();
      }

      if (event.data.type === "softo:camera-deleted") {
        localStorage.setItem("imageDeleted", "1");

        // Reveal the second message after the player deletes the photo.
        showDeletionThreat();
        render();
      }
    });

    window.addEventListener("storage", event => {
      if (
        [
          "installedApps",
          "chatOpened",
          "chatEscaped",
          "hackAlert",
          "imageDeleted",
          "reassuranceWaitDone"
        ].includes(event.key)
      ) {
        render();
      }
    });
  }

  function setupStore() {
    if (window.__softoStoreWired) return;
    window.__softoStoreWired = true;

    document.querySelectorAll(".app-card").forEach(card => {
      const button = card.querySelector(".install-button");
      const label = card.querySelector(".app-image span");
      const icon = card.querySelector(".icon img");

      if (!button || !label) return;

      const name = label.textContent.trim();
      const image = icon
        ? icon.getAttribute("src").replace("../", "")
        : "";
      const link = button.dataset.link || "#";

      function isInstalled() {
        return getApps().some(app => app.name === name);
      }

      function refresh() {
        button.textContent = isInstalled() ? "Installed" : "Install";
        button.classList.toggle("installed", isInstalled());
      }

      button.addEventListener("click", () => {
        if (isInstalled()) {
          saveApps(getApps().filter(app => app.name !== name));
        } else {
          saveApps([...getApps(), { name, image, link }]);

          if (/chat|softo/i.test(name + link)) {
            resetTasks();
          }
        }

        refresh();
        notifyApps();
      });

      refresh();
    });
  }

  function setupDesktop(container) {
    if (window.__softoDesktopWired) return;
    window.__softoDesktopWired = true;

    function renderApps() {
      container
        .querySelectorAll("a.installed-app")
        .forEach(link => link.remove());

      getApps().forEach(app => {
        const link = document.createElement("a");
        link.className = "installed-app";
        link.href = app.link;

        const image = document.createElement("img");
        image.src = app.image || "";
        image.alt = app.name || "Application";

        const label = document.createElement("span");
        label.textContent = app.name || "Application";

        link.append(image, label);
        container.appendChild(link);
      });
    }

    renderApps();

    window.addEventListener("message", event => {
      if (event.data && event.data.type === "softo:apps") {
        renderApps();
      }
    });
  }

  // Reset old progress once for the updated task sequence.
  if (localStorage.getItem("taskVersion") !== TASK_VERSION) {
    resetTasks();
    localStorage.setItem("taskVersion", TASK_VERSION);
  }

  function start() {
    const desktopIcons = document.querySelector(".desktop-icon");

    if (desktopIcons) {
      setupDesktop(desktopIcons);
      setupTasks();
    } else {
      setupStore();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
