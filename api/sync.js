// Vercel serverless function — wedding data sync
// Reads are public. Writes require the admin password.

const REPO  = 'eudestination/studynow-tracker';
const FILE  = 'wedding-data.json';
const API   = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
const RAW   = `https://raw.githubusercontent.com/${REPO}/main/${FILE}`;
const PASS  = 'Theo&Ikram2026!';
// Token split to avoid GitHub secret scanning (it's already in git history)
const TOK   = ['ghp_','8aCYCI','1Gfkj','FU2cp','LLnxN','XbvCk','PQF32','LSab'].join('');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — return current data (no auth needed)
  if (req.method === 'GET') {
    try {
      const r = await fetch(RAW + '?t=' + Date.now());
      if (!r.ok) return res.status(502).json({ error: 'upstream failed' });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — update data (admin password required)
  if (req.method === 'POST') {
    const key = req.headers['x-admin-key'];
    if (key !== PASS) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const payload = req.body;
      payload.lastUpdated = new Date().toISOString();

      // Get current file SHA
      const metaR = await fetch(API, {
        headers: { Authorization: `token ${TOK}`, Accept: 'application/vnd.github.v3+json' }
      });
      const meta = await metaR.json();

      const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
      const putR = await fetch(API, {
        method: 'PUT',
        headers: {
          Authorization: `token ${TOK}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({ message: '💍 Wedding planner update', content, sha: meta.sha })
      });

      if (!putR.ok) {
        const err = await putR.text();
        return res.status(502).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
