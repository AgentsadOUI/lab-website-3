(function () {
  let uiStrings = {};
  let currentLang = localStorage.getItem("lang") || "ja";

  async function loadStrings() {
    const res = await fetch(dataPath("ui-strings.json"));
    uiStrings = await res.json();
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
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: currentLang }));
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
  }

  window.i18n = {
    getLang: () => currentLang,
    dataPath: dataPath,
  };

  document.addEventListener("DOMContentLoaded", async () => {
    await loadStrings();
    applyTranslations();
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  });
})();
