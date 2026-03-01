/**
 * Attendance Tracker – Cloud Server
 * Deployed on Railway — data stored permanently via JSONBin.
 *
 * No npm installs needed — uses only Node.js built-ins + fetch (Node 18+).
 */

const http = require('http');
const path = require('path');
const fs   = require('fs');

const PORT           = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'RTS_checker'; // 🔑 Change this to your own password
const HTML_FILE      = path.join(__dirname, 'index.html');

// ── JSONBin config ────────────────────────────────────────────────────────────
const JSONBIN_BIN_ID  = '69a3ccffd0ea881f40e3dcfa';   // 🔑 Paste your Bin ID here
const JSONBIN_API_KEY = '$2a$10$3Qpgl3bV2cmLfQ06VFCMY.q5Btc5Nq73x4rdgEVJg.28dKOrKVbnW';   // 🔑 Paste your Master Key here
const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ── Helpers ──────────────────────────────────────────────────────────────────
async function readData() {
  const res = await fetch(JSONBIN_URL + '/latest', {
    headers: { 'X-Master-Key': JSONBIN_API_KEY }
  });
  const json = await res.json();
  return json.record;
}

async function writeData(data) {
  await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    },
    body: JSON.stringify(data)
  });
}

function json(res, obj, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(obj));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end',  () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // ── Serve HTML ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && url === '/') {
    const html = fs.readFileSync(HTML_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }

  // ── GET /api/data  →  return everything ────────────────────────────────
  if (req.method === 'GET' && url === '/api/data') {
    const data = await readData();
    return json(res, data);
  }

  // ── POST /api/auth  →  { password }  →  verify admin ───────────────────
  if (req.method === 'POST' && url === '/api/auth') {
    const { password } = await body(req);
    return json(res, { ok: password === ADMIN_PASSWORD });
  }

  // ── POST /api/people  →  { name }  →  add person ────────────────────────
  if (req.method === 'POST' && url === '/api/people') {
    const { name } = await body(req);
    if (!name) return json(res, { error: 'name required' }, 400);
    const data = await readData();
    if (data.people.includes(name)) return json(res, { error: 'already exists' }, 409);
    data.people.push(name);
    await writeData(data);
    return json(res, { ok: true, people: data.people });
  }

  // ── DELETE /api/people  →  { name }  →  remove person ───────────────────
  if (req.method === 'DELETE' && url === '/api/people') {
    const { name } = await body(req);
    const data = await readData();
    data.people = data.people.filter(p => p !== name);
    Object.values(data.records).forEach(day => delete day[name]);
    await writeData(data);
    return json(res, { ok: true });
  }

  // ── POST /api/attendance  →  { date, name, status }  →  set status ──────
  if (req.method === 'POST' && url === '/api/attendance') {
    const { date, name, status } = await body(req);
    const data = await readData();
    if (!data.records[date]) data.records[date] = {};
    if (status === null || status === undefined) {
      delete data.records[date][name];
    } else {
      data.records[date][name] = status;
    }
    await writeData(data);
    return json(res, { ok: true });
  }

  // ── POST /api/attendance/bulk  →  { date, status }  →  mark all ─────────
  if (req.method === 'POST' && url === '/api/attendance/bulk') {
    const { date, status } = await body(req);
    const data = await readData();
    if (!data.records[date]) data.records[date] = {};
    data.people.forEach(p => { data.records[date][p] = status; });
    await writeData(data);
    return json(res, { ok: true });
  }

  // ── 404 ─────────────────────────────────────────────────────────────────
  json(res, { error: 'not found' }, 404);
});

server.listen(PORT, () => {
  console.log(`\n🟢  Attendance Tracker running!`);
  console.log(`   Open → http://localhost:${PORT}\n`);
});