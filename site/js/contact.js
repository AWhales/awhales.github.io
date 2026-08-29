(() => {
  const root = document.querySelector("[data-contact]");
  if (!root) return;

  const configured = root.getAttribute("data-api") || "";
  const api =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787"
      : configured;

  const form = root.querySelector("[data-contact-form]");
  const status = root.querySelector("[data-contact-status]");

  const setStatus = (text, kind = "") => {
    if (!status) return;
    status.textContent = text || "";
    status.dataset.kind = kind;
  };

  if (new URLSearchParams(location.search).get("sent") === "1") {
    setStatus("Message sent — thanks.", "ok");
    history.replaceState(null, "", location.pathname);
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!api) {
      setStatus("Contact form is not hooked up yet.");
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      body: String(data.get("body") || ""),
      website: String(data.get("website") || ""),
    };

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    setStatus("");

    try {
      const res = await fetch(`${api}/api/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not send");
      form.reset();
      setStatus("Message sent — thanks.", "ok");
    } catch (err) {
      setStatus(err.message || "Could not send");
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
