const express = require('express');
const path = require('path');
const { ensureStore, readProceedings, createProceeding } = require('./proceeding');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/proceedings', (_req, res) => {
  res.json(readProceedings());
});

app.post('/api/proceedings', (req, res) => {
  const { scheduledDate, proceedingType, client, participants, location } = req.body;

  if (!scheduledDate || !proceedingType || !client || !participants || !location) {
    return res
      .status(400)
      .json({ error: 'scheduledDate, proceedingType, client, participants, and location are required.' });
  }

  const proceeding = createProceeding({
    scheduledDate,
    proceedingType,
    client,
    participants,
    location,
  });

  return res.status(201).json(proceeding);
});

app.listen(PORT, () => {
  ensureStore();
  console.log(`Legal proceedings microservice running on http://localhost:${PORT}`);
});
