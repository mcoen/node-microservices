const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'proceedings.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = [
      {
        id: 'p-1001',
        createdDate: new Date().toISOString(),
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        proceedingType: 'Deposition',
        client: 'Acme Holdings',
        participants: ['Jane Doe', 'John Smith', 'Court Reporter'],
        location: 'Remote (Zoom)'
      },
      {
        id: 'p-1002',
        createdDate: new Date().toISOString(),
        scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        proceedingType: 'Arbitration',
        client: 'Northstar Logistics',
        participants: ['Counsel A', 'Counsel B', 'Arbitrator'],
        location: 'New York, NY'
      },
      {
        id: 'p-1003',
        createdDate: new Date().toISOString(),
        scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        proceedingType: 'Hearing',
        client: 'Brightline Legal',
        participants: ['Plaintiff', 'Defendant', 'Judge'],
        location: 'Brooklyn Courthouse'
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readProceedings() {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeProceedings(proceedings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(proceedings, null, 2));
}

app.get('/api/proceedings', (_req, res) => {
  res.json(readProceedings());
});

app.post('/api/proceedings', (req, res) => {
  const { scheduledDate, proceedingType, client, participants, location } = req.body;

  if (!scheduledDate || !proceedingType || !client || !participants || !location) {
    return res.status(400).json({ error: 'scheduledDate, proceedingType, client, participants, and location are required.' });
  }

  const list = readProceedings();
  const createdDate = new Date().toISOString();
  const proceeding = {
    id: `p-${Date.now()}`,
    createdDate,
    scheduledDate,
    proceedingType,
    client,
    participants: Array.isArray(participants) ? participants : String(participants).split(',').map((x) => x.trim()).filter(Boolean),
    location
  };

  list.push(proceeding);
  writeProceedings(list);
  res.status(201).json(proceeding);
});

app.listen(PORT, () => {
  ensureStore();
  console.log(`Legal proceedings microservice running on http://localhost:${PORT}`);
});
