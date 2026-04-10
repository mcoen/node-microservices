const express = require('express');
const path = require('path');
const { ensureStore, readProceedings, createProceeding } = require('./proceeding');
const { ensureMatterStore, readMatters, createMatter } = require('./matter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/matters', (_req, res) => {
  const matters = readMatters();
  const proceedings = readProceedings();
  const enriched = matters.map((m) => ({
    ...m,
    proceedingCount: proceedings.filter((p) => p.matterId === m.id).length,
  }));
  res.json(enriched);
});

app.post('/api/matters', (req, res) => {
  const { name, description, client, status } = req.body;
  if (!name || !description || !client) {
    return res.status(400).json({ error: 'name, description, and client are required.' });
  }

  const matter = createMatter({ name, description, client, status });
  return res.status(201).json(matter);
});

app.get('/api/proceedings', (_req, res) => {
  res.json(readProceedings());
});

app.post('/api/proceedings', (req, res) => {
  const { matterId, scheduledDate, proceedingType, client, participants, location } = req.body;

  if (!matterId || !scheduledDate || !proceedingType || !client || !participants || !location) {
    return res
      .status(400)
      .json({ error: 'matterId, scheduledDate, proceedingType, client, participants, and location are required.' });
  }

  const matters = readMatters();
  if (!matters.some((m) => m.id === matterId)) {
    return res.status(400).json({ error: 'Invalid matterId. Please select an existing matter.' });
  }

  const proceeding = createProceeding({
    matterId,
    scheduledDate,
    proceedingType,
    client,
    participants,
    location,
  });

  return res.status(201).json(proceeding);
});

app.listen(PORT, () => {
  ensureMatterStore();
  ensureStore();
  console.log(`Legal proceedings microservice running on http://localhost:${PORT}`);
});
