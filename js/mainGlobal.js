// /js/mainGlobal.js

document.addEventListener("DOMContentLoaded", () => {

  // Title suffix
  const suffix = " | Braxon's Stuff";
  if (!document.title.endsWith(suffix)) {
    document.title += suffix;
  }

  // Helper to add meta tags if missing
  function addMeta(name, content, attr = "name") {
    if (!document.querySelector(`meta[${attr}="${name}"]`)) {
      const meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  // Viewport
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(viewport);
  }

  // Description
  addMeta("description", "Welcome to Braxon's Stuff!");

  // Theme color
  addMeta("theme-color", "#ff000", "name");

});
