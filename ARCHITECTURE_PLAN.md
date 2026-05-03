# Interview‑Simulator – Production‑Ready Architecture & Roadmap

## 1️⃣ Architecture Overview
- **Frontend** – React 18 + Vite, component‑slice structure, Zustand (or Redux Toolkit) store, React Router v6, Framer Motion for micro‑animations, optional Tailwind CSS.
- **Backend** – Node TS (Express/Fastify) following Clean Architecture (controllers → services → repositories). Uses socket.io for real‑time audio, Winston for logging, Zod for validation, JWT auth, Prisma ORM with PostgreSQL, Redis cache.
- **API Layer** – REST endpoints for interview CRUD, auth, TTS, transcription; WebSocket namespace `/interview` for streaming audio and proctor updates.
- **Service Layer** – `InterviewService`, `AudioService`, `EvaluationService`, `AuthService`.
- **Persistence** – PostgreSQL (tables: users, interviews, audio_chunks, evaluations, proctor_events). Prisma schema included.
- **Infrastructure** – Docker‑Compose for dev/prod, Nginx reverse‑proxy, PM2 cluster, GitHub Actions CI/CD.

## 2️⃣ Feature Gap Analysis (Priorities)
| Feature | Status | Priority |
|---|---|---|
| JWT Auth | Missing | **Critical** |
| Persistent interview storage | Missing | **Critical** |
| WebSocket scaling (redis‑adapter) | Missing | **Critical** |
| UI modernisation (dark mode, animations) | Partial | **Critical** |
| Audio transcription queue & caching | Partial | **Important** |
| Testing suite (Jest, RTL) | Missing | **Important** |
| CI/CD pipeline | Missing | **Optional** |

## 3️⃣ Module Breakdown (Core Modules)
- **Auth** – `/auth/*` routes, JWT issuance, bcrypt passwords.
- **Interview** – CRUD, status management.
- **WebSocket Gateway** – real‑time events: `join`, `audio-chunk`, `end-answer`, `question`, `evaluation`, `session-missing`, `proctor-update`.
- **Audio Service** – Convert WebM/OGG → WAV (ffmpeg), Whisper/Deepgram transcription, Redis cache.
- **Evaluation Service** – Call LLM (OpenRouter), compute score, store work‑map.
- **TTS Service** – ElevenLabs API with fallback to browser SpeechSynthesis.
- **Cache Layer** – Redis for transient audio chunks & rate‑limit counters.

## 4️⃣ UI/UX Improvements
- Design system with CSS variables (already defined) + optional Tailwind for utilities.
- Micro‑animations via **Framer Motion** (page transitions, chat bubbles, progress bars).
- Skeleton loaders for question card, chat list.
- Dark‑mode toggle persisting in `localStorage`.
- Toast notifications (`react-hot-toast`) instead of `alert()`.
- Responsive layout: sidebar collapses on <768 px.
- Accessibility: ARIA labels, focus outlines.

## 5️⃣ Frontend Architecture
```
src/
 ├─ api/
 ├─ components/
 ├─ features/
 │   ├─ interview/
 │   └─ auth/
 ├─ hooks/
 ├─ routes/
 ├─ styles/
 ├─ utils/
 └─ App.tsx
```
State management with **Zustand** (or Redux Toolkit). Lazy‑load routes, error boundaries, protected routes.

## 6️⃣ Backend Improvements
- Split code into `controllers/`, `services/`, `repositories/`, `routes/`.
- Central error‑handling middleware returning JSON errors.
- Winston JSON logger with request IDs.
- Rate limiting (`express-rate-limit`).
- Input validation with **Zod**.
- Socket.io‑Redis adapter for horizontal scaling.
- Graceful shutdown handling.
- Tests with **Jest** + **Supertest**.
- CI/CD via GitHub Actions.

## 7️⃣ Database Design (Prisma excerpt)
```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  role        Role     @default(CANDIDATE)
  createdAt   DateTime @default(now())
  interviews  Interview[]
}

model Interview {
  id            String       @id @default(uuid())
  company       String
  role          String
  roleDesc      String?
  status        InterviewStatus @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  audioChunks   AudioChunk[]
  evaluation    Evaluation?
  proctorEvents ProctorEvent[]
}

model AudioChunk {
  id          String   @id @default(uuid())
  interviewId String
  interview   Interview @relation(fields: [interviewId], references: [id])
  path        String
  mimeType    String
  createdAt   DateTime @default(now())
}

model Evaluation {
  id          String   @id @default(uuid())
  interviewId String @unique
  interview   Interview @relation(fields: [interviewId], references: [id])
  score       Float
  workmap     Json
  feedback    String?
  createdAt   DateTime @default(now())
}

model ProctorEvent {
  id          String   @id @default(uuid())
  interviewId String
  interview   Interview @relation(fields: [interviewId], references: [id])
  facePresent Boolean
  timestamp   DateTime @default(now())
}
```
Indexes on `email`, `userId`, `interviewId` for fast lookups.

## 8️⃣ Performance Optimisation
- Frontend: lazy loading, memoization, debounce inputs.
- Backend: Redis cache for audio chunks, limit concurrent Whisper transcriptions, streaming to Deepgram.
- DB: connection pooling, batch inserts.
- Deploy: PM2 cluster mode, Nginx HTTP/2.

## 9️⃣ Implementation Roadmap (2‑week sprint plan)
| Day | Task |
|---|---|
| 1‑2 | Initialise Prisma, create DB migrations, add auth routes & JWT middleware. |
| 3‑4 | Build Interview CRUD + socket.io namespace, integrate Redis adapter. |
| 5 | Add AudioService (ffmpeg + Whisper) with Redis cache, test locally. |
| 6‑7 | Implement EvaluationService (LLM call) and TTS endpoint. |
| 8 | Refactor frontend state (Zustand), add protected routes, lazy‑load pages. |
| 9 | Integrate Framer Motion for chat bubbles & page transitions, add dark‑mode toggle. |
|10 | Add toast notifications, skeleton loaders, responsive sidebar. |
|11 | Write unit/integration tests for backend (Jest) and frontend (RTL). |
|12 | Set up GitHub Actions CI/CD, Dockerfiles, docker‑compose for prod. |
|13‑14 | QA, bug‑fixes, documentation (OpenAPI spec, README). |

---

*All suggestions are practical for the current repository and can be implemented incrementally.*
