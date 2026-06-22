(function () {
  let items = [];

  function formatDate(iso, lang) {
    const [y, m, d] = iso.split("-").map(Number);
    if (lang === "ja") return `${y}年${m}月${d}日`;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[m - 1]} ${d}, ${y}`;
  }

  function render() {
    const list = document.getElementById("news-list");
    if (!list) return;
    const lang = window.i18n.getLang();
    if (items.length === 0) {
      list.innerHTML = '<li class="news-empty" data-i18n-empty></li>';
      return;
    }
    const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
    list.innerHTML = sorted
      .map(
        (item) => `
        <li class="news-item">
          <span class="news-date">${formatDate(item.date, lang)}</span>
          <span class="news-text">${item[lang] ?? item.ja ?? ""}</span>
        </li>`
      )
      .join("");
  }

  async function init() {
    try {
      const res = await fetch(window.i18n.dataPath("news.json"));
      items = await res.json();
    } catch (e) {
      items = [];
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("langchange", render);
})();
