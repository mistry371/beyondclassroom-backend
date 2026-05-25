# Render deployment (beyondclassroom-backend)

This repository root **must** contain `server-simple.js` and `package.json` directly (not inside a `server/` subfolder).

## Render dashboard settings

| Setting | Value |
|---------|--------|
| **Repository** | `mistry371/beyondclassroom-backend` |
| **Branch** | `master` (or `main`) |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

## If deploy fails with `Cannot find module server-simple.js`

The `master` branch was accidentally pushed with the full monorepo. Fix:

```bash
git subtree split --prefix=server -b deploy-backend-only
git push backend deploy-backend-only:master --force
```

Then **Manual Deploy** on Render.
