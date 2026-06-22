(function () {
  let uiStrings = {};
  let currentLang = localStorage.getItem("lang") || "ja";

  async function loadStrings() {
    const res = await fetch(dataPath("ui-strings.json"));
    uiStrings = await res.json();
    localStorage.setItem("uiStrings", JSON.stringify(uiStrings));
  }

  function dataPath(file) {
    const depth = document.body.dataset.depth || "";
    return depth + "data/" + file;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (uiStrings[key] && uiStrings[key][currentLang] !== undefined) {
        el.textContent = uiStrings[key][currentLang];
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (uiStrings[key] && uiStrings[key][currentLang] !== undefined) {
        el.placeholder = uiStrings[key][currentLang];
      }
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: currentLang }));
    document.documentElement.classList.add("i18n-ready");
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
  }

  window.i18n = {
    getLang: () => currentLang,
    dataPath: dataPath,
    strings: () => uiStrings,
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const cached = localStorage.getItem("uiStrings");
    if (cached) {
      try {
        uiStrings = JSON.parse(cached);
        applyTranslations();
      } catch (e) {}
    }
    await loadStrings();
    applyTranslations();
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  });
})();
