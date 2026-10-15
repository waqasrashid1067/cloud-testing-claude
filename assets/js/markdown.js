// Minimal Markdown renderer for blog posts (no dependencies).
// Supports: # headings, paragraphs, **bold**, *italic*, `code`, ```fenced code```,
// [links](url), ![images](url), - / 1. lists, > blockquotes, --- rules.
window.renderMarkdown = (function () {
  "use strict";
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const safeUrl = u => /^(https?:|mailto:|#|\/|\.{0,2}\/|[\w-]+(\.[\w-]+)*(\/|#|\?|$))/i.test(u) && !/^javascript:/i.test(u) ? u : "#";

  function inline(text) {
    const codes = [];
    let s = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
    s = esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, url) => `<a href="${safeUrl(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  }

  return function render(md) {
    const lines = md.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (/^```/.test(line)) {
        const lang = line.slice(3).trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(`<pre><code${lang ? ` class="lang-${esc(lang)}"` : ""}>${esc(buf.join("\n"))}</code></pre>`);
        continue;
      }
      if (!line.trim()) { i++; continue; }

      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { const n = Math.max(2, h[1].length); out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }  // page title is the h1

      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
        out.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
        continue;
      }

      const ul = /^\s*[-*+]\s+/, ol = /^\s*\d+\.\s+/;
      if (ul.test(line) || ol.test(line)) {
        const re = ul.test(line) ? ul : ol;
        const tag = re === ul ? "ul" : "ol";
        const items = [];
        while (i < lines.length && re.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(re, ""))}</li>`);
        out.push(`<${tag}>${items.join("")}</${tag}>`);
        continue;
      }

      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|>|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
      out.push(`<p>${inline(buf.join(" "))}</p>`);
    }
    return out.join("\n");
  };
})();
