/*Copyright © 2026 Braxon's Stuff. All rights reserved.*/
(() => {
    "use strict";

    const app = document.getElementById("reader-app");
    if (!app) return;

    const input = document.getElementById("markdown-input");
    const output = document.getElementById("markdown-output");
    const fileInput = document.getElementById("markdown-file-input");
    const openButton = document.getElementById("open-file-button");
    const clearButton = document.getElementById("clear-button");
    const filename = document.getElementById("reader-filename");
    const formatButtons = Array.from(
        document.querySelectorAll("[data-format]")
    );

    let dragDepth = 0;

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function safeUrl(value, type = "link") {
        const url = String(value || "").trim();

        const compact = url
            .replace(/[\u0000-\u0020\u007f]+/g, "")
            .toLowerCase();

        if (!url || /^(javascript|vbscript|file|data):/.test(compact)) {
            return "#";
        }

        if (type === "image" && /^(mailto|tel):/.test(compact)) {
            return "#";
        }

        if (
            /^[a-z][a-z0-9+.-]*:/i.test(url) &&
            !/^(https?:|mailto:|tel:|blob:)/i.test(url)
        ) {
            return "#";
        }

        return url;
    }

    function parseInline(source) {
        const tokens = [];

        function store(html) {
            const token = `\u0000INLINE${tokens.length}END\u0000`;
            tokens.push(html);
            return token;
        }

        let text = String(source || "");

        text = text.replace(/`([^`\n]+)`/g, (_match, code) => {
            return store(`<code>${escapeHtml(code)}</code>`);
        });

        text = text.replace(
            /!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g,
            (_match, alt, url, title) => {
                const cleanUrl = safeUrl(url, "image");

                if (cleanUrl === "#") {
                    return store(
                        `<span>[image: ${escapeHtml(alt || "untitled")}]</span>`
                    );
                }

                const titleAttribute = title
                    ? ` title="${escapeHtml(title)}"`
                    : "";

                return store(
                    `<img src="${escapeHtml(cleanUrl)}" ` +
                    `alt="${escapeHtml(alt)}" ` +
                    `loading="lazy"${titleAttribute}>`
                );
            }
        );

        text = text.replace(
            /\[([^\]]+)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/g,
            (_match, label, url, title) => {
                const cleanUrl = safeUrl(url);

                const titleAttribute = title
                    ? ` title="${escapeHtml(title)}"`
                    : "";

                const externalAttributes = /^https?:\/\//i.test(cleanUrl)
                    ? ' target="_blank" rel="noopener noreferrer"'
                    : "";

                return store(
                    `<a href="${escapeHtml(cleanUrl)}"` +
                    `${titleAttribute}${externalAttributes}>` +
                    `${escapeHtml(label)}</a>`
                );
            }
        );

        text = escapeHtml(text);

        text = text.replace(
            /\\([\\`*{}\[\]()#+\-.!_>~|])/g,
            "$1"
        );

        text = text.replace(
            /\*\*([^*\n]+)\*\*/g,
            "<strong>$1</strong>"
        );

        text = text.replace(
            /__([^_\n]+)__/g,
            "<strong>$1</strong>"
        );

        text = text.replace(
            /~~([^~\n]+)~~/g,
            "<del>$1</del>"
        );

        text = text.replace(
            /(^|[^*])\*([^*\n]+)\*(?!\*)/g,
            "$1<em>$2</em>"
        );

        text = text.replace(
            /(^|[^_])_([^_\n]+)_(?!_)/g,
            "$1<em>$2</em>"
        );

        tokens.forEach((html, index) => {
            text = text.replace(
                `\u0000INLINE${index}END\u0000`,
                html
            );
        });

        return text;
    }

    function splitTableRow(line) {
        let row = line.trim();

        if (row.startsWith("|")) {
            row = row.slice(1);
        }

        if (row.endsWith("|")) {
            row = row.slice(0, -1);
        }

        const cells = [];
        let cell = "";
        let escaped = false;

        for (const character of row) {
            if (escaped) {
                cell += character;
                escaped = false;
            } else if (character === "\\") {
                escaped = true;
            } else if (character === "|") {
                cells.push(cell.trim());
                cell = "";
            } else {
                cell += character;
            }
        }

        cells.push(cell.trim());
        return cells;
    }

    function isTableDivider(line) {
        const cells = splitTableRow(line);

        return (
            cells.length > 0 &&
            cells.every(cell => /^:?-{3,}:?$/.test(cell))
        );
    }

    function tableAlignment(cell) {
        const trimmed = cell.trim();

        if (
            trimmed.startsWith(":") &&
            trimmed.endsWith(":")
        ) {
            return "center";
        }

        if (trimmed.endsWith(":")) {
            return "right";
        }

        return "left";
    }

    function renderMarkdown(markdown) {
        const lines = String(markdown || "")
            .replace(/\r\n?/g, "\n")
            .split("\n");

        const html = [];
        let index = 0;

        function startsBlock(position) {
            const line = lines[position] || "";
            const next = lines[position + 1] || "";

            return (
                /^\s*```/.test(line) ||
                /^\s{0,3}#{1,6}\s+/.test(line) ||
                /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
                /^\s{0,3}>\s?/.test(line) ||
                /^\s*[-+*]\s+/.test(line) ||
                /^\s*\d+[.)]\s+/.test(line) ||
                (
                    line.includes("|") &&
                    isTableDivider(next)
                )
            );
        }

        while (index < lines.length) {
            const line = lines[index];

            if (!line.trim()) {
                index += 1;
                continue;
            }

            const fence = line.match(
                /^\s*```\s*([\w-]+)?\s*$/
            );

            if (fence) {
                const language = (fence[1] || "")
                    .replace(/[^\w-]/g, "");

                const codeLines = [];

                index += 1;

                while (
                    index < lines.length &&
                    !/^\s*```\s*$/.test(lines[index])
                ) {
                    codeLines.push(lines[index]);
                    index += 1;
                }

                if (index < lines.length) {
                    index += 1;
                }

                const className = language
                    ? ` class="language-${escapeHtml(language)}"`
                    : "";

                html.push(
                    `<pre><code${className}>` +
                    `${escapeHtml(codeLines.join("\n"))}` +
                    `</code></pre>`
                );

                continue;
            }

            const heading = line.match(
                /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/
            );

            if (heading) {
                const level = heading[1].length;

                html.push(
                    `<h${level}>` +
                    `${parseInline(heading[2])}` +
                    `</h${level}>`
                );

                index += 1;
                continue;
            }

            if (
                /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)
            ) {
                html.push("<hr>");
                index += 1;
                continue;
            }

            if (/^\s{0,3}>\s?/.test(line)) {
                const quoteLines = [];

                while (
                    index < lines.length &&
                    /^\s{0,3}>\s?/.test(lines[index])
                ) {
                    quoteLines.push(
                        lines[index].replace(
                            /^\s{0,3}>\s?/,
                            ""
                        )
                    );

                    index += 1;
                }

                html.push(
                    `<blockquote><p>` +
                    `${parseInline(quoteLines.join(" "))}` +
                    `</p></blockquote>`
                );

                continue;
            }

            if (
                line.includes("|") &&
                lines[index + 1] &&
                isTableDivider(lines[index + 1])
            ) {
                const headings = splitTableRow(line);
                const dividers = splitTableRow(lines[index + 1]);
                const rows = [];

                index += 2;

                while (
                    index < lines.length &&
                    lines[index].trim() &&
                    lines[index].includes("|")
                ) {
                    rows.push(splitTableRow(lines[index]));
                    index += 1;
                }

                const headingHtml = headings
                    .map((cell, cellIndex) => {
                        const alignment = tableAlignment(
                            dividers[cellIndex] || "---"
                        );

                        return (
                            `<th style="text-align:${alignment}">` +
                            `${parseInline(cell)}</th>`
                        );
                    })
                    .join("");

                const rowHtml = rows
                    .map(row => {
                        const cells = headings
                            .map((_heading, cellIndex) => {
                                const alignment = tableAlignment(
                                    dividers[cellIndex] || "---"
                                );

                                return (
                                    `<td style="text-align:${alignment}">` +
                                    `${parseInline(row[cellIndex] || "")}` +
                                    `</td>`
                                );
                            })
                            .join("");

                        return `<tr>${cells}</tr>`;
                    })
                    .join("");

                html.push(
                    `<table>` +
                    `<thead><tr>${headingHtml}</tr></thead>` +
                    `<tbody>${rowHtml}</tbody>` +
                    `</table>`
                );

                continue;
            }

            if (/^\s*[-+*]\s+/.test(line)) {
                const items = [];

                while (
                    index < lines.length &&
                    /^\s*[-+*]\s+/.test(lines[index])
                ) {
                    const item = lines[index].replace(
                        /^\s*[-+*]\s+/,
                        ""
                    );

                    const task = item.match(
                        /^\[([ xX])\]\s+(.*)$/
                    );

                    if (task) {
                        const checked =
                            task[1].toLowerCase() === "x"
                                ? " checked"
                                : "";

                        items.push(
                            `<li class="reader-task-item">` +
                            `<input type="checkbox" disabled${checked}>` +
                            `${parseInline(task[2])}</li>`
                        );
                    } else {
                        items.push(
                            `<li>${parseInline(item)}</li>`
                        );
                    }

                    index += 1;
                }

                html.push(`<ul>${items.join("")}</ul>`);
                continue;
            }

            if (/^\s*\d+[.)]\s+/.test(line)) {
                const items = [];

                while (
                    index < lines.length &&
                    /^\s*\d+[.)]\s+/.test(lines[index])
                ) {
                    const item = lines[index].replace(
                        /^\s*\d+[.)]\s+/,
                        ""
                    );

                    items.push(
                        `<li>${parseInline(item)}</li>`
                    );

                    index += 1;
                }

                html.push(`<ol>${items.join("")}</ol>`);
                continue;
            }

            const paragraph = [];

            while (
                index < lines.length &&
                lines[index].trim()
            ) {
                if (
                    paragraph.length > 0 &&
                    startsBlock(index)
                ) {
                    break;
                }

                paragraph.push(lines[index].trim());
                index += 1;
            }

            html.push(
                `<p>${parseInline(paragraph.join(" "))}</p>`
            );
        }

        return html.join("\n");
    }

    function render() {
        const markdown = input.value;

        if (!markdown.trim()) {
            output.innerHTML =
                '<div class="reader-empty-preview">' +
                "Your preview will appear here." +
                "</div>";

            return;
        }

        output.innerHTML = renderMarkdown(markdown);
    }

    function replaceSelection(
        before,
        after = before,
        placeholder = "text"
    ) {
        const start = input.selectionStart;
        const end = input.selectionEnd;

        const selected =
            input.value.slice(start, end) || placeholder;

        input.setRangeText(
            `${before}${selected}${after}`,
            start,
            end,
            "select"
        );

        if (start === end) {
            input.selectionStart = start + before.length;

            input.selectionEnd =
                start +
                before.length +
                placeholder.length;
        }

        input.focus();
        render();
    }

    function prefixSelectedLines(
        prefix,
        numbered = false
    ) {
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;

        const lineStart =
            input.value.lastIndexOf(
                "\n",
                Math.max(0, selectionStart - 1)
            ) + 1;

        const nextLineBreak =
            input.value.indexOf("\n", selectionEnd);

        const lineEnd =
            nextLineBreak === -1
                ? input.value.length
                : nextLineBreak;

        const selectedLines =
            input.value.slice(lineStart, lineEnd);

        const changed = selectedLines
            .split("\n")
            .map((line, lineIndex) => {
                const beginning = numbered
                    ? `${lineIndex + 1}. `
                    : prefix;

                return `${beginning}${line}`;
            })
            .join("\n");

        input.setRangeText(
            changed,
            lineStart,
            lineEnd,
            "select"
        );

        input.focus();
        render();
    }

    function insertText(
        text,
        selectionOffset = 0,
        selectionLength = 0
    ) {
        const start = input.selectionStart;
        const end = input.selectionEnd;

        input.setRangeText(
            text,
            start,
            end,
            "end"
        );

        if (selectionLength > 0) {
            input.selectionStart =
                start + selectionOffset;

            input.selectionEnd =
                start +
                selectionOffset +
                selectionLength;
        }

        input.focus();
        render();
    }

    function applyFormat(format) {
        switch (format) {
            case "heading":
                prefixSelectedLines("## ");
                break;

            case "bold":
                replaceSelection(
                    "**",
                    "**",
                    "bold text"
                );
                break;

            case "italic":
                replaceSelection(
                    "*",
                    "*",
                    "italic text"
                );
                break;

            case "strike":
                replaceSelection(
                    "~~",
                    "~~",
                    "struck text"
                );
                break;

            case "code": {
                const selected = input.value.slice(
                    input.selectionStart,
                    input.selectionEnd
                );

                if (selected.includes("\n")) {
                    replaceSelection(
                        "```\n",
                        "\n```",
                        "code"
                    );
                } else {
                    replaceSelection(
                        "`",
                        "`",
                        "code"
                    );
                }

                break;
            }

            case "bullet":
                prefixSelectedLines("- ");
                break;

            case "number":
                prefixSelectedLines("", true);
                break;

            case "task":
                prefixSelectedLines("- [ ] ");
                break;

            case "quote":
                prefixSelectedLines("> ");
                break;

            case "link":
                replaceSelection(
                    "[",
                    "](https://example.com)",
                    "link text"
                );
                break;

            case "image":
                insertText(
                    "![Image description]" +
                    "(https://example.com/image.png)",
                    2,
                    17
                );
                break;

            case "table":
                insertText(
                    "\n" +
                    "| Column 1 | Column 2 |\n" +
                    "| :--- | :--- |\n" +
                    "| Value | Value |\n"
                );
                break;

            case "rule":
                insertText("\n---\n");
                break;

            default:
                break;
        }
    }

    async function openFile(file) {
        if (!file) return;

        try {
            input.value = await file.text();

            filename.textContent =
                file.name || "document.md";

            render();
            input.focus();
        } catch (_error) {
            filename.textContent =
                "Could not open file";
        } finally {
            fileInput.value = "";
        }
    }

    input.addEventListener("input", render);

    input.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;

        event.preventDefault();

        const start = input.selectionStart;

        input.setRangeText(
            "  ",
            start,
            input.selectionEnd,
            "end"
        );

        render();
    });

    openButton.addEventListener("click", () => {
        fileInput.click();
    });

    clearButton.addEventListener("click", () => {
        input.value = "";
        filename.textContent = "untitled.md";
        fileInput.value = "";

        render();
        input.focus();
    });

    fileInput.addEventListener("change", () => {
        openFile(
            fileInput.files &&
            fileInput.files[0]
        );
    });

    formatButtons.forEach(button => {
        button.addEventListener("click", () => {
            applyFormat(button.dataset.format);
        });
    });

    app.addEventListener("dragenter", event => {
        event.preventDefault();

        dragDepth += 1;
        app.classList.add("is-dragging");
    });

    app.addEventListener("dragover", event => {
        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "copy";
        }
    });

    app.addEventListener("dragleave", event => {
        event.preventDefault();

        dragDepth = Math.max(
            0,
            dragDepth - 1
        );

        if (dragDepth === 0) {
            app.classList.remove("is-dragging");
        }
    });

    app.addEventListener("drop", event => {
        event.preventDefault();

        dragDepth = 0;
        app.classList.remove("is-dragging");

        openFile(
            event.dataTransfer &&
            event.dataTransfer.files[0]
        );
    });

    render();
})();