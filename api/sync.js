// Wedding data sync via GitHub Contents API
// READ:  raw.githubusercontent.com — no auth, instant
// WRITE: GitHub API with GH_TOKEN env var (set in Vercel dashboard)

const REPO  = 'eudestination/studynow-tracker';
const FILE  = 'wedding-data.json';
const BRANCH = 'main';
const PASS   = 'Theo&Ikram2026!';

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

async function getFileSha(token) {
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`,
    { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!r.ok) return null;
  const d = await r.json();
  return d.sha || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: read current data ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // Use raw URL — fast, no rate limits, no auth needed
      const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE}?t=${Date.now()}`;
      const r = await fetch(rawUrl, { headers: { 'Cache-Control': 'no-cache' } });
      if (!r.ok) return res.status(200).json({ version:1, savedAt:0, guests:[], expenses:[], tasks:[], tables:[], photos:[], venuePhotos:{}, settings:{} });
      const data = await r.json();
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: save data ─────────────────────────────────────────────
  if (req.method === 'POST') {
    if (req.headers['x-admin-key'] !== PASS) return res.status(401).json({ error: 'Unauthorized' });

    const token = process.env.GH_TOKEN;
    if (!token) return res.status(503).json({ error: 'GH_TOKEN env var not set in Vercel — see setup instructions' });

    try {
      const payload = { ...req.body, lastUpdated: new Date().toISOString() };
      const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

      // Need current file SHA to update (GitHub requires it)
      const sha = await getFileSha(token);

      const body = {
        message: `sync: wedding data update ${new Date().toISOString()}`,
        content,
        branch: BRANCH,
        ...(sha ? { sha } : {})
      };

      const r = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${FILE}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
      if (!r.ok) {
        const e = await r.text();
        return res.status(502).json({ error: e });
      }
      return res.status(200).json({ ok: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
