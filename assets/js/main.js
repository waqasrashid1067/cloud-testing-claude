(function () {
  "use strict";

  // ---------- Theme ----------
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (_) {}
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
  });

  // ---------- Year ----------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Reveal + active nav ----------
  const sections = document.querySelectorAll("main section");
  const links = document.querySelectorAll(".nav a");
  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => revealer.observe(el));

    const spy = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(s => spy.observe(s));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  // ---------- Contact form ----------
  // Opens the visitor's email app. To receive messages without email apps, point the form
  // at a form service (e.g. Formspree) and replace this handler with a fetch() POST.
  const form = document.getElementById("contactForm");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const subject = encodeURIComponent("Portfolio enquiry from " + f.get("name"));
    const bodyText = encodeURIComponent(f.get("message") + "\n\n— " + f.get("name") + " (" + f.get("email") + ")");
    window.location.href = "mailto:rashidwaqas025@gmail.com?subject=" + subject + "&body=" + bodyText;
    document.getElementById("formNote").textContent = "Your email app should open now. If it doesn't, email rashidwaqas025@gmail.com directly.";
  });

  // ---------- Latest posts ----------
  const list = document.getElementById("latestPosts");
  if (list) {
    fetch("blog/posts.json")
      .then(r => r.json())
      .then(posts => {
        posts.sort((a, b) => b.date.localeCompare(a.date));
        list.innerHTML = posts.slice(0, 3).map(p => `
          <li><a href="post.html?slug=${encodeURIComponent(p.slug)}">
            <time datetime="${p.date}">${formatDate(p.date)}</time>
            <div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.summary)}</p></div>
          </a></li>`).join("") || '<li class="muted">No posts yet.</li>';
      })
      .catch(() => { list.innerHTML = '<li class="muted"><a href="blog.html">Read the blog →</a></li>'; });
  }

  function formatDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  window.SiteUtil = { formatDate, escapeHtml };
})();
