// Portfolio assistant: a small RAG pipeline + an in-browser MCP-style server.
//
// Pipeline per question:
//   1. MCP  tools/list                  -> discover tools
//   2. RAG  search_portfolio (BM25)     -> top-k chunks from knowledge.js
//   3. MCP  tools/call for intent tools -> structured data (contact, projects, experience)
//   4. Answer grounded only in what steps 2-3 returned, with sources.
//
// Optional: set window.CHAT_CONFIG = { endpoint: "https://your-api/ask" } before this script
// to send { question, context } to a real LLM backend. It falls back to local answers on error.
(function () {
  "use strict";

  const KB = window.KNOWLEDGE || [];
  const PROFILE = window.PROFILE || {};

  // ---------- Text processing ----------
  const STOP = new Set(("a an the and or of to in on for with is are was were be been his he him what which who " +
    "how does do did can could would you your about me my i it its this that these those at by from as has have " +
    "had any some tell show give list does waqas rashid know knows use used worked work done ever").split(" "));

  const SYNONYMS = {
    automat: ["n8n", "workflow", "zapier", "make", "webhook", "trigger"],
    workflow: ["n8n", "automat"],
    contact: ["email", "linkedin", "reach"],
    hire: ["contact", "email", "open", "work"],
    reach: ["contact", "email"],
    job: ["experi", "engineer", "workmatec", "imta"],
    experi: ["engineer", "workmatec", "imta"],
    mcp: ["model", "context", "protocol", "connector"],
    rag: ["retriev", "chromadb", "pinecon", "langchain", "vector"],
    chatbot: ["rag", "chatbot"],
    skill: ["python", "fastapi", "skill"],
    backend: ["fastapi", "postgresql", "redi", "queue"],
    oauth: ["pkce", "token", "refresh"],
    sam: ["lead", "outreach"],
    freight: ["procur", "whatsapp", "quot"]
  };

  // Crude but effective for a small corpus: "automate", "automation", "automated" -> "automa".
  function stem(w) {
    return w.replace(/s$/, "").slice(0, 6) || w;
  }
  function tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, " ")
      .split(" ")
      .map(t => t.replace(/^\.+|\.+$/g, ""))
      .filter(t => t && !STOP.has(t))
      .map(stem);
  }
  const SYN = {};
  Object.entries(SYNONYMS).forEach(([k, v]) => { SYN[stem(k)] = v.map(stem); });
  function expand(tokens) {
    const out = [...tokens];
    tokens.forEach(t => (SYN[t] || []).forEach(s => out.push(s)));
    return out;
  }

  // ---------- BM25 index ----------
  const K1 = 1.4, B = 0.75;
  const docs = KB.map(c => ({ ...c, tokens: tokenize(c.text + " " + c.source) }));
  const avgLen = docs.reduce((n, d) => n + d.tokens.length, 0) / Math.max(docs.length, 1);
  const df = {};
  docs.forEach(d => new Set(d.tokens).forEach(t => { df[t] = (df[t] || 0) + 1; }));
  const idf = t => Math.log(1 + (docs.length - (df[t] || 0) + 0.5) / ((df[t] || 0) + 0.5));

  function bm25(query, k) {
    const q = expand(tokenize(query));
    const scored = docs.map(d => {
      const tf = {};
      d.tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
      let score = 0;
      new Set(q).forEach(t => {
        if (!tf[t]) return;
        score += idf(t) * (tf[t] * (K1 + 1)) / (tf[t] + K1 * (1 - B + B * d.tokens.length / avgLen));
      });
      return { id: d.id, source: d.source, text: d.text, score: +score.toFixed(3) };
    });
    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  }

  // ---------- In-browser MCP server (JSON-RPC 2.0) ----------
  const TOOLS = [
    {
      name: "search_portfolio",
      description: "Retrieve the most relevant portfolio chunks for a question (BM25).",
      inputSchema: { type: "object", properties: { query: { type: "string" }, k: { type: "integer", default: 4 } }, required: ["query"] },
      run: ({ query, k = 4 }) => ({ chunks: bm25(query, k) })
    },
    {
      name: "get_contact",
      description: "Return Waqas's public contact details.",
      inputSchema: { type: "object", properties: {} },
      run: () => ({ name: PROFILE.name, location: PROFILE.location, ...PROFILE.contact })
    },
    {
      name: "list_projects",
      description: "List portfolio projects, optionally filtered by tag.",
      inputSchema: { type: "object", properties: { tag: { type: "string" } } },
      run: ({ tag } = {}) => ({ projects: (PROFILE.projects || []).filter(p => !tag || p.tags.includes(tag)) })
    },
    {
      name: "get_experience",
      description: "Return work history (role, company, dates).",
      inputSchema: { type: "object", properties: {} },
      run: () => ({ experience: PROFILE.experience || [] })
    }
  ];

  let rpcId = 0;
  function mcp(method, params) {
    const request = { jsonrpc: "2.0", id: ++rpcId, method, ...(params ? { params } : {}) };
    let response;
    if (method === "tools/list") {
      response = { jsonrpc: "2.0", id: request.id, result: { tools: TOOLS.map(({ run, ...t }) => t) } };
    } else if (method === "tools/call") {
      const tool = TOOLS.find(t => t.name === params.name);
      response = tool
        ? { jsonrpc: "2.0", id: request.id, result: { content: [{ type: "json", json: tool.run(params.arguments || {}) }] } }
        : { jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "Unknown tool: " + params.name } };
    } else {
      response = { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "Method not found" } };
    }
    return { request, response };
  }

  // ---------- Intent routing ----------
  function routeTools(q) {
    const s = q.toLowerCase();
    const calls = [];
    if (/\b(contact|email|reach|hire|linkedin|github|touch)\b/.test(s)) calls.push({ name: "get_contact", arguments: {} });
    if (/\b(projects?|built|build|portfolio|work samples?)\b/.test(s)) {
      const tag = ["automation", "rag", "mcp", "ai", "agents", "n8n"].find(t => s.includes(t));
      calls.push({ name: "list_projects", arguments: tag ? { tag } : {} });
    }
    if (/\b(experience|jobs?|companies|company|career|employ\w*|work history)\b|where .*work/.test(s)) calls.push({ name: "get_experience", arguments: {} });
    return calls;
  }

  // ---------- Answer composition (grounded, extractive) ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const linkify = s => esc(s)
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>')
    .replace(/(linkedin\.com\/in\/[\w-]+)/g, '<a href="https://www.$1" target="_blank" rel="noopener">$1</a>');

  function compose(question, chunks, toolResults) {
    const parts = [];
    const r = toolResults;

    if (r.get_contact) {
      const c = r.get_contact;
      parts.push(`You can reach ${esc(c.name)} at <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>, on <a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> or <a href="${esc(c.github)}" target="_blank" rel="noopener">GitHub</a>. He's based in ${esc(c.location)}.`);
    }
    if (r.get_experience) {
      const items = r.get_experience.experience.map(e => `${esc(e.role)} at <b>${esc(e.company)}</b> (${esc(e.from)} – ${esc(e.to)})`);
      parts.push("Current roles: " + items.join("; ") + ".");
    }
    if (r.list_projects && r.list_projects.projects.length) {
      parts.push("Projects: " + r.list_projects.projects.map(p => `<b>${esc(p.name)}</b> (${esc(p.summary)})`).join(" · "));
    }

    const top = chunks[0] ? chunks[0].score : 0;
    const relevant = chunks.filter(c => c.score >= Math.max(1.2, top * 0.55)).slice(0, 2);
    relevant.forEach(c => { if (!(r.get_contact && c.source === "Contact")) parts.push(linkify(c.text)); });

    if (!parts.length) {
      return {
        html: `I don't have that in my notes. Ask Waqas directly at <a href="mailto:rashidwaqas025@gmail.com">rashidwaqas025@gmail.com</a>.`,
        sources: []
      };
    }
    return { html: parts.map(p => `<p>${p}</p>`).join(""), sources: relevant };
  }

  async function llmAnswer(question, chunks) {
    const cfg = window.CHAT_CONFIG;
    if (!cfg || !cfg.endpoint) return null;
    try {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: chunks.map(c => c.text) })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.answer ? `<p>${esc(data.answer)}</p>` : null;
    } catch (_) { return null; }
  }

  // ---------- UI ----------
  const $ = id => document.getElementById(id);
  const chat = $("chat"), body = $("chatBody"), trace = $("traceBody"), input = $("chatInput");
  if (!chat) return;

  const SUGGESTIONS = [
    "What automation tools do you use?",
    "Tell me about FreightProcure AI",
    "Have you worked with MCP?",
    "How do I contact you?"
  ];

  function addMsg(role, html, sources) {
    const el = document.createElement("div");
    el.className = "msg " + role;
    el.innerHTML = html;
    if (sources && sources.length) {
      const src = document.createElement("div");
      src.className = "src";
      src.innerHTML = "<em>sources</em>" + sources.map(s => `<span title="${esc(s.id)} · score ${s.score}">${esc(s.source)}</span>`).join("");
      el.appendChild(src);
    }
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function addSuggestions() {
    const wrap = document.createElement("div");
    wrap.className = "suggest";
    SUGGESTIONS.forEach(q => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.onclick = () => { wrap.remove(); ask(q); };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }

  function renderTrace(steps) {
    trace.innerHTML = '<p class="trace-intro">Last question, step by step. JSON-RPC messages are what an MCP client and server exchange.</p>';
    steps.forEach((s, i) => {
      const el = document.createElement("div");
      el.className = "step";
      el.innerHTML = `<div class="step-h"><b>${i + 1}. ${esc(s.title)}</b><span>${esc(s.meta || "")}</span></div><pre>${esc(s.body)}</pre>`;
      trace.appendChild(el);
    });
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  let busy = false;

  async function ask(question) {
    question = question.trim();
    if (!question || busy) return;
    busy = true;
    addMsg("user", esc(question));
    const typing = addMsg("bot", '<span class="typing"><i></i><i></i><i></i></span>');
    const t0 = performance.now();
    const steps = [];

    const list = mcp("tools/list");
    steps.push({ title: "MCP tools/list", meta: `${list.response.result.tools.length} tools`, body: JSON.stringify(list.request) + "\n→ " + list.response.result.tools.map(t => t.name).join(", ") });

    const search = mcp("tools/call", { name: "search_portfolio", arguments: { query: question, k: 4 } });
    const chunks = search.response.result.content[0].json.chunks;
    steps.push({
      title: "RAG retrieve (BM25)",
      meta: `${KB.length} chunks indexed`,
      body: "query tokens: " + JSON.stringify(expand(tokenize(question))) + "\n\n" +
        (chunks.length ? chunks.map(c => `[${c.score}] ${c.id} (${c.source})\n  ${c.text.slice(0, 120)}…`).join("\n") : "no matching chunks")
    });

    const toolResults = {};
    routeTools(question).forEach(call => {
      const r = mcp("tools/call", call);
      toolResults[call.name] = r.response.result ? r.response.result.content[0].json : null;
      steps.push({ title: "MCP tools/call · " + call.name, meta: "id " + r.request.id, body: JSON.stringify(r.request, null, 1) + "\n\n← " + JSON.stringify(r.response.result || r.response.error, null, 1) });
    });

    let { html, sources } = compose(question, chunks, toolResults);
    const llm = await llmAnswer(question, chunks);
    if (llm) html = llm;
    steps.push({ title: "Generate answer", meta: `${Math.round(performance.now() - t0)} ms`, body: llm ? "LLM backend answered using retrieved context." : `Grounded answer built from ${sources.length} chunk(s)${Object.keys(toolResults).length ? " + " + Object.keys(toolResults).join(", ") : ""}. No facts outside retrieved context.` });

    await wait(450);
    typing.remove();
    addMsg("bot", html, sources);
    renderTrace(steps);
    busy = false;
  }

  function open() {
    chat.classList.add("open");
    $("chatFab").style.display = "none";
    if (!body.children.length) {
      addMsg("bot", "<p>Hi, I'm Waqas's portfolio assistant. Ask me about his automation work, AI projects or experience.</p><p>Every answer comes from this site's content. Open <b>Under the hood</b> to see the RAG and MCP steps.</p>");
      addSuggestions();
    }
    input.focus();
  }
  function close() {
    chat.classList.remove("open");
    $("chatFab").style.display = "";
  }

  $("chatFab").addEventListener("click", open);
  $("chatClose").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && chat.classList.contains("open")) close(); });
  chat.querySelectorAll(".chat-tabs button").forEach(b => b.addEventListener("click", () => {
    chat.querySelectorAll(".chat-tabs button").forEach(x => x.classList.toggle("on", x === b));
    chat.classList.toggle("show-trace", b.dataset.tab === "trace");
  }));
  $("chatForm").addEventListener("submit", e => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });

  // Exposed for testing.
  window.PortfolioBot = { bm25, mcp, routeTools, compose };
})();
