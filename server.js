const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const DB_PATH = path.join(__dirname, './db/db.json');

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const readNotes = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeNotes = (notes) => fs.writeFileSync(DB_PATH, JSON.stringify(notes, null, 2));

//Routes
app.get('/api/notes', (req, res) => {
    res.json(readNotes());
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.post('/api/notes', (req, res) => {
    const notes = readNotes();
    const newNote = { ...req.body, id: Date.now() };
    notes.push(newNote);
    writeNotes(notes);
    res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const filtered = notes.filter((note) => note.id !== Number(req.params.id));
    writeNotes(filtered);
    res.json(true);
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
