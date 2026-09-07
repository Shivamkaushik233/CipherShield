# CipherShield — AI Fraud Detection & Fair Decision Verification

### 🚀 Live Demo

👉 [CipherShield Live Demo](https://ciphershield-frontend.onrender.com/)

A full-stack fintech security platform combining AI fraud detection, a
simulated zero-knowledge proof layer, and a blockchain-style hash-chain
audit trail — built to look and behave like a real SOC (Security
Operations Center) product.

```
ciphershield/
├── backend/       Node.js + Express + PostgreSQL (Sequelize) + Socket.IO API
├── ai-service/    Python FastAPI + scikit-learn fraud model
├── frontend/      React + Vite + Tailwind + Recharts dashboard
└── render.yaml    Render Blueprint (deploys all three + a managed Postgres)
```

## What's real vs. simulated (be upfront about this in interviews)

| Layer | Implementation | Honest framing |
|---|---|---|
| AI fraud detection | Real RandomForestClassifier trained on a synthetic dataset (`ai-service/app/train.py`) | Genuine model, genuine inference, synthetic training data |
| Blockchain audit trail | A single-writer SHA-256 hash-chain stored as Postgres rows (`backend/src/services/blockchain.js`) | Real tamper-evidence via hash linking; **not** a distributed ledger or smart contract |
| Zero-knowledge proofs | Structured to mirror the Groth16/snarkjs API shape (`backend/src/services/zkproof.js`) | **Simulated** — no real elliptic-curve cryptography. Comments in the file explain exactly how to swap in a real circom circuit |
| Database schema management | `sequelize.sync()` on boot (`backend/src/config/db.js`) | Creates tables from the model definitions directly — simple to run and deploy, but **not** versioned SQL migrations. See "Next steps" below |
| Secure Document Vault storage | Encrypted files on local disk (`backend/vault_storage/`) | Fine for local dev; **ephemeral** on Render's free tier (see deployment notes) |

This scoping was a deliberate set of choices made while planning and
building the project — it keeps things buildable, testable, and
deployable on free-tier infrastructure while being fully transparent
about which pieces are production-grade and which are pragmatic
stand-ins. Every file that simulates or simplifies something says so in
a comment block at the top.

## Architecture / data flow

1. A customer submits a transaction from the **Transaction Portal**.
2. The backend builds a feature vector (amount, device trust, distance
   from last transaction, VPN flag, failed logins, etc.) and calls the
   **AI microservice** (`POST /predict`). If the microservice is
   unreachable, a rule-based fallback scorer keeps the platform working.
3. The risk score decides the transaction's fate (approved / pending
   review / blocked).
4. A **simulated ZK proof** is generated, proving "risk score exceeds
   threshold" without exposing the underlying transaction data.
5. A **block** is appended to the hash-chain (a Postgres table), committing
   to the transaction's outcome and linking to the previous block's hash.
6. If risk is high enough, a **fraud case** is auto-created and
   **Socket.IO** pushes a live alert to every connected analyst.
7. Analysts investigate through the **Case Management** workflow (open →
   investigating → resolved/closed → reopened), attach evidence, upload
   documents to the encrypted vault, and export a PDF report.

### Database note: relational core + JSONB for nested data

The backend uses **Sequelize** (not Prisma — Prisma's engine binaries need
a network fetch that isn't available in every environment; Sequelize is
pure JS + the `pg` driver, no binary downloads required). Core entities
(users, transactions, fraud cases, sessions, devices, notes, timeline
events) are proper relational tables with foreign keys. Semi-structured,
nested data that would otherwise need several extra join tables (device
location, AI feature vectors, zk proofs, case evidence snapshots) is
stored as native Postgres **JSONB** columns instead — a common,
legitimate real-world pattern, not a shortcut.

One subtlety worth knowing if you extend this: **Postgres JSONB does not
preserve object key order**. The hash-chain's integrity check
(`blockchain.js`) hashes each block's JSON data, so it uses a canonical
(sorted-key) stringifier rather than plain `JSON.stringify` — otherwise
the same logical data could hash differently after a round trip through
JSONB, which would make `verifyChain()` report tampering that never
actually happened. This was caught by testing against a real Postgres
instance during development, not by code review — worth remembering if
you add more hashed/signed data elsewhere in the stack.

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+ running locally, or a hosted instance (Render, Supabase,
  Neon, RDS, etc. all work — you just need a connection string)

## Local setup

### 1. PostgreSQL

Create an empty database, e.g.:
```bash
psql -U postgres -c "CREATE DATABASE ciphershield;"
```

### 2. AI microservice

```bash
cd ai-service
pip install -r requirements.txt
python app/train.py        # trains the model, writes models/fraud_model.pkl
uvicorn app.main:app --reload --port 8000
```

### 3. Backend

```bash
cd backend
cp .env.example .env       # edit DATABASE_URL / JWT_SECRET if needed
npm install
npm run seed                # creates tables (via sync) + 4 demo accounts
npm run dev                 # starts on :5000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on :5173, proxies /api and /socket.io to :5000
```

Open **http://localhost:5173**.

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Customer | customer@ciphershield.dev | password123 |
| Fraud Analyst | analyst@ciphershield.dev | password123 |
| Security Admin | admin@ciphershield.dev | password123 |
| Auditor | auditor@ciphershield.dev | password123 |

Log in as `customer` and send a payment, or as any role and try the
**Fraud Simulator** to trigger scenarios (impossible travel, VPN login,
new device, large transaction, multiple failed logins) and watch the
alert appear live on the Analyst Dashboard in another browser tab.

## Deploying to Render

`render.yaml` at the repo root is a Render **Blueprint** that provisions
and wires up all four resources (Postgres + backend + AI service +
frontend) in one sync:

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In the Render dashboard: **New -> Blueprint**, connect the repo.
   Render reads `render.yaml` and shows you the four resources it's about
   to create.
3. Click **Apply**. Render provisions the Postgres database, then builds
   and deploys all three services. Cross-service URLs (backend -> AI
   service, backend -> frontend for CORS, frontend -> backend) are wired
   automatically from each service's Render-assigned hostname - no manual
   env var copy-pasting required.
4. Once all three services show "Live", open the frontend's `.onrender.com`
   URL and log in with the seeded demo accounts (run `npm run seed`
   yourself against the deployed backend, e.g. via Render's shell, since
   the Blueprint doesn't auto-seed).

**Known free-tier tradeoffs** (see the comment block at the top of
`render.yaml` for the full list): free web services spin down after
inactivity (first request after idle takes ~30-60s to wake up), and have
an **ephemeral filesystem** - Secure Document Vault uploads won't survive
a redeploy unless you attach a paid Render Disk or move to object storage.
Render's free-tier specifics (Postgres expiry, service limits) change
over time, so check Render's current pricing page before relying on this
for anything beyond a demo/portfolio deployment.

## Feature map

| Feature | Where |
|---|---|
| JWT auth, 4 roles | `backend/src/controllers/authController.js` |
| PostgreSQL via Sequelize | `backend/src/models/`, `backend/src/config/database.js` |
| AI fraud detection + explanation | `ai-service/app/model.py` |
| Live transaction monitoring | Socket.IO, `backend/src/sockets` |
| Fraud Analyst dashboard + analytics | `frontend/src/pages/analyst/Dashboard.jsx` |
| Case management workflow | `backend/src/controllers/caseController.js`, `frontend/.../CaseDetail.jsx` |
| Blockchain audit trail | `backend/src/services/blockchain.js` |
| Security center (devices/sessions) | `backend/src/controllers/deviceController.js` |
| Fraud simulator | `backend/src/controllers/simulatorController.js` |
| PDF reports | `backend/src/services/pdfReports.js` (pdfkit) |
| Secure document vault (AES-256-GCM) | `backend/src/controllers/vaultController.js` |
| Device trust score | `Device` model, updated on every login |
| Audit logs | `backend/src/middleware/auditLogger.js` |
| Dark purple-black futuristic UI | `frontend/tailwind.config.js`, `HashChainThread.jsx`, `Logo.jsx` |
| Render deployment | `render.yaml` |

## Next steps if you want to go further

- Swap `services/zkproof.js` for a real circom + snarkjs circuit (the
  comments in that file walk through what's needed).
- Swap the hash-chain for a Solidity `AuditTrail.sol` contract on a
  local Hardhat network, emitting the same `data` shape as an event.
- Replace `sequelize.sync()` with proper `sequelize-cli` migrations once
  the schema stabilizes - sync is convenient for getting started but
  doesn't give you reviewable, reversible schema change history.
- Move Secure Document Vault storage from local disk to S3-compatible
  object storage so uploads survive redeploys on Render's free tier.
- Add SHAP for richer, per-prediction AI explanations instead of the
  current feature-importance x deviation approach.
