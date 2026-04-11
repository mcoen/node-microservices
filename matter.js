const { readJson, writeJson } = require('./storage');

const KEY = 'matters.json';

function seedMatters() {
  return [
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
}

async function ensureMatterStore() {
  await readJson(KEY, seedMatters());
}

async function readMatters() {
  return readJson(KEY, seedMatters());
}

async function createMatter({ name, description, client, status = 'Open' }) {
  const matters = await readMatters();
  const matter = {
    id: `m-${Date.now()}`,
    createdDate: new Date().toISOString(),
    name,
    description,
    client,
    status,
  };
  matters.push(matter);
  await writeJson(KEY, matters);
  return matter;
}

module.exports = {
  ensureMatterStore,
  readMatters,
  createMatter,
};
