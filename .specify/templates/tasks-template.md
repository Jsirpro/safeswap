---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED. Every feature must include intent, validation, PTB, guardian, preview, confirmation, failure-path, and mock-mode coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and constitution-aligned scaffolding

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Define or update the intent schema artifacts referenced by the feature
- [ ] T003 Define or update feature contracts before implementation begins
- [ ] T004 Configure test harnesses for intent, validation, PTB, guardian, preview, confirmation, failure, and mock-mode coverage

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Implement intent parsing and validation boundaries
- [ ] T006 [P] Implement quote provider interfaces and deterministic validation rules
- [ ] T007 [P] Implement PTB compilation interfaces that consume only validated intent and quote data
- [ ] T008 [P] Implement guardian engine severity handling, including CRITICAL blocking behavior
- [ ] T009 Implement preview generation and explicit confirmation gating
- [ ] T010 Prove there is no direct wallet path outside the confirmation gate

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Intent parsing test in tests/[location]/test_[name].*
- [ ] T012 [P] [US1] Validation or contract test in tests/[location]/test_[name].*
- [ ] T013 [P] [US1] PTB, guardian, preview, and confirmation flow test in tests/[location]/test_[name].*
- [ ] T014 [P] [US1] Failure-path or mock-mode test in tests/[location]/test_[name].*

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create or update entities/models needed for validated swap intent data
- [ ] T016 [US1] Implement user-story-specific quote and PTB flow
- [ ] T017 [US1] Implement guardian findings handling and blocking behavior
- [ ] T018 [US1] Implement preview rendering and explicit confirmation gate
- [ ] T019 [US1] Integrate wallet handoff only after confirmation succeeds

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 ⚠️

- [ ] T020 [P] [US2] Intent or contract test in tests/[location]/test_[name].*
- [ ] T021 [P] [US2] Guardian or preview regression test in tests/[location]/test_[name].*
- [ ] T022 [P] [US2] Confirmation or mock-mode regression test in tests/[location]/test_[name].*

### Implementation for User Story 2

- [ ] T023 [P] [US2] Extend validated intent and quote handling for the story
- [ ] T024 [US2] Implement story-specific PTB, guardian, and preview logic
- [ ] T025 [US2] Integrate with User Story 1 components without bypassing confirmation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 ⚠️

- [ ] T026 [P] [US3] Intent or validation regression test in tests/[location]/test_[name].*
- [ ] T027 [P] [US3] End-to-end guardian, preview, and confirmation test in tests/[location]/test_[name].*

### Implementation for User Story 3

- [ ] T028 [P] [US3] Extend deterministic quote or PTB handling for the story
- [ ] T029 [US3] Implement the story without expanding beyond constitution-approved scope
- [ ] T030 [US3] Verify wallet access remains gated by confirmation only

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Constitution compliance audit across plan, spec, tasks, and implementation
- [ ] TXXX Additional regression tests for blocked execution and mock mode
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Schema and contracts before production code
- Intent and validation before quote generation
- Quote generation before PTB compilation
- Guardian before preview
- Preview before explicit confirmation
- Confirmation before wallet access
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all User Story 1 tests together:
Task: "Intent parsing test in tests/[location]/test_[name].*"
Task: "Validation or contract test in tests/[location]/test_[name].*"
Task: "PTB, guardian, preview, and confirmation flow test in tests/[location]/test_[name].*"
Task: "Failure-path or mock-mode test in tests/[location]/test_[name].*"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, or any cross-story shortcut that bypasses guardian or confirmation
