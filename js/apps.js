const KEY = 'installedApps';

function getApps() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function saveApps(apps) {
  localStorage.setItem(KEY, JSON.stringify(apps));
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
} else {
  setupStore();
}
