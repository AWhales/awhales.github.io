
Public site builds from `site/` + `posts/` → `production/` → GitHub Pages.

## Design

The site uses the game's locked **9-colour palette**. CSS variables live in `site/css/style.css` (`:root`).

| Token | Hex | Role |
|---|---|---|
| `--white` | `#9c9cba` | Body text, clouds |
| `--light-blue` | `#7c7ca3` | Secondary text, nav default |
| `--blue` | `#5357a3` | Section headings, accents |
| `--deep-blue` | `#3b3b7d` | Rules, media borders |
| `--grey-blue` | `#383849` | Subtle borders |
| `--black` | `#232323` | **Page background (whole site)** |
| `--blacker` | `#181818` | Inset wells — previews, inputs |
| `--light-orange` | `#deb88f` | Warm accent — dates, links, hover |
| `--orange` | `#f9b265` | Loud accent — buttons, active states |

Rule of thumb: cold violet-blues vs warm peach-oranges. Don't introduce colours outside this set.

Fonts: **Silkscreen** (pixel labels, nav, headings) · **IBM Plex Sans** (body).

## Write a note (easy mode)

1. **Copy** `posts/_TEMPLATE.md` → `posts/my-cool-thing.md`
2. **Edit the top block** (between the `---` lines):
   - `title` — headline on the page
   - `date` — e.g. `2026-08-26`
   - `preview` — optional still on the Notes list (a `.webm` / `.gif` uses `name-still.png`)
   - `permalink` — must match filename: `notes/my-cool-thing.html`
3. **Write below** the second `---`. Normal text. Blank line = new paragraph.
4. **Pictures:** drop files in `site/assets/notes/`, then in the post:
   ```
   ![caption](/assets/notes/pic.png)
   ![looping clip](/assets/notes/clip.webm)
   ```
5. **Push** — GitHub builds and deploys automatically.

That's it. You never touch `production/`, HTML, or Eleventy config.

**Preview on your machine** — run these two commands separately (one per line):

```
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:8080/).

**GitHub Pages:** Settings → Pages → Source → **GitHub Actions**
