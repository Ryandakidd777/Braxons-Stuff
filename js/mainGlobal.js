// /js/mainGlobal.js

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- Page & Main Layout -------------------- */
  document.documentElement.style.height = "100%";
  document.body.style.minHeight = "100vh";
  document.body.style.margin = "0";

  const main = document.querySelector(".main");
  if (main) {
    // Make .main control layout instead of body
    main.style.minHeight = "100vh";
    main.style.display = "flex";
    main.style.flexDirection = "column";
  }

  /* -------------------- Title -------------------- */
  const suffix = " | Braxon's Stuff";
  if (!document.title.endsWith(suffix)) {
    document.title += suffix;
  }

  /* -------------------- Meta Helper -------------------- */
  function addMeta(name, content, attr = "name") {
    if (!document.querySelector(`meta[${attr}="${name}"]`)) {
      const meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  /* -------------------- Meta Tags -------------------- */
  addMeta("viewport", "width=device-width, initial-scale=1.0");
  addMeta("description", "Welcome to Braxon's Stuff!");
  addMeta("theme-color", "#ffffff");

  /* -------------------- Auto Footer (inside .main) -------------------- */
  if (main && !main.querySelector("footer")) {
    const footer = document.createElement("footer");
    const year = new Date().getFullYear();

    footer.textContent = `© ${year} Braxon's Stuff. All rights reserved.`;

    footer.style.marginTop = "auto"; // push to bottom of .main
    footer.style.padding = "1px";
    footer.style.textAlign = "center";
    footer.style.fontSize = "13px";
    footer.style.opacity = "0.7";

    // Lift slightly without affecting layout height
    footer.style.transform = "translateY(-15px)";

    main.appendChild(footer);
  }

});
