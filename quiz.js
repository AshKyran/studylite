/* quiz.js — notes selector + shuffled questions loader for StudyLite
   - No references to note.html
   - Opens notes in-page using #note-modal
   - Restores quiz and solution modal behaviour
*/

(function () {
  /* ---- helpers ---- */
  function el(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return ('' + s).replace(/[&<>"'`]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[m];
    });
  }
  function isSubjectPage() {
    const p = (window.location.pathname || '').split('/');
    const fname = p[p.length - 1] || p[p.length - 2] || '';
    return (/^([a-z0-9\-]+)\.html$/i).test(fname);
  }
  function subjectCodeFromPath() {
    const p = (window.location.pathname || '').split('/');
    const fname = p[p.length - 1] || p[p.length - 2] || '';
    const m = fname.match(/^([a-z0-9\-]+)\.html$/i);
    return m ? m[1] : null;
  }
  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* page elements */
  const notesListEl = el('notes-list');
  const questionListEl = el('question-list');
  const takeQuizBtn = el('take-quiz');
  const quizArea = el('quiz-area');
  const quizContent = el('quiz-content');
  const quizResult = el('quiz-result');
  const quizTitle = el('quiz-title');
  const quizCloseBtn = el('quiz-close');
  const selarBuy = el('selar-buy');
  const waOrder = el('wa-order');
  const tillDisplay = el('till-display');

  // Note modal elements 
  const noteModal = el('note-modal');
  const noteTitle = el('note-title');
  const noteContent = el('note-content');
  const noteClose = el('close-note') || el('note-modal') && el('note-modal').querySelector('.close-btn');
  const noteDownload = el('download-note');

  let notesData = null;
  let questionData = null;
  let allNotes = [];
  let currentNote = null;

  if (!isSubjectPage()) return;
  const subjectCode = subjectCodeFromPath();
  if (!subjectCode) return;

  const notesPath = `${subjectCode}-notes.json`;
  const questionsPath = `${subjectCode}.json`;

  // fetch notes and questions in parallel (graceful fallback)
  const pNotes = fetch(notesPath).then(r => { if (!r.ok) throw new Error('No notes file'); return r.json(); }).catch(() => null);
  const pQs = fetch(questionsPath).then(r => { if (!r.ok) throw new Error('No questions file'); return r.json(); }).catch(() => null);

  Promise.all([pNotes, pQs]).then(([nData, qData]) => {
    notesData = nData;
    questionData = qData;
    populatePage();
  }).catch(err => {
    console.error(err);
    if (notesListEl) notesListEl.innerHTML = '<p class="muted">Failed to load notes.</p>';
    if (questionListEl) questionListEl.innerHTML = '<p class="muted">Failed to load questions.</p>';
  });

  /* ---------- populate page ---------- */
  function populatePage() {
    // set subject title/meta if available (use notes or questions metadata)
    const subjNameEl = el('subject-name');
    if (subjNameEl) subjNameEl.textContent = (notesData && notesData.subject) || (questionData && questionData.subject) || '';
    const metaEl = el('subject-meta');
    if (metaEl) {
      const desc = (notesData && notesData.metadata && notesData.metadata.description) || (questionData && questionData.metadata && questionData.metadata.description) || '';
      metaEl.textContent = desc;
    }

    // determine subject type (theoretical or mixed)
    const subjType = (questionData && questionData.metadata && questionData.metadata.type) ||
                     (notesData && notesData.metadata && notesData.metadata.type) || 'mixed';

    /* NOTES: render a searchable dropdown and Open/Download actions (no note.html) */
    if (notesListEl) {
      notesListEl.innerHTML = '';
      const notes = (notesData && Array.isArray(notesData.notes)) ? notesData.notes : [];
      if (notes.length === 0) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'No notes available yet.';
        notesListEl.appendChild(p);
      } else {
        // search box
        const search = document.createElement('input');
        search.type = 'search';
        search.placeholder = 'Search notes (title)...';
        search.style.width = '100%';
        search.style.padding = '8px';
        search.style.marginBottom = '8px';
        search.className = 'note-search';
        notesListEl.appendChild(search);

        // select
        const select = document.createElement('select');
        select.id = 'notes-select';
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.borderRadius = '6px';
        select.style.border = '1px solid #eee';
        notes.forEach(n => {
          const o = document.createElement('option');
          o.value = n.id;
          o.textContent = n.title;
          select.appendChild(o);
        });
        notesListEl.appendChild(select);

        // action row
        const actions = document.createElement('div');
        actions.style.marginTop = '10px';
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        const openBtn = document.createElement('button');
        openBtn.className = 'btn primary';
        openBtn.textContent = 'Open note';
        openBtn.addEventListener('click', () => {
          const id = select.value;
          if (!id) return;
          openNoteById(id);
        });
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn ghost';
        downloadBtn.textContent = 'Download note';
        
       downloadBtn.addEventListener('click', () => {
  // Create the overlay
      const overlay = document.createElement('div');
      overlay.className = 'purchase-overlay';
      overlay.innerHTML = `
        <div class="card" style="max-width:350px; text-align:center; padding:20px;">
        <h3>Premium feature</h3>
        <p>This note is available only in the full StudyLite package.</p>
        <p><strong>Till Number:</strong> 8996560</p>
        <a class="btn primary" href="https://wa.me/2547XXXXXXX" target="_blank">Contact via WhatsApp</a><br><br>
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
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000'
      });

  // Append and wire up close action
      document.body.appendChild(overlay);
      overlay.querySelector('#close-purchase').addEventListener('click', () => {
      overlay.remove(); // removes the entire thing
      });
    });


        actions.appendChild(openBtn);
        actions.appendChild(downloadBtn);
        notesListEl.appendChild(actions);

        // search filter
        search.addEventListener('input', () => {
          const term = search.value.trim().toLowerCase();
          Array.from(select.options).forEach(opt => {
            opt.hidden = term !== '' && (opt.textContent.toLowerCase().indexOf(term) === -1);
          });
          const selOpt = select.options[select.selectedIndex];
          if (selOpt && selOpt.hidden) {
            const firstVisible = Array.from(select.options).find(o => !o.hidden);
            if (firstVisible) select.value = firstVisible.value;
          }
        });
      }
      allNotes = notes;
    }

    /* QUESTIONS: auto-shuffle and render sample list (shuffled) */
    if (questionListEl) {
      questionListEl.innerHTML = '';

      questionListEl.style.maxHeight = '520px';
      questionListEl.style.overflowY = 'auto';
      questionListEl.style.paddingRight = '8px';

      const qs = (questionData && Array.isArray(questionData.questions)) ? questionData.questions.slice() : [];
      if (qs.length === 0) {
        questionListEl.innerHTML = '<p class="muted">No sample questions available yet.</p>';
      } else {
        shuffleArray(qs);
        const desiredCount = qs.length >= 10 ? Math.min(qs.length, 12) : qs.length;
        const preview = qs.slice(0, desiredCount);
        preview.forEach(q => {
          const div = document.createElement('div');
          div.className = 'q';
          div.innerHTML = `<div class="title">${escapeHtml(q.title || '')}</div>
            <div class="muted">${escapeHtml(q.question || '')}</div>
            <div style="margin-top:8px"><button class="btn outline view-sol" data-qid="${escapeHtml(q.id)}">View answer</button></div>`;
          questionListEl.appendChild(div);
        });
        questionListEl.querySelectorAll('button.view-sol').forEach(btn => {
          btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-qid');
            openSolutionModal(id);
          });
        });
      }
    }

    // Payment/till links (if present)
    if (selarBuy) {
      const pack = (questionData && questionData.metadata && questionData.metadata.packs && questionData.metadata.packs[0]) ? questionData.metadata.packs[0] : null;
      if (pack && pack.link) {
        selarBuy.href = pack.link; selarBuy.textContent = `Buy: ${pack.title} — KES ${pack.price_kes || ''}`; selarBuy.style.display = '';
      } else selarBuy.style.display = 'none';
    }
    if (waOrder) {
      const phone = (window.PAYMENT_DETAILS && PAYMENT_DETAILS.contactWhatsApp) ? PAYMENT_DETAILS.contactWhatsApp.replace(/\+/g, '') : '';
      const subj = (questionData && questionData.subject) || subjectCode;
      waOrder.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hi, I want the ' + subj + ' pack')}`;
    }
    if (tillDisplay) {
      const t = (window.PAYMENT_DETAILS && PAYMENT_DETAILS.tillNumber) ? PAYMENT_DETAILS.tillNumber : '8996560';
      tillDisplay.textContent = t;
    }

    // quiz CTA behavior depending on subject type
    if (takeQuizBtn) {
      if (subjType === 'theoretical') {
        takeQuizBtn.style.display = 'none';
        const qContainer = el('question-list');
        if (qContainer) {
          const note = document.createElement('div');
          note.className = 'muted';
          note.style.marginTop = '10px';
          note.textContent = 'This subject is theory-heavy — auto-graded quizzes are disabled. Practice questions and model solutions are available below.';
          qContainer.parentNode.insertBefore(note, qContainer);
        }
      } else {
        takeQuizBtn.style.display = '';
        takeQuizBtn.addEventListener('click', () => startQuiz(10));
      }
    }
    if (quizCloseBtn) quizCloseBtn.addEventListener('click', closeQuiz);
  }

  /* ---- NOTE modal handling ---- */
  function openNoteById(id, autoDownload = false) {
    const note = allNotes.find(n => String(n.id) === String(id));
    if (!note) return alert('Note not found');
    currentNote = note;
    if (noteTitle) noteTitle.textContent = note.title;
    if (noteContent) noteContent.textContent = note.content;
    if (noteModal) noteModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (autoDownload) downloadCurrentNote();
  }

  if (noteClose) noteClose.addEventListener('click', closeNote);
  if (noteModal) noteModal.addEventListener('click', e => { if (e.target === noteModal) closeNote(); });

  function closeNote() {
    if (noteModal) noteModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentNote = null;
  }

  if (noteDownload) noteDownload.addEventListener('click', downloadCurrentNote);
  function downloadCurrentNote() {
    if (!currentNote) return;
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert('PDF library not available'); return; }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    doc.setFontSize(18);
    doc.text(String(currentNote.title || ''), margin, 60);
    doc.setFontSize(11);
    const text = String(currentNote.content || '').replace(/\r\n/g, '\n');
    const lines = doc.splitTextToSize(text, 520);
    doc.text(lines, margin, 90);
    const safeName = (currentNote.title || 'note').replace(/[^\w\- ]+/g, '').slice(0,80) || 'note';
    doc.save(`${safeName}.pdf`);
  }

  /* ---- Open solution modal (reads from questionData) ---- */
  function openSolutionModal(qid) {
    if (!questionData) return alert('Questions not loaded');
    const q = (questionData.questions || []).find(x => String(x.id) === String(qid));
    if (!q) return alert('Question not found');
    showSolutionModal(q);
  }

  function showSolutionModal(question) {
    const existing = document.querySelector('.studylite-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'studylite-modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(11,17,34,0.55)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.tabIndex = -1;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const modal = document.createElement('div');
    modal.className = 'studylite-modal';
    modal.style.width = 'min(960px,92%)';
    modal.style.maxHeight = '86vh';
    modal.style.overflow = 'auto';
    modal.style.background = '#fff';
    modal.style.borderRadius = '12px';
    modal.style.padding = '18px';
    modal.style.boxShadow = '0 20px 50px rgba(2,6,23,0.45)';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', question.title || 'Solution');

    const header = document.createElement('header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.gap = '12px';
    header.style.marginBottom = '8px';

    const h = document.createElement('h3');
    h.textContent = question.title || 'Solution';
    h.style.margin = '0';
    h.style.fontSize = '18px';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = 'Worked solution — StudyLite';
    meta.style.color = '#6b7280';
    meta.style.fontSize = '13px';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = 'Close';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = '1px solid #e6eefc';
    closeBtn.style.padding = '6px 8px';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = '600';
    closeBtn.addEventListener('click', closeModal);

    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.flexDirection = 'column';
    headerLeft.appendChild(h);
    headerLeft.appendChild(meta);

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.style.marginTop = '10px';
    body.style.color = '#0b1726';
    body.style.lineHeight = '1.45';

    const qHtml = document.createElement('div');
    qHtml.innerHTML = `<strong>Question:</strong><div style="margin-top:6px">${escapeHtml(question.question || '')}</div>`;
    body.appendChild(qHtml);

    if (question.working_steps && Array.isArray(question.working_steps) && question.working_steps.length) {
      const stepsWrap = document.createElement('div');
      stepsWrap.style.marginTop = '10px';
      stepsWrap.innerHTML = `<strong>Working steps:</strong>`;
      const ol = document.createElement('ol');
      ol.style.margin = '8px 0 12px 20px';
      question.working_steps.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = escapeHtml(s);
        ol.appendChild(li);
      });
      stepsWrap.appendChild(ol);
      body.appendChild(stepsWrap);
    }

    const solWrap = document.createElement('div');
    solWrap.style.marginTop = '10px';
    solWrap.innerHTML = `<strong>Solution:</strong><div style="white-space:pre-wrap;margin-top:6px">${escapeHtml(question.solution || '')}</div>`;
    body.appendChild(solWrap);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    actions.style.marginTop = '12px';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.flexWrap = 'wrap';

    const printBtn = document.createElement('button');
    printBtn.className = 'btn ghost';
    printBtn.textContent = 'Print';
    printBtn.addEventListener('click', () => {
      const w = window.open('', '_blank');
      const title = escapeHtml(question.title || 'Solution');
      const inner = `
        <html><head><title>${title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>body{font-family:system-ui;padding:18px;line-height:1.45;color:#0b1726} h3{margin-top:0}</style>
        </head><body><h3>${title}</h3>${body.innerHTML}</body></html>`;
      w.document.write(inner);
      w.document.close();
      w.focus();
      w.print();
    });

    actions.appendChild(printBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);

    function closeModal() {
      document.removeEventListener('keydown', onKey);
      const ex = document.querySelector('.studylite-modal-overlay');
      if (ex) ex.remove();
    }
  }

  /* ---- Quiz runner (uses questionData) ---- */
  function startQuiz(n = 10) {
    if (!questionData) return alert('Question data not loaded');
    const pool = (questionData.questions || []).slice();
    if (pool.length === 0) return alert('No questions for quiz');
    shuffleArray(pool);
    const qs = pool.slice(0, Math.min(n, pool.length));
    renderQuiz(qs);
  }

  /* renderQuiz / evaluateQuiz / closeQuiz */
  function renderQuiz(questions) {
    if (!quizArea || !quizContent || !quizResult) {
      return alert('Quiz area not found on this page.');
    }
    quizArea.classList.remove('hidden');
    quizContent.innerHTML = '';
    quizResult.classList.add('hidden');
    if (quizTitle) quizTitle.textContent = `${(questionData && questionData.subject) || ''} — ${questions.length}-question quiz`;

    const form = document.createElement('form');
    form.id = 'quiz-form';
    questions.forEach((q, idx) => {
      const div = document.createElement('div');
      div.className = 'quiz-question';
      div.style.padding = '12px';
      div.style.borderRadius = '8px';
      div.style.border = '1px solid #eef2ff';
      div.style.marginBottom = '10px';
      let inner = `<div><strong>Q${idx + 1}.</strong> ${escapeHtml(q.question || '')}</div>`;
      if (q.choices && Array.isArray(q.choices) && q.choices.length) {
        inner += '<div style="margin-top:8px">';
        q.choices.forEach(c => { inner += `<div class="choice"><label><input type="radio" name="q_${q.id}" value="${escapeHtml(c)}"> ${escapeHtml(c)}</label></div>`; });
        inner += '</div>';
      } else {
        inner += `<div style="margin-top:8px"><input type="text" name="q_${q.id}" placeholder="Your answer" style="width:100%;padding:8px;border-radius:6px;border:1px solid #eee"></div>`;
      }
      div.innerHTML = inner;
      form.appendChild(div);
    });

    const controls = document.createElement('div');
    controls.style.marginTop = '12px';
    controls.innerHTML = `<button type="button" class="btn primary" id="quiz-submit-btn">Submit</button>
                          <button type="button" class="btn ghost" id="quiz-cancel-btn" style="margin-left:8px">Cancel</button>`;
    form.appendChild(controls);
    quizContent.appendChild(form);

    const submitBtn = document.getElementById('quiz-submit-btn');
    const cancelBtn = document.getElementById('quiz-cancel-btn');
    if (submitBtn) submitBtn.addEventListener('click', () => evaluateQuiz(questions));
    if (cancelBtn) cancelBtn.addEventListener('click', closeQuiz);
    quizContent.scrollIntoView({ behavior: 'smooth' });
  }

  function evaluateQuiz(questions) {
    const form = document.getElementById('quiz-form');
    if (!form) return;
    const fd = new FormData(form);
    const subjType = (questionData && questionData.metadata && questionData.metadata.type) ? questionData.metadata.type : 'mixed';

    // Theoretical: show model answers only (no auto-grade)
    if (subjType === 'theoretical') {
      quizContent.innerHTML = '';
      quizResult.classList.remove('hidden');
      let html = `<h3>Review — model solutions shown (auto-grading disabled)</h3>`;
      questions.forEach((q, idx) => {
        const key = 'q_' + q.id;
        const ans = fd.get(key) || '';
        html += `<div class="q" style="margin-bottom:12px;padding:10px;border-radius:8px;border:1px solid #eef2ff;background:#fff">
          <div><strong>Q${idx+1}.</strong> ${escapeHtml(q.question || '')}</div>
          <div style="margin-top:6px"><strong>Your answer:</strong> ${escapeHtml(ans)}</div>
          <div style="margin-top:8px"><strong>Model answer / solution:</strong><div style="white-space:pre-wrap">${escapeHtml(q.solution || '')}</div></div>
          <div style="margin-top:8px"><strong>Working:</strong><ol>${(q.working_steps||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol></div>
        </div>`;
      });
      html += `<div style="margin-top:12px"><button class="btn primary" id="quiz-done" >Done</button></div>`;
      quizResult.innerHTML = html;
      const done = document.getElementById('quiz-done');
      if (done) done.addEventListener('click', closeQuiz);
      quizResult.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Auto-grade for non-theory
    let total = questions.length, correct = 0;
    const details = [];
    questions.forEach(q => {
      const key = 'q_' + q.id;
      const ans = fd.get(key);
      let ok = false;
      if (q.correct && String(q.correct).trim() !== '') {
        if (ans && String(ans).trim().toLowerCase() === String(q.correct).trim().toLowerCase()) ok = true;
      } else {
        if (ans && q.solution && String(q.solution).toLowerCase().includes(String(ans).trim().toLowerCase())) ok = true;
      }
      if (ok) correct++;
      details.push({ id: q.id, ok, answer: ans || '', correct: q.correct || '', solution: q.solution || '', working_steps: q.working_steps || [] });
    });

    quizContent.innerHTML = '';
    quizResult.classList.remove('hidden');
    let html = `<h3>Score: ${correct} / ${total}</h3>`;
    details.forEach(d => {
      html += `<div class="q" style="margin-bottom:10px;padding:10px;border-radius:8px;border:1px solid #eef2ff;background:#fff"><div><strong>Q ${escapeHtml(String(d.id))}</strong> — ${d.ok ? '<span style="color:green">Correct</span>' : '<span style="color:red">Wrong</span>'}</div>
        <div style="margin-top:6px"><strong>Your answer:</strong> ${escapeHtml(d.answer)}</div>
        <div style="margin-top:6px"><strong>Correct:</strong> ${escapeHtml(d.correct)}</div>
        <div style="margin-top:6px"><strong>Working steps:</strong><ol>${d.working_steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol></div>
        <div style="margin-top:6px"><strong>Solution:</strong><div style="white-space:pre-wrap">${escapeHtml(d.solution)}</div></div></div>`;
    });
    html += `<div style="margin-top:12px"><button class="btn primary" id="quiz-retry">Retry</button>
             <button class="btn ghost" id="quiz-done" style="margin-left:8px">Done</button></div>`;
    quizResult.innerHTML = html;

    const retry = document.getElementById('quiz-retry');
    const done = document.getElementById('quiz-done');
    if (retry) retry.addEventListener('click', () => startQuiz(total));
    if (done) done.addEventListener('click', closeQuiz);
    quizResult.scrollIntoView({ behavior: 'smooth' });
  }

  function closeQuiz() {
    if (quizArea) quizArea.classList.add('hidden');
    if (quizContent) quizContent.innerHTML = '';
    if (quizResult) quizResult.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* expose */
  window.startQuiz = startQuiz;
  window.showSolutionModal = showSolutionModal;

})();
