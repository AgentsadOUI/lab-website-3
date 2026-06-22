(function () {
  let data = { pi: {}, members: [] };

  function render() {
    const lang = window.i18n.getLang();
    const piEl = document.getElementById("pi-name");
    if (piEl) piEl.textContent = data.pi[lang] ?? data.pi.ja ?? "";

    const list = document.getElementById("member-list");
    if (!list) return;
    list.innerHTML = data.members
      .map(
        (m) => `
        <li class="member-row">
          <span class="member-name">${lang === "ja" ? m.name_ja : m.name_en}</span>
          <span class="member-role">${lang === "ja" ? m.role_ja : m.role_en}</span>
        </li>`
      )
      .join("");
  }

  async function init() {
    try {
      const res = await fetch(window.i18n.dataPath("members.json"));
      data = await res.json();
    } catch (e) {
      data = { pi: {}, members: [] };
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("langchange", render);
})();
