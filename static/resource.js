// Resource management module
(function () {
  const state = { items: [] };

  async function loadResources() {
    try {
      const items = await window.api(`/api/resources/${window.PROJECT_ID}`);
      state.items = items;
      renderResources();
      broadcast();
    } catch (err) {
      const list = document.getElementById("resource-list");
      if (list) list.innerHTML = `<p class="error">Failed to load resources: ${err.message}</p>`;
    }
  }

  function broadcast() {
    window.dispatchEvent(new CustomEvent("resources:update", { detail: state.items }));
  }

  function renderResources() {
    const list = document.getElementById("resource-list");
    if (!list) return;
    list.innerHTML = "";
    if (!state.items.length) {
      list.innerHTML = '<p class="muted">No resources yet.</p>';
      return;
    }
    state.items.forEach((res) => {
      const card = document.createElement("div");
      card.className = "resource-item";

      const header = document.createElement("header");
      header.textContent = res.name;

      const actions = document.createElement("div");
      actions.className = "backlog-actions";

      const statusSel = document.createElement("select");
      [
        { value: "free", label: "Free" },
        { value: "overloaded", label: "Overloaded" },
        { value: "holiday", label: "On holiday" },
      ].forEach(({ value, label }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        if (value === res.status) opt.selected = true;
        statusSel.append(opt);
      });
      statusSel.addEventListener("change", () => quickUpdate(res.id, { status: statusSel.value }));

      const notesInput = document.createElement("input");
      notesInput.type = "text";
      notesInput.placeholder = "Notes";
      notesInput.value = res.notes || "";
      notesInput.addEventListener("change", () => quickUpdate(res.id, { notes: notesInput.value }));

      const delBtn = document.createElement("button");
      delBtn.className = "pill danger";
      delBtn.textContent = "✕";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", () => deleteResource(res.id));

      actions.append(statusSel, notesInput, delBtn);
      card.append(header, actions);
      list.append(card);
    });
  }

  async function addResource(data) {
    const payload = Object.fromEntries(data.entries());
    try {
      await window.api(`/api/resources/${window.PROJECT_ID}`, { method: "POST", body: JSON.stringify(payload) });
      await loadResources();
    } catch (err) {
      alert(`Unable to add resource: ${err.message}`);
    }
  }

  async function quickUpdate(id, payload) {
    try {
      await window.api(`/api/resource/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      await loadResources();
    } catch (err) {
      alert(`Unable to update resource: ${err.message}`);
    }
  }

  async function deleteResource(id) {
    if (!confirm("Delete this resource?")) return;
    try {
      await fetch(`/api/resource/${id}`, { method: "DELETE" });
      await loadResources();
    } catch (err) {
      alert(`Unable to delete: ${err.message}`);
    }
  }

  function setupForm() {
    const form = document.getElementById("resource-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (!data.get("name")) return;
      await addResource(data);
      form.reset();
    });
  }

  window.initResources = function initResources() {
    loadResources();
    setupForm();
  };
})();
