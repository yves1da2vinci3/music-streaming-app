const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/musicapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.send('Music streaming app');
});

// Upload route
app.post('/upload', upload.single('song'), (req, res) => {
  res.send('Song uploaded');
});

// Models
const Song = require('./models/song');
const Playlist = require('./models/playlist');

// Routes
// ... (previous routes)

// Create a playlist
app.post('/playlist', async (req, res) => {
  const playlist = new Playlist({
    name: req.body.name,
  });

  try {
    const savedPlaylist = await playlist.save();
    res.json(savedPlaylist);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Add a song to a playlist
app.post('/playlist/:id/songs', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
  res.status(404).send('Playlist not found');
  return;
}

const song = new Song({
  title: req.body.title,
  artist: req.body.artist,
  path: req.body.path,
});

const savedSong = await song.save();
playlist.songs.push(savedSong);

const updatedPlaylist = await playlist.save();
res.json(updatedPlaylist);
} catch (err) {
    res.status(400).send(err);
    }
    });
    
    // Get a playlist with songs
    app.get('/playlist/:id', async (req, res) => {
    try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    res.json(playlist);
    } catch (err) {
    res.status(404).send(err);
    }
    });
    
    // Get all playlists
    app.get('/playlists', async (req, res) => {
    try {
    const playlists = await Playlist.find().populate('songs');
    res.json(playlists);
    } catch (err) {
    res.status(400).send(err);
    }
    })


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
