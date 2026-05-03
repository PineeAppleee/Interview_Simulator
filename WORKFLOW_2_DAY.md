# ⚡️ 2-Day Architecture Sprint Workflow: Interview Simulator

This workflow is designed to transition the current prototype into a **production-ready foundation** in 48 hours. It focuses on high-impact architectural changes.

---

## 🗓 Day 1: Core Infrastructure & Persistence
**Goal:** Build the "Source of Truth" and secure the API.

### Phase 1: Modular Restructuring (Morning)
- [ ] **Backend Restructure:** Move from monolithic `index.ts` to `src/controllers`, `src/services`, `src/routes`, and `src/models`.
- [ ] **Dependency Injection:** Initialize a simple service container or standardise service instantiation.
- [ ] **Environment Setup:** Strict `.env` validation (ensure `DATABASE_URL`, `JWT_SECRET`, and API keys are present).

### Phase 2: Persistence Layer (Afternoon)
- [ ] **Prisma Setup:** Initialize Prisma and define the `User`, `Interview`, `AudioChunk`, and `Evaluation` models.
- [ ] **Migrations:** Run initial migrations to PostgreSQL.
- [ ] **Repository Pattern:** Create data access layers for Interviews and Users to decouple logic from the DB.

### Phase 3: Identity & Security (Evening)
- [ ] **Auth Implementation:** Create `AuthService` for JWT generation and `bcrypt` hashing.
- [ ] **Middleware:** Implement `authMiddleware` to protect interview routes.
- [ ] **Persistent CRUD:** Refactor `POST /api/interviews` to save metadata to the database instead of in-memory maps.

---

## 🗓 Day 2: Real-time Orchestration & UI Scaling
**Goal:** Stabilize communication and modernize the interaction model.

### Phase 1: Real-time Refactor (Morning)
- [ ] **Socket.io Namespacing:** Use `/interview` namespace and refactor logic to use the database-backed `SessionService`.
- [ ] **Robust Handlers:** Implement `onDisconnect` cleanup and reconnection logic (heartbeats).
- [ ] **Event Standardization:** Define strict TypeScript interfaces for all Socket.io events.

### Phase 2: Service Orchestration (Afternoon)
- [ ] **Audio Pipeline Refactor:** Move logic from `transcriber.ts` into an `AudioService` with error retries.
- [ ] **Evaluation Logic:** Create a separate `EvaluationService` to handle LLM scoring and persistence of results.
- [ ] **Logging:** Integrate `Winston` for structured logging across the pipeline.

### Phase 3: Frontend Modernization (Evening)
- [ ] **State Management:** Replace local component state with a **Zustand** store for global session/interview state.
- [ ] **Routing:** Implement `react-router-dom` with a `ProtectedRoute` component.
- [ ] **UI Polish (The "Wow" Factor):**
    - [ ] Install `framer-motion` and `lucide-react`.
    - [ ] Add page transitions and chat bubble animations.
    - [ ] Replace `alert()` with `react-hot-toast`.

---

## 🚀 Success Criteria for Day 2
1. **Zero Data Loss:** Refreshing the browser doesn't lose the interview progress (fetched from DB).
2. **Secure:** Endpoints require a valid JWT.
3. **Responsive:** Real-time feedback (transcripts/scores) appears with clear loading states.
4. **Premium Feel:** Smooth transitions and professional typography.
