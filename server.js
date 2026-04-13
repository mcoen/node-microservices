const express = require('express');
const path = require('path');
const { ensureStore, readProceedings, createProceeding } = require('./proceeding');
const { ensureMatterStore, readMatters, createMatter } = require('./matter');
const { ensurePeopleStore } = require('./person');
const { ensureUserStore, readUsers } = require('./user');
const {
  ensureParticipantStore,
  readParticipantsExpanded,
  createParticipant,
} = require('./participant');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/users', async (_req, res) => {
  res.json(await readUsers());
});

app.get('/api/participants', async (_req, res) => {
  res.json(await readParticipantsExpanded());
});

app.post('/api/participants', async (req, res) => {
  const { firstName, lastName, email, phone, participantType, userId } = req.body;

  if (userId) {
    const participant = await createParticipant({ userId, participantType });
    return res.status(201).json(participant);
  }

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'firstName, lastName, and email are required when not linking from a user.' });
  }

  const participant = await createParticipant({ firstName, lastName, email, phone, participantType });
  return res.status(201).json(participant);
});

app.get('/api/matters', async (_req, res) => {
  const matters = await readMatters();
  const proceedings = await readProceedings();
  const enriched = matters.map((m) => ({
    ...m,
    proceedingCount: proceedings.filter((p) => p.matterId === m.id).length,
  }));
  res.json(enriched);
});

app.post('/api/matters', async (req, res) => {
  const { name, description, client, status } = req.body;
  if (!name || !description || !client) {
    return res.status(400).json({ error: 'name, description, and client are required.' });
  }

  const matter = await createMatter({ name, description, client, status });
  return res.status(201).json(matter);
});

app.get('/api/proceedings', async (_req, res) => {
  const [proceedings, participants] = await Promise.all([readProceedings(), readParticipantsExpanded()]);
  const participantById = Object.fromEntries(participants.map((p) => [p.id, p.displayName]));

  const enriched = proceedings.map((p) => ({
    ...p,
    participantNames: (p.participantIds || []).map((id) => participantById[id]).filter(Boolean),
  }));

  res.json(enriched);
});

app.post('/api/proceedings', async (req, res) => {
  const { matterId, scheduledDate, proceedingType, client, participantIds, location } = req.body;

  if (!matterId || !scheduledDate || !proceedingType || !client || !participantIds || !location) {
    return res
      .status(400)
      .json({ error: 'matterId, scheduledDate, proceedingType, client, participantIds, and location are required.' });
  }

  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ error: 'participantIds must be a non-empty array.' });
  }

  const [matters, participants] = await Promise.all([readMatters(), readParticipantsExpanded()]);

  if (!matters.some((m) => m.id === matterId)) {
    return res.status(400).json({ error: 'Invalid matterId. Please select an existing matter.' });
  }

  const participantById = Object.fromEntries(participants.map((p) => [p.id, p.displayName]));
  const names = participantIds.map((id) => participantById[id]).filter(Boolean);
  if (names.length !== participantIds.length) {
    return res.status(400).json({ error: 'One or more participantIds are invalid.' });
  }

  const proceeding = await createProceeding({
    matterId,
    scheduledDate,
    proceedingType,
    client,
    participantIds,
    participants: names,
    location,
  });

  return res.status(201).json(proceeding);
});

app.listen(PORT, async () => {
  await ensurePeopleStore();
  await ensureUserStore();
  await ensureParticipantStore();
  await ensureMatterStore();
  await ensureStore();
  console.log(`Legal proceedings microservice running on http://localhost:${PORT}`);
});
