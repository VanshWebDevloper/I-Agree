const KEY = 'installedApps';
const STEP_KEY = 'taskStep';
const PROGRESS_KEYS = [STEP_KEY, 'chatOpened', 'chatEscaped', 'hackAlert'];

function resetTasks() {
  PROGRESS_KEYS.forEach(key => localStorage.removeItem(key));
}

if (localStorage.getItem('taskVersion') !== '2') {
  resetTasks();
  localStorage.setItem('taskVersion', '2');
}

function getApps() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function saveApps(apps) {
  localStorage.setItem(KEY, JSON.stringify(apps));
}

function hasChatbot() {
  return getApps().some(app => /chat|softo/i.test(app.name + app.link));
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
    done: () => localStorage.getItem('chatOpened') === '1'
  },
  {
    thought: "Something is wrong with it. I don't want to hear any more.",
    goal: "Close the chatbot",
    done: () => localStorage.getItem('chatEscaped') === '1'
  },
  {
    thought: "I got out. But I can still feel it waiting on this machine.",
    goal: "Uninstall the chatbot",
    done: () => !hasChatbot()
  },
  {
    thought: "It's gone. Finally I can relax. Let me watch something.",
    goal: "Watch videos on funTv",
    done: () => localStorage.getItem('hackAlert') === '1'
  },
  {
    thought: "That alert said SoftO chatbot is hacking!. But I deleted it. How is it still here?",
    goal: "Report at Cybercrime website.",
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
  localStorage.setItem(STEP_KEY, step);
  return step;
}

function setupTasks() {
  const box = document.createElement('div');
  box.className = 'task-box';
  box.innerHTML = `
    <div class="task-title">TASKS</div>
    <p class="task-thought"></p>
    <p class="task-goal"></p>
  `;
  document.body.appendChild(box);

  const style = document.createElement('style');
  style.textContent = `
    .task-box {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 260px;
      background: #c0c0c0;
      border: 2px solid;
      border-color: #fff #404040 #404040 #fff;
      box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
      font-family: "Courier New", monospace;
      font-size: 13px;
      color: #000;
    }
    .task-title {
      background: linear-gradient(90deg, #000080, #1084d0);
      color: #fff;
      font-weight: bold;
      padding: 3px 6px;
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
    }
    .task-goal::before {
      content: "[ ] ";
    }
    .task-goal.empty {
      display: none;
    }
  `;
  document.head.appendChild(style);

  const thought = box.querySelector('.task-thought');
  const goal = box.querySelector('.task-goal');

  function render() {
    const step = updateStep();
    if (step >= tasks.length) {
      thought.textContent = "It's quiet now. Too quiet.";
      goal.classList.add('empty');
      return;
    }
    thought.textContent = tasks[step].thought;
    goal.textContent = tasks[step].goal;
    goal.classList.remove('empty');
  }

  render();
  window.addEventListener('focus', render);
  window.addEventListener('pageshow', render);
}

function setupStore() {
  document.querySelectorAll('.app-card').forEach(card => {
    const button = card.querySelector('.install-button');
    const name = card.querySelector('.app-image span').textContent;
    const image = card.querySelector('.icon img').getAttribute('src').replace('../', '');
    const link = button.dataset.link || '#';

    function isInstalled() {
      return getApps().some(app => app.name === name);
    }

    function refresh() {
      button.textContent = isInstalled() ? 'Installed' : 'Install';
      button.classList.toggle('installed', isInstalled());
    }

    button.addEventListener('click', () => {
      if (isInstalled()) {
        saveApps(getApps().filter(app => app.name !== name));
      } else {
        saveApps([...getApps(), { name, image, link }]);
        if (/chat|softo/i.test(name + link)) resetTasks();
      }
      refresh();
    });

    refresh();
  });
}

function setupDesktop(container) {
  getApps().forEach(app => {
    const link = document.createElement('a');
    link.href = app.link;
    link.innerHTML = `<img src="${app.image}" alt="${app.name}"><span>${app.name}</span>`;
    container.appendChild(link);
  });
}

const desktopIcons = document.querySelector('.desktop-icon');

if (desktopIcons) {
  setupDesktop(desktopIcons);
  setupTasks();
} else {
  setupStore();
}
