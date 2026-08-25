
Public site source lives in `production/`. Edit there, commit, push — GitHub Actions deploys it to Pages.

Everything else in this folder (Docs, Game Assets, etc.) stays local and is gitignored.

**Pages setup:** Settings → Pages → Source → **GitHub Actions**. Then Actions → **Deploy site** → green run required after each source change.
