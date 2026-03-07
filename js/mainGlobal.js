// /js/mainGlobal.js
document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- Base Page Setup -------------------- */
  document.documentElement.style.height = "100%";
  document.body.style.margin = "0";

  const main = document.querySelector(".main");
  if (!main) return;

  main.style.minHeight = "100vh";
  main.style.display = "flex";
  main.style.flexDirection = "column";

  /* -------------------- Auto Favicon -------------------- */
  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "/img/Braxon'sStuffLogo-256x256.png";
    document.head.appendChild(favicon);
  }

  /* -------------------- Title Handling -------------------- */
  const suffix = " | Braxon's Stuff";
  if (!document.title.endsWith(suffix)) {
    document.title += suffix;
  }

  /* -------------------- Meta Helper -------------------- */
  function addMeta(attr, name, content) {
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  /* -------------------- Standard Meta -------------------- */
  addMeta("name", "viewport", "width=device-width, initial-scale=1.0");
  addMeta("name", "description", "Welcome to Braxon's Stuff! It's some stuff, by Braxon.");
  addMeta("name", "theme-color", "#ffffff");

  /* -------------------- Theme Controller -------------------- */

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const THEME_KEY = "braxon-theme";

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || "system";
  }

  function setMetaThemeColor() {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) return;

    const dark = document.documentElement.dataset.theme === "dark";
    metaTheme.content = dark ? "#0f0f0f" : "#ffffff";
  }

  function applyTheme(theme) {

    if (theme === "system") {
      document.documentElement.dataset.theme =
        mediaQuery.matches ? "dark" : "light";
    } else {
      document.documentElement.dataset.theme = theme;
    }

    setMetaThemeColor();
  }

  applyTheme(getSavedTheme());

  mediaQuery.addEventListener("change", () => {
    if (getSavedTheme() === "system") {
      applyTheme("system");
    }
  });

  /* -------------------- Global Header Loader -------------------- */

  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {

      main.insertAdjacentHTML("afterbegin", html);

      initGitHubIcon();
      initThemeToggle();

    })
    .catch(err => console.error("Failed to load header:", err));

  /* -------------------- Theme Toggle -------------------- */

  function initThemeToggle() {

    const toggleBtn = document.getElementById("theme-toggle");
    const toggleIcon = document.getElementById("theme-toggle-icon");

    function updateIcon(theme) {

      if (!toggleIcon) return;

      if (theme === "dark")
        toggleIcon.src = "/img/LightDarkIcons/DarkToggle.png";

      else if (theme === "light")
        toggleIcon.src = "/img/LightDarkIcons/LightToggle.png";

      else
        toggleIcon.src = "/img/LightDarkIcons/DefaultToggle.png";
    }

    function cycleTheme() {

      const current = getSavedTheme();

      let next;

      if (current === "system") next = "dark";
      else if (current === "dark") next = "light";
      else next = "system";

      localStorage.setItem(THEME_KEY, next);

      applyTheme(next);
      updateIcon(next);
    }

    const saved = getSavedTheme();
    updateIcon(saved);

    toggleBtn?.addEventListener("click", cycleTheme);
  }

  /* -------------------- GitHub Icon Theme Handling -------------------- */

  function initGitHubIcon() {

    const icon = document.getElementById("github-icon");
    if (!icon) return;

    function updateIcon() {

      const isDark = document.documentElement.dataset.theme === "dark";

      icon.src = isDark
        ? "/img/GitHubLogos/GitHubLogo-White.png"
        : "/img/GitHubLogos/GitHubLogo.png";
    }

    updateIcon();

    const observer = new MutationObserver(updateIcon);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  /* -------------------- Auto Footer -------------------- */
  if (!main.querySelector("footer")) {
    const footer = document.createElement("footer");
    const year = new Date().getFullYear();

    footer.textContent = `© ${year} Braxon's Stuff. All rights reserved.`;
    footer.style.marginTop = "auto";
    footer.style.padding = "10px";
    footer.style.textAlign = "center";
    footer.style.fontSize = "13px";
    footer.style.opacity = "0.7";

    main.appendChild(footer);
  }

});
