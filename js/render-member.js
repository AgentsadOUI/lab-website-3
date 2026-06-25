(function () {
  let member = null;
  let isPI = false;
  let publications = [];

  function getSlug() {
    return new URLSearchParams(location.search).get("slug") || "";
  }

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

  function matchesMember(authors) {
    if (!member || !Array.isArray(member.name_match) || member.name_match.length === 0) return false;
    const a = (authors || "").toLowerCase();
    return member.name_match.some((n) => a.includes(String(n).toLowerCase()));
  }

  function renderPubs() {
    const lang = window.i18n.getLang();
    const list = document.getElementById("member-pub-list");
    if (!list) return;
    const matched = publications.filter((p) => matchesMember(p.authors));
    if (matched.length === 0) {
      const strings = window.i18n.strings();
      list.innerHTML = `<p class="news-empty">${strings["member.publications.empty"]?.[lang] || ""}</p>`;
      return;
    }
    const sorted = [...matched].sort((a, b) => b.year - a.year);
    let html = "";
    let lastYear = null;
    sorted.forEach((p) => {
      if (p.year !== lastYear) {
        html += `<div class="pub-year">${p.year}</div>`;
        lastYear = p.year;
      }
      const metaParts = [p.authors, p.journal ? `<em>${p.journal}</em>` : "", p.vol_pages].filter(Boolean);
      html += `
        <div class="pub-item">
          <div class="pub-title">${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</div>
          <div class="pub-meta">${metaParts.join(" — ")}</div>
        </div>`;
    });
    list.innerHTML = html;
  }

  function render() {
    const lang = window.i18n.getLang();
    const profileEl = document.getElementById("member-profile");
    if (!profileEl) return;

    if (!member) {
      const strings = window.i18n.strings();
      profileEl.innerHTML = `<p>${strings["member.notFound"]?.[lang] || "Member not found."}</p>`;
      return;
    }

    const name = isPI ? member[lang] ?? member.ja : lang === "ja" ? member.name_ja : member.name_en;
    const role = isPI
      ? window.i18n.strings()["members.pi.role"]?.[lang] || ""
      : lang === "ja"
      ? member.role_ja
      : member.role_en;
    const bio = lang === "ja" ? member.bio_ja : member.bio_en;

    document.title = name;
    const titleEl = document.getElementById("member-title");
    if (titleEl) titleEl.textContent = name;

    profileEl.innerHTML = `
      <div class="member-profile-card">
        ${avatarHtml(name, member.photo)}
        <div class="member-profile-info">
          <h1>${name}</h1>
          <div class="member-role">${role || ""}</div>
          ${bio ? `<p class="member-bio">${bio}</p>` : ""}
        </div>
      </div>`;

    renderPubs();
  }

  async function init() {
    const slug = getSlug();
    try {
      const [membersRes, pubsRes] = await Promise.all([
        fetch(window.i18n.dataPath("members.json")),
        fetch(window.i18n.dataPath("publications.json")),
      ]);
      const data = await membersRes.json();
      publications = await pubsRes.json();

      if (data.pi && data.pi.slug === slug) {
        member = data.pi;
        isPI = true;
      } else {
        member = (data.members || []).find((m) => m.slug === slug) || null;
        isPI = false;
      }
    } catch (e) {
      member = null;
      publications = [];
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("langchange", render);
})();
