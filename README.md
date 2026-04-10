# Legal Proceedings Microservice

Simple Node.js microservice + UI for creating and listing legal proceedings.

## Data model
Each proceeding has:
- `createdDate`
- `scheduledDate`
- `proceedingType`
- `client`
- `participants`
- `location`

Data is stored in `data/proceedings.json` (file store).

## Run
```bash
npm install
npm start
```

App URL: `http://localhost:3000`

## API
- `GET /api/proceedings`
- `POST /api/proceedings`

A few sample proceedings are auto-seeded on first run.
