/*Copyright © 2026 Braxon's Stuff. All rights reserved.*/
// /js/headerLoader.js
document.addEventListener("DOMContentLoaded", () => {

  const main = document.querySelector(".main");
  if (!main) return;

  /* -------------------- Global Header Loader -------------------- */
  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {
      main.insertAdjacentHTML("afterbegin", html);

      initGitHubIcon();
      initThemeToggle();
    })
    .catch(err => console.error("Failed to load header:", err));

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

  /* -------------------- Theme Toggle -------------------- */
  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const toggleIcon = document.getElementById("theme-toggle-icon");

    if (!toggleBtn || !toggleIcon) return;

    function updateIcon(theme) {
      if (theme === "dark") {
        toggleIcon.src = "/Media/img/LightDarkIcons/DarkToggle.png";
      } else if (theme === "light") {
        toggleIcon.src = "/Media/img/LightDarkIcons/LightToggle.png";
      } else {
        toggleIcon.src = "/Media/img/LightDarkIcons/DefaultToggle.png";
      }
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

    updateIcon(getSavedTheme());

    toggleBtn.addEventListener("click", cycleTheme);

    mediaQuery.addEventListener("change", () => {
      if (getSavedTheme() === "system") {
        applyTheme("system");
      }
    });
  }

  /* -------------------- GitHub Icon Theme Handling -------------------- */
  function initGitHubIcon() {
    const icon = document.getElementById("github-icon");
    if (!icon) return;

    function updateIcon() {
      const isDark = document.documentElement.dataset.theme === "dark";

      icon.src = isDark
        ? "/Media/img/GitHubLogos/GitHubLogo-White.png"
        : "/Media/img/GitHubLogos/GitHubLogo.png";
    }

    updateIcon();

    const observer = new MutationObserver(updateIcon);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }
});