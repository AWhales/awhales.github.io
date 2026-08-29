(() => {
  const root = document.querySelector("[data-newsletter]");
  if (!root) return;

  const configured = root.getAttribute("data-api") || "";
  const api =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : configured;

  const form = root.querySelector("[data-newsletter-form]");
  const status = root.querySelector("[data-newsletter-status]");

  const setStatus = (text, kind = "") => {
    if (!status) return;
    status.textContent = text || "";
    status.dataset.kind = kind;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!api) {
      setStatus("Newsletter is not hooked up yet.");
      return;
    }

    const data = new FormData(form);
    const payload = {
      email: String(data.get("email") || ""),
      website: String(data.get("website") || ""),
    };

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    setStatus("");

    try {
      const res = await fetch(`${api}/api/newsletter`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not subscribe");
      form.reset();
      setStatus(result.already ? "You're already on the list." : "You're on the list — thanks.", "ok");
    } catch (err) {
      setStatus(err.message || "Could not subscribe");
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
