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
  function addMeta(name, content, attr = "name") {
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  addMeta("viewport", "width=device-width, initial-scale=1.0");
  addMeta("description", "Welcome to Braxon's Stuff!");
  addMeta("theme-color", "#ffffff");

  /* -------------------- Theme Controller (Live + Forced) -------------------- */
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function applySystemTheme() {
    const theme = mediaQuery.matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === "dark" ? "#0f0f0f" : "#ffffff";
    }
  }

  applySystemTheme();
  mediaQuery.addEventListener("change", applySystemTheme);

  /* -------------------- Global Header Loader -------------------- */
  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {
      main.insertAdjacentHTML("afterbegin", html);

      // After header is inserted, initialize GitHub icon theme switch
      initGitHubIcon();
    })
    .catch(err => console.error("Failed to load header:", err));

  /* -------------------- GitHub Icon Dark Mode Handling -------------------- */
  function initGitHubIcon() {
    const icon = document.getElementById("github-icon");
    if (!icon) return;

    function updateIcon() {
      const isDark = document.documentElement.dataset.theme === "dark" ||
                     mediaQuery.matches;
      icon.src = isDark ? "/img/GitHubLogos/GitHubLogo-White.png" : "/img/GitHubLogos/GitHubLogo.png";
    }

    updateIcon();

    mediaQuery.addEventListener("change", updateIcon);

    const observer = new MutationObserver(updateIcon);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
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
