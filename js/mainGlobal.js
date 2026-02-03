//again pls
// /js/mainGlobal.js
document.addEventListener("DOMContentLoaded", () => {

  /*Base Page Setup*/

  document.documentElement.style.height = "100%";
  document.body.style.margin = "0";

  const main = document.querySelector(".main");
  if (!main) return;

  main.style.minHeight = "100vh";
  main.style.display = "flex";
  main.style.flexDirection = "column";


  /*Auto Favicon*/

  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "/img/Braxon'sStuffLogo-256x256.png";
    document.head.appendChild(favicon);
  }


  /*Title Handling*/

  const suffix = " | Braxon's Stuff";
  if (!document.title.endsWith(suffix)) {
    document.title += suffix;
  }


  /*Meta Helper*/

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


/*Theme Controller (FORCED + LIVE) */

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applySystemTheme() {
  const theme = mediaQuery.matches ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", theme);

  // Update browser UI color
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = theme === "dark" ? "#0f0f0f" : "#ffffff";
}

// FORCE reset on load
applySystemTheme();

// LIVE update when OS theme changes
mediaQuery.addEventListener("change", applySystemTheme);
//end

/*Global Header Loader (INSIDE .main)*/
  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {
      main.insertAdjacentHTML("afterbegin", html);
    })
    .catch(err => console.error("Failed to load header:", err));


  /* Auto Footer (inside .main)*/
  if (!main.querySelector("footer")) {
    const footer = document.createElement("footer");
    const year = new Date().getFullYear();

    footer.textContent = `© ${year} Braxon's Stuff. All rights reserved.`;
    footer.style.marginTop = "auto";

    main.appendChild(footer);
  }

});
