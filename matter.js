const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'matters.json');

function ensureMatterStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = [
      {
        id: 'm-1001',
        createdDate: new Date().toISOString(),
        name: 'Acme Holdings v. Northstar Logistics',
        description: 'Commercial litigation matter involving contract dispute and damages.',
        client: 'Acme Holdings',
        status: 'Open',
      },
      {
        id: 'm-1002',
        createdDate: new Date().toISOString(),
        name: 'Brightline Legal - Employment Arbitration',
        description: 'Arbitration regarding employment termination and severance terms.',
        client: 'Brightline Legal',
        status: 'Open',
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readMatters() {
  ensureMatterStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeMatters(matters) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(matters, null, 2));
}

function createMatter({ name, description, client, status = 'Open' }) {
  const matters = readMatters();
  const matter = {
    id: `m-${Date.now()}`,
    createdDate: new Date().toISOString(),
    name,
    description,
    client,
    status,
  };
  matters.push(matter);
  writeMatters(matters);
  return matter;
}

module.exports = {
  ensureMatterStore,
  readMatters,
  createMatter,
};
