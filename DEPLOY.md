# StudyNow Partnership Tracker — Deployment Guide

## What you need (both free, no credit card)
- **Supabase** account → supabase.com (database)
- **Vercel** account → vercel.com (hosting)

---

## STEP 1 — Set up Supabase (your database)

1. Go to **supabase.com** → Sign up → New Project
2. Give it a name (e.g. `studynow-tracker`) and a password → Create project
3. Wait ~2 minutes for it to provision
4. Click **SQL Editor** in the left sidebar
5. Click **New query**, paste the contents of `setup.sql`, click **Run**
6. Go to **Settings → API** (left sidebar)
7. Copy two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

---

## STEP 2 — Add your Supabase credentials to the files

Open **both** `admin.html` and `index.html` in a text editor.

In each file, find these two lines near the top of the `<script>` section:

```
const SB_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SB_KEY = 'YOUR_ANON_PUBLIC_KEY';
```

Replace them with your actual values, for example:

```
const SB_URL = 'https://abcdefghij.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Save both files.

---

## STEP 3 — Deploy to Vercel

### Option A — Drag and drop (easiest, no GitHub needed)

1. Go to **vercel.com** → Log in → click **Add New → Project**
2. Click **"Import from folder"** or drag your whole folder into the upload area
3. Vercel will detect it as a static site automatically
4. Click **Deploy**
5. Done — Vercel gives you a live URL like `https://studynow-tracker.vercel.app`

### Option B — GitHub (recommended for ongoing updates)

1. Install Git if you don't have it: **git-scm.com**
2. Open Terminal and run:
   ```
   cd "/Users/theostudynow/Desktop/Untitled Folder"
   git init
   git add .
   git commit -m "Initial deploy"
   ```
3. Go to **github.com** → New repository → name it `studynow-tracker` → Create
4. Follow the instructions GitHub shows to push your code
5. Go to **vercel.com** → Add New → Project → Import from GitHub
6. Select your repo → Deploy
7. Future updates: edit files → `git add . && git commit -m "update" && git push` → Vercel redeploys automatically

---

## STEP 4 — Share your URLs

After deployment Vercel gives you a URL. Share it like this:

| Who | URL | Access |
|-----|-----|--------|
| You (admin) | `https://your-app.vercel.app/admin` | Full edit access — requires login |
| Managers | `https://your-app.vercel.app` | Read-only dashboard — no login needed |

---

## Admin login credentials

```
Username:  studynow_admin
Password:  StudyNow@2024!
```

To change the password, open `admin.html` and find:
```js
const CREDS = { username:'studynow_admin', password:'StudyNow@2024!' };
```

---

## How data works

- All data is stored in your **Supabase** database
- Both `admin.html` and `index.html` read from the same database
- Changes made in admin are visible to managers within **30 seconds** (auto-refresh)
- The first time admin loads, it automatically seeds all 42 universities

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot connect to database" on admin login | Check SB_URL and SB_KEY are correct in both files |
| Data not showing on manager view | Confirm the same SB_URL/SB_KEY is in index.html |
| Vercel shows a blank page | Make sure index.html is in the root of the folder you uploaded |
| CORS error in browser console | Go to Supabase → Settings → API → make sure your Vercel domain is not blocked |

---

## Files in this folder

```
admin.html    — Backend (admin, editable, password protected)
index.html    — Frontend (manager view, read-only, live data)
setup.sql     — Run this once in Supabase SQL Editor
vercel.json   — Vercel routing config (auto-used on deploy)
DEPLOY.md     — This guide
```
