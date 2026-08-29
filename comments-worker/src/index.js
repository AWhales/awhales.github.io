const PAGE_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;

let schemaReady = false;

async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      ip_hash TEXT
    )`
  ).run();
  await env.DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_comments_page_created ON comments (page, created_at)"
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS rate_limits (
      ip_hash TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL
    )`
  ).run();
  schemaReady = true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), request, env);
    }

    try {
      await ensureSchema(env);
      if (url.pathname === "/api/comments" && request.method === "GET") {
        return cors(await listComments(url, env), request, env);
      }
      if (url.pathname === "/api/comments" && request.method === "POST") {
        return cors(await createComment(request, env), request, env);
      }
      if (url.pathname.startsWith("/api/comments/") && request.method === "DELETE") {
        return cors(await deleteComment(request, env, url.pathname.slice("/api/comments/".length)), request, env);
      }
      if (url.pathname === "/admin" && request.method === "GET") {
        return new Response(adminPage(), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return cors(json({ error: "Not found" }, 404), request, env);
    } catch (err) {
      return cors(json({ error: err.message || "Server error" }, 500), request, env);
    }
  },
};

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const list = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (list.includes(origin)) return origin;
  return "";
}

function cors(response, request, env) {
  const origin = allowedOrigin(request, env);
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isAdmin(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return Boolean(env.ADMIN_SECRET && token && token === env.ADMIN_SECRET);
}

async function hashIp(ip, env) {
  const salt = env.ADMIN_SECRET || "moonlight";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clean(value, max) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

async function listComments(url, env) {
  const page = url.searchParams.get("page") || "";
  if (!PAGE_RE.test(page)) return json({ error: "Bad page" }, 400);

  const { results } = await env.DB.prepare(
    "SELECT id, name, body, created_at FROM comments WHERE page = ? ORDER BY created_at ASC"
  )
    .bind(page)
    .all();

  return json({ comments: results || [] });
}

async function createComment(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }

  if (payload.website) return json({ ok: true }, 201);

  const page = clean(payload.page, 80);
  const name = clean(payload.name, 32);
  const body = clean(payload.body, 800);

  if (!PAGE_RE.test(page)) return json({ error: "Bad page" }, 400);
  if (name.length < 1) return json({ error: "Name needed" }, 400);
  if (body.length < 1) return json({ error: "Write something" }, 400);

  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "local";
  const ipHash = await hashIp(ip.split(",")[0].trim(), env);
  const now = Date.now();

  const rate = await env.DB.prepare("SELECT window_start, count FROM rate_limits WHERE ip_hash = ?")
    .bind(ipHash)
    .first();

  if (rate && now - rate.window_start < RATE_WINDOW_MS && rate.count >= RATE_MAX) {
    return json({ error: "Easy — wait a few minutes" }, 429);
  }

  if (!rate || now - rate.window_start >= RATE_WINDOW_MS) {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO rate_limits (ip_hash, window_start, count) VALUES (?, ?, 1)"
    )
      .bind(ipHash, now)
      .run();
  } else {
    await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE ip_hash = ?")
      .bind(ipHash)
      .run();
  }

  const comment = {
    id: crypto.randomUUID(),
    name,
    body,
    created_at: now,
  };

  await env.DB.prepare(
    "INSERT INTO comments (id, page, name, body, created_at, ip_hash) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(comment.id, page, name, body, comment.created_at, ipHash)
    .run();

  return json({ comment }, 201);
}

async function deleteComment(request, env, id) {
  if (!isAdmin(request, env)) return json({ error: "Nope" }, 401);
  const cleanId = clean(id, 64);
  if (!cleanId) return json({ error: "Bad id" }, 400);
  await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(cleanId).run();
  return json({ ok: true });
}

function adminPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Comments admin</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; background: #181818; color: #9c9cba; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
    input, button { font: inherit; }
    input { width: 100%; padding: 0.5rem; margin: 0.5rem 0 1rem; }
    button { cursor: pointer; }
    li { margin: 0 0 1rem; }
  </style>
</head>
<body>
  <h1>Comments admin</h1>
  <p>Paste the admin secret. Then you can delete spam.</p>
  <input id="secret" type="password" placeholder="Admin secret">
  <input id="page" placeholder="page slug, e.g. shaders-are-hard">
  <button id="load" type="button">Load</button>
  <ul id="list"></ul>
  <script>
    const list = document.getElementById("list");
    document.getElementById("load").onclick = async () => {
      const secret = document.getElementById("secret").value;
      const page = document.getElementById("page").value.trim();
      const res = await fetch("/api/comments?page=" + encodeURIComponent(page));
      const data = await res.json();
      list.replaceChildren();
      (data.comments || []).forEach((c) => {
        const li = document.createElement("li");
        const meta = document.createElement("div");
        meta.textContent = c.name + " — " + c.body;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Delete";
        btn.onclick = async () => {
          await fetch("/api/comments/" + c.id, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + secret },
          });
          li.remove();
        };
        li.append(meta, btn);
        list.append(li);
      });
    };
  </script>
</body>
</html>`;
}
