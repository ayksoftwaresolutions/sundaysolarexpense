(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://script.google.com/macros/s/AKfycbyssm-QNWxV_5T5SMP0XCr383mse4r_kpOBX0Siz-uks_m4k43C5wZVyud1acJ19weh/exec`,t=[`Yashwanth`,`Sandeep`,`Ashok`,`Ramesh`,`Chenchi Reddy`],n=`ss_expense_unlocked`,r=`ss_expense_pass`;function i(e,{maxEdge:t=1600,quality:n=.8}={}){return new Promise((r,i)=>{if(!e||!e.type.startsWith(`image/`)){i(Error(`Please choose an image file.`));return}let a=URL.createObjectURL(e),o=new Image;o.onload=()=>{URL.revokeObjectURL(a);let{width:s,height:c}=o,l=Math.min(1,t/Math.max(s,c));s=Math.round(s*l),c=Math.round(c*l);let u=document.createElement(`canvas`);u.width=s,u.height=c,u.getContext(`2d`).drawImage(o,0,0,s,c),u.toBlob(t=>{if(!t){i(Error(`Could not compress image.`));return}let n=new FileReader;n.onload=()=>{let i=n.result;r({blob:t,base64:String(i).split(`,`)[1]||``,mimeType:`image/jpeg`,previewUrl:i,fileName:e.name.replace(/\.[^.]+$/,``)+`.jpg`})},n.onerror=()=>i(Error(`Could not read compressed image.`)),n.readAsDataURL(t)},`image/jpeg`,n)},o.onerror=()=>{URL.revokeObjectURL(a),i(Error(`Could not load image.`))},o.src=a})}function a(){if(`https://script.google.com/macros/s/AKfycbyssm-QNWxV_5T5SMP0XCr383mse4r_kpOBX0Siz-uks_m4k43C5wZVyud1acJ19weh/exec`.includes(`PASTE_APPS_SCRIPT`))throw Error(`Set APPS_SCRIPT_URL in src/config.js to your deployed Apps Script web app URL.`)}async function o(e){let t=await e.text(),n;try{n=JSON.parse(t)}catch{throw Error(`Unexpected response from Apps Script. Redeploy the web app and check the URL.`)}if(!n.ok)throw Error(n.error||`Request failed.`);return n}async function s(t){a();let n=new URL(e);return n.searchParams.set(`action`,`list`),n.searchParams.set(`pass`,t),(await o(await fetch(n.toString(),{method:`GET`}))).rows||[]}async function c(t,n){return a(),o(await fetch(e,{method:`POST`,headers:{"Content-Type":`text/plain;charset=utf-8`},body:JSON.stringify({pass:t,...n})}))}var l=document.querySelector(`#app`),u=[],d=null,f=null,p={type:`all`};function m(e){let t=Number(e)||0;try{return new Intl.NumberFormat(void 0,{style:`currency`,currency:`Rs`,maximumFractionDigits:2}).format(t)}catch{return`Rs ${t.toFixed(2)}`}}function h(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function g(){return crypto.randomUUID?crypto.randomUUID():`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e===`x`?t:t&3|8).toString(16)})}function _(){return sessionStorage.getItem(n)===`1`}function v(){return sessionStorage.getItem(`ss_expense_pass`)||``}function y(){sessionStorage.removeItem(n),sessionStorage.removeItem(r)}function b(e){sessionStorage.setItem(n,`1`),sessionStorage.setItem(r,e)}function x(e,t=`ok`){let n=document.querySelector(`.toast`);n||(n=document.createElement(`div`),n.className=`toast`,n.setAttribute(`role`,`status`),document.body.appendChild(n)),n.textContent=e,n.className=`toast is-visible is-${t}`,clearTimeout(f),f=setTimeout(()=>{n.classList.remove(`is-visible`)},3200)}function S(e=``){return t.map(t=>`<option value="${C(t)}" ${t===e?`selected`:``}>${C(t)}</option>`).join(``)}function C(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function w(e){return`#/person/${encodeURIComponent(e)}`}function T(){let e=(location.hash||`#/all`).replace(/^#/,``).split(`/`).filter(Boolean);if(e[0]===`person`&&e[1]){let n=decodeURIComponent(e.slice(1).join(`/`));if(t.includes(n))return{type:`person`,person:n}}return{type:`all`}}function E(e){return e.type===`person`?u.filter(t=>t.person===e.person):u}function D(e){return e.reduce((e,t)=>e+(Number(t.amount)||0),0)}function O(e){let n=new Map;for(let e of t)n.set(e,0);for(let t of e){let e=t.person||`Unknown`;n.set(e,(n.get(e)||0)+(Number(t.amount)||0))}return[...n.entries()].filter(([,e])=>e>0)}function k(){l.innerHTML=`
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
  `,document.querySelector(`#unlock-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=new FormData(t).get(`pass`)?.toString().trim()||``,r=document.querySelector(`#unlock-error`),i=t.querySelector(`button`);if(n){i.disabled=!0,r.hidden=!0;try{await s(n),b(n),F()}catch(e){r.textContent=e.message||`Could not unlock.`,r.hidden=!1,i.disabled=!1}}})}function A(e){return`
    <nav class="view-nav" aria-label="Expense views">
      <a class="nav-tab ${e.type===`all`?`is-active`:``}" href="#/all">All expenses</a>
      ${t.map(t=>`<a class="nav-tab ${e.type===`person`&&e.person===t?`is-active`:``}" href="${w(t)}">${C(t)}</a>`).join(``)}
    </nav>
  `}function j(e,t){return e.length===0?`
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
            <tr><td colspan="5" class="empty-state">${C(t)}</td></tr>
          </tbody>
        </table>
      </div>`:`
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
        <tbody>${e.slice().sort((e,t)=>String(t.date).localeCompare(String(e.date))||String(t.createdAt).localeCompare(String(e.createdAt))).map(e=>`
    <tr>
      <td>${C(e.date||``)}</td>
      <td>${C(e.person||``)}</td>
      <td class="amount">${m(e.amount)}</td>
      <td class="note">${C(e.note||`—`)}</td>
      <td>${e.receiptUrl?`<a class="receipt-link" href="${C(e.receiptUrl)}" target="_blank" rel="noopener noreferrer">Receipt</a>`:`—`}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`}function M(){let e=document.querySelector(`#view-nav-host`),t=document.querySelector(`#list-panel`);if(!e||!t)return;let n=p;e.innerHTML=A(n);let r=E(n),i=D(r);if(n.type===`person`){t.innerHTML=`
      <h2>${C(n.person)}’s expenses</h2>
      <p class="hint">Only this person’s rows. Use the tabs above for All or another member.</p>
      <div class="list-toolbar">
        <div class="totals">
          <div>Entries <strong>${r.length}</strong></div>
          <div>Total <strong>${m(i)}</strong></div>
        </div>
      </div>
      ${j(r,`No expenses for ${n.person} yet.`)}
    `;return}let a=document.querySelector(`#filter-person`)?.value||`all`,o=a===`all`?r:r.filter(e=>e.person===a),s=D(o),c=O(o),l=c.length>0?`<ul class="by-person" aria-label="Totals by person">${c.map(([e,t])=>`<li><span>${C(e)}</span><span>${m(t)}</span></li>`).join(``)}</ul>`:``;t.innerHTML=`
    <h2>All expenses</h2>
    <p class="hint">Full company list and overall totals. Open a person tab for an individual page.</p>
    <div class="list-toolbar">
      <label>
        Quick filter
        <select id="filter-person">
          <option value="all" ${a===`all`?`selected`:``}>All people</option>
          ${S(a===`all`?``:a)}
        </select>
      </label>
      <div class="totals">
        <div>Showing <strong>${o.length}</strong></div>
        <div>Total <strong>${m(s)}</strong></div>
        <div class="totals-overall">Overall <strong>${m(i)}</strong></div>
      </div>
    </div>
    ${j(o,`No expenses yet.`)}
    ${l}
  `,document.querySelector(`#filter-person`)?.addEventListener(`change`,()=>{M()})}async function N(){u=await s(v()),M()}function P(){let e=document.querySelector(`#expense-form`),n=document.querySelector(`#receipt-preview`),r=e.querySelector(`input[name="receipt"]`);r.addEventListener(`change`,async()=>{d=null,n.classList.remove(`is-visible`),n.removeAttribute(`src`);let e=r.files?.[0];if(e)try{d=await i(e),n.src=d.previewUrl,n.classList.add(`is-visible`)}catch(e){x(e.message||`Could not process image.`,`error`),r.value=``}}),e.addEventListener(`submit`,async r=>{r.preventDefault();let i=document.querySelector(`#submit-btn`),a=new FormData(e),o=a.get(`person`)?.toString()||``,s=Number(a.get(`amount`)),l=a.get(`date`)?.toString()||``,u=a.get(`note`)?.toString().trim()||``;if(!t.includes(o))x(`Pick a team member from the list.`,`error`);else if(!(s>0))x(`Amount must be greater than zero.`,`error`);else if(!l)x(`Date is required.`,`error`);else{i.disabled=!0;try{await c(v(),{id:g(),person:o,amount:s,date:l,note:u,receiptBase64:d?.base64||``,receiptMimeType:d?.mimeType||``,receiptFileName:d?.fileName||``}),e.reset(),e.querySelector(`input[name="date"]`).value=h(),d=null,n.classList.remove(`is-visible`),n.removeAttribute(`src`),x(`Expense saved.`,`ok`),await N()}catch(e){x(e.message||`Could not save expense.`,`error`)}finally{i.disabled=!1}}})}function F(){p=T(),l.innerHTML=`
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
                ${S()}
              </select>
            </label>
            <label>
              Amount (${C(`Rs`)})
              <input type="number" name="amount" min="0.01" step="0.01" required placeholder="0.00" />
            </label>
            <label>
              Date
              <input type="date" name="date" required value="${h()}" />
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
  `,document.querySelector(`#lock-btn`).addEventListener(`click`,()=>{y(),k()}),P(),M(),N().catch(e=>{x(e.message||`Could not load expenses.`,`error`),M()})}window.addEventListener(`hashchange`,()=>{_()&&v()&&(p=T(),M())}),_()&&v()?(location.hash||(location.hash=`#/all`),F()):(y(),k());