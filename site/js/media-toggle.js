(() => {
  const playIcon = `
    <svg class="post-gif-play-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z"/>
    </svg>
  `;

  document.querySelectorAll(".post-body video").forEach((video) => {
    const name = video.getAttribute("aria-label") || "animation";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "post-gif is-paused";

    const play = document.createElement("span");
    play.className = "post-gif-play";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML = playIcon;

    video.replaceWith(button);
    button.append(video, play);

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = false;
    video.disablePictureInPicture = true;
    video.controls = false;
    video.pause();
    video.currentTime = 0;

    let playing = false;

    const setState = () => {
      button.classList.toggle("is-paused", !playing);
      button.setAttribute("aria-pressed", playing ? "true" : "false");
      button.setAttribute(
        "aria-label",
        `${playing ? "Pause" : "Play"} ${name}`
      );
    };

    const pauseClip = () => {
      video.pause();
      playing = false;
      setState();
    };

    const playClip = () => {
      const start = video.play();
      playing = true;
      setState();
      if (start && typeof start.catch === "function") {
        start.catch(() => pauseClip());
      }
    };

    button.addEventListener("click", () => {
      if (playing) pauseClip();
      else playClip();
    });

    setState();
  });
})();
