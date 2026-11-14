import './style.css'
import {
  TEAM_NAMES,
  CURRENCY,
  SESSION_UNLOCK_KEY,
  SESSION_PASS_KEY,
} from './config.js'
import { compressImage } from './compress.js'
import { listExpenses, createExpense } from './api.js'

const app = document.querySelector('#app')
let expenses = []
let compressedReceipt = null
let toastTimer = null
let currentView = { type: 'all' }

function formatMoney(n) {
  const num = Number(n) || 0
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: CURRENCY,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${CURRENCY} ${num.toFixed(2)}`
  }
}

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function isUnlocked() {
  return sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1'
}

function getPass() {
  return sessionStorage.getItem(SESSION_PASS_KEY) || ''
}

function lockSession() {
  sessionStorage.removeItem(SESSION_UNLOCK_KEY)
  sessionStorage.removeItem(SESSION_PASS_KEY)
}

function unlockSession(pass) {
  sessionStorage.setItem(SESSION_UNLOCK_KEY, '1')
  sessionStorage.setItem(SESSION_PASS_KEY, pass)
}

function showToast(message, kind = 'ok') {
  let el = document.querySelector('.toast')
  if (!el) {
    el = document.createElement('div')
    el.className = 'toast'
    el.setAttribute('role', 'status')
    document.body.appendChild(el)
  }
  el.textContent = message
  el.className = `toast is-visible is-${kind}`
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible')
  }, 3200)
}

function personOptions(selected = '') {
  return TEAM_NAMES.map(
    (name) =>
      `<option value="${escapeHtml(name)}" ${name === selected ? 'selected' : ''}>${escapeHtml(name)}</option>`,
  ).join('')
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function personHash(name) {
  return `#/person/${encodeURIComponent(name)}`
}

/** Parse location.hash → { type: 'all' } | { type: 'person', person } */
function parseHash() {
  const raw = (location.hash || '#/all').replace(/^#/, '')
  const parts = raw.split('/').filter(Boolean)
  if (parts[0] === 'person' && parts[1]) {
    const person = decodeURIComponent(parts.slice(1).join('/'))
    if (TEAM_NAMES.includes(person)) {
      return { type: 'person', person }
    }
  }
  return { type: 'all' }
}

function setHash(view) {
  const next =
    view.type === 'person' && view.person
      ? personHash(view.person)
      : '#/all'
  if (location.hash !== next) {
    location.hash = next
  } else {
    currentView = view
    renderViewPanels()
  }
}

function rowsForView(view) {
  if (view.type === 'person') {
    return expenses.filter((r) => r.person === view.person)
  }
  return expenses
}

function sumRows(rows) {
  return rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
}

function byPersonBreakdown(rows) {
  const map = new Map()
  for (const name of TEAM_NAMES) map.set(name, 0)
  for (const r of rows) {
    const key = r.person || 'Unknown'
    map.set(key, (map.get(key) || 0) + (Number(r.amount) || 0))
  }
  return [...map.entries()].filter(([, v]) => v > 0)
}

function renderUnlock() {
  app.innerHTML = `
    <section class="unlock">
      <div class="unlock-card">
        <div class="brand-mark">
          <span class="brand-sun" aria-hidden="true"></span>
          <span class="brand-name">Sunday Solar</span>
        </div>
        <h1>Expense tracker</h1>
        <p>Enter the shared team passphrase to continue. Real checks happen on the server (Apps Script).</p>
        <form class="unlock-form" id="unlock-form">
          <label>
            Passphrase
            <input type="password" name="pass" autocomplete="current-password" required />
          </label>
          <p class="field-error" id="unlock-error" hidden></p>
          <button class="btn-primary" type="submit">Unlock</button>
        </form>
      </div>
    </section>
  `

  document.querySelector('#unlock-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const pass = new FormData(form).get('pass')?.toString().trim() || ''
    const err = document.querySelector('#unlock-error')
    const btn = form.querySelector('button')
    if (!pass) return

    btn.disabled = true
    err.hidden = true

    try {
      await listExpenses(pass)
      unlockSession(pass)
      renderApp()
    } catch (ex) {
      err.textContent = ex.message || 'Could not unlock.'
      err.hidden = false
      btn.disabled = false
    }
  })
}

function navHtml(view) {
  const allActive = view.type === 'all' ? 'is-active' : ''
  const personLinks = TEAM_NAMES.map((name) => {
    const active =
      view.type === 'person' && view.person === name ? 'is-active' : ''
    return `<a class="nav-tab ${active}" href="${personHash(name)}">${escapeHtml(name)}</a>`
  }).join('')

  return `
    <nav class="view-nav" aria-label="Expense views">
      <a class="nav-tab ${allActive}" href="#/all">All expenses</a>
      ${personLinks}
    </nav>
  `
}

function expenseTableHtml(rows, emptyMessage) {
  if (rows.length === 0) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Person</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="empty-state">${escapeHtml(emptyMessage)}</td></tr>
          </tbody>
        </table>
      </div>`
  }

  const sorted = rows
    .slice()
    .sort(
      (a, b) =>
        String(b.date).localeCompare(String(a.date)) ||
        String(b.createdAt).localeCompare(String(a.createdAt)),
    )

  const body = sorted
    .map(
      (r) => `
    <tr>
      <td>${escapeHtml(r.date || '')}</td>
      <td>${escapeHtml(r.person || '')}</td>
      <td class="amount">${formatMoney(r.amount)}</td>
      <td class="note">${escapeHtml(r.note || '—')}</td>
      <td>${
        r.receiptUrl
          ? `<a class="receipt-link" href="${escapeHtml(r.receiptUrl)}" target="_blank" rel="noopener noreferrer">Receipt</a>`
          : '—'
      }</td>
    </tr>`,
    )
    .join('')

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Person</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`
}

function renderViewPanels() {
  const navHost = document.querySelector('#view-nav-host')
  const listRoot = document.querySelector('#list-panel')
  if (!navHost || !listRoot) return

  const view = currentView
  navHost.innerHTML = navHtml(view)

  const rows = rowsForView(view)
  const total = sumRows(rows)

  if (view.type === 'person') {
    listRoot.innerHTML = `
      <h2>${escapeHtml(view.person)}’s expenses</h2>
      <p class="hint">Only this person’s rows. Use the tabs above for All or another member.</p>
      <div class="list-toolbar">
        <div class="totals">
          <div>Entries <strong>${rows.length}</strong></div>
          <div>Total <strong>${formatMoney(total)}</strong></div>
        </div>
      </div>
      ${expenseTableHtml(rows, `No expenses for ${view.person} yet.`)}
    `
    return
  }

  // All expenses — optional filter within All
  const filterPerson =
    document.querySelector('#filter-person')?.value || 'all'
  const filtered =
    filterPerson === 'all'
      ? rows
      : rows.filter((r) => r.person === filterPerson)
  const filteredTotal = sumRows(filtered)
  const breakdown = byPersonBreakdown(filtered)

  const breakdownHtml =
    breakdown.length > 0
      ? `<ul class="by-person" aria-label="Totals by person">${breakdown
          .map(
            ([name, amt]) =>
              `<li><span>${escapeHtml(name)}</span><span>${formatMoney(amt)}</span></li>`,
          )
          .join('')}</ul>`
      : ''

  listRoot.innerHTML = `
    <h2>All expenses</h2>
    <p class="hint">Full company list and overall totals. Open a person tab for an individual page.</p>
    <div class="list-toolbar">
      <label>
        Quick filter
        <select id="filter-person">
          <option value="all" ${filterPerson === 'all' ? 'selected' : ''}>All people</option>
          ${personOptions(filterPerson === 'all' ? '' : filterPerson)}
        </select>
      </label>
      <div class="totals">
        <div>Showing <strong>${filtered.length}</strong></div>
        <div>Total <strong>${formatMoney(filteredTotal)}</strong></div>
        <div class="totals-overall">Overall <strong>${formatMoney(total)}</strong></div>
      </div>
    </div>
    ${expenseTableHtml(filtered, 'No expenses yet.')}
    ${breakdownHtml}
  `

  document.querySelector('#filter-person')?.addEventListener('change', () => {
    renderViewPanels()
  })
}

async function refreshList() {
  const pass = getPass()
  expenses = await listExpenses(pass)
  renderViewPanels()
}

function wireExpenseForm() {
  const form = document.querySelector('#expense-form')
  const preview = document.querySelector('#receipt-preview')
  const fileInput = form.querySelector('input[name="receipt"]')

  fileInput.addEventListener('change', async () => {
    compressedReceipt = null
    preview.classList.remove('is-visible')
    preview.removeAttribute('src')
    const file = fileInput.files?.[0]
    if (!file) return
    try {
      compressedReceipt = await compressImage(file)
      preview.src = compressedReceipt.previewUrl
      preview.classList.add('is-visible')
    } catch (ex) {
      showToast(ex.message || 'Could not process image.', 'error')
      fileInput.value = ''
    }
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.querySelector('#submit-btn')
    const fd = new FormData(form)
    const person = fd.get('person')?.toString() || ''
    const amount = Number(fd.get('amount'))
    const date = fd.get('date')?.toString() || ''
    const note = fd.get('note')?.toString().trim() || ''

    if (!TEAM_NAMES.includes(person)) {
      showToast('Pick a team member from the list.', 'error')
      return
    }
    if (!(amount > 0)) {
      showToast('Amount must be greater than zero.', 'error')
      return
    }
    if (!date) {
      showToast('Date is required.', 'error')
      return
    }

    btn.disabled = true
    try {
      await createExpense(getPass(), {
        id: uuid(),
        person,
        amount,
        date,
        note,
        receiptBase64: compressedReceipt?.base64 || '',
        receiptMimeType: compressedReceipt?.mimeType || '',
        receiptFileName: compressedReceipt?.fileName || '',
      })
      form.reset()
      form.querySelector('input[name="date"]').value = todayISO()
      compressedReceipt = null
      preview.classList.remove('is-visible')
      preview.removeAttribute('src')
      showToast('Expense saved.', 'ok')
      await refreshList()
    } catch (ex) {
      showToast(ex.message || 'Could not save expense.', 'error')
    } finally {
      btn.disabled = false
    }
  })
}

function renderApp() {
  currentView = parseHash()

  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div>
          <div class="brand-mark">
            <span class="brand-sun" aria-hidden="true"></span>
            <span class="brand-name">Sunday Solar</span>
          </div>
          <h1>Company expenses</h1>
          <p class="tagline">Log expenses, then review All or each person’s page.</p>
        </div>
        <button type="button" class="btn-ghost" id="lock-btn">Lock</button>
      </header>

      <div id="view-nav-host"></div>

      <section class="panel" aria-labelledby="add-heading">
        <h2 id="add-heading">Add expense</h2>
        <p class="hint">Available on every view. Receipt photo is optional; images are compressed before upload.</p>
        <form id="expense-form">
          <div class="form-grid">
            <label>
              Person
              <select name="person" required>
                <option value="" disabled selected>Select…</option>
                ${personOptions()}
              </select>
            </label>
            <label>
              Amount (${escapeHtml(CURRENCY)})
              <input type="number" name="amount" min="0.01" step="0.01" required placeholder="0.00" />
            </label>
            <label>
              Date
              <input type="date" name="date" required value="${todayISO()}" />
            </label>
            <label class="full">
              Note <span style="font-weight:400;color:var(--ink-muted)">(optional)</span>
              <textarea name="note" maxlength="500" placeholder="What was this for?"></textarea>
            </label>
            <div class="full file-row">
              <label>
                Receipt photo <span style="font-weight:400;color:var(--ink-muted)">(optional)</span>
                <input type="file" name="receipt" accept="image/*" />
              </label>
              <img class="receipt-preview" id="receipt-preview" alt="Receipt preview" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="submit" id="submit-btn">Submit expense</button>
          </div>
        </form>
      </section>

      <section class="panel" id="list-panel" aria-live="polite">
        <p class="empty-state">Loading…</p>
      </section>
    </div>
  `

  document.querySelector('#lock-btn').addEventListener('click', () => {
    lockSession()
    renderUnlock()
  })

  wireExpenseForm()
  renderViewPanels()

  refreshList().catch((ex) => {
    showToast(ex.message || 'Could not load expenses.', 'error')
    renderViewPanels()
  })
}

window.addEventListener('hashchange', () => {
  if (!isUnlocked() || !getPass()) return
  currentView = parseHash()
  renderViewPanels()
})

if (isUnlocked() && getPass()) {
  if (!location.hash) location.hash = '#/all'
  renderApp()
} else {
  lockSession()
  renderUnlock()
}
