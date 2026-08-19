/**
 * POST /api/oracle
 *
 * The only place your AI API key exists. Vercel picks any file in /api up
 * automatically — no build config, no framework, nothing else to change.
 *
 * Dormant by default. Nothing calls this until you set oracle:true in
 * js/config.js. Until then the whole site runs with no key at all.
 *
 * Free key, no credit card: aistudio.google.com -> Get API key.
 * Then set AI_PROVIDER=gemini and AI_MODEL=gemini-2.5-flash.
 *
 * Environment variables (Vercel → Settings → Environment Variables):
 *
 *   AI_API_KEY         required — key from whichever provider you use
 *   AI_PROVIDER        anthropic | openai | gemini | compatible  (default anthropic)
 *   AI_MODEL           model id; sensible default per provider
 *   AI_BASE_URL        only when AI_PROVIDER=compatible
 *   ORACLE_PASSCODE    optional shared secret; without it the route is open
 */

const DEFAULT_MODEL = {
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-5',
  gemini: 'gemini-2.5-pro',
  compatible: 'openai/gpt-4o-mini'
};

const MAX_PROMPT_CHARS = 20000;
const MAX_OUTPUT_TOKENS = 4000;

/* ---- optional shared secret, so the endpoint is not wide open ---- */
function verify(req, env) {
  if (!env.ORACLE_PASSCODE) return { ok: true };
  return { ok: (req.headers['x-oracle-passcode'] || '') === env.ORACLE_PASSCODE };
}

/* ---- normalise any provider's reply into Anthropic's shape ---- */
function normalise(provider, data) {
  if (provider === 'gemini') return data;
  if (provider === 'gemini') {
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts) || [];
    return { content: [{ type: 'text', text: parts.map(p => p.text || '').join('') }] };
  }
  const choice = (data.choices && data.choices[0]) || {};
  let text = (choice.message && choice.message.content);
  if (Array.isArray(text)) text = text.map(c => c.text || '').join('');
  if (typeof text !== 'string') text = choice.text || '';
  return { content: [{ type: 'text', text }] };
}

function buildRequest(provider, key, model, baseUrl, prompt) {
  if (provider === 'anthropic') return {
    url: 'https://api.anthropic.com/v1/messages',
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: MAX_OUTPUT_TOKENS, messages: [{ role: 'user', content: prompt }] })
    }
  };
  if (provider === 'gemini') return {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS }
      })
    }
  };
  if (provider === 'openai') return {
    url: 'https://api.openai.com/v1/chat/completions',
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, max_completion_tokens: MAX_OUTPUT_TOKENS, messages: [{ role: 'user', content: prompt }] })
    }
  };
  const base = (baseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
  return {
    url: base + '/chat/completions',
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, max_tokens: MAX_OUTPUT_TOKENS, messages: [{ role: 'user', content: prompt }] })
    }
  };
}

module.exports = async (req, res) => {
  const send = (status, body) => {
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.status(status).send(JSON.stringify(body));
  };
  const fail = (status, message) => send(status, { error: { message } });

  if (req.method !== 'POST') return fail(405, 'POST only.');

  const env = process.env;

  if (!verify(req, env).ok) return fail(401, 'Passcode required.');

  const provider = (env.AI_PROVIDER || 'gemini').toLowerCase();
  if (!DEFAULT_MODEL[provider]) return fail(500, 'AI_PROVIDER must be anthropic, openai, gemini or compatible.');

  const key = env.AI_API_KEY;
  if (!key) return fail(500, 'AI_API_KEY is not set on the server.');

  const model = env.AI_MODEL || DEFAULT_MODEL[provider];

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { return fail(400, 'Body must be JSON.'); } }
  const prompt = body && body.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) return fail(400, 'Missing prompt.');
  if (prompt.length > MAX_PROMPT_CHARS) return fail(400, 'Prompt too long.');

  const { url, init } = buildRequest(provider, key, model, env.AI_BASE_URL, prompt);

  let upstream, data;
  try {
    upstream = await fetch(url, init);
    data = await upstream.json();
  } catch (e) {
    return fail(502, 'Could not reach ' + provider + ': ' + (e.message || 'network error'));
  }

  if (!upstream.ok) {
    const m = (data && data.error && (data.error.message || data.error)) || (data && data.message) || 'Upstream error';
    return fail(upstream.status, typeof m === 'string' ? m : JSON.stringify(m));
  }

  return send(200, normalise(provider, data));
};
