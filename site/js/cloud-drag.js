(() => {
  const sky = document.querySelector(".sky");
  if (!sky) return;

  const tracks = [...sky.querySelectorAll(".cloud-track")];
  const layers = [...sky.querySelectorAll(".cloud-layer")];
  const scaler = sky.querySelector(".cloud-scaler");
  if (!tracks.length || !layers.length) return;

  const CLOUD_W = 386;
  const SCROLL_DURATION = 56;
  const THROW_SCALE = 0.9;
  const TAPER_BASE = 1.3;
  const TAPER_SPEED = 0.02;
  const STORAGE_KEY = "moonlight.clouds";
  const SAVE_INTERVAL = 250;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const baseSpeed = reducedMotion ? 0 : -CLOUD_W / SCROLL_DURATION;
  // Only the splash lets you throw the clouds around; elsewhere they just drift.
  const draggable = !sky.closest(".page-sky");

  let trackOffset = 0;
  let throwVel = 0;
  let dragging = false;
  let dragPointerId = null;
  let dragLayer = null;
  let dragStartX = 0;
  let dragStartTrackOffset = 0;
  let lastMoveX = 0;
  let lastMoveTime = 0;
  let velocity = 0;
  let lastFrame = 0;
  let lastSave = 0;

  for (const track of tracks) {
    track.style.animation = "none";
  }

  const wrapTransform = (value) => {
    let wrapped = value % CLOUD_W;
    if (wrapped > 0) wrapped -= CLOUD_W;
    return wrapped;
  };

  const renormalizeDrag = () => {
    while (trackOffset <= -2 * CLOUD_W) {
      trackOffset += CLOUD_W;
      dragStartTrackOffset += CLOUD_W;
    }
    while (trackOffset > 0) {
      trackOffset -= CLOUD_W;
      dragStartTrackOffset -= CLOUD_W;
    }
  };

  /*
   * The clouds are meant to read as one continuous sky across the whole site,
   * so each page picks the strip up where the last one left off, advanced by
   * however long the navigation took.
   */
  const restore = () => {
    let saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      return;
    }
    if (!saved || !Number.isFinite(saved.x) || !Number.isFinite(saved.t)) return;

    const elapsed = Math.max(0, (Date.now() - saved.t) / 1000);
    trackOffset = saved.x + baseSpeed * elapsed;
    renormalizeDrag();
  };

  const save = () => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: trackOffset, t: Date.now() })
      );
    } catch {}
  };

  const getScale = () => {
    if (scaler) {
      const transform = getComputedStyle(scaler).transform;
      if (transform && transform !== "none") {
        const scale = new DOMMatrix(transform).a;
        if (Number.isFinite(scale) && scale > 0) return scale;
      }
    }

    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--title-scale")
      .trim();
    const scale = Number.parseFloat(raw);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  };

  const paint = () => {
    const x = wrapTransform(trackOffset);
    for (const track of tracks) {
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }
    for (const layer of layers) {
      layer.style.setProperty("--cloud-drag-x", "0px");
    }
  };

  const taperVelocity = (vel, dt) => {
    const decay = TAPER_BASE + Math.abs(vel) * TAPER_SPEED;
    return vel * Math.exp(-dt * decay);
  };

  const tick = (now) => {
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
    lastFrame = now;

    if (!dragging && dt > 0) {
      throwVel = taperVelocity(throwVel, dt);
      if (Math.abs(throwVel) < 1) throwVel = 0;
      trackOffset += (baseSpeed + throwVel) * dt;
      renormalizeDrag();
    }

    paint();

    if (now - lastSave > SAVE_INTERVAL) {
      lastSave = now;
      save();
    }

    requestAnimationFrame(tick);
  };

  const finishDrag = (e) => {
    if (!dragging || e.pointerId !== dragPointerId) return;
    dragging = false;
    sky.classList.remove("is-cloud-dragging");
    if (dragLayer) {
      try {
        dragLayer.releasePointerCapture(dragPointerId);
      } catch {}
    }
    dragLayer = null;
    dragPointerId = null;
    throwVel = (velocity / getScale()) * THROW_SCALE;
    renormalizeDrag();
    paint();
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    dragLayer = e.currentTarget;
    dragPointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartTrackOffset = trackOffset;
    lastMoveX = e.clientX;
    lastMoveTime = performance.now();
    velocity = 0;
    throwVel = 0;
    sky.classList.add("is-cloud-dragging");
    dragLayer.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!dragging || e.pointerId !== dragPointerId) return;
    const scale = getScale();
    const now = performance.now();
    const dt = (now - lastMoveTime) / 1000;
    if (dt > 0) {
      velocity = (e.clientX - lastMoveX) / scale / dt;
    }
    trackOffset =
      dragStartTrackOffset + (e.clientX - dragStartX) / scale;
    renormalizeDrag();
    lastMoveX = e.clientX;
    lastMoveTime = now;
    paint();
  };

  if (draggable) {
    for (const layer of layers) {
      layer.addEventListener("pointerdown", onPointerDown);
      layer.addEventListener("pointermove", onPointerMove);
      layer.addEventListener("pointerup", finishDrag);
      layer.addEventListener("pointercancel", finishDrag);
    }
  }

  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });

  restore();
  paint();
  requestAnimationFrame(tick);
})();
