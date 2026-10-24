const WATCH_SECONDS = 5;

function chatbotInstalled() {
  const apps = JSON.parse(localStorage.getItem('installedApps')) || [];
  return apps.some(app => /chat|softo/i.test(app.name + app.link));
}

function shouldAlert() {
  return localStorage.getItem('chatEscaped') === '1'
    && !chatbotInstalled()
    && localStorage.getItem('hackAlert') !== '1';
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 220;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 400);
  } catch (e) {}
}

function showAlert() {
  localStorage.setItem('hackAlert', '1');
  beep();

  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:"Courier New",monospace;';
  overlay.innerHTML = `
    <div style="width:min(90vw,360px);background:#c0c0c0;border:2px solid;border-color:#fff #404040 #404040 #fff;box-shadow:4px 4px 0 rgba(0,0,0,.5);padding:3px;">
      <div style="background:#800000;color:#fff;font-weight:bold;padding:4px 6px;">SYSTEM ALERT</div>
      <p style="margin:18px 12px;line-height:1.5;">
        <b>SoftO Chatbot</b> is hacking your system.
      </p>
      <div style="text-align:center;padding-bottom:12px;">
        <button type="button" style="font:inherit;padding:6px 24px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #404040 #404040 #fff;">OK</button>
      </div>
    </div>
  `;
  overlay.querySelector('button').addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

function startWatching() {
  if (!shouldAlert()) return;

  let timer = null;
  const video = document.querySelector('video');

  function begin() {
    if (timer) return;
    timer = setTimeout(() => {
      if (shouldAlert()) showAlert();
    }, WATCH_SECONDS * 1000);
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
  }

  if (video) {
    video.addEventListener('play', begin);
    video.addEventListener('pause', stop);
    video.addEventListener('ended', stop);
    if (!video.paused) begin();
  } else {
    begin();
  }
}

startWatching();
