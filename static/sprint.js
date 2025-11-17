// Sprints module
(function () {
  const sprintState = { items: [] };

  async function loadSprints() {
    try {
      const items = await window.api(`/api/sprints/${window.PROJECT_ID}`);
      sprintState.items = items;
      renderSprints();
    } catch (err) {
      document.getElementById("sprint-list").innerHTML = `<p class="error">Failed to load sprints: ${err.message}</p>`;
    }
  }

  function renderSprints() {
    const list = document.getElementById("sprint-list");
    if (!list) return;
    list.innerHTML = "";
    if (!sprintState.items.length) {
      list.innerHTML = '<p class="muted">No sprints yet.</p>';
      return;
    }
    sprintState.items.forEach((sprint) => {
      const card = document.createElement("div");
      card.className = "sprint-item";
      card.draggable = true;
      card.dataset.id = sprint.id;

      const header = document.createElement("header");
      const title = document.createElement("div");
      title.textContent = sprint.name;
      const actions = document.createElement("div");
      actions.className = "backlog-actions";
      const editBtn = document.createElement("button");
      editBtn.className = "pill ghost";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editSprint(sprint));
      const delBtn = document.createElement("button");
      delBtn.className = "pill danger";
      delBtn.textContent = "✕";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", () => deleteSprint(sprint.id));
      actions.append(editBtn, delBtn);
      header.append(title, actions);

      const meta = document.createElement("div");
      meta.className = "sprint-meta";
      const status = document.createElement("span");
      status.className = "badge";
      status.textContent = sprint.status;
      const velocity = document.createElement("span");
      velocity.className = "badge";
      velocity.textContent = `Velocity: ${sprint.velocity || 0}`;
      const dates = document.createElement("span");
      dates.className = "badge";
      dates.textContent = `${sprint.start_date || ""} ${sprint.end_date ? "→ " + sprint.end_date : ""}`.trim();
      meta.append(status, velocity, dates);

      const scope = sprint.scope_points || 0;
      const done = Math.min(scope, sprint.done_points || 0);
      const pct = scope ? Math.round((done / scope) * 100) : 0;
      const progress = document.createElement("div");
      progress.className = "sprint-progress";
      const bar = document.createElement("div");
      bar.style.width = `${pct}%`;
      progress.append(bar);

      const notes = document.createElement("div");
      notes.className = "muted";
      notes.textContent = sprint.notes || "No notes";

      const controls = document.createElement("div");
      controls.className = "sprint-meta";
      controls.append(
        makeLabel("Scope", numberInput(scope, (v) => quickUpdateSprint(sprint.id, { scope_points: v }))),
        makeLabel("Done", numberInput(done, (v) => quickUpdateSprint(sprint.id, { done_points: v }))),
        makeLabel("Velocity", numberInput(sprint.velocity || 0, (v) => quickUpdateSprint(sprint.id, { velocity: v }))),
        makeLabel("Status", statusSelect(sprint.status, (v) => quickUpdateSprint(sprint.id, { status: v })))
      );

      card.append(header, meta, progress, notes, controls);

      card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
        card.dataset.dragging = "true";
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        delete card.dataset.dragging;
      });

      list.append(card);
    });
  }

  function numberInput(value, onChange) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = value;
    input.addEventListener("change", () => onChange(input.value));
    return input;
  }

  function statusSelect(value, onChange) {
    const sel = document.createElement("select");
    [
      { value: "planned", label: "Planned" },
      { value: "active", label: "Active" },
      { value: "done", label: "Done" },
    ].forEach(({ value: v, label }) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = label;
      if (v === value) opt.selected = true;
      sel.append(opt);
    });
    sel.addEventListener("change", () => onChange(sel.value));
    return sel;
  }

  function makeLabel(text, el) {
    const wrap = document.createElement("label");
    wrap.className = "backlog-field";
    const span = document.createElement("span");
    span.textContent = text;
    wrap.append(span, el);
    return wrap;
  }

  async function addSprint(data) {
    const payload = Object.fromEntries(data.entries());
    try {
      await window.api(`/api/sprints/${window.PROJECT_ID}`, { method: "POST", body: JSON.stringify(payload) });
      await loadSprints();
    } catch (err) {
      alert(`Unable to add sprint: ${err.message}`);
    }
  }

  async function quickUpdateSprint(id, payload) {
    try {
      await window.api(`/api/sprint/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      await loadSprints();
    } catch (err) {
      alert(`Unable to update sprint: ${err.message}`);
    }
  }

  async function editSprint(item) {
    const name = prompt("Sprint name", item.name);
    if (name === null || !name.trim()) return;
    const status = prompt("Status (planned/active/done)", item.status) || item.status;
    const start_date = prompt("Start date (YYYY-MM-DD)", item.start_date || "") || item.start_date;
    const end_date = prompt("End date (YYYY-MM-DD)", item.end_date || "") || item.end_date;
    const velocity = prompt("Velocity", item.velocity || 0) || item.velocity;
    const scope_points = prompt("Scope points", item.scope_points || 0) || item.scope_points;
    const done_points = prompt("Done points", item.done_points || 0) || item.done_points;
    const notes = prompt("Notes", item.notes || "") || item.notes;
    await quickUpdateSprint(item.id, { name, status, start_date, end_date, velocity, scope_points, done_points, notes });
  }

  async function deleteSprint(id) {
    if (!confirm("Delete this sprint?")) return;
    try {
      await fetch(`/api/sprint/${id}`, { method: "DELETE" });
      await loadSprints();
    } catch (err) {
      alert(`Unable to delete: ${err.message}`);
    }
  }

  function setupSprintForm() {
    const sprintForm = document.getElementById("sprint-form");
    if (!sprintForm) return;
    sprintForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(sprintForm);
      if (!data.get("name")) return;
      await addSprint(data);
      sprintForm.reset();
    });
  }

  function setupSprintDnD() {
    const list = document.getElementById("sprint-list");
    if (!list) return;
    list.addEventListener("dragover", (e) => e.preventDefault());
    list.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = list.querySelector('[data-dragging="true"]');
      if (!dragging) return;
      const rect = list.getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      const items = Array.from(list.children).filter((c) => c !== dragging);
      const insertBefore = items.find((card) => dropY < card.offsetTop - list.offsetTop + card.offsetHeight / 2);
      if (insertBefore) {
        list.insertBefore(dragging, insertBefore);
      } else {
        list.appendChild(dragging);
      }
    });
  }

  window.initSprints = function initSprints() {
    loadSprints();
    setupSprintForm();
    setupSprintDnD();
  };
})();
