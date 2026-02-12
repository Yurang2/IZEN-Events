const activeKey = "alpha";

const projects = {
  alpha: {
    tasks: [
      { id: 1, title: "요구사항 정리", status: "done", owner: "민지", delayDays: 0, milestoneAt: "2026-03-20" },
      { id: 2, title: "UI 설계", status: "ongoing", owner: "태훈", delayDays: 3, milestoneAt: "2026-03-01" },
      { id: 3, title: "API 연동", status: "todo", owner: "지수", delayDays: 0, milestoneAt: "2026-03-30" },
      { id: 4, title: "테스트 케이스", status: "ongoing", owner: "민지", delayDays: 1, milestoneAt: "2026-02-28" }
    ]
  }
};

const filterState = {
  zoom: "month",
  showDelay: true,
  showOngoing: true,
  status: "all",
  owner: "all"
};

function createKpiCard(label, value, className = "") {
  const card = document.createElement("article");
  card.className = "kpi-card";

  const labelEl = document.createElement("span");
  labelEl.className = "kpi-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("strong");
  valueEl.className = `kpi-value ${className}`.trim();
  valueEl.textContent = value;

  card.append(labelEl, valueEl);
  return card;
}

function buildKpiSection(metrics) {
  const grid = document.createElement("div");
  grid.className = "kpi-grid";

  grid.append(
    createKpiCard("전체 업무", `${metrics.total}`),
    createKpiCard("완료율", `${metrics.completionRate}%`),
    createKpiCard("지연 건수", `${metrics.delayCount}`, metrics.delayCount > 0 ? "is-danger" : ""),
    createKpiCard("평균 지연일", `${metrics.avgDelayDays}일`),
    createKpiCard("마일스톤 D-day", metrics.nextMilestoneDday)
  );

  return grid;
}

function buildToolbar(ownerOptions) {
  const toolbar = document.createElement("div");
  toolbar.className = "filter-toolbar";

  toolbar.innerHTML = `
    <div class="filter-item">
      <label for="zoom">Zoom</label>
      <select id="zoom">
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
      </select>
    </div>
    <div class="filter-item">
      <label for="status">상태 필터</label>
      <select id="status">
        <option value="all">전체</option>
        <option value="todo">할 일</option>
        <option value="ongoing">진행중</option>
        <option value="done">완료</option>
      </select>
    </div>
    <div class="filter-item">
      <label for="owner">담당자 필터</label>
      <select id="owner"></select>
    </div>
    <div class="filter-item">
      <label>표시 옵션</label>
      <div class="checkbox-row">
        <input id="showDelay" type="checkbox" />
        <label for="showDelay">지연 표시</label>
      </div>
    </div>
    <div class="filter-item">
      <label>&nbsp;</label>
      <div class="checkbox-row">
        <input id="showOngoing" type="checkbox" />
        <label for="showOngoing">진행중 표시</label>
      </div>
    </div>
  `;

  const ownerSelect = toolbar.querySelector("#owner");
  ownerSelect.innerHTML = `<option value="all">전체</option>${ownerOptions
    .map((owner) => `<option value="${owner}">${owner}</option>`)
    .join("")}`;

  const controls = {
    zoom: toolbar.querySelector("#zoom"),
    showDelay: toolbar.querySelector("#showDelay"),
    showOngoing: toolbar.querySelector("#showOngoing"),
    status: toolbar.querySelector("#status"),
    owner: toolbar.querySelector("#owner")
  };

  controls.zoom.value = filterState.zoom;
  controls.showDelay.checked = filterState.showDelay;
  controls.showOngoing.checked = filterState.showOngoing;
  controls.status.value = filterState.status;
  controls.owner.value = filterState.owner;

  Object.entries(controls).forEach(([key, control]) => {
    const evt = control.type === "checkbox" ? "change" : "input";
    control.addEventListener(evt, () => {
      filterState[key] = control.type === "checkbox" ? control.checked : control.value;
      renderProject(activeKey);
    });
  });

  return toolbar;
}

function calculateMetrics(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const delayed = tasks.filter((task) => task.delayDays > 0);
  const delayCount = delayed.length;
  const avgDelayDays = delayCount ? (delayed.reduce((sum, task) => sum + task.delayDays, 0) / delayCount).toFixed(1) : 0;

  const today = new Date();
  const nearestTask = [...tasks].sort((a, b) => new Date(a.milestoneAt) - new Date(b.milestoneAt))[0];
  const dday = nearestTask
    ? Math.ceil((new Date(nearestTask.milestoneAt).setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    : "-";

  return {
    total,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    delayCount,
    avgDelayDays,
    nextMilestoneDday: typeof dday === "number" ? `D-${dday}` : "-"
  };
}

function applyFilters(tasks) {
  return tasks.filter((task) => {
    if (filterState.status !== "all" && task.status !== filterState.status) return false;
    if (filterState.owner !== "all" && task.owner !== filterState.owner) return false;
    if (!filterState.showDelay && task.delayDays > 0) return false;
    if (!filterState.showOngoing && task.status === "ongoing") return false;
    return true;
  });
}

function renderProject(key) {
  const project = projects[key];
  const header = document.querySelector("#projHeader");
  const body = document.querySelector("#projectBody");
  const owners = [...new Set(project.tasks.map((task) => task.owner))];

  const visibleTasks = applyFilters(project.tasks);
  const metrics = calculateMetrics(visibleTasks.length ? visibleTasks : project.tasks);

  header.replaceChildren(buildKpiSection(metrics), buildToolbar(owners));
  body.innerHTML = `<b>활성 필터:</b> ${JSON.stringify(filterState)}<br/><b>표시 업무:</b> ${visibleTasks
    .map((task) => task.title)
    .join(", ")}`;
}

renderProject(activeKey);
