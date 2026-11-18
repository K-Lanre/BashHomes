export async function handleInquiry(request, env) {
  const reply = (status, payload) =>
    Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
  const fail = (status, message) => reply(status, { ok: false, message });

  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return fail(403, 'This form can only be submitted from Bash Homes.');
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return fail(415, 'The inquiry format was invalid.');
  }
  let input;
  try {
    const body = await request.text();
    if (body.length > 12000) return fail(413, 'Your inquiry is too long.');
    input = JSON.parse(body);
  } catch {
    return fail(400, 'The inquiry could not be read.');
  }
  if (!input || typeof input !== 'object' || input.website) {
    return fail(400, 'Please check your inquiry and try again.');
  }

  const fields = { id: 36, name: 100, email: 254, phone: 32, arrival: 10, departure: 10, message: 2000 };
  const inquiry = {};
  for (const [name, limit] of Object.entries(fields)) {
    const value = input[name];
    if (typeof value !== 'string' || value.length > limit) {
      return fail(400, 'Please check that your inquiry fields are filled in correctly.');
    }
    inquiry[name] = value.trim();
  }
  if (!/^[0-9a-f-]{36}$/i.test(inquiry.id) || !inquiry.name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email) || !inquiry.message) {
    return fail(400, 'Please enter your name, a valid email address, and a message.');
  }
  if (!validDate(inquiry.arrival) || !validDate(inquiry.departure) ||
      (inquiry.arrival && inquiry.departure && inquiry.departure <= inquiry.arrival)) {
    return fail(400, 'Please check your dates. Check-out must be after check-in.');
  }
  const { GOOGLE_APPS_SCRIPT_URL: url, GOOGLE_APPS_SCRIPT_SECRET: secret } = env;
  if (!url || !secret) {
    return fail(503, 'Online inquiries are currently unavailable.');
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inquiry, secret }),
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok && (await response.json()).ok === true) {
      return reply(200, { ok: true });
    }
  } catch {
    // Return a retryable error for timeouts, network errors, and invalid responses.
  }
  return fail(502, 'We couldn’t save your inquiry. Please try again.');
}

function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
