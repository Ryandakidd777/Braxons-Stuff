/*Copyright © 2026 Braxon's Stuff. All rights reserved.*/
document.addEventListener("DOMContentLoaded", () => {

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function safeUrl(url) {
    return /^\s*javascript:/i.test(url) ? "#" : url;
  }

  function inline(text) {
    text = escapeHtml(text);
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (m, alt, url, title) => `<img src="${safeUrl(url)}" alt="${alt}"${title ? ` title="${title}"` : ""}>`);
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (m, label, url, title) => `<a href="${safeUrl(url)}"${title ? ` title="${title}"` : ""} rel="noopener">${label}</a>`);
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/(^|\s)_([^_]+)_(?=\s|$)/g, "$1<em>$2</em>");
    return text;
  }

  function mdToHtml(src) {
    const codeBlocks = [];
    src = src.replace(/```([^\n]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push({ lang: lang.trim(), code: escapeHtml(code.replace(/\n$/, "")) });
      return `\u0000CODEBLOCK${idx}\u0000`;
    });

    const lines = src.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      const cb = line.match(/^\u0000CODEBLOCK(\d+)\u0000$/);
      if (cb) {
        const block = codeBlocks[+cb[1]];
        const cls = block.lang ? ` class="language-${block.lang}"` : "";
        out.push(`<pre><code${cls}>${block.code}</code></pre>`);
        i++; continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { out.push(`<h${h[1].length}>${inline(h[2].trim())}</h${h[1].length}>`); i++; continue; }

      if (/^>\s?/.test(line)) {
        const q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push(`<blockquote>${inline(q.join(" "))}</blockquote>`);
        continue;
      }

      if (/^\|.*\|$/.test(line.trim()) && lines[i + 1] && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(lines[i + 1].trim())) {
        const head = line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
          rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
          i++;
        }
        let tbl = "<table><thead><tr>" + head.map(c => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>";
        rows.forEach(r => { tbl += "<tr>" + r.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>"; });
        out.push(tbl + "</tbody></table>");
        continue;
      }

      if (/^(\s*)[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^(\s*)[-*+]\s+/.test(lines[i])) { items.push(lines[i].replace(/^(\s*)[-*+]\s+/, "")); i++; }
        out.push("<ul>" + items.map(it => `<li>${inline(it)}</li>`).join("") + "</ul>");
        continue;
      }

      if (/^(\s*)\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^(\s*)\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^(\s*)\d+\.\s+/, "")); i++; }
        out.push("<ol>" + items.map(it => `<li>${inline(it)}</li>`).join("") + "</ol>");
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim()
        && !/^(#{1,6})\s+/.test(lines[i]) && !/^>\s?/.test(lines[i])
        && !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) && !/^(\s*)[-*+]\s+/.test(lines[i])
        && !/^(\s*)\d+\.\s+/.test(lines[i]) && !/^\u0000CODEBLOCK\d+\u0000$/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push(`<p>${inline(para.join(" "))}</p>`);
    }

    return out.join("\n");
  }

  const pane = document.getElementById("reader-pane");
  const placeholder = document.getElementById("reader-placeholder");
  const input = document.getElementById("reader-input");
  const output = document.getElementById("reader-output");
  const editBtn = document.getElementById("reader-edit-btn");
  const clearBtn = document.getElementById("reader-clear-btn");
  const fileInput = document.getElementById("reader-file-input");
  const filenameLabel = document.getElementById("reader-filename");

  let raw = "";
  let editing = false;

  function setState() {
    placeholder.style.display = (!raw && !editing) ? "block" : "none";
    input.style.display = editing ? "block" : "none";
    output.style.display = (!editing && raw) ? "block" : "none";
    if (!editing && raw) output.innerHTML = mdToHtml(raw);
    editBtn.textContent = editing ? "Preview" : "Edit";
  }

  editBtn.addEventListener("click", () => {
    if (editing) raw = input.value; else input.value = raw;
    editing = !editing;
    setState();
    if (editing) input.focus();
  });

  clearBtn.addEventListener("click", () => {
    raw = ""; input.value = ""; editing = false;
    filenameLabel.textContent = "untitled.md";
    setState();
  });

  input.addEventListener("input", () => { raw = input.value; });

  function loadFile(file) {
    filenameLabel.textContent = file.name;
    const reader = new FileReader();
    reader.onload = e => { raw = e.target.result; editing = false; setState(); };
    reader.readAsText(file);
  }

  pane.addEventListener("click", () => { if (!raw && !editing) editBtn.click(); });

  ["dragover", "dragenter"].forEach(ev => document.addEventListener(ev, e => {
    e.preventDefault();
    pane.classList.add("drag");
  }));

  document.addEventListener("dragleave", e => {
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      pane.classList.remove("drag");
    }
  });

  document.addEventListener("drop", e => {
    e.preventDefault();
    pane.classList.remove("drag");
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  });

  fileInput.addEventListener("change", e => { const f = e.target.files[0]; if (f) loadFile(f); });

  setState();
});