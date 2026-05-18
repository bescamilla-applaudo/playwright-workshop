# Playwright Workshop — My Progress

> **How to use this file:**
> Update the checkboxes `[ ]` → `[x]` as you complete each item.
> When you resume the workshop, tell Copilot:
> _"Check PROGRESS.md and let's continue from where I left off"_
>
> **Model:** Gemini 3 Flash for chat. Claude Sonnet 4.6 for agents.

---

## Current Status

**Active phase:** Phase 1 — Explore the app and first test
**Last action:** Workshop set up, ready to start

---

## Phase 1 — Explore the app and record your first test

- [ ] Started the app: `source .venv/bin/activate && uvicorn app.main:app --reload`
- [ ] Tested the app manually at `http://localhost:8000` (create, complete, delete)
- [ ] Ran codegen: `npx playwright codegen http://localhost:8000` and recorded a flow
- [ ] Sent the prompt from INSTRUCTIONS.md §1.2 (ARIA locators of the app) and read the response
- [ ] Ran the seed test: `npx playwright test tests/seed.spec.ts --headed`
- [ ] Understood: the app starts automatically via `webServer` in `playwright.config.ts`

**Validation:** `npx playwright test` shows 1 test passing (empty seed).

---

## Phase 2 — Locators: the 5 types

- [ ] Sent the prompt from INSTRUCTIONS.md §2 and Copilot generated `tests/locators-demo.spec.ts`
- [ ] Ran: `npx playwright test tests/locators-demo.spec.ts --headed` — 5 tests pass
- [ ] Did exercise 2.2 (break a locator) and understood why `getByRole` > CSS
- [ ] Can explain when to use each locator type without looking at the reference

**Validation:** `npx playwright test tests/locators-demo.spec.ts` — 5/5 pass.

---

## Phase 3 — Page Object Model (POM)

- [ ] Sent the prompt from INSTRUCTIONS.md §3 and got `tests/pages/TodoPage.ts` + `tests/fixtures.ts`
- [ ] Reviewed the generated POM: has `readonly` locators, async methods, `resetViaApi()`
- [ ] Understood: teardown via API is faster and more reliable than UI clicks
- [ ] Compared with `solutions/tests/pages/TodoPage.ts` — differences noted below

**Validation:** `npx playwright test tests/seed.spec.ts` — still compiles without errors.

---

## Phase 4 — Flow 1: Create todos

- [ ] Sent the prompt from INSTRUCTIONS.md §4 and got `tests/flows/todo-create.spec.ts`
- [ ] Ran: `npx playwright test tests/flows/todo-create.spec.ts --headed` — all pass
- [ ] Each test is independent (fixture resets state)
- [ ] If something failed, pasted the error to Copilot and it fixed it

**Validation:** `npx playwright test tests/flows/todo-create.spec.ts` — 4/4 pass.

---

## Phase 5 — Flow 2: Complete/delete + Mocks

- [ ] Sent the prompt from INSTRUCTIONS.md §5 and got `tests/flows/todo-complete.spec.ts`
- [ ] All 3 flow tests pass (complete, delete, counter)
- [ ] Both mock tests pass (`page.route` intercepts correctly)
- [ ] Sent prompt §5.2 and understood `fulfill()` vs `continue()` vs `abort()`

**Validation:** `npx playwright test tests/flows/todo-complete.spec.ts` — 5/5 pass.

---

## Phase 6 — Debugging

- [ ] Broke a locator on purpose and ran with `--trace on`
- [ ] Opened the trace viewer and found the screenshot at the moment of failure
- [ ] Used `page.pause()` and explored the live DOM with the Inspector
- [ ] Asked Copilot to diagnose the error (prompt §6.3) and it fixed it

**Validation:** Successfully broke, diagnosed, and repaired a test without help from solutions/.

---

## Phase 7 — Playwright Agents (planner/generator/healer)

- [ ] Switched model to Claude Sonnet 4.6 in the model picker
- [ ] Used planner: generated plan in `specs/crud-flow.md`
- [ ] Used generator: converted plan into `tests/flows/crud-flow.spec.ts`
- [ ] Generated tests pass (or fixed them with healer)
- [ ] Broke a test and used healer to repair it automatically

**Validation:** `npx playwright test tests/flows/crud-flow.spec.ts` — passes.

---

## Phase 8 — Python: same flows, sync API

- [ ] Sent the prompt from INSTRUCTIONS.md §8 and got the 4 Python files
- [ ] Ran: `source .venv/bin/activate && pytest tests-python/ -v` — all pass
- [ ] Compared Python API (`get_by_role`) vs TypeScript (`getByRole`)
- [ ] Compared with `solutions/tests-python/`

**Validation:** `pytest tests-python/ -v` — all tests pass.

---

## Phase 9 — Playwright MCP: browser control

- [ ] Copilot navigated to localhost:8000 via MCP and took a screenshot
- [ ] Copilot inspected the DOM and listed accessible locators
- [ ] Copilot generated a test based on what it saw in the browser
- [ ] Understood: MCP `playwright` = browser control, `playwright-test` = run tests

**Validation:** A test generated via MCP passes when run locally.

---

## Final Summary

| Topic | Status | Confidence (1-5) |
|---|---|---|
| Locators (ARIA, label, testid, text, CSS) | ⬜ pending | — |
| Page Object Model | ⬜ pending | — |
| Fixtures and teardown | ⬜ pending | — |
| E2E flow tests | ⬜ pending | — |
| API mocking with `page.route()` | ⬜ pending | — |
| Debugging + Trace Viewer | ⬜ pending | — |
| Playwright Agents (planner/generator/healer) | ⬜ pending | — |
| pytest-playwright (Python) | ⬜ pending | — |
| Playwright MCP | ⬜ pending | — |

> Completed when all rows have ✅ and confidence ≥ 4
