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
  addMeta("name", "theme-color", document.documentElement.dataset.theme === "dark" ? "#0f0f0f" : "#ffffff");

  /* -------------------- Open Graph Meta -------------------- */
  addMeta("property", "og:title", "Braxon's Stuff");
  addMeta("property", "og:description", "Welcome to Braxon's Stuff! It's some stuff, by Braxon.");
  addMeta("property", "og:type", "website");
  addMeta("property", "og:url", "https://braxonsstuff.com/");
  addMeta("property", "og:image", "https://braxonsstuff.com/img/Braxon'sStuffLogo-128x128.png");

  /* -------------------- Twitter Card Meta -------------------- */
  addMeta("name", "twitter:card", "summary_large_image");
  addMeta("name", "twitter:title", "Braxon's Stuff");
  addMeta("name", "twitter:description", "Welcome to Braxon's Stuff! It's some stuff, by Braxon.");
  addMeta("name", "twitter:image", "https://braxonsstuff.com/img/Braxon'sStuffLogo-128x128.png");

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
  
/* Console Thingie */
(function() {
  const text = "BRAXON'S STUFF";
  const colors = ["#ff4b5c","#56cfe1","#ffbd69","#6a4c93","#4caf50","#f72585","#ffa500","#00ffff","#ff00ff","#ffff00"];
  const bgColors = ["#000","#111","#222","#333","#444","#555","#666"];
  const outputParts = [];
  const styleArgs = [];

  const decorations = ["underline","line-through","overline","none"];
  const transforms = ["rotate","skewX","skewY","translateY"];

  for (let i = 0; i < text.length; i++) {
    const color = colors[Math.floor(Math.random()*colors.length)];
    const bg = Math.random() < 0.3 ? bgColors[Math.floor(Math.random()*bgColors.length)] : "transparent";
    const bold = Math.random() < 0.5 ? "font-weight: bold;" : "";
    const italic = Math.random() < 0.4 ? "font-style: italic;" : "";
    const decoration = `text-decoration: ${decorations[Math.floor(Math.random()*decorations.length)]};`;
    const size = `${14 + Math.floor(Math.random()*24)}px`;
    const letterSpacing = Math.random() < 0.5 ? `${Math.floor(Math.random()*5)}px` : "0px";
    const shadow = Math.random() < 0.5 ? `${Math.floor(Math.random()*4-2)}px ${Math.floor(Math.random()*4-2)}px ${Math.floor(Math.random()*6)}px ${colors[Math.floor(Math.random()*colors.length)]}` : "none";
    
    let transform = "";
    if (Math.random() < 0.6) {
      const choice = transforms[Math.floor(Math.random()*transforms.length)];
      if(choice === "rotate") transform = `transform: rotate(${Math.floor(Math.random()*60-30)}deg); display:inline-block;`;
      if(choice === "skewX") transform = `transform: skewX(${Math.floor(Math.random()*30-15)}deg); display:inline-block;`;
      if(choice === "skewY") transform = `transform: skewY(${Math.floor(Math.random()*30-15)}deg); display:inline-block;`;
      if(choice === "translateY") transform = `transform: translateY(${Math.floor(Math.random()*10-5)}px); display:inline-block;`;
    }

    const style = `
      color: ${color};
      background: ${bg};
      font-size: ${size};
      font-weight: ${bold};
      font-style: ${italic};
      letter-spacing: ${letterSpacing};
      text-shadow: ${shadow};
      ${decoration}
      ${transform}
    `;

    outputParts.push("%c" + text[i]);
    styleArgs.push(style);
  }

  console.log(outputParts.join(""), ...styleArgs);
})();

});
