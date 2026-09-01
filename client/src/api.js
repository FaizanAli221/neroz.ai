export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");

function cookie(name) {
  return document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

function getStored(key, fallback) {
  try {
    const val = localStorage.getItem(`vermex_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(`vermex_${key}`, JSON.stringify(value));
  } catch {}
}

const DEFAULT_AGENTS = [
  { name: "Researcher", role: "Information & Data Retrieval", description: "Searches external sources, gathers facts, and summarizes findings." },
  { name: "Architect", role: "System & Solution Design", description: "Structures components, blueprints architectures, and technical plans." },
  { name: "Engineer", role: "Code Synthesis & Implementation", description: "Writes production-ready code, unit tests, and integrations." },
  { name: "Analyst", role: "Logic & Critical Evaluation", description: "Reviews reasoning, identifies edge cases, and verifies correctness." },
  { name: "Writer", role: "Technical Documentation", description: "Crafts clear briefs, documentation, and polished communications." },
  { name: "Memory", role: "Context & Knowledge Retention", description: "Stores document references and maintains workspace history." },
  { name: "Guardian", role: "Security & Policy Compliance", description: "Validates security boundaries, secrets, and policy adherence." },
];

function handleDemoMock(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === "/auth/me") {
    const isGuest = typeof sessionStorage !== "undefined" && sessionStorage.getItem("vermex_guest") === "true";
    if (isGuest) {
      return { user: { id: "guest", name: "Guest Explorer", email: "guest@vermex.ai", role: "user", isGuest: true } };
    }
    throw new Error("Unauthorized");
  }

  if (path === "/models") {
    return {
      models: [
        { id: "vermex/core-v2", name: "Vermex Core 2.0 (Fast)", free: true },
        { id: "vermex/deep-reasoning", name: "Vermex Deep Reasoning", free: true },
        { id: "vermex/mesh-auto", name: "Vermex Multi-Agent Auto", free: true },
      ],
      defaultModel: "vermex/core-v2",
    };
  }

  if (path === "/dashboard") {
    const convs = getStored("conversations", []);
    const docs = getStored("documents", [
      { id: 1, name: "System Architecture Brief.md", sizeBytes: 2450, createdAt: new Date().toISOString() },
      { id: 2, name: "API Security Guidelines.pdf", sizeBytes: 18200, createdAt: new Date().toISOString() },
    ]);
    return {
      metrics: {
        conversations: convs.length || 3,
        messages: (convs.length ? convs.length * 4 : 12),
        documents: docs.length,
      },
      recent: convs.slice(0, 5).map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt })),
      agents: [
        { agent: "Vermex Core", status: "Coordinating 7 specialists", value: "Active" },
        { agent: "Architect", status: "Generated blueprint schema", value: "Completed" },
        { agent: "Engineer", status: "Verified 4 modules", value: "Idle" },
      ],
    };
  }

  if (path === "/agents") {
    return {
      team: DEFAULT_AGENTS,
      events: [
        { id: 1, agent: "Vermex Core", status: "completed", detail: "Workspace session initialized", createdAt: new Date().toISOString() },
        { id: 2, agent: "Researcher", status: "completed", detail: "Loaded knowledge context", createdAt: new Date(Date.now() - 60000).toISOString() },
        { id: 3, agent: "Architect", status: "running", detail: "Monitoring active pipelines", createdAt: new Date(Date.now() - 120000).toISOString() },
      ],
    };
  }

  if (path === "/documents") {
    let docs = getStored("documents", [
      { id: 1, name: "System Architecture Brief.md", content: "Vermex AI multi-agent orchestration architecture...", sizeBytes: 2450, createdAt: new Date().toISOString() },
      { id: 2, name: "API Security Guidelines.md", content: "Best practices for token authentication and CSRF...", sizeBytes: 1820, createdAt: new Date().toISOString() },
    ]);
    if (method === "POST") {
      const newDoc = {
        id: Date.now(),
        name: body.name || "Untitled Document",
        content: body.content || "",
        sizeBytes: (body.content || "").length,
        createdAt: new Date().toISOString(),
      };
      docs = [newDoc, ...docs];
      setStored("documents", docs);
      return { document: newDoc };
    }
    return { documents: docs };
  }

  if (path.startsWith("/documents/") && method === "DELETE") {
    const docId = path.split("/")[2];
    let docs = getStored("documents", []);
    docs = docs.filter((d) => String(d.id) !== String(docId));
    setStored("documents", docs);
    return { success: true };
  }

  if (path === "/conversations") {
    let convs = getStored("conversations", [
      { id: 101, title: "Design System Architecture", updatedAt: new Date().toISOString() },
      { id: 102, title: "Review Security Guidelines", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
    return { conversations: convs };
  }

  if (path.startsWith("/conversations/") && path.endsWith("/messages")) {
    const id = path.split("/")[2];
    const msgs = getStored(`messages_${id}`, [
      { id: "m1", role: "user", content: "Outline the key capabilities of Vermex multi-agent mesh." },
      {
        id: "m2",
        role: "assistant",
        content: "Vermex AI orchestrates 7 autonomous specialist agents:\n\n1. **Researcher**: Real-time context gathering and data extraction.\n2. **Architect**: High-level systems design and API contracts.\n3. **Engineer**: Production code synthesis and refactoring.\n4. **Analyst**: Edge-case discovery and verification.\n5. **Writer**: Documentation and structured reports.\n6. **Memory**: Long-term workspace recall and document grounding.\n7. **Guardian**: Security validation and boundary enforcement.\n\nAll workflows are coordinated through Vermex Core to ensure end-to-end alignment.",
      },
    ]);
    return { messages: msgs };
  }

  if (path.startsWith("/conversations/") && method === "DELETE") {
    const id = path.split("/")[2];
    let convs = getStored("conversations", []);
    convs = convs.filter((c) => String(c.id) !== String(id));
    setStored("conversations", convs);
    return { success: true };
  }

  if (path === "/chat" && method === "POST") {
    const convId = body.conversationId || Date.now();
    let convs = getStored("conversations", []);
    const existing = convs.find((c) => String(c.id) === String(convId));
    if (!existing) {
      convs = [{ id: convId, title: (body.message || "").slice(0, 32) + "…", updatedAt: new Date().toISOString() }, ...convs];
      setStored("conversations", convs);
    }
    const userMsg = { id: `u-${Date.now()}`, role: "user", content: body.message };
    const botMsg = {
      id: `b-${Date.now()}`,
      role: "assistant",
      content: `[Vermex Core · Multi-Agent Response]\n\nI have analyzed your objective: "${body.message}".\n\n- **Architect**: Reviewed structure and identified core requirements.\n- **Engineer**: Verified technical feasibility.\n- **Analyst**: Confirmed execution pathway with 0 critical blockers.\n\nReady to proceed with execution. What is the next task?`,
    };
    let msgs = getStored(`messages_${convId}`, []);
    msgs = [...msgs, userMsg, botMsg];
    setStored(`messages_${convId}`, msgs);

    return {
      conversationId: convId,
      message: botMsg,
    };
  }

  if (path === "/settings") {
    let settings = getStored("settings", {
      theme: "dark",
      aiModel: "vermex/core-v2",
      systemPrompt: "You are Vermex AI, an autonomous multi-agent intelligence platform.",
    });
    if (method === "PUT") {
      settings = { ...settings, ...body };
      setStored("settings", settings);
      return { settings };
    }
    return { settings };
  }

  return {};
}

export async function api(path, options = {}) {
  const isGuest = typeof sessionStorage !== "undefined" && sessionStorage.getItem("vermex_guest") === "true";
  
  if (isGuest && path !== "/auth/login" && path !== "/auth/register") {
    return handleDemoMock(path, options);
  }

  const method = options.method || "GET";
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) headers["X-CSRF-Token"] = decodeURIComponent(cookie("nexora_csrf"));
  
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, method, headers, credentials: "include" });
  } catch {
    if (isGuest) return handleDemoMock(path, options);
    throw new Error("Unable to reach the Vermex API. Confirm the backend and PostgreSQL are available.");
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (isGuest) return handleDemoMock(path, options);
    throw new Error(data.error?.message || `Request failed (${response.status})`);
  }
  return data;
}
