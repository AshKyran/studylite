
    const modal = document.getElementById('note-modal');
    const titleEl = document.getElementById('note-title');
    const contentEl = document.getElementById('note-content');
    const closeBtn = document.getElementById('close-note');
    let allNotes = [];
    let currentNote = null;

    // Load notes and attach handlers
    fetch(`${subject}-notes.json`)
      .then(r => r.json())
      .then(data => {
        allNotes = data.notes || [];
        document.querySelectorAll('[data-note-id]').forEach(item => {
          item.addEventListener('click', () => openNoteById(item.dataset.noteId));
        });
      })
      .catch(err => console.error('Failed to load notes:', err));

    function openNoteById(id) {
      const note = allNotes.find(n => String(n.id) === String(id));
      if (!note) return alert('Note not found.');
      currentNote = note;
      titleEl.textContent = note.title;
      contentEl.textContent = note.content;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    closeBtn.addEventListener('click', closeNote);
    modal.addEventListener('click', e => { if (e.target === modal) closeNote(); });
    function closeNote() {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      currentNote = null;
    }