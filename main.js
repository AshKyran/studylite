

const PAYMENT_DETAILS = {
  tillNumber: "8996560",
  paybill: "",
  contactWhatsApp: "+254746394674",
  contactEmail: "denismutuginjagi@gmail.com",
  selarLink: ""
};

const SUBJECTS = [
  { code: "math", name: "Mathematics", file: "math.json" },
  { code: "chemistry", name: "Chemistry", file: "chemistry.json" },
  { code: "biology", name: "Biology", file: "biology.json" },
  { code: "computer", name: "Computer Science", file: "computer.json" },
  { code: "physics", name: "Physics", file: "physics.json" }
];

function el(id){ return document.getElementById(id); }

function init(){
  safeRenderSubjectsGrid();
  safeSetupNav();
  safeFillPaymentBlock();
  safeSetupLinks();
}
window.addEventListener('DOMContentLoaded', init);

/* ===== Safe helpers ===== */
function safeAddListener(id, evt, fn){
  const e = el(id);
  if(e) e.addEventListener(evt, fn);
}

/* NAV (safe) */
function safeSetupNav(){
  safeAddListener('nav-home','click', ()=>{ showHome(); });
  safeAddListener('back-home','click', ()=>{ showHome(); });
  safeAddListener('quiz-back','click', ()=>{ if (typeof showSubjectView === 'function') showSubjectView(window.currentSubjectCode); });
}

/* Home: render subject cards only if container exists */
function safeRenderSubjectsGrid(){
  const grid = el('subjects-grid');
  if(!grid) return;
  grid.innerHTML = '';
  SUBJECTS.forEach(s=>{
    const card = document.createElement('div');
    card.className = 'card subject-card';
    card.innerHTML = `
      <h3>${s.name}</h3>
      <div class="badges">
        <div class="badge">KCSE quizzes & answers</div>
        <div class="badge">Puzzle quizzes</div>
        <div class="badge">Short notes</div>
      </div>
      <p class="muted" style="margin-top:8px">Tap to open subject resources and start a quiz.</p>
      <div class="cta-row">
        <button class="btn primary" onclick="openSubjectSafe('${s.code}')">Open subject</button>
        <button class="btn ghost" onclick="quickQuizSafe('${s.code}')">Quick quiz</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* State */
window.currentSubjectData = null;
window.currentSubjectCode = null;

/* Open subject (safe wrapper) */
async function openSubjectSafe(code){
  const possiblePath1 = `subjects/${code}.html`;
  const possiblePath2 = `${code}.html`;
  try {
    const res = await fetch(possiblePath1, {method:'HEAD'});
    if (res && res.ok){ window.location.href = possiblePath1; return; }
  } catch(e){}
  try {
    const res2 = await fetch(possiblePath2, {method:'HEAD'});
    if (res2 && res2.ok){ window.location.href = possiblePath2; return; }
  } catch(e){}
  const subj = SUBJECTS.find(s=>s.code===code);
  if(!subj) return alert('Subject not found');
  try {
    const resp = await fetch(subj.file);
    if(!resp.ok) throw new Error('Could not load subject file: ' + subj.file);
    const data = await resp.json();
    window.currentSubjectData = data;
    window.currentSubjectCode = code;
    if (typeof renderSubject === 'function') renderSubject(data);
    else alert('Subject data loaded but no renderer found on this page.');
  } catch(err){
    console.error(err);
    alert('Failed to load subject data.');
  }
}

/* Quick quiz safe wrapper */
function quickQuizSafe(code){
  const subjPage = `${code}.html`;
  const subjPage2 = `subjects/${code}.html`;
  fetch(subjPage, {method:'HEAD'}).then(r=>{
    if(r.ok){ window.location.href = subjPage + '#quiz'; return; }
    fetch(subjPage2, {method:'HEAD'}).then(r2=>{
      if(r2.ok){ window.location.href = subjPage2 + '#quiz'; return; }
      openSubjectSafe(code).then(()=>{ if(window.currentSubjectData && typeof startQuiz==='function') startQuiz(window.currentSubjectData,10); });
    });
  }).catch(()=>{ openSubjectSafe(code).then(()=>{ if(window.currentSubjectData && typeof startQuiz==='function') startQuiz(window.currentSubjectData,10); }); });
}

/* show/hide for SPA pages (guarded) */
function showSubjectView(code){
  const hv = el('home'); if(hv) hv.classList.add('hidden');
  const sv = el('subject-view'); if(sv) sv.classList.remove('hidden');
  const qv = el('quiz-view'); if(qv) qv.classList.add('hidden');
}

function showHome(){
  const hv = el('home'); if(hv) hv.classList.remove('hidden');
  const sv = el('subject-view'); if(sv) sv.classList.add('hidden');
  const qv = el('quiz-view'); if(qv) qv.classList.add('hidden');
  window.currentSubjectData = null;
  window.currentSubjectCode = null;
}

/* Fill payment block safely */
function safeFillPaymentBlock(){
  const p = el('payment-block');
  const till = PAYMENT_DETAILS.tillNumber || '8996560';
  const wa = PAYMENT_DETAILS.contactWhatsApp || '';
  if(p){
    p.innerHTML = `
      <div><strong>Till / Paybill:</strong> <span id="display-till">${till}</span></div>
      <div><strong>WhatsApp:</strong> <a href="https://wa.me/${wa.replace(/\+/g,'')}" target="_blank">${wa}</a></div>
      <div style="margin-top:8px"><small class="muted">After payment, send MPESA code on WhatsApp for instant delivery.</small></div>
    `;
  }
  const tillDisp = el('till-display'); if(tillDisp) tillDisp.textContent = till;
  const selar = el('selar-buy'); if(selar){
    if(PAYMENT_DETAILS.selarLink) { selar.href = PAYMENT_DETAILS.selarLink; selar.classList.remove('hidden'); }
    else selar.classList.add('hidden');
  }
  const waBtn = el('wa-order'); if(waBtn){
    const subjName = (window.currentSubjectData && window.currentSubjectData.subject) ? window.currentSubjectData.subject : '';
    const phone = PAYMENT_DETAILS.contactWhatsApp.replace(/\+/g,'');
    waBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hi, I want the '+ (subjName || 'pack'))}`;
  }
}

/* Safe misc links */
function safeSetupLinks(){
  const contactLink = el('contact-link'); if(contactLink) contactLink.href = 'mailto:' + (PAYMENT_DETAILS.contactEmail || 'you@example.com');
  const sample = el('link-sample'); if(sample) sample.addEventListener('click',(e)=>{ e.preventDefault(); alert('Send sample request via WhatsApp after purchase.'); });
  const tutor = el('link-tutor'); if(tutor) tutor.addEventListener('click',(e)=>{ e.preventDefault(); alert('Tutor reseller info: contact via WhatsApp.'); });
}

window.addEventListener('DOMContentLoaded', () => {
 
  const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (!isHome) return;

  if (sessionStorage.getItem('purchasePopupShown')) return;

  
  sessionStorage.setItem('purchasePopupShown', 'true');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'purchase-overlay';
  overlay.innerHTML = `
    <div class="card" style="max-width:380px; text-align:center; padding:24px;">
      <h2>Get Full Access 📘</h2>
      <p>Buy <strong>quality StudyLite notes</strong> and <strong>past-KCSE questions with answers</strong>.</p>
      <p style="margin-top:0.5em;">Only <strong>Ksh 150</strong> per set (50 questions & answers).</p>
      <p><strong>Till / Paybill:</strong> 8996560</p>
      <a class="btn primary" href="https://wa.me/2547XXXXXXX" target="_blank">Buy via WhatsApp</a><br><br>
      <button id="close-purchase" class="btn ghost">Close</button>
    </div>
  `;

  // Style overlay
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000'
  });

  // Add overlay
  document.body.appendChild(overlay);

  // Close button
  overlay.querySelector('#close-purchase').addEventListener('click', () => {
    overlay.remove();
  });
});
