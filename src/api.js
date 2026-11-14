import { APPS_SCRIPT_URL } from './config.js'

function assertConfigured() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_APPS_SCRIPT')) {
    throw new Error(
      'Set APPS_SCRIPT_URL in src/config.js to your deployed Apps Script web app URL.',
    )
  }
}

async function parseJsonResponse(res) {
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Unexpected response from Apps Script. Redeploy the web app and check the URL.')
  }
  if (!data.ok) {
    throw new Error(data.error || 'Request failed.')
  }
  return data
}

/** List expenses. Passphrase required; Apps Script is the real gate. */
export async function listExpenses(passphrase) {
  assertConfigured()
  const url = new URL(APPS_SCRIPT_URL)
  url.searchParams.set('action', 'list')
  url.searchParams.set('pass', passphrase)

  const res = await fetch(url.toString(), { method: 'GET' })
  const data = await parseJsonResponse(res)
  return data.rows || []
}

/** Create expense with base64 receipt. */
export async function createExpense(passphrase, payload) {
  assertConfigured()
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    // text/plain avoids a CORS preflight against Apps Script web apps
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      pass: passphrase,
      ...payload,
    }),
  })
  return parseJsonResponse(res)
}
