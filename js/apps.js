(() => {
  const KEY = 'installedApps';

  function getApps() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function saveApps(apps) {
    localStorage.setItem(KEY, JSON.stringify(apps));
  }

  function notifyApps() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'softo:apps' }, '*');
    }
  }

  function setupStore() {
    if (window.__softoStoreWired) return;
    window.__softoStoreWired = true;

    document.querySelectorAll('.app-card').forEach(card => {
      const button = card.querySelector('.install-button');
      const label = card.querySelector('.app-image span');
      const icon = card.querySelector('.icon img');

      if (!button || !label) return;

      const name = label.textContent.trim();
      const image = icon ? icon.getAttribute('src').replace('../', '') : '';
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
        notifyApps();
      });

      refresh();
    });
  }

  function setupDesktop(container) {
    if (window.__softoDesktopWired) return;
    window.__softoDesktopWired = true;

    function renderApps() {
      container.querySelectorAll('a.installed-app').forEach(link => link.remove());

      getApps().forEach(app => {
        const link = document.createElement('a');
        link.className = 'installed-app';
        link.href = app.link;
        link.innerHTML = `<img src="${app.image}" alt="${app.name}"><span>${app.name}</span>`;
        container.appendChild(link);
      });
    }

    renderApps();

    window.addEventListener('message', event => {
      if (event.data && event.data.type === 'softo:apps') renderApps();
    });
  }

  const desktopIcons = document.querySelector('.desktop-icon');

  if (desktopIcons) {
    setupDesktop(desktopIcons);
  } else {
    setupStore();
  }
})();
