
(() => {
  function initWindowManager() {
    const desktop = document.querySelector("#screen-content");

    if (!desktop) {
      console.error("Window manager: #screen-content not found.");
      return;
    }

    if (document.querySelector("#window-layer")) return;

    const layer = document.createElement("div");
    layer.id = "window-layer";
    desktop.appendChild(layer);

    const taskbar = document.createElement("div");
    taskbar.id = "window-taskbar";
    document.body.appendChild(taskbar);

    let topZ = 10;
    const openWindows = [];

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function pinWindow(win, left, top) {
      win.classList.add("pinned");
      win.style.left = `${Math.round(left)}px`;
      win.style.top = `${Math.round(top)}px`;
    }

    function centerWindow(win) {
      win.classList.remove("pinned");
      win.style.removeProperty("left");
      win.style.removeProperty("top");
    }

    function maxLeft(win) {
      return Math.max(0, layer.clientWidth - win.offsetWidth);
    }

    function maxTop(win) {
      return Math.max(0, layer.clientHeight - win.offsetHeight);
    }

    function keepInView(win) {
      if (win.classList.contains("maximized")) return;
      if (!win.classList.contains("pinned")) return;

      pinWindow(
        win,
        clamp(parseFloat(win.style.left) || 0, 0, maxLeft(win)),
        clamp(parseFloat(win.style.top) || 0, 0, maxTop(win))
      );
    }

    window.addEventListener("resize", () => {
      openWindows.forEach(item => keepInView(item.win));
    });

    function openApp(url, title) {
      if (!url || url === "#") return;

      const name = String(title || "Application").trim() || "Application";

      const win = document.createElement("section");
      win.className = "app-window";
      win.setAttribute("role", "dialog");
      win.setAttribute("aria-label", name);

      win.innerHTML = `
        <div class="window-titlebar">
          <span class="window-title"></span>
          <div class="window-buttons">
            <button type="button" data-action="minimize" aria-label="Minimize" title="Minimize">_</button>
            <button type="button" data-action="maximize" aria-label="Maximize" title="Maximize">&#9633;</button>
            <button type="button" data-action="close" aria-label="Close" title="Close">&times;</button>
          </div>
        </div>
        <div class="window-content">
          <iframe title="${name.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}" src="about:blank"></iframe>
        </div>
      `;

      win.querySelector(".window-title").textContent = name;
      win.querySelector("iframe").src = url;

      const bar = document.createElement("button");
      bar.type = "button";
      bar.className = "taskbar-app";
      bar.textContent = name;
      bar.title = name;

      layer.appendChild(win);
      taskbar.appendChild(bar);

      let minimized = false;
      let maximized = false;
      let savedPosition = null;

      function focus() {
        openWindows.forEach(item => {
          item.win.classList.remove("active");
          item.bar.classList.remove("active");
          item.bar.setAttribute("aria-pressed", "false");
        });

        win.classList.add("active");
        bar.classList.add("active");
        bar.setAttribute("aria-pressed", "true");
        win.style.zIndex = String(++topZ);
      }

      function restore() {
        minimized = false;
        win.style.removeProperty("display");
        focus();
      }

      function minimize() {
        minimized = true;
        win.style.display = "none";
        win.classList.remove("active");
        bar.classList.remove("active");
        bar.setAttribute("aria-pressed", "false");
      }

      function maximize() {
        if (!maximized) {
          savedPosition = {
            pinned: win.classList.contains("pinned"),
            left: parseFloat(win.style.left) || 0,
            top: parseFloat(win.style.top) || 0
          };

          win.classList.remove("pinned");
          win.style.removeProperty("left");
          win.style.removeProperty("top");
          win.classList.add("maximized");
          maximized = true;
        } else {
          win.classList.remove("maximized");
          maximized = false;

          if (savedPosition && savedPosition.pinned) {
            pinWindow(win, savedPosition.left, savedPosition.top);
          } else {
            centerWindow(win);
          }
        }

        focus();
      }

      function close() {
        // Complete the task only for the ChatterBot window.
        if (/chatter\s*bot|chatbot/i.test(name)) {
          try {
            localStorage.setItem("chatEscaped", "1");

            // Tell the desktop task panel to refresh.
            window.dispatchEvent(new Event("focus"));
          } catch (error) {
            console.error("Could not save chatbot close progress:", error);
          }
        }

        const index = openWindows.findIndex(item => item.win === win);
        if (index !== -1) openWindows.splice(index, 1);

        win.remove();
        bar.remove();

        const next = openWindows
          .filter(item => item.win.style.display !== "none")
          .sort(
            (a, b) =>
              (Number(b.win.style.zIndex) || 0) -
              (Number(a.win.style.zIndex) || 0)
          )[0];

        if (next) next.focus();
      }

      const item = { win, bar, focus };
      openWindows.push(item);

      win.addEventListener("pointerdown", focus);

      win.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", event => {
          event.stopPropagation();

          switch (button.dataset.action) {
            case "minimize":
              minimize();
              break;

            case "maximize":
              maximize();
              break;

            case "close":
              close();
              break;
          }
        });
      });

      bar.addEventListener("click", () => {
        if (minimized) {
          restore();
        } else if (win.classList.contains("active")) {
          minimize();
        } else {
          restore();
        }
      });

      const titlebar = win.querySelector(".window-titlebar");

      titlebar.addEventListener("pointerdown", event => {
        if (event.button !== undefined && event.button !== 0) return;
        if (event.target.closest("button") || maximized) return;

        event.preventDefault();
        focus();

        const layerRect = layer.getBoundingClientRect();
        const rect = win.getBoundingClientRect();

        const startX = event.clientX;
        const startY = event.clientY;
        const startLeft = rect.left - layerRect.left;
        const startTop = rect.top - layerRect.top;

        pinWindow(win, startLeft, startTop);

        if (titlebar.setPointerCapture && event.pointerId !== undefined) {
          try {
            titlebar.setPointerCapture(event.pointerId);
          } catch (error) {}
        }

        function move(e) {
          pinWindow(
            win,
            clamp(startLeft + e.clientX - startX, 0, maxLeft(win)),
            clamp(startTop + e.clientY - startY, 0, maxTop(win))
          );
        }

        function stop(e) {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", stop);
          document.removeEventListener("pointercancel", stop);

          if (
            e &&
            titlebar.hasPointerCapture &&
            titlebar.hasPointerCapture(e.pointerId)
          ) {
            titlebar.releasePointerCapture(e.pointerId);
          }
        }

        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", stop);
        document.addEventListener("pointercancel", stop);
      });

      titlebar.addEventListener("dblclick", event => {
        if (event.target.closest("button")) return;
        maximize();
      });

      topZ += 1;
      focus();
    }

    desktop.addEventListener(
      "click",
      event => {
        const link = event.target.closest(".desktop-icon a");

        if (!link) return;

        event.preventDefault();

        openApp(
          link.getAttribute("href"),
          link.querySelector("span")?.textContent.trim() ||
            link.textContent.trim() ||
            "Application"
        );
      },
      true
    );

    window.openAppWindow = openApp;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWindowManager);
  } else {
    initWindowManager();
  }
})();
