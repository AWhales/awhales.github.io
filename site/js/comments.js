(() => {
  const root = document.querySelector("[data-comments]");
  if (!root) return;

  const page = root.getAttribute("data-page") || "";
  const configured = root.getAttribute("data-api") || "";
  const api =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : configured;

  const list = root.querySelector("[data-comments-list]");
  const form = root.querySelector("[data-comments-form]");
  const status = root.querySelector("[data-comments-status]");
  const empty = root.querySelector("[data-comments-empty]");

  const setStatus = (text) => {
    if (status) status.textContent = text || "";
  };

  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const render = (comments) => {
    list.replaceChildren();
    if (!comments.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    comments.forEach((comment) => {
      const item = document.createElement("li");
      item.className = "comment";

      const head = document.createElement("p");
      head.className = "comment-meta";
      const who = document.createElement("span");
      who.className = "comment-name";
      who.textContent = comment.name;
      head.append(who, document.createTextNode(" · " + formatDate(comment.created_at)));

      const body = document.createElement("p");
      body.className = "comment-body";
      body.textContent = comment.body;

      item.append(head, body);
      list.append(item);
    });
  };

  const load = async () => {
    if (!api) {
      setStatus("Comments are not hooked up yet.");
      return;
    }
    try {
      const res = await fetch(`${api}/api/comments?page=${encodeURIComponent(page)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load comments");
      render(data.comments || []);
    } catch (err) {
      setStatus(err.message || "Could not load comments");
    }
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!api) return;
    const data = new FormData(form);
    const payload = {
      page,
      name: String(data.get("name") || ""),
      body: String(data.get("body") || ""),
      website: String(data.get("website") || ""),
    };
    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    setStatus("");
    try {
      const res = await fetch(`${api}/api/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not post");
      form.reset();
      await load();
    } catch (err) {
      setStatus(err.message || "Could not post");
    } finally {
      if (button) button.disabled = false;
    }
  });

  load();
})();
