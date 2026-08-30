#!/usr/bin/env python3
"""Encode site loops as VP9 WebM.

Capture mode: the QuickTime grab at half resolution, source frame rate.
No grid sampling, no palette snap.

Sprite mode: PNG sequence as-is, Frame-N order.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

DEFAULT_FPS = 12


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def encode_vp9(frames_dir: Path, dest: Path, fps: int | float | str, *, alpha: bool) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    pix = "yuva420p" if alpha else "yuv420p"
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-framerate",
            str(fps),
            "-i",
            str(frames_dir / "f_%04d.png"),
            "-c:v",
            "libvpx-vp9",
            "-b:v",
            "0",
            "-crf",
            "32",
            "-pix_fmt",
            pix,
            "-an",
            "-row-mt",
            "1",
            "-auto-alt-ref",
            "0",
            "-deadline",
            "good",
            "-cpu-used",
            "1",
            str(dest),
        ]
    )


def write_still_from_video(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-vframes",
            "1",
            str(dest),
        ]
    )
    # ffmpeg tags the PNG with the video's BT.709 gamma, which colour-managed
    # viewers then apply, showing the still darker than the clip. Rewrite it
    # without those chunks.
    Image.open(dest).convert("RGB").save(dest)


def encode_capture(src: Path, dest: Path, fps: int | float | None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Even dims for yuv420. Half of 1910×1550 → 954×774.
    vf = "scale=2*trunc(iw/4):2*trunc(ih/4):flags=neighbor"
    if fps is not None:
        vf = f"fps={fps},{vf}"
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-an",
            "-vf",
            vf,
            "-c:v",
            "libvpx-vp9",
            "-b:v",
            "0",
            "-crf",
            "24",
            "-pix_fmt",
            "yuv420p",
            "-row-mt",
            "1",
            "-auto-alt-ref",
            "0",
            "-deadline",
            "good",
            "-cpu-used",
            "1",
            str(dest),
        ]
    )
    still = dest.with_name(f"{dest.stem}-still.png")
    write_still_from_video(dest, still)
    print(f"{src.name} -> {dest}  {dest.stat().st_size / 1024:.0f} KB")


def frame_num(path: Path) -> int:
    match = re.search(r"Frame-(\d+)", path.name)
    if match:
        return int(match.group(1))
    match = re.search(r"(\d+)", path.stem)
    return int(match.group(1)) if match else 0


def encode_sequence(files: list[Path], dest: Path, fps: int) -> None:
    files = sorted(files, key=frame_num)
    with tempfile.TemporaryDirectory() as tmp:
        frames_dir = Path(tmp) / "frames"
        frames_dir.mkdir()
        first = None
        alpha = False
        for index, src in enumerate(files, start=1):
            frame = Image.open(src)
            if frame.mode == "RGBA":
                alpha = True
            else:
                frame = frame.convert("RGB")
            if first is None:
                first = frame.convert("RGBA") if alpha else frame.convert("RGB")
            frame.save(frames_dir / f"f_{index:04d}.png")
        encode_vp9(frames_dir, dest, fps, alpha=alpha)
        print(
            f"{len(files)} pngs -> {dest}  "
            f"{first.size[0]}x{first.size[1]}  {dest.stat().st_size / 1024:.0f} KB"
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("src", nargs="+", help="A .mov, or PNG frames")
    parser.add_argument("dest", help="Output .webm")
    parser.add_argument(
        "--fps",
        type=float,
        default=None,
        help="Frame rate. Captures default to the source video; sequences default to 12.",
    )
    parser.add_argument(
        "--capture",
        action="store_true",
        help="Treat src as a window recording (half res, source fps)",
    )
    args = parser.parse_args()
    dest = Path(args.dest)
    if args.capture:
        if len(args.src) != 1:
            parser.error("capture mode takes one .mov")
        encode_capture(Path(args.src[0]), dest, args.fps)
        return
    paths = [Path(item) for item in args.src]
    if len(paths) == 1 and paths[0].suffix.lower() == ".mov":
        parser.error("pass --capture for QuickTime window recordings")
    encode_sequence(paths, dest, args.fps if args.fps is not None else DEFAULT_FPS)


if __name__ == "__main__":
    main()
