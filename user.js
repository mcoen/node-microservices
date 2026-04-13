const { readJson, writeJson } = require('./storage');
const { readPeople } = require('./person');

const KEY = 'users.json';

async function seedUsers() {
  const people = await readPeople();
  const jane = people[0];
  return [
    {
      id: 'user-1001',
      createdDate: new Date().toISOString(),
      personId: jane.id,
      username: 'jane.doe',
      role: 'Attorney',
      active: true,
    },
  ];
}

async function ensureUserStore() {
  const seed = await seedUsers();
  await readJson(KEY, seed);
}

async function readUsers() {
  const seed = await seedUsers();
  return readJson(KEY, seed);
}

async function createUser({ personId, username, role = 'User', active = true }) {
  const users = await readUsers();
  const user = {
    id: `user-${Date.now()}`,
    createdDate: new Date().toISOString(),
    personId,
    username,
    role,
    active,
  };
  users.push(user);
  await writeJson(KEY, users);
  return user;
}

module.exports = {
  ensureUserStore,
  readUsers,
  createUser,
};
