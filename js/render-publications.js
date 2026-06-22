(function () {
  let items = [];
  const citationMap = new Map();
  const CITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  function doiFromLink(link) {
    if (!link) return null;
    const m = link.match(/doi\.org\/(.+)$/i);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function localCacheGet(doi) {
    try {
      const raw = localStorage.getItem("citCache:" + doi);
      if (!raw) return null;
      const { count, ts } = JSON.parse(raw);
      if (Date.now() - ts > CITATION_TTL_MS) return null;
      return count;
    } catch (e) {
      return null;
    }
  }

  function localCacheSet(doi, count) {
    try {
      localStorage.setItem("citCache:" + doi, JSON.stringify({ count, ts: Date.now() }));
    } catch (e) {}
  }

  async function fetchCitationCount(doi) {
    const cached = localCacheGet(doi);
    if (cached !== null) return cached;
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      const count = data.message && data.message["is-referenced-by-count"];
      if (typeof count === "number") {
        localCacheSet(doi, count);
        return count;
      }
    } catch (e) {}
    return null;
  }

  function citationLabel(n) {
    const lang = window.i18n.getLang();
    return lang === "ja" ? `被引用数: ${n}` : `${n} citation${n === 1 ? "" : "s"}`;
  }

  function insertBadge(el, count) {
    if (el.querySelector(".pub-citations")) return;
    const meta = el.querySelector(".pub-meta");
    if (!meta) return;
    const badge = document.createElement("div");
    badge.className = "pub-citations";
    badge.textContent = citationLabel(count);
    meta.insertAdjacentElement("afterend", badge);
  }

  function applyCitations() {
    document.querySelectorAll(".pub-item[data-doi]").forEach((el) => {
      const doi = el.dataset.doi;
      if (citationMap.has(doi)) {
        const v = citationMap.get(doi);
        if (v !== null) insertBadge(el, v);
        return;
      }
      fetchCitationCount(doi).then((count) => {
        citationMap.set(doi, count);
        if (count !== null) {
          const target = document.querySelector(`.pub-item[data-doi="${CSS.escape(doi)}"]`);
          if (target) insertBadge(target, count);
        }
      });
    });
  }

  function buildYearOptions() {
    const select = document.getElementById("pub-year-filter");
    if (!select) return;
    const previous = select.value;
    const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a);
    const strings = window.i18n.strings();
    const allLabel = strings["publications.filter.allYears"]?.[window.i18n.getLang()] || "All years";
    select.innerHTML =
      `<option value="">${allLabel}</option>` + years.map((y) => `<option value="${y}">${y}</option>`).join("");
    if (previous) select.value = previous;
  }

  function getFiltered() {
    const search = (document.getElementById("pub-search")?.value || "").trim().toLowerCase();
    const yearFilter = document.getElementById("pub-year-filter")?.value || "";
    return items.filter((p) => {
      if (yearFilter && String(p.year) !== yearFilter) return false;
      if (!search) return true;
      const haystack = `${p.title} ${p.authors} ${p.journal}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  function render() {
    const list = document.getElementById("pub-list");
    if (!list) return;
    buildYearOptions();

    const filtered = getFiltered();
    if (filtered.length === 0) {
      const strings = window.i18n.strings();
      list.innerHTML = `<p class="news-empty">${strings["publications.empty"]?.[window.i18n.getLang()] || ""}</p>`;
      return;
    }

    const sorted = [...filtered].sort((a, b) => b.year - a.year);
    let html = "";
    let lastYear = null;
    sorted.forEach((p) => {
      if (p.year !== lastYear) {
        html += `<div class="pub-year">${p.year}</div>`;
        lastYear = p.year;
      }
      const doi = doiFromLink(p.link);
      const metaParts = [p.authors, p.journal ? `<em>${p.journal}</em>` : "", p.vol_pages].filter(Boolean);
      html += `
        <div class="pub-item"${doi ? ` data-doi="${doi}"` : ""}>
          <div class="pub-title">${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</div>
          <div class="pub-meta">${metaParts.join(" — ")}</div>
        </div>`;
    });
    list.innerHTML = html;
    applyCitations();
  }

  async function init() {
    try {
      const res = await fetch(window.i18n.dataPath("publications.json"));
      items = await res.json();
    } catch (e) {
      items = [];
    }
    render();

    const search = document.getElementById("pub-search");
    const yearFilter = document.getElementById("pub-year-filter");
    if (search) search.addEventListener("input", render);
    if (yearFilter) yearFilter.addEventListener("change", render);
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("langchange", render);
})();
