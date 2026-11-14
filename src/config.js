/**
 * Sunday Solar Expense Tracker — frontend config
 *
 * Edit TEAM_NAMES here when members change. Passphrase is NEVER committed:
 * each person unlocks in the browser; Apps Script checks EXPENSE_PASS
 * (Script Properties). See README.md.
 */

/** Paste the Apps Script web-app URL after deploy (ends with /exec). */
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyssm-QNWxV_5T5SMP0XCr383mse4r_kpOBX0Siz-uks_m4k43C5wZVyud1acJ19weh/exec'

/** Display currency label (amounts are plain numbers in the Sheet). */
export const CURRENCY = 'ZAR'

/** Person dropdown — exactly these four. Edit this array if membership changes. */
export const TEAM_NAMES = ['Yashwanth', 'Sandeep', 'Ashok', 'Ramesh']

/** sessionStorage key after successful unlock this tab session */
export const SESSION_UNLOCK_KEY = 'ss_expense_unlocked'

/** sessionStorage key for the passphrase used on API calls this session */
export const SESSION_PASS_KEY = 'ss_expense_pass'
