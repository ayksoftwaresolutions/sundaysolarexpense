# Sunday Solar — Company Expense Tracker (v1)

Free, no custom backend. Static Vite site + Google Sheet + Drive + Apps Script. Host on GitHub Pages.

**Owner Google account:** `sundaypowerprojectspvt@gmail.com`  
**Auth:** shared passphrase + unlisted site URL (passphrase checked in Apps Script)  
**Team (dropdown):** Yashwanth, Sandeep, Ashok, Ramesh — edit `src/config.js` → `TEAM_NAMES` if membership changes.

---

## What’s in this folder

| Path | Purpose |
|------|---------|
| `src/` | Frontend (unlock, add expense, list/filter/totals) |
| `src/config.js` | `APPS_SCRIPT_URL`, `TEAM_NAMES`, `CURRENCY` — **no passphrase here** |
| `apps-script/Code.gs` | Paste into Apps Script on the common Gmail account |
| `public/` | Favicon |

Passphrase lives only in **Apps Script → Script Properties** (`EXPENSE_PASS`). Never commit it.

---

## One-time Google setup

Sign in as **`sundaypowerprojectspvt@gmail.com`** for all of the following.

### 1. Spreadsheet

1. Create a Google Sheet named **Sunday Solar Expenses**.
2. Rename the first tab to **`Expenses`**.
3. Put this header row in `A1:H1`:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | createdAt | person | amount | date | note | receiptFileId | receiptUrl |

4. Copy the **Spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`SHEET_ID`**`/edit`

### 2. Drive folder

1. In Drive, create folder **Sunday Solar** → inside it **Receipts** (or one folder named `Sunday Solar / Receipts`).
2. Copy the **Folder ID** from the URL:  
   `https://drive.google.com/drive/folders/`**`FOLDER_ID`**

Share Sheet (Viewer or Editor as you prefer) and the Receipts folder with the four members when ready.

### 3. Apps Script

1. From the Sheet: **Extensions → Apps Script**.
2. Delete any stub code. Paste the full contents of [`apps-script/Code.gs`](./apps-script/Code.gs).
3. Save the project (e.g. name it `Sunday Solar Expenses API`).
4. **Project Settings** (gear) → **Script properties** → add:

| Property | Value |
|----------|--------|
| `EXPENSE_PASS` | Shared team passphrase (choose a strong one; store in a password manager) |
| `SHEET_ID` | Spreadsheet ID from step 1 |
| `FOLDER_ID` | Drive folder ID from step 2 |

5. **Deploy → New deployment →** type **Web app**:
   - Description: `v1`
   - Execute as: **Me** (`sundaypowerprojectspvt@gmail.com`)
   - Who has access: **Anyone**
6. Authorize when prompted.
7. Copy the **Web app URL** (ends with `/exec`).

After every future change to `Code.gs`, deploy a **new version** (Manage deployments → Edit → New version).

---

## Wire the frontend

1. Open [`src/config.js`](./src/config.js).
2. Set:

```js
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/…/exec'
```

3. Confirm `TEAM_NAMES` is:

```js
export const TEAM_NAMES = ['Yashwanth', 'Sandeep', 'Ashok', 'Ramesh']
```

4. Optional: change `CURRENCY` (default `ZAR`).

Do **not** put the passphrase in config or the repo. Users enter it on the unlock screen; it is held in `sessionStorage` for that tab session only and sent with API calls.

---

## Local dev

```bash
cd apps/expense-tracker
npm install
npm run dev
```

Open the URL Vite prints. Unlock with the same passphrase as `EXPENSE_PASS`.

---

## Deploy to GitHub Pages (free)

1. Put this folder in a GitHub repo (or copy `apps/expense-tracker` into its own repo).
2. If the site is a **project** Pages site (`https://ORG.github.io/REPO/`), set in `vite.config.js`:

```js
export default defineConfig({
  base: '/REPO/',
})
```

3. Build:

```bash
npm run build
```

4. Publish the `dist/` folder:
   - **Settings → Pages →** Deploy from GitHub Actions (Vite’s official Pages workflow), or
   - Push `dist` to a `gh-pages` branch.

5. Treat the live URL as sensitive (unlisted). Share it + passphrase via Signal / password manager — not in the public README of a public repo if the repo is public.

Add `noindex` is already in `index.html`.

---

## How the app works

1. **Unlock** — user enters passphrase; frontend calls `GET ?action=list&pass=…`. On success, a session flag + passphrase are stored in `sessionStorage` (client convenience only; Apps Script re-checks every request).
2. **Add expense** — always visible on every view. Person (dropdown of four), amount, date, optional note, receipt photo. Image is compressed client-side (~1600px, JPEG ~0.8), then `POST` JSON with base64 receipt.
3. **Views (hash nav)** — tabs at the top:
   - **All expenses** (`#/all`) — full list, overall total, optional quick filter, per-person breakdown
   - **Yashwanth / Sandeep / Ashok / Ramesh** (`#/person/Name`) — that person’s expenses and their total only

Edits/deletes: do them in the Sheet for v1 (not in the website).

---

## Smoke test checklist

While signed into the owner account’s Sheet/Drive:

- [ ] Unlock with correct passphrase works; wrong passphrase fails.
- [ ] Submit one expense with a photo for each of the four names.
- [ ] Row appears in Sheet; file appears in Receipts folder.
- [ ] List filter + totals match the Sheet.
- [ ] Receipt link opens the photo.

---

## Security notes (v1)

- Trust model: four founders + shared passphrase + unlisted URL.
- Rotate passphrase by changing Script Property `EXPENSE_PASS` (no redeploy needed for property-only changes).
- Do not commit secrets. Do not invent extra member names in the UI.
