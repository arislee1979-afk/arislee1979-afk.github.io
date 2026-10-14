"use strict";
const form = document.getElementById("filters");
const search = document.getElementById("search");
const category = document.getElementById("category");
const rows = Array.from(document.querySelectorAll("tbody tr"));
function filterRows() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const row of rows) {
    row.hidden = !(row.dataset.search.includes(query) && (!category.value || row.dataset.category === category.value));
    if (!row.hidden) count += 1;
  }
  document.getElementById("result-count").textContent = `顯示 ${count} / ${rows.length} 個已核准網頁 · 最新在前`;
  document.getElementById("empty").hidden = count !== 0;
}
form.hidden = false;
form.addEventListener("submit", event => event.preventDefault());
search.addEventListener("input", filterRows);
category.addEventListener("change", filterRows);
form.addEventListener("reset", () => requestAnimationFrame(filterRows));
filterRows();
