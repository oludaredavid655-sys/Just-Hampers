const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
require('dotenv').config();

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const usePaidOpenAi = process.env.JUSTY_MODE === 'openai' && Boolean(process.env.OPENAI_API_KEY);
const rateLimits = new Map();
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp'
};

function buildSiteConfig(env = process.env) {
  const source = env || {};
  const supabaseUrl = String(source.SUPABASE_URL || source.NEXT_PUBLIC_SUPABASE_URL || source.supabaseUrl || '').trim();
  const supabasePublishableKey = String(
    source.SUPABASE_PUBLISHABLE_KEY ||
    source.SUPABASE_ANON_KEY ||
    source.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    source.supabasePublishableKey ||
    source.supabaseAnonKey ||
    ''
  ).trim();
  const paystackPublicKey = String(source.PAYSTACK_PUBLIC_KEY || source.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || source.paystackPublicKey || '').trim();
  const paystackSecretKey = String(source.PAYSTACK_SECRET_KEY || source.PAYSTACK_SECRET || source.paystackSecretKey || '').trim();
  const paymentEnabled = Boolean(paystackPublicKey && paystackSecretKey);
  const paymentMethods = [
    { id: 'card', label: 'Card', detail: 'Debit and credit cards through secure provider checkout.', enabled: paymentEnabled, providerChannel: 'card' },
    { id: 'bank_transfer', label: 'Bank transfer', detail: 'Provider-managed transfer instructions.', enabled: paymentEnabled, providerChannel: 'bank_transfer' },
    { id: 'payment_link', label: 'Payment link', detail: 'A secure, order-specific link issued by the payment backend.', enabled: paymentEnabled, providerChannel: null }
  ];

  return {
    auth: {
      enabled: Boolean(supabaseUrl && supabasePublishableKey),
      provider: 'supabase',
      supabaseUrl,
      supabasePublishableKey,
      redirectUrl: env.SUPABASE_REDIRECT_URL || null
    },
    payment: {
      enabled: paymentEnabled,
      provider: paymentEnabled ? 'paystack' : null,
      paystackPublicKey,
      currency: 'NGN',
      methods: paymentMethods,
      endpoints: {
        createCheckout: '/api/payments/checkout',
        verifyStatus: '/api/payments/status',
        corporatePaymentLink: '/api/corporate/payments/link'
      },
      corporate: {
        depositPercentage: 50,
        balancePercentage: 50,
        scheduleSource: 'approved_quote'
      }
    }
  };
}

const responseSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    giftRelated: { type: 'boolean' },
    recipient: { type: 'string' },
    occasion: { type: 'string' },
    budget: { type: ['number', 'null'] },
    preferences: { type: 'array', items: { type: 'string' } },
    dislikes: { type: 'array', items: { type: 'string' } },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' },
          productIds: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'reason', 'productIds'],
        additionalProperties: false
      }
    }
  },
  required: ['reply', 'giftRelated', 'recipient', 'occasion', 'budget', 'preferences', 'dislikes', 'recommendations'],
  additionalProperties: false
};

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 64000) {
        reject(Object.assign(new Error('Request is too large.'), { status: 413 }));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error('Request must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function cleanConversation(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.slice(-16).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    content: String(message?.content || '').slice(0, 4000)
  })).filter((message) => message.content.trim());
}

function cleanCatalog(catalog) {
  if (!Array.isArray(catalog)) return [];
  return catalog.slice(0, 100).map((product) => ({
    id: String(product?.id || '').slice(0, 80),
    name: String(product?.name || '').slice(0, 120),
    category: String(product?.category || '').slice(0, 80),
    description: String(product?.description || '').slice(0, 240),
    price: Number(product?.price) || 0,
    minimumBudget: String(product?.minimumBudget || '').slice(0, 24)
  })).filter((product) => product.id && product.name);
}

function createLocalAnswer(messages, catalog) {
  const query = messages[messages.length - 1]?.content || '';
  const normalizedQuery = query.toLowerCase();
  const numberPattern = '(\\d[\\d,]*(?:\\.\\d+)?)\\s*(k)?';
  const budgetMatch = query.match(new RegExp(`(?:under|below|within|less than|budget(?: is| of)?|maximum|max)\\s*(?:₦|ngn|n)?\\s*${numberPattern}`, 'i'))
    || query.match(new RegExp(`(?:₦|ngn)\\s*${numberPattern}`, 'i'))
    || query.match(/(\d[\d,]*(?:\.\d+)?)\s*(?:k|naira)\b/i);
  const budgetValue = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) * (budgetMatch[2]?.toLowerCase() === 'k' ? 1000 : 1) : null;
  const budget = Number.isFinite(budgetValue) && budgetValue > 0 ? budgetValue : null;

  const recipientPatterns = [
    [/\b(?:mum|mom|mother|mummy)\b/i, 'Mum'],
    [/\b(?:wife|spouse)\b/i, 'Wife'],
    [/\b(?:husband)\b/i, 'Husband'],
    [/\b(?:dad|father|daddy)\b/i, 'Dad'],
    [/\b(?:friend|best friend)\b/i, 'Friend'],
    [/\b(?:colleague|coworker|employee|staff)\b/i, 'Colleague'],
    [/\b(?:client|customer)\b/i, 'Client'],
    [/\b(?:sister)\b/i, 'Sister'],
    [/\b(?:brother)\b/i, 'Brother']
  ];
  const occasionPatterns = [
    [/\bbirthday\b/i, 'Birthday'],
    [/\banniversary\b/i, 'Anniversary'],
    [/\bwedding\b/i, 'Wedding'],
    [/\bchristmas\b/i, 'Christmas'],
    [/\bthank(?:s| you)\b/i, 'Thank you'],
    [/\b(?:promotion|new job)\b/i, 'New job'],
    [/\bhousewarming\b/i, 'Housewarming'],
    [/\b(?:corporate|employees|staff)\b/i, 'Corporate gifting']
  ];
  const recipient = recipientPatterns.find(([pattern]) => pattern.test(query))?.[1] || '';
  const occasion = occasionPatterns.find(([pattern]) => pattern.test(query))?.[1] || '';
  const preferenceRules = [
    { label: 'coffee', pattern: /\b(?:coffee|caffeine|espresso)\b/i },
    { label: 'tea', pattern: /\b(?:tea|herbal)\b/i },
    { label: 'sweet treats', pattern: /\b(?:sweet|chocolate|brownie|cake)\b/i },
    { label: 'Nigerian-made gifts', pattern: /\b(?:nigerian|local|artisan|adire|kilishi|chin.chin|plantain)\b/i },
    { label: 'wellness', pattern: /\b(?:wellness|self.care|spa|relax|fragrance|candle)\b/i },
    { label: 'work and tech', pattern: /\b(?:office|work|tech|desk|employee|client)\b/i },
    { label: 'snacks', pattern: /\b(?:snack|biscuit|nuts|popcorn)\b/i }
  ];
  const preferences = preferenceRules.filter((rule) => rule.pattern.test(query)).map((rule) => rule.label);
  const dislikeMatch = query.match(/(?:doesn't like|does not like|dislikes|avoid)\s+([^.,;]+)/i);
  const dislikes = dislikeMatch ? [dislikeMatch[1].trim()] : [];
  const giftRelated = Boolean(recipient || occasion || preferences.length || /\b(?:gift|hamper|present|gifting)\b/i.test(query));

  if (!giftRelated) {
    return {
      reply: 'I’m the free Justy catalog helper, focused on hamper and gift ideas. Tell me who you’re shopping for, the occasion, your budget, and what they enjoy.',
      giftRelated: false,
      recipient,
      occasion,
      budget,
      preferences,
      dislikes,
      recommendations: []
    };
  }

  const themes = [
    { title: 'Coffee break', keywords: ['coffee', 'caffeine', 'espresso'], productIds: ['coffee', 'nigerian-coffee', 'mug', 'biscuits', 'personalised-card'] },
    { title: 'Tea and slow mornings', keywords: ['tea', 'herbal', 'honey'], productIds: ['tea', 'honey-preserve', 'granola-fruit', 'biscuits', 'personalised-card'] },
    { title: 'Sweet celebration', keywords: ['birthday', 'sweet', 'chocolate', 'cake', 'celebration'], productIds: ['cake-brownies', 'chocolate', 'sweets', 'floral-accent', 'personalised-card'] },
    { title: 'Nigerian favourites', keywords: ['nigerian', 'local', 'artisan', 'adire', 'kilishi', 'chin-chin', 'plantain'], productIds: ['nigerian-coffee', 'chin-chin', 'plantain-chips', 'cashews', 'personalised-card'] },
    { title: 'A moment to unwind', keywords: ['wellness', 'self-care', 'spa', 'relax', 'fragrance', 'candle'], productIds: ['hand-care', 'essential-oils', 'tea', 'personalised-card'] },
    { title: 'Desk and tech essentials', keywords: ['office', 'work', 'tech', 'desk', 'employee', 'client'], productIds: ['notebook', 'wireless-mouse', 'pen-set', 'personalised-card'] },
    { title: 'Thoughtful favourites', keywords: ['gift', 'hamper', 'present', 'mum', 'mom', 'mother', 'wife', 'husband', 'friend'], productIds: ['chocolate', 'biscuits', 'tea', 'personalised-card'] }
  ];
  const productsById = new Map(catalog.map((product) => [product.id, product]));
  const rankedThemes = themes.map((theme, index) => ({
    ...theme,
    index,
    score: theme.keywords.reduce((score, keyword) => score + (normalizedQuery.includes(keyword) ? 1 : 0), 0)
      + (preferences.some((preference) => theme.keywords.some((keyword) => keyword.includes(preference) || preference.includes(keyword))) ? 2 : 0)
  })).sort((first, second) => second.score - first.score || first.index - second.index);
  const recommendations = rankedThemes.slice(0, 3).map((theme) => {
    let subtotal = 0;
    const products = theme.productIds.map((id) => productsById.get(id)).filter(Boolean).filter((product) => {
      if (budget && subtotal + product.price > budget) return false;
      subtotal += product.price;
      return true;
    });
    const occasionContext = recipient && occasion
      ? `for ${recipient}'s ${occasion.toLowerCase()}`
      : recipient ? `for ${recipient}` : occasion ? `for a ${occasion.toLowerCase()}` : '';
    return {
      title: theme.title,
      reason: `A ${theme.title.toLowerCase()} selection${occasionContext ? ` ${occasionContext}` : ''}. Listed product subtotal: ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(subtotal)}; packaging and delivery are not included. Prices are estimates.`,
      productIds: products.map((product) => product.id)
    };
  }).filter((recommendation) => recommendation.productIds.length);

  const preferenceText = preferences.length ? `, with ${preferences.join(' and ')} in mind` : '';
  const budgetText = budget ? ` and a budget of ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(budget)}` : '';
  const occasionText = occasion ? `${recipient ? `'s ${occasion.toLowerCase()}` : ` for ${occasion.toLowerCase()}`}` : '';
  const reply = recommendations.length
    ? `Here are a few catalog-based ideas${recipient ? ` for ${recipient}${occasionText}` : occasionText}${preferenceText}${budgetText}. These are illustrative product estimates; final prices, packaging and delivery need confirmation.`
    : `I couldn't find listed items within${budgetText || ' that budget'}. Try raising the budget or tell me which items matter most.`;

  return { reply, giftRelated: true, recipient, occasion, budget, preferences, dislikes, recommendations };
}

function loadCatalog() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(root, 'js', 'builder-data.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'builder-data.js', timeout: 1000 });
  return cleanCatalog(context.window.HamperBuilderData?.products);
}

function allowRequest(request) {
  const now = Date.now();
  const address = request.socket.remoteAddress || 'local';
  const recentRequests = (rateLimits.get(address) || []).filter((time) => now - time < 60000);
  if (recentRequests.length >= 12) return false;
  recentRequests.push(now);
  rateLimits.set(address, recentRequests);
  return true;
}

function normalizeModelResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstObject = trimmed.match(/\{[\s\S]*\}/);
    if (!firstObject) return null;
    try {
      return JSON.parse(firstObject[0]);
    } catch {
      return null;
    }
  }
}

function callModel(messages, catalog) {
  const catalogText = JSON.stringify(catalog);
  const instructions = [
    'You are Justy, the warm, perceptive gifting and customer-help assistant for Just Hampers, a Nigerian gifting business.',
    'Answer the user’s actual question directly, including general questions. Do not force every conversation into a hamper recommendation. Ask one concise follow-up only when needed.',
    'For gift questions, make practical, specific suggestions based on recipient, occasion, budget, culture, dietary restrictions, accessibility, and stated dislikes. Use Naira for budgets.',
    'Current catalog data follows as JSON. Recommend only product IDs in this catalog. Product prices are illustrative estimates, not confirmed prices or live stock. Never claim an order, delivery, payment, or availability is confirmed.',
    'Do not invent company policies, contact details, stock, shipping times, or exact product contents. State when the owner must confirm a detail.',
    'For current facts outside the catalog, use web search when useful and distinguish sourced facts from assumptions. Keep the tone natural, thoughtful, concise, and never use a generic filler answer.',
    'Return a valid JSON object only. Use the keys: reply, giftRelated, recipient, occasion, budget, preferences, dislikes, recommendations. Keep recommendations aligned with any stated budget. If the request is not about gifting, set giftRelated=false and use an empty recommendations array.',
    `Catalog: ${catalogText}`
  ].join('\n\n');

  const payload = JSON.stringify({
    model,
    instructions,
    input: messages,
    tools: [{ type: 'web_search_preview', search_context_size: 'low', user_location: { type: 'approximate', country: 'NG' } }],
    max_output_tokens: 1000,
    store: false
  });

  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.openai.com',
      path: '/v1/responses',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        let result;
        try {
          result = JSON.parse(body);
        } catch {
          reject(new Error('The AI provider returned an unreadable response.'));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(Object.assign(new Error(result.error?.message || 'The AI provider request failed.'), { status: response.statusCode }));
          return;
        }
        const outputText = (result.output || []).flatMap((item) => item.content || [])
          .filter((item) => item.type === 'output_text')
          .map((item) => item.text)
          .join('\n');
        const parsed = normalizeModelResponse(outputText);
        if (parsed && typeof parsed === 'object') {
          resolve(parsed);
          return;
        }
        resolve({
          reply: 'I can help with gifting and hamper ideas, but I need a clearer question to give you a precise suggestion.',
          giftRelated: false,
          recipient: '',
          occasion: '',
          budget: null,
          preferences: [],
          dislikes: [],
          recommendations: []
        });
      });
    });
    request.setTimeout(45000, () => request.destroy(new Error('The AI request timed out.')));
    request.on('error', reject);
    request.end(payload);
  });
}

function serveStatic(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.resolve(root, `.${requestedPath}`);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function paystackRequest(pathname, method = 'GET', body = null) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment.');

  const payload = body ? JSON.stringify(body) : '';
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.paystack.co',
      port: 443,
      path: pathname,
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(Object.assign(new Error(parsed.message || 'Paystack request failed.'), { status: response.statusCode }));
            return;
          }
          resolve(parsed.data || parsed);
        } catch (error) {
          reject(new Error('Paystack returned an unreadable response.'));
        }
      });
    });

    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

const server = http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
  } catch {
    sendJson(response, 400, { error: 'Invalid request URL.' });
    return;
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { configured: true, assistant: 'Justy', mode: usePaidOpenAi ? 'openai' : 'free catalog' });
    return;
  }

  if (pathname === '/api/site-config' && request.method === 'GET') {
    sendJson(response, 200, buildSiteConfig());
    return;
  }

  if (pathname === '/api/payments/checkout' && request.method === 'POST') {
    try {
      const payload = await readJson(request);
      const amount = Number(payload.amount);
      const email = String(payload.email || '').trim();
      const name = String(payload.name || '').trim() || 'Just Hampers customer';
      if (!Number.isFinite(amount) || amount <= 0) {
        sendJson(response, 400, { error: 'A valid payment amount is required.' });
        return;
      }
      if (!email) {
        sendJson(response, 400, { error: 'An email address is required to start checkout.' });
        return;
      }
      const reference = String(payload.reference || `jh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`).slice(0, 50);
      const result = await paystackRequest('/transaction/initialize', 'POST', {
        amount: String(Math.round(amount * 100)),
        email,
        currency: 'NGN',
        reference,
        callback_url: payload.callbackUrl || 'http://127.0.0.1:4173/builder.html?payment=success',
        metadata: {
          custom_fields: [
            { display_name: 'Customer name', variable_name: 'customer_name', value: name },
            { display_name: 'Order type', variable_name: 'order_type', value: 'Just Hampers hamper' }
          ]
        }
      });
      sendJson(response, 200, {
        authorizationUrl: result.authorization_url,
        reference,
        accessCode: result.access_code,
        status: 'initialized'
      });
    } catch (error) {
      console.error('Paystack initialization failed:', error.message);
      sendJson(response, error.status || 500, { error: error.message || 'Checkout could not be initialized.' });
    }
    return;
  }

  if (pathname === '/api/payments/status' && request.method === 'GET') {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const reference = url.searchParams.get('reference');
      if (!reference) {
        sendJson(response, 400, { error: 'A payment reference is required.' });
        return;
      }
      const result = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
      sendJson(response, 200, {
        status: result.status,
        amount: Number(result.amount || 0) / 100,
        reference: result.reference,
        currency: result.currency,
        paidAt: result.paid_at || null,
        gatewayResponse: result.gateway_response || null
      });
    } catch (error) {
      sendJson(response, error.status || 500, { error: error.message || 'Payment status could not be verified.' });
    }
    return;
  }

  if (pathname === '/api/chat') {
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Use POST to chat with Justy.' });
      return;
    }
    if (!allowRequest(request)) {
      sendJson(response, 429, { error: 'A few too many messages at once. Please try again in a minute.' });
      return;
    }
    try {
      const body = await readJson(request);
      const messages = cleanConversation(body.messages);
      if (!messages.length || messages[messages.length - 1].role !== 'user') {
        sendJson(response, 400, { error: 'Add a message for Justy first.' });
        return;
      }
      const catalog = loadCatalog();
      if (!catalog.length) throw new Error('The Just Hampers catalog is empty.');
      const answer = usePaidOpenAi ? await callModel(messages, catalog) : createLocalAnswer(messages, catalog);
      const catalogIds = new Set(catalog.map((product) => product.id));
      answer.recommendations = Array.isArray(answer.recommendations) ? answer.recommendations.slice(0, 3).map((recommendation) => ({
        title: String(recommendation.title || 'Justy’s pick').slice(0, 80),
        reason: String(recommendation.reason || '').slice(0, 300),
        productIds: Array.isArray(recommendation.productIds) ? recommendation.productIds.filter((id) => catalogIds.has(id)).slice(0, 4) : []
      })).filter((recommendation) => recommendation.productIds.length) : [];
      answer.reply = String(answer.reply || '').slice(0, 5000);
      sendJson(response, 200, answer);
    } catch (error) {
      console.error('Justy request failed:', error.status || 'network error', error.message);
      const status = [400, 413].includes(error.status) ? error.status : error.status === 429 ? 503 : 502;
      sendJson(response, status, { error: 'Justy could not get a complete answer right now. Please try again shortly.' });
    }
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end('Method not allowed');
    return;
  }
  serveStatic(request, response, pathname);
});

if (require.main === module) {
  server.listen(port, '127.0.0.1', () => {
    console.log(`Just Hampers is available at http://127.0.0.1:${port}`);
    console.log(`Justy is running in ${usePaidOpenAi ? 'OpenAI paid' : 'free local catalog'} mode`);
  });
}

module.exports = { buildSiteConfig, server };