const { readJson, writeJson } = require('./storage');

const KEY = 'proceedings.json';

function seedProceedings() {
  return [
    {
      id: 'p-1001',
      matterId: 'm-1001',
      createdDate: new Date().toISOString(),
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      proceedingType: 'Deposition',
      client: 'Acme Holdings',
      participants: ['Jane Doe', 'John Smith', 'Court Reporter'],
      location: 'Remote (Zoom)',
    },
    {
      id: 'p-1002',
      matterId: 'm-1002',
      createdDate: new Date().toISOString(),
      scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      proceedingType: 'Arbitration',
      client: 'Northstar Logistics',
      participants: ['Counsel A', 'Counsel B', 'Arbitrator'],
      location: 'New York, NY',
    },
    {
      id: 'p-1003',
      matterId: 'm-1001',
      createdDate: new Date().toISOString(),
      scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      proceedingType: 'Hearing',
      client: 'Brightline Legal',
      participants: ['Plaintiff', 'Defendant', 'Judge'],
      location: 'Brooklyn Courthouse',
    },
  ];
}

async function ensureStore() {
  await readJson(KEY, seedProceedings());
}

async function readProceedings() {
  return readJson(KEY, seedProceedings());
}

async function createProceeding({ matterId, scheduledDate, proceedingType, client, participantIds = [], participants = [], location }) {
  const list = await readProceedings();
  const createdDate = new Date().toISOString();

  const proceeding = {
    id: `p-${Date.now()}`,
    matterId,
    createdDate,
    scheduledDate,
    proceedingType,
    client,
    participantIds: Array.isArray(participantIds) ? participantIds : [],
    participants: Array.isArray(participants)
      ? participants
      : String(participants)
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
    location,
  };

  list.push(proceeding);
  await writeJson(KEY, list);
  return proceeding;
}

module.exports = {
  ensureStore,
  readProceedings,
  createProceeding,
};
