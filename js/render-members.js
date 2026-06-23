(function () {
  let data = { pi: {}, members: [] };

  function initials(name) {
    return (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function avatarHtml(name, photo) {
    if (photo) {
      return `<img class="member-avatar" src="${photo}" alt="${name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'member-avatar member-avatar-fallback',textContent:'${initials(name)}'}))">`;
    }
    return `<div class="member-avatar member-avatar-fallback">${initials(name)}</div>`;
  }

  function cardHtml({ name, role, bio, photo }) {
    const nameHtml = name;
    return `
      <div class="member-card">
        ${avatarHtml(name, photo)}
        <div class="member-card-info">
          <div class="member-card-header">
            <span class="member-card-name">${nameHtml}</span>
            <span class="member-role">${role || ""}</span>
          </div>
          ${bio ? `<p class="member-bio">${bio}</p>` : ""}
        </div>
      </div>`;
  }

  function applyStagger(container, startIndex) {
    container.querySelectorAll(".member-card").forEach((card, i) => {
      card.style.animationDelay = (0.06 + (startIndex + i) * 0.07) + "s";
      card.style.animationName = "none";
      card.offsetHeight;
      card.style.animationName = "";
    });
  }

  function render() {
    const lang = window.i18n.getLang();

    const piWrap = document.getElementById("pi-card-wrap");
    if (piWrap) {
      const piName = data.pi[lang] ?? data.pi.ja ?? "";
      const piRole = window.i18n.strings()["members.pi.role"]?.[lang] || "";
      const piBio = lang === "ja" ? data.pi.bio_ja : data.pi.bio_en;
      piWrap.innerHTML = cardHtml({
        name: piName,
        role: piRole,
        bio: piBio,
        photo: data.pi.photo,
      });
      applyStagger(piWrap, 0);
    }

    const list = document.getElementById("member-list");
    if (!list) return;
    list.innerHTML = data.members
      .map((m) => {
        const name = lang === "ja" ? m.name_ja : m.name_en;
        const role = lang === "ja" ? m.role_ja : m.role_en;
        const bio = lang === "ja" ? m.bio_ja : m.bio_en;
        return cardHtml({ name, role, bio, photo: m.photo });
      })
      .join("");
    applyStagger(list, piWrap ? 1 : 0);
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
