# Bajaj SRM BFHL Challenge Solution

This project includes:
- `POST /bfhl` REST API using Node.js + Express
- Complete hierarchy processing per challenge rules
- Frontend single-page app to submit node data and visualize response

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Identity fields

Set these before deployment so response has your actual details:

- `USER_ID` (example: `satvikgupta_24042026`)
- `EMAIL_ID` (your SRM college email)
- `COLLEGE_ROLL_NUMBER` (your roll number)

## API contract

`POST /bfhl`

Request body:

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

Response includes:
- `user_id`
- `email_id`
- `college_roll_number`
- `hierarchies`
- `invalid_entries`
- `duplicate_edges`
- `summary`

## Test

```bash
npm test
```

## Deploy suggestions

- Render / Railway / Vercel (Node server)
- Add environment variables for identity fields in hosting dashboard

## GitHub + Render deploy flow

This repository includes `render.yaml` for Render Blueprint deploy.

1. Push this project to a GitHub repository.
2. In Render, create a new Blueprint service from that GitHub repo.
3. Render will detect `render.yaml` and create the web service automatically.
4. After deploy, test:

```bash
curl -X POST https://<your-render-url>/bfhl \\
  -H "Content-Type: application/json" \\
  -d '{"data":["A->B","B->C"]}'
```
