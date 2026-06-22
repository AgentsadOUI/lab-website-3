(function () {
  let items = [];

  function render() {
    const list = document.getElementById("pub-list");
    if (!list) return;
    const sorted = [...items].sort((a, b) => b.year - a.year);
    let html = "";
    let lastYear = null;
    sorted.forEach((p) => {
      if (p.year !== lastYear) {
        html += `<div class="pub-year">${p.year}</div>`;
        lastYear = p.year;
      }
      html += `
        <div class="pub-item">
          <div class="pub-title">${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</div>
          <div class="pub-meta">${p.authors} — <em>${p.journal}</em>, ${p.vol_pages}</div>
        </div>`;
    });
    list.innerHTML = html;
  }

  async function init() {
    try {
      const res = await fetch(window.i18n.dataPath("publications.json"));
      items = await res.json();
    } catch (e) {
      items = [];
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
