
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
   - `wip` — see **Drafts** below
   The URL comes from the filename: `posts/my-cool-thing.md` → `/notes/my-cool-thing.html`.
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

## Drafts

Add `wip: true` to a post's top block and it stays off the live site — no page is
built and it doesn't appear on Notes. It still shows on `npm run dev`, with a WIP
badge, so you can read it as it'll look. Delete the line to publish.

Note this only controls the **website**. The markdown file still lives in the repo,
so it's readable on GitHub either way.

To preview a production build with drafts included: `INCLUDE_WIP=1 npx eleventy`.

**GitHub Pages:** Settings → Pages → Source → **GitHub Actions**

## Contact form (Resend)

The contact page posts to the same Cloudflare Worker as comments. Email is sent via [Resend](https://resend.com).

### One-time setup

1. **Create a free Resend account** at [resend.com](https://resend.com) (sign up with `alexwaiteuk@gmail.com` if you want to test quickly).
2. **Create an API key** — Resend dashboard → API Keys → Create.
3. **Add the secret to the worker:**
   ```
   wrangler secret put RESEND_API_KEY --config comments-worker/wrangler.toml
   ```
   Paste the key when prompted (`re_…`).
4. **Local dev** — add the same key to `comments-worker/.dev.vars`:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   ADMIN_SECRET=local-dev-secret
   ```
5. **Deploy the worker:**
   ```
   npm run comments:deploy
   ```

### Testing vs production

- **Testing:** `CONTACT_FROM` is set to `onboarding@resend.dev`. Resend only delivers these to the email address you signed up with.
- **Production:** verify your domain in Resend (e.g. `dayoftheplanetofthenight.com`), then update `CONTACT_FROM` in `comments-worker/wrangler.toml` to something like `Contact Form <hello@dayoftheplanetofthenight.com>` and redeploy.
