(() => {
  const videos = [...document.querySelectorAll(".splash-prop video")];
  if (!videos.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const kick = () => {
    for (const video of videos) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      if (reducedMotion) {
        video.pause();
        continue;
      }
      const start = video.play();
      if (start && typeof start.catch === "function") start.catch(() => {});
    }
  };

  kick();
  document.addEventListener("pointerdown", kick, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") kick();
  });
})();
