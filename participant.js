const { readJson, writeJson } = require('./storage');
const { createPerson, readPeople } = require('./person');
const { readUsers } = require('./user');

const KEY = 'participants.json';

async function seedParticipants() {
  const people = await readPeople();
  const users = await readUsers();
  return [
    {
      id: 'participant-1001',
      createdDate: new Date().toISOString(),
      personId: people[0].id,
      userId: users[0]?.id || null,
      participantType: 'Attorney',
    },
    {
      id: 'participant-1002',
      createdDate: new Date().toISOString(),
      personId: people[1].id,
      userId: null,
      participantType: 'Witness',
    },
  ];
}

async function ensureParticipantStore() {
  const seed = await seedParticipants();
  await readJson(KEY, seed);
}

async function readParticipants() {
  const seed = await seedParticipants();
  return readJson(KEY, seed);
}

async function createParticipant({ firstName, lastName, email, phone, participantType = 'Participant', userId = null }) {
  let personId = null;

  if (userId) {
    const users = await readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('Invalid userId');
    personId = user.personId;
  } else {
    const person = await createPerson({ firstName, lastName, email, phone });
    personId = person.id;
  }

  const participants = await readParticipants();
  const participant = {
    id: `participant-${Date.now()}`,
    createdDate: new Date().toISOString(),
    personId,
    userId,
    participantType,
  };

  participants.push(participant);
  await writeJson(KEY, participants);
  return participant;
}

async function readParticipantsExpanded() {
  const [participants, people] = await Promise.all([readParticipants(), readPeople()]);
  const peopleById = Object.fromEntries(people.map((p) => [p.id, p]));

  return participants.map((pt) => {
    const person = peopleById[pt.personId] || {};
    return {
      ...pt,
      person,
      displayName: [person.firstName, person.lastName].filter(Boolean).join(' ') || pt.id,
      email: person.email || '',
    };
  });
}

module.exports = {
  ensureParticipantStore,
  readParticipants,
  readParticipantsExpanded,
  createParticipant,
};
