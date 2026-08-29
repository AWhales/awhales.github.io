
Public site builds from `site/` + `posts/` → `production/` → GitHub Pages.

## Write a note (easy mode)

1. **Copy** `posts/_TEMPLATE.md` → `posts/my-cool-thing.md`
2. **Edit the top block** (between the `---` lines):
   - `title` — headline on the page
   - `date` — e.g. `2026-08-26`
   - `preview` — optional still on the Notes list (a `.gif` uses `name-still.png`)
   - `permalink` — must match filename: `notes/my-cool-thing.html`
3. **Write below** the second `---`. Normal text. Blank line = new paragraph.
4. **Pictures:** drop files in `site/assets/notes/`, then in the post:
   ```
   ![caption](/assets/notes/pic.png)
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
