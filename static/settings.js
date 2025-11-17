// Settings toggles for project sections
(function () {
  const toggleBtn = document.getElementById("settings-toggle");
  const panel = document.getElementById("settings-panel");
  const closeBtn = document.getElementById("settings-close");
  const storageKey = "pm_section_visibility";

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function applyVisibility(state) {
    document.querySelectorAll("#settings-panel input[type='checkbox']").forEach((cb) => {
      const target = cb.dataset.target;
      const shouldShow = state[target] !== false;
      cb.checked = shouldShow;
      document.querySelectorAll(target).forEach((el) => {
        el.style.display = shouldShow ? "" : "none";
      });
    });
  }

  function init() {
    if (!toggleBtn || !panel) return;
    const state = loadState();
    applyVisibility(state);

    toggleBtn.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", () => panel.classList.remove("open"));
    }

    panel.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", () => {
        const target = cb.dataset.target;
        state[target] = cb.checked;
        applyVisibility(state);
        saveState(state);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
