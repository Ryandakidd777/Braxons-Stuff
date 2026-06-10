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
    favicon.href = "/img/Braxon'sStuffLogo-Favicon.svg";
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

  /* -------------------- Theme Toggle -------------------- */ //NEEDS FIXING//
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

// add thing to change all icons/logos to their dark and light mode 

/* -------------------- Auto Footer -------------------- */
  function injectAutoFooter() {
    if (main.querySelector("footer")) return;

    const footer = document.createElement("footer");
    const year = new Date().getFullYear();

    footer.innerHTML = `
      <p id="last-updated">Checking GitHub for updates...</p>
      <p>&copy; ${year} MrChicken's Homemade Website. All rights reserved.</p>
    `;

    footer.style.marginTop = "auto";
    footer.style.padding = "10px";
    footer.style.textAlign = "center";
    footer.style.fontSize = "13px";
    footer.style.opacity = "0.7";

    main.appendChild(footer);

    let initialPushTime = null;

    // Check GitHub function
    async function checkWebsiteUpdate() {
      try {
        const response = await fetch("https://api.github.com/repos/Ryandakidd777/MrChicken-Braxons-Stuff");
        if (!response.ok) throw new Error("GitHub API connection failed");
        
        const repoData = await response.json();
        const currentPushTime = Date.parse(repoData.pushed_at); 
        
        const formattedDate = new Date(currentPushTime).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const statusLabel = document.getElementById("last-updated");
        if (!statusLabel) return;

        // 1. Initial Page Load Setup
        if (initialPushTime === null) {
            initialPushTime = currentPushTime;
            statusLabel.innerText = `Last updated: ${formattedDate}`;
        } 
        // 2. Continuous Live Updates (Appends Outdated Warning)
        else if (currentPushTime > initialPushTime) {
            statusLabel.innerHTML = `
                Last updated: ${formattedDate} <span style="color: #ff4a4a; font-weight: 800; margin-left: 5px;">(Outdated - Please Refresh)</span>
            `;
        }
        
      } catch (error) {
        console.error("Error tracking repository update status:", error);
      }
    }

    // Runs immediately on page display, then schedules background updates every 5 minutes
    checkWebsiteUpdate(); 
    setInterval(checkWebsiteUpdate, 5 * 60 * 1000); 
  }

  // Trigger the footer routine
  injectAutoFooter();
  
  /* -------------------- Missing Image Handler -------------------- */
  const PLACEHOLDER_IMG = "/img/misc/Placeholder.png";

  function handleImageError(img) {
    if (img.dataset.fallbackApplied) return; // Prevent loops

    console.warn(`Missing image detected: ${img.src}`);
    img.dataset.fallbackApplied = "true";

    // Set title with missing image source
    img.title = `Placeholder: Missing image: ${img.src}`;

    // Replace source with placeholder
    img.src = PLACEHOLDER_IMG;
  }

  // Attach to existing images
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => handleImageError(img));
  });

  // Watch for dynamically added images
  const imgObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === "IMG") {
          node.addEventListener("error", () => handleImageError(node));
        }

        if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach(img => {
            img.addEventListener("error", () => handleImageError(img));
          });
        }
      });
    });
  });

  imgObserver.observe(document.body, { childList: true, subtree: true });

  /* -------------------- Console Thingie -------------------- */
  (function() {
    const text = "BRAXON'S STUFF";
    const fonts = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Impact", "Comic Sans MS", "Trebuchet MS", "Lucida Sans Unicode", "Palatino Linotype"];
    const decorations = ["underline", "line-through", "overline", "none", "wavy underline", "dotted line-through", "double overline", "dashed underline", "solid overline"];
    const borders = ["none", "1px solid", "2px dashed", "3px dotted", "1px double", "4px groove", "2px ridge", "5px inset", "3px outset"];
    const transforms = ["rotate", "skewX", "skewY", "translateX", "translateY", "scale", "scaleX", "scaleY", "matrix", "perspective"];
    const filters = ["none", "blur(2px)", "brightness(150%)", "contrast(200%)", "grayscale(100%)", "hue-rotate(90deg)", "invert(100%)", "saturate(200%)", "sepia(100%)", "drop-shadow(4px 4px 2px rgba(0,0,0,0.5))"];
    const outputParts = [];
    const styleArgs = [];

    // Function to generate fully random hex color
    function randomHexColor() {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    // Function to generate random RGBA for backgrounds with transparency
    function randomRgba() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const a = (Math.random() * 0.8 + 0.2).toFixed(2); // Avoid full transparency
      return `rgba(${r},${g},${b},${a})`;
    }

    // Set to only one line
    for (let i = 0; i < text.length; i++) {
      const color = randomHexColor(); // Fully random color
      const bg = Math.random() < 0.6 ? randomRgba() : "transparent"; // Random background with chance for transparency
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      const bold = Math.random() < 0.8 ? "bold" : "normal";
      const italic = Math.random() < 0.7 ? "italic" : "normal";
      const oblique = Math.random() < 0.3 ? "oblique" : "";
      const decorationStyle = decorations[Math.floor(Math.random() * decorations.length)];
      const decorationColor = randomHexColor();
      const decoration = `text-decoration: ${decorationStyle} ${decorationColor};`;
      const size = `${Math.floor(Math.random() * 20) + 20}px`; // More similar sizes: 20-39px with a cap
      const letterSpacing = `${Math.floor(Math.random() * 20 - 10)}px`; // More extreme spacing
      const wordSpacing = `${Math.floor(Math.random() * 30 - 15)}px`;
      const shadowX = Math.floor(Math.random() * 20 - 10);
      const shadowY = Math.floor(Math.random() * 20 - 10);
      const shadowBlur = Math.floor(Math.random() * 30);
      const shadowColor = randomHexColor();
      const shadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`;
      const padding = `${Math.floor(Math.random() * 20)}px ${Math.floor(Math.random() * 20)}px`;
      const margin = `${Math.floor(Math.random() * 10 - 5)}px`; // Can be negative for overlap chaos
      const borderStyle = borders[Math.floor(Math.random() * borders.length)];
      const borderColor = randomHexColor();
      const border = `${borderStyle} ${borderColor}`;
      const opacity = (Math.random() * 0.8 + 0.2).toFixed(2); // Random opacity
      const filter = filters[Math.floor(Math.random() * filters.length)];

      let transform = "";
      const numTransforms = Math.floor(Math.random() * 3) + 1; // Apply 1-3 transforms for compounded madness
      const transformParts = [];
      for (let t = 0; t < numTransforms; t++) {
        const choice = transforms[Math.floor(Math.random() * transforms.length)];
        let value;
        if (choice === "rotate") {
          value = Math.floor(Math.random() * 720 - 360); // Double the spin range
          transformParts.push(`rotate(${value}deg)`);
        } else if (choice === "skewX") {
          value = Math.floor(Math.random() * 180 - 90);
          transformParts.push(`skewX(${value}deg)`);
        } else if (choice === "skewY") {
          value = Math.floor(Math.random() * 180 - 90);
          transformParts.push(`skewY(${value}deg)`);
        } else if (choice === "translateX") {
          value = Math.floor(Math.random() * 100 - 50);
          transformParts.push(`translateX(${value}px)`);
        } else if (choice === "translateY") {
          value = Math.floor(Math.random() * 100 - 50);
          transformParts.push(`translateY(${value}px)`);
        } else if (choice === "scale") {
          value = (Math.random() * 3 + 0.2).toFixed(2);
          transformParts.push(`scale(${value})`);
        } else if (choice === "scaleX") {
          value = (Math.random() * 3 + 0.2).toFixed(2);
          transformParts.push(`scaleX(${value})`);
        } else if (choice === "scaleY") {
          value = (Math.random() * 3 + 0.2).toFixed(2);
          transformParts.push(`scaleY(${value})`);
        } else if (choice === "matrix") {
          const m1 = (Math.random() * 2 - 0.5).toFixed(2);
          const m2 = (Math.random() - 0.5).toFixed(2);
          const m3 = (Math.random() - 0.5).toFixed(2);
          const m4 = (Math.random() * 2 - 0.5).toFixed(2);
          const m5 = Math.floor(Math.random() * 50 - 25);
          const m6 = Math.floor(Math.random() * 50 - 25);
          transformParts.push(`matrix(${m1}, ${m2}, ${m3}, ${m4}, ${m5}, ${m6})`);
        } else if (choice === "perspective") {
          value = Math.floor(Math.random() * 1000 + 100);
          transformParts.push(`perspective(${value}px)`);
        }
      }
      if (transformParts.length > 0) {
        transform = `transform: ${transformParts.join(' ')}; display:inline-block;`;
      }

      const style = `
        color: ${color};
        background: ${bg};
        font-family: ${font};
        font-size: ${size};
        font-weight: ${bold};
        font-style: ${italic} ${oblique};
        letter-spacing: ${letterSpacing};
        word-spacing: ${wordSpacing};
        text-shadow: ${shadow};
        ${decoration}
        padding: ${padding};
        margin: ${margin};
        border: ${border};
        opacity: ${opacity};
        filter: ${filter};
        ${transform}
      `;

      outputParts.push("%c" + text[i]);
      styleArgs.push(style);
    }

    console.log(outputParts.join(""), ...styleArgs);
  })();

  /* OLD Console Thingie
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
  */

  //hi (●'◡'●)//
});