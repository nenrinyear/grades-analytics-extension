(function initKsuProfessionalGpa() {
  const PANEL_ID = "ksu-professional-gpa-panel";
  const TABLE_ID = "01-seiseki-table";
  const TABLE_SELECTOR = "table.seiseki-table";
  const UPDATE_DELAY_MS = 120;
  let updateTimer = null;

  function collectRows(table) {
    return Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      const cells = tr.querySelectorAll("td");
      return {
        title: cells[1] ? cells[1].textContent : "",
        credits: cells[2] ? cells[2].textContent : "",
        grade: cells[4] ? cells[4].textContent : ""
      };
    });
  }

  function formatNumber(value, digits) {
    return Number(value).toFixed(digits);
  }

  function createStat(label, value) {
    const item = document.createElement("div");
    item.className = "ksu-gpa-stat";

    const labelElement = document.createElement("span");
    labelElement.className = "ksu-gpa-stat-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.className = "ksu-gpa-stat-value";
    valueElement.textContent = value;

    item.append(labelElement, valueElement);
    return item;
  }

  function findGradeTable() {
    return document.getElementById(TABLE_ID) || document.querySelector(TABLE_SELECTOR);
  }

  function isProfessionalRowsLoaded(rows) {
    return rows.some((row) => String(row.title || "").includes("【専門教育科目】"));
  }

  function renderPanel(result) {
    const existing = document.getElementById(PANEL_ID);
    if (existing) {
      existing.remove();
    }

    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "ksu-gpa-panel";

    const header = document.createElement("div");
    header.className = "ksu-gpa-header";

    const title = document.createElement("h2");
    title.textContent = "専門教育科目 GPA";

    const formula = document.createElement("p");
    formula.textContent = "秀=4、優=3、良=2、可=1 として単位数で加重平均しています。";

    header.append(title, formula);

    const stats = document.createElement("div");
    stats.className = "ksu-gpa-stats";

    stats.append(
      createStat("GPA", result.gpa === null ? "-" : formatNumber(result.gpa, 2)),
      createStat("対象単位", formatNumber(result.totalCredits, 1).replace(/\.0$/, "")),
      createStat("対象科目", String(result.courseCount)),
      createStat("秀 / 優 / 良 / 可", [
        result.gradeCounts["秀"],
        result.gradeCounts["優"],
        result.gradeCounts["良"],
        result.gradeCounts["可"]
      ].join(" / "))
    );

    const note = document.createElement("p");
    note.className = "ksu-gpa-note";
    note.textContent = "「専門教育科目」以下の行だけを対象にし、N、※、K、／、W/Ｗ、履修中止、見出し行は除外しています。";

    panel.append(header, stats, note);
    return panel;
  }

  function update() {
    const table = findGradeTable();
    if (!table || !window.KsuGpaCore) {
      return;
    }

    const rows = collectRows(table);
    if (!isProfessionalRowsLoaded(rows)) {
      return;
    }

    const result = window.KsuGpaCore.calculateProfessionalGpa(rows);
    table.insertAdjacentElement("beforebegin", renderPanel(result));
  }

  function removePanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) {
      existing.remove();
    }
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(() => {
      if (findGradeTable()) {
        update();
        return;
      }

      removePanel();
    }, UPDATE_DELAY_MS);
  }

  function isPanelNode(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element && (element.id === PANEL_ID || element.closest(`#${PANEL_ID}`)));
  }

  function isPanelMutation(mutation) {
    if (mutation.type === "characterData") {
      return isPanelNode(mutation.target);
    }

    const changedNodes = [
      ...Array.from(mutation.addedNodes),
      ...Array.from(mutation.removedNodes)
    ];

    return changedNodes.length > 0 && changedNodes.every(isPanelNode);
  }

  function start() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.every(isPanelMutation)) {
        return;
      }

      scheduleUpdate();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });

    scheduleUpdate();
  }

  start();
})();
