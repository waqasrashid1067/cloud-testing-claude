# Waqas Rashid · Portfolio

Personal portfolio for Waqas Rashid, AI Automation Engineer. It's a static site (HTML, CSS, vanilla JS) with no build step.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local server, not `file://`, because the blog and chatbot load files with `fetch()`.

## Structure

```
index.html                 main page (about, automation, experience, work, problem solving, skills, blog, contact)
blog.html                  list of all posts
post.html?slug=...         renders one Markdown post
blog/posts.json            post index (title, date, summary, tags)
blog/posts/<slug>.md       post content in Markdown
assets/css/style.css       design tokens + styles (light and dark)
assets/js/knowledge.js     chatbot knowledge chunks + profile data
assets/js/chat.js          chatbot: BM25 retrieval (RAG) + in-browser MCP JSON-RPC server
assets/js/main.js          theme toggle, nav, contact form, latest posts
assets/img/waqas.jpg       profile photo
```

## Add a blog post

1. Write the post in Markdown at `blog/posts/my-new-post.md`.
2. Add an entry at the top of `blog/posts.json`:

   ```json
   {
     "slug": "my-new-post",
     "title": "My new post",
     "date": "2026-11-01",
     "summary": "One line shown in the post list.",
     "tags": ["n8n", "automation"]
   }
   ```

3. Commit and push. The post appears on `blog.html` and the three newest show on the home page.

Images: put them in `assets/img/blog/` and reference them with `![alt](assets/img/blog/file.png)`.

## Chatbot

The "Ask my AI" assistant runs entirely in the browser:

1. **MCP `tools/list`**: discovers the tools the in-browser server exposes (`search_portfolio`, `get_contact`, `list_projects`, `get_experience`).
2. **RAG retrieve**: BM25 ranks the chunks in `assets/js/knowledge.js` for the question.
3. **MCP `tools/call`**: intent-matched tools return structured data.
4. **Answer**: built only from the retrieved content, with sources.

The **Under the hood** tab shows every JSON-RPC message and retrieval score.

To use a real LLM, set this before `chat.js` loads:

```html
<script>window.CHAT_CONFIG = { endpoint: "https://your-api.example.com/ask" };</script>
```

The endpoint receives `{ question, context: [chunk texts] }` and must return `{ answer }`. If the call fails, the bot falls back to local answers.

## Contact form

The form opens the visitor's email app with the message filled in. To receive messages directly, point it at a form service such as Formspree and replace the submit handler in `main.js` with a `fetch()` POST.

## Deploy (GitHub Pages)

Repo **Settings → Pages → Deploy from a branch → `main` / root**.
