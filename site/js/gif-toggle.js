(() => {
  const prefersStill = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const decode =
    window.gifuct &&
    typeof window.gifuct.parseGIF === "function" &&
    typeof window.gifuct.decompressFrames === "function"
      ? window.gifuct
      : null;

  document.querySelectorAll('.post-body img[src$=".gif"]').forEach((img) => {
    const gifSrc = img.getAttribute("src");
    const name = img.alt || "animation";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "post-gif";

    const badge = document.createElement("span");
    badge.className = "post-gif-badge";
    badge.setAttribute("aria-hidden", "true");

    img.style.visibility = "hidden";
    img.replaceWith(button);
    button.append(img, badge);

    let playing = !prefersStill;
    let pause = () => {};
    let play = () => {};

    const setState = () => {
      button.classList.toggle("is-paused", !playing);
      button.setAttribute("aria-pressed", playing ? "true" : "false");
      button.setAttribute(
        "aria-label",
        `${playing ? "Pause" : "Play"} ${name}`
      );
      badge.textContent = playing ? "pause" : "play";
    };

    button.addEventListener("click", () => {
      if (playing) pause();
      else play();
    });

    const startDecoded = (parsed, frames) => {
      const width = parsed.lsd.width;
      const height = parsed.lsd.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const view = canvas.getContext("2d");
      view.imageSmoothingEnabled = false;

      const layer = document.createElement("canvas");
      layer.width = width;
      layer.height = height;
      const layerCtx = layer.getContext("2d", { alpha: true });
      layerCtx.imageSmoothingEnabled = false;

      const patch = document.createElement("canvas");
      const patchCtx = patch.getContext("2d", { alpha: true });
      patchCtx.imageSmoothingEnabled = false;

      let index = 0;
      let timer = 0;
      let prev = null;

      const draw = (frameIndex) => {
        if (frameIndex === 0) {
          layerCtx.clearRect(0, 0, width, height);
          prev = null;
        }

        const frame = frames[frameIndex];
        if (prev && prev.disposalType === 2) {
          layerCtx.clearRect(
            prev.dims.left,
            prev.dims.top,
            prev.dims.width,
            prev.dims.height
          );
        }

        if (
          patch.width !== frame.dims.width ||
          patch.height !== frame.dims.height
        ) {
          patch.width = frame.dims.width;
          patch.height = frame.dims.height;
          patchCtx.imageSmoothingEnabled = false;
        }

        const imageData = patchCtx.createImageData(
          frame.dims.width,
          frame.dims.height
        );
        imageData.data.set(frame.patch);
        patchCtx.putImageData(imageData, 0, 0);
        layerCtx.drawImage(patch, frame.dims.left, frame.dims.top);
        view.clearRect(0, 0, width, height);
        view.drawImage(layer, 0, 0);
        prev = frame;
      };

      const arm = () => {
        const delay = Math.max(20, frames[index].delay || 80);
        timer = window.setTimeout(() => {
          index = (index + 1) % frames.length;
          draw(index);
          if (playing) arm();
        }, delay);
      };

      pause = () => {
        if (!playing) return;
        playing = false;
        window.clearTimeout(timer);
        setState();
      };

      play = () => {
        if (playing) return;
        playing = true;
        setState();
        arm();
      };

      img.replaceWith(canvas);
      draw(0);
      setState();
      if (playing) arm();
    };

    const freezeImg = () => {
      if (!img.naturalWidth) return false;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      img.src = canvas.toDataURL("image/png");
      return true;
    };

    if (!decode) {
      pause = () => {
        if (!playing) return;
        freezeImg();
        playing = false;
        setState();
      };
      play = () => {
        img.src = "";
        img.src = gifSrc;
        playing = true;
        setState();
      };
      if (prefersStill) {
        const freezeWhenReady = () => {
          freezeImg();
          playing = false;
          setState();
        };
        if (img.complete && img.naturalWidth) freezeWhenReady();
        else img.addEventListener("load", freezeWhenReady, { once: true });
      } else {
        setState();
      }
      return;
    }

    fetch(gifSrc)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const parsed = decode.parseGIF(buffer);
        const frames = decode.decompressFrames(parsed, true);
        if (!frames.length) throw new Error("no frames");
        startDecoded(parsed, frames);
      })
      .catch(() => {
        setState();
      });

    setState();
  });
})();
