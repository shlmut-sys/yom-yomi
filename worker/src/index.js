/* =============================================================
   יומיומי · Newsletter Worker (Cloudflare)
   - POST /subscribe         → add email to D1
   - GET  /unsubscribe?token → deactivate
   - GET  /send-now?key=...   → manually trigger daily send
   - GET  /count              → active subscriber count
   - scheduled (cron)         → daily send to all active subscribers

   Deploy: wrangler deploy
   Secret: wrangler secret put BREVO_API_KEY
   ============================================================= */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function token() {
  return crypto.randomUUID().replace(/-/g, '');
}

export default {
  /* ---------- HTTP routes ---------- */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // ---- subscribe ----
    if (url.pathname === '/subscribe' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
      const email = String(body.email || '').trim().toLowerCase();
      const source = String(body.source || 'site').slice(0, 40);
      if (!isValidEmail(email)) return json({ error: 'כתובת מייל לא תקינה' }, 400);
      try {
        await env.DB.prepare(
          `INSERT INTO subscribers (email, source, created_at, active, unsub_token)
           VALUES (?, ?, ?, 1, ?)
           ON CONFLICT(email) DO UPDATE SET active = 1`
        ).bind(email, source, Date.now(), token()).run();
      } catch (e) {
        return json({ error: 'db error' }, 500);
      }
      return json({ ok: true });
    }

    // ---- unsubscribe ----
    if (url.pathname === '/unsubscribe') {
      const t = url.searchParams.get('token');
      if (t) await env.DB.prepare(`UPDATE subscribers SET active = 0 WHERE unsub_token = ?`).bind(t).run();
      return new Response(
        `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8">
         <body style="font-family:sans-serif;background:#0a0a0a;color:#f5f5f7;text-align:center;padding:4rem">
         <h1 style="color:#d4a843">הוסרתם מהרשימה</h1>
         <p>לא תקבלו יותר מיילים. תמיד אפשר להירשם מחדש באתר.</p></body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // ---- manual send trigger ----
    if (url.pathname === '/send-now') {
      if (url.searchParams.get('key') !== env.SEND_NOW_KEY) return json({ error: 'unauthorized' }, 401);
      return json(await sendDaily(env));
    }

    // ---- count ----
    if (url.pathname === '/count') {
      const r = await env.DB.prepare(`SELECT COUNT(*) AS n FROM subscribers WHERE active = 1`).first();
      return json({ active: r?.n ?? 0 });
    }

    return json({ name: 'yomyomi-list', routes: ['/subscribe', '/unsubscribe', '/send-now', '/count'] });
  },

  /* ---------- Cron (daily) ---------- */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDaily(env));
  },
};

/* =============================================================
   Build today's email + send to all active subscribers via Brevo
   ============================================================= */
async function sendDaily(env) {
  const { results } = await env.DB.prepare(
    `SELECT email, unsub_token FROM subscribers WHERE active = 1`
  ).all();
  if (!results || results.length === 0) return { sent: 0, note: 'no subscribers' };

  const baseHtml = await buildDailyEmail(env);
  const subject = `🕯️ יומיומי · ${hebrewDateLabel()}`;

  let sent = 0, failed = 0;
  for (const sub of results) {
    const unsubUrl = `${workerOrigin(env)}/unsubscribe?token=${sub.unsub_token}`;
    const html = baseHtml.replace('{{UNSUB_URL}}', unsubUrl);
    const ok = await sendBrevo(env, sub.email, subject, html);
    if (ok) sent++; else failed++;
  }
  return { sent, failed, total: results.length };
}

function workerOrigin(env) {
  // Brevo unsub links point back to this worker. If you have a custom domain, set it here.
  return env.WORKER_URL || 'https://yomyomi-list.workers.dev';
}

/* Send one email through Brevo transactional API */
async function sendBrevo(env, toEmail, subject, html) {
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: env.SENDER_EMAIL, name: env.SENDER_NAME },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      }),
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}

/* =============================================================
   Compose the daily digest email (dark + gold, RTL, email-safe HTML).
   Pulls live data: Hebrew date + parsha (Hebcal), a Breslov chizuk,
   and links back to the site. Email clients strip <script>/<style>
   sometimes, so this uses inline styles only.
   ============================================================= */
async function buildDailyEmail(env) {
  const site = env.SITE_URL || 'https://example.github.io/yom-yomi/';

  // --- Hebrew date + parsha from Hebcal (free, CORS-less server fetch) ---
  let hebDate = '', parsha = '';
  try {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();
    const hc = await (await fetch(
      `https://www.hebcal.com/converter?cfg=json&gy=${y}&gm=${m}&gd=${d}&g2h=1&strict=1`
    )).json();
    hebDate = hc.hebrew || '';
  } catch {}
  try {
    const items = await (await fetch(
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&s=on&geo=none&year=now&month=x`
    )).json();
    const p = (items.items || []).find(it => it.category === 'parashat');
    parsha = p ? (p.hebrew || p.title) : '';
  } catch {}

  // --- a daily chizuk quote (static rotation; full quotes live in the site JSON) ---
  const chizukim = [
    'מצוה גדולה להיות בשמחה תמיד',
    'אם אתה מאמין שיכולים לקלקל, תאמין שיכולים לתקן',
    'העיקר הוא האמונה, וצריך לחפש ולבקש מאד את האמונה',
    'כל העולם כולו גשר צר מאוד, והעיקר לא לפחד כלל',
    'תכלית הידיעה אשר לא נדע',
  ];
  const chizuk = chizukim[new Date().getDate() % chizukim.length];

  const G = '#d4a843', GL = '#f0c668', BG = '#0a0a0a', CARD = '#141416', TXT = '#f5f5f7', MUT = '#a1a1a6';

  return `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- header -->
        <tr><td align="center" style="padding:16px 0 24px;">
          <div style="font-size:42px;font-weight:900;color:${G};letter-spacing:-1px;">יומיומי</div>
          <div style="font-size:14px;color:${MUT};margin-top:4px;">היום היהודי שלך, יום אחר יום</div>
        </td></tr>

        <!-- date / parsha card -->
        <tr><td style="background:${CARD};border:1px solid rgba(212,168,67,0.25);border-radius:16px;padding:24px;text-align:center;">
          <div style="font-size:13px;color:${G};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">היום</div>
          <div style="font-size:24px;font-weight:800;color:${TXT};">${parsha ? 'פרשת ' + escapeHtml(parsha) : 'שבת שלום'}</div>
          <div style="font-size:16px;color:${MUT};margin-top:8px;">${escapeHtml(hebDate)}</div>
        </td></tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- chizuk card -->
        <tr><td style="background:${CARD};border:1px solid rgba(212,168,67,0.25);border-radius:16px;padding:28px 24px;text-align:center;">
          <div style="font-size:13px;color:${G};letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">חיזוק יומי · רבי נחמן</div>
          <div style="font-size:22px;font-weight:600;color:${GL};line-height:1.6;">"${escapeHtml(chizuk)}"</div>
        </td></tr>

        <tr><td style="height:24px;"></td></tr>

        <!-- CTA -->
        <tr><td align="center">
          <a href="${site}" style="display:inline-block;background:${G};color:#0a0a0a;font-size:16px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:40px;">
            לכל התוכן של היום באתר ←
          </a>
        </td></tr>

        <tr><td style="height:8px;"></td></tr>
        <tr><td align="center" style="font-size:12px;color:${MUT};line-height:1.6;">
          זמני תפילה · הלכה · פתגם · יומא דהילולא · תהילים · גליונות ועוד
        </td></tr>

        <!-- footer -->
        <tr><td align="center" style="padding-top:28px;border-top:1px solid rgba(255,255,255,0.08);margin-top:24px;">
          <div style="font-size:11px;color:#666;line-height:1.8;">
            קיבלתם מייל זה כי נרשמתם לרשימת התפוצה של יומיומי.<br>
            <a href="{{UNSUB_URL}}" style="color:${MUT};">להסרה מהרשימה</a> ·
            <a href="${site}" style="color:${MUT};">לאתר</a>
          </div>
          <div style="font-size:11px;color:#444;margin-top:10px;">© מעבדות שלימות · בית שמש</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function hebrewDateLabel() {
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  return 'יום ' + days[new Date().getDay()];
}
