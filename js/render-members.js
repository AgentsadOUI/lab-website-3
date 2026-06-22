(function () {
  let data = { pi: {}, members: [] };

  function render() {
    const lang = window.i18n.getLang();

    const piWrap = document.getElementById("pi-name-wrap");
    if (piWrap) {
      const piName = data.pi[lang] ?? data.pi.ja ?? "";
      piWrap.innerHTML = data.pi.slug
        ? `<a href="member.html?slug=${encodeURIComponent(data.pi.slug)}">${piName}</a>`
        : piName;
    }

    const list = document.getElementById("member-list");
    if (!list) return;
    list.innerHTML = data.members
      .map((m) => {
        const name = lang === "ja" ? m.name_ja : m.name_en;
        const role = lang === "ja" ? m.role_ja : m.role_en;
        const nameHtml = m.slug
          ? `<a href="member.html?slug=${encodeURIComponent(m.slug)}">${name}</a>`
          : name;
        return `
        <li class="member-row">
          <span class="member-name">${nameHtml}</span>
          <span class="member-role">${role}</span>
        </li>`;
      })
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
