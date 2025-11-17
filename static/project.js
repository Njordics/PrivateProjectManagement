// Orchestrator for project page
(function () {
  window.initProjectPage = function initProjectPage() {
    if (window.initTasks) window.initTasks();
    if (window.initBacklogs) window.initBacklogs();
    if (window.initSprints) window.initSprints();
    if (window.initResources) window.initResources();
  };
})();
