const { readJson, writeJson } = require('./storage');

const KEY = 'people.json';

function seedPeople() {
  return [
    {
      id: 'person-1001',
      createdDate: new Date().toISOString(),
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '555-1001',
    },
    {
      id: 'person-1002',
      createdDate: new Date().toISOString(),
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-1002',
    },
  ];
}

async function ensurePeopleStore() {
  await readJson(KEY, seedPeople());
}

async function readPeople() {
  return readJson(KEY, seedPeople());
}

async function createPerson({ firstName, lastName, email, phone }) {
  const people = await readPeople();
  const person = {
    id: `person-${Date.now()}`,
    createdDate: new Date().toISOString(),
    firstName,
    lastName,
    email,
    phone: phone || '',
  };
  people.push(person);
  await writeJson(KEY, people);
  return person;
}

module.exports = {
  ensurePeopleStore,
  readPeople,
  createPerson,
};
