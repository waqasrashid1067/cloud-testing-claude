// Knowledge base for the portfolio assistant.
// Each chunk is one retrievable fact. Edit or add chunks here to change what the bot knows.
window.KNOWLEDGE = [
  { id: "about-1", source: "About", text: "Waqas Rashid is an AI Automation Engineer based in Islamabad, Pakistan. He is a Computer Science graduate who builds end-to-end automations that connect AI agents to real business tools." },
  { id: "about-2", source: "About", text: "Waqas currently works as an AI Engineer at Workmatecs (since August 2025) and as an n8n Automation Engineer at IMTA (since December 2025). He is open to new work and collaborations." },

  { id: "auto-1", source: "Automation", text: "Automation is Waqas's core skill. He builds n8n workflows with webhooks, scheduled triggers, conditional logic and error handling, and uses Python and FastAPI for custom workflow logic." },
  { id: "auto-2", source: "Automation", text: "Automation tools Waqas uses: n8n, Make.com, Zapier, GoHighLevel (GHL), Google Workspace APIs, WhatsApp API, Apify, Apollo.io, webhooks, cron schedules and MCP connectors with OAuth 2.0." },
  { id: "auto-3", source: "Automation", text: "Waqas migrated legacy n8n workflows into in-process Python executors, including a video-to-stills pipeline using ffmpeg, OpenCV and Gemini that replaced an old n8n and Replicate flow." },
  { id: "auto-4", source: "Automation", text: "He automated recurring work with cron-based scheduled agent runs, and built a brand-research pipeline (website and Apify social scraping plus LLM synthesis) that gives every agent request the brand's context." },

  { id: "work-1", source: "Workmatecs", text: "At Workmatecs, Waqas integrated 10+ third-party apps (Apify, Apollo.io, Canva, Notion, monday.com, Meta Ads, Google Sheets) into an AI SaaS platform through MCP connectors, so its agent can act inside users' tools." },
  { id: "work-2", source: "Workmatecs", text: "He built the OAuth 2.0 connection flow with dynamic client registration, PKCE and locked token refresh, plus a self-healing retry that reshapes rejected tool inputs. This removed a whole class of failures across every connector." },
  { id: "work-3", source: "Workmatecs", text: "He built a native Google Sheets automation layer with 15 agent tools: read and write, formatting, charts, pivots, conditional rules, import and export, plus sandboxed Excel scripting and formula recalculation." },
  { id: "work-4", source: "Workmatecs", text: "He built the production agent runtime in Python and FastAPI with three isolated processes: an API with HTTP and SSE streaming, an execution worker and a monitor worker." },
  { id: "work-5", source: "Workmatecs", text: "The runtime uses PostgreSQL (Supabase) as source of truth and as a durable job queue with atomic dequeue, leases and heartbeats, plus Redis for coordination. Runs survive API, worker or Redis restarts and resume from the last checkpoint." },
  { id: "work-6", source: "Workmatecs", text: "He separated a LangGraph planner from a single execution engine with permission gates, retries, checkpoints and idempotent Stripe-billed credits, and built a tool SDK and registry for about 45 AI tools with contract-tested schemas." },
  { id: "work-7", source: "Workmatecs", text: "He exposed the agent as an MCP server, built the MCP client side with OAuth 2.0, and built a connector gateway that avoids loading 150K+ tokens of tool schemas into the prompt." },
  { id: "work-8", source: "Workmatecs", text: "He fixed production bugs including an API and worker token-refresh race, OAuth 500 errors on non-ASCII names, and early session logouts. He writes idempotent SQL migrations with row-level security and ships via CI/CD from pull request to Docker to VPS." },
  { id: "imta-1", source: "IMTA", text: "At IMTA in Rawalpindi, Waqas works as an n8n Automation Engineer, designing and maintaining n8n workflows for business processes." },

  { id: "sam-1", source: "SAM AI", text: "SAM AI is a lead generation and marketing automation platform Waqas worked on, built with n8n, web scraping, FastAPI, React.js and OpenAI." },
  { id: "sam-2", source: "SAM AI", text: "For SAM AI, Waqas built web scraping pipelines to extract and enrich prospect data, and the lead management side: filtering, segmentation, status tracking and campaign assignment for outreach teams." },
  { id: "sam-3", source: "SAM AI", text: "In SAM AI, his n8n workflows automate the full marketing cycle: lead capture, data enrichment, personalised email and WhatsApp outreach, and conditional follow-up triggers. AI agents personalise outreach copy and qualify leads automatically." },

  { id: "freight-1", source: "FreightProcure AI", text: "FreightProcure AI is an automated freight procurement workflow in n8n that connects WhatsApp user input to backend AI processing and email delivery. It achieved a 90% reduction in manual processing time and a 35% increase in operational efficiency." },
  { id: "freight-2", source: "FreightProcure AI", text: "In FreightProcure AI, OpenAI agents parse unstructured quotation data and generate comparative analysis. The workflow automates unique ID generation, vendor email dispatch and follow-ups for carriers who don't respond." },

  { id: "rag-1", source: "RAG", text: "Waqas built a document-based RAG chatbot as his final-year project using LangChain and ChromaDB. PDFs are loaded with PyPDFLoader and split with RecursiveCharacterTextSplitter, then vector search feeds an LLM." },
  { id: "rag-2", source: "RAG", text: "He also engineered and deployed a RAG pipeline with LangChain, Pinecone and proprietary documentation to create an internal support chatbot." },
  { id: "rag-3", source: "This site", text: "This assistant is itself a small RAG and MCP demo. It splits the portfolio into chunks, ranks them with BM25 for your question, and calls tools through an MCP-style JSON-RPC server. Open the Under the hood tab to see every step." },
  { id: "agent-1", source: "Agentic data analyst", text: "Waqas built an agentic data analyst: an LLM generates code to process a user's dataset, runs it, and interprets and visualises the results with minimal human input." },
  { id: "mcp-1", source: "MCP", text: "Waqas has hands-on MCP (Model Context Protocol) experience on both sides: he exposed an agent as an MCP server and built MCP clients and connectors with OAuth 2.0, PKCE and dynamic client registration." },

  { id: "skills-1", source: "Skills", text: "Backend skills: Python, FastAPI (REST and SSE), PostgreSQL and Supabase, Redis, job queues, Docker and CI/CD. Frontend: React.js and JavaScript. He also knows C++ and Python with TensorFlow." },
  { id: "skills-2", source: "Skills", text: "AI skills: agentic AI (autonomous agents, tool integration, task orchestration, memory, reasoning loops), LangGraph, prompt engineering, RAG, and Hugging Face generative AI including fine-tuning, transformers, tokenization and inference acceleration." },
  { id: "certs-1", source: "Courses", text: "Courses and certificates: Machine Learning Specialization on Coursera by Andrew Ng, Generative AI by Krish Naik on Udemy, Python Programming Certification from Pearson VUE, and Advanced Python Programming from NAVTTC." },
  { id: "lang-1", source: "About", text: "Waqas speaks English, Urdu and Pashto." },

  { id: "contact-1", source: "Contact", text: "You can reach Waqas by email at rashidwaqas025@gmail.com, on LinkedIn at linkedin.com/in/waqasrashid-k, or through the contact form on this page." }
];

// Structured data served by the in-browser MCP server's tools.
window.PROFILE = {
  name: "Waqas Rashid",
  title: "AI Automation Engineer",
  location: "Islamabad, Pakistan",
  contact: {
    email: "rashidwaqas025@gmail.com",
    linkedin: "https://www.linkedin.com/in/waqasrashid-k/",
    github: "https://github.com/waqasrashid1067"
  },
  experience: [
    { role: "AI Engineer", company: "Workmatecs", from: "2025-08", to: "present" },
    { role: "n8n Automation Engineer", company: "IMTA", from: "2025-12", to: "present" }
  ],
  projects: [
    { name: "SAM AI", tags: ["automation", "n8n", "ai", "leads"], summary: "Lead generation and marketing automation platform." },
    { name: "FreightProcure AI", tags: ["automation", "n8n", "whatsapp", "ai"], summary: "WhatsApp-driven freight procurement. 90% less manual processing." },
    { name: "Document RAG chatbot", tags: ["rag", "langchain", "chromadb"], summary: "Final-year project: PDF question answering with vector search." },
    { name: "Agentic data analyst", tags: ["agents", "ai", "python"], summary: "LLM-generated analysis code, run and visualised automatically." },
    { name: "AI SaaS connectors", tags: ["mcp", "oauth", "automation", "ai"], summary: "10+ apps connected to an AI agent through MCP." }
  ]
};
