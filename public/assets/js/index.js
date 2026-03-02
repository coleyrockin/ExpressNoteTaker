// localStorage-backed data layer
const STORAGE_KEY = 'note-taker-notes';
const COUNTER_KEY = 'note-taker-counter';

const NoteStore = {
  _getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  _saveAll(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },

  _nextId() {
    const current = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10);
    const next = current + 1;
    localStorage.setItem(COUNTER_KEY, String(next));
    return next;
  },

  getAll() {
    return this._getAll();
  },

  save(note) {
    const notes = this._getAll();
    note.id = this._nextId();
    notes.push(note);
    this._saveAll(notes);
    return note;
  },

  delete(id) {
    const notes = this._getAll();
    const filtered = notes.filter((note) => note.id !== id);
    this._saveAll(filtered);
  },
};

// DOM elements
const isNotesPage = ['/notes', '/notes.html'].includes(window.location.pathname);

let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (isNotesPage) {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  NoteStore.save(newNote);
  activeNote = {};
  getAndRenderNotes();
  renderActiveNote();
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  NoteStore.delete(noteId);
  getAndRenderNotes();
  renderActiveNote();
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to an empty object and allows the user to enter a new note
const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = (jsonNotes) => {
  if (isNotesPage) {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (isNotesPage) {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from localStorage and renders them to the sidebar
const getAndRenderNotes = () => renderNoteList(NoteStore.getAll());

if (isNotesPage) {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();
