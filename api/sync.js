// Wedding data sync via Supabase
const SB_URL = 'https://swottaalkgzuhlkchycb.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3b3R0YWFsa2d6dWhsa2NoeWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODMwNDgsImV4cCI6MjA5NjY1OTA0OH0.VwgHUUrIpfTwYrxSL19sQV8sxbmKm-LMFMvCGauca2A';
const ROW_ID = 'WEDDING_DATA_V1';
const PASS   = 'Theo&Ikram2026!';
const SB_HEADERS = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — return wedding data (no auth needed)
  if (req.method === 'GET') {
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/universities?id=eq.${ROW_ID}&select=notes`,
        { headers: SB_HEADERS }
      );
      const rows = await r.json();
      if (!rows.length || !rows[0].notes) return res.status(200).json({ version: 1, guests: [], expenses: [], tasks: [], tables: [], settings: { spotifyUrl: '' } });
      return res.status(200).json(JSON.parse(rows[0].notes));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — save wedding data (admin password required)
  if (req.method === 'POST') {
    if (req.headers['x-admin-key'] !== PASS) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const payload = { ...req.body, lastUpdated: new Date().toISOString() };
      const r = await fetch(`${SB_URL}/rest/v1/universities`, {
        method: 'POST',
        headers: { ...SB_HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ id: ROW_ID, name: '__wedding__', country: '__wedding__', notes: JSON.stringify(payload) })
      });
      if (!r.ok) { const e = await r.text(); return res.status(502).json({ error: e }); }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
