# Playwright Workshop — AI-First Guide

> **Recommended model:** Gemini 3 Flash (0.33x multiplier) for learning chat.
> For agents (planner/generator/healer): Claude Sonnet 4.6 or GPT-5.4 (better tool calling).
>
> **How to use this file:** Each phase has ready-to-use prompts for Copilot Chat.
> Copy the prompt, send it, read the generated response, run the validation command.
> If you get stuck: `solutions/` has the full reference implementation.

---

## Initial Setup (one time only)

```bash
# 1. Install Node dependencies
npm install

# 2. Install Playwright browsers and system dependencies
npx playwright install chromium
npx playwright install-deps chromium

# 3. Activate Python environment
source .venv/bin/activate

# 4. Verify the app starts
uvicorn app.main:app --reload
# → open http://localhost:8000 — add/complete/delete a todo manually
```

---

## Phase 1 — Explore the app and record your first test
**Goal:** Understand the Todo App as a user and generate code with codegen.

### Exercise 1.1 — Codegen
```bash
npx playwright codegen http://localhost:8000
```
1. Add 2 todos ("Buy coffee", "Call the doctor")
2. Complete the first one
3. Delete the second one
4. Observe the code generated in the right panel
5. Close codegen — don't save anything yet

### Exercise 1.2 — First prompt to Copilot

> **Prompt (copy verbatim to Copilot Chat):**
> ```
> Review app/templates/index.html and explain what ARIA attributes the app has
> that are useful as Playwright locators. List each interactive element
> with its recommended locator in priority order (getByRole > getByLabel > getByTestId).
> ```

**Validation:** The response should mention at least: `getByLabel('New todo')`, `getByRole('button', { name: 'Add' })`, `getByTestId('todo-item')`, `getByRole('status')`.

### Exercise 1.3 — Run the seed test
```bash
npx playwright test tests/seed.spec.ts --headed
```
The test is empty — you'll see it pass (it does nothing). This confirms the setup works.

---

## Phase 2 — Locators: the 5 types
**Goal:** Generate a spec that demonstrates the 5 locator types against the real app.

> **Prompt (copy verbatim to Copilot Chat):**
> ```
> Generate a file tests/locators-demo.spec.ts that demonstrates the 5 Playwright
> locator types against http://localhost:8000 (the app already has baseURL configured).
>
> The spec should have 5 tests inside a describe "Locators Demo":
> 1. getByRole — locate the Add button and the Todo App heading
> 2. getByLabel — locate the input by its label "New todo"
> 3. getByTestId — locate todo-items after adding one
> 4. getByText — locate visible static text
> 5. locator() with CSS — same Add button but with a CSS selector (with a comment explaining why it's worse)
>
> Each test should perform at least one action and one assertion with expect().
> Import test and expect directly from @playwright/test (no fixtures yet).
> ```

**Validation:**
```bash
npx playwright test tests/locators-demo.spec.ts --headed
```
All 5 tests should pass. Watch the browser executing each one.

### Exercise 2.2 — Break and diagnose

> **Prompt:**
> ```
> In tests/locators-demo.spec.ts, change the getByRole test to use
> locator('button') instead of getByRole('button', { name: 'Add' }).
> Explain why this is fragile if the app had more than one button.
> ```

**Validation:** Revert the change after understanding the explanation.

---

## Phase 3 — Page Object Model (POM)
**Goal:** Generate the complete POM and understand why it centralizes locators.

> **Prompt (copy verbatim):**
> ```
> Generate tests/pages/TodoPage.ts — a Page Object Model for the FastAPI Todo App.
>
> Requirements:
> - Locators as readonly properties in the constructor
> - Methods: goto(), addTodo(title), completeTodo(title), deleteTodo(title), resetViaApi()
> - resetViaApi() uses page.request.delete('/api/todos') to clean state
> - Use the locator hierarchy: getByRole > getByLabel > getByTestId
> - Add a brief comment explaining why you chose each locator
>
> Then generate tests/fixtures.ts that:
> - Extends base with base.extend<{ todoPage: TodoPage }>()
> - The todoPage fixture navigates to /, uses the test, and calls resetViaApi() in teardown
> - Exports test and expect
>
> Explain afterwards: why is API teardown better than clicking to clean up?
> ```

**Validation:**
```bash
npx playwright test tests/seed.spec.ts
```
Should compile without errors (the seed test doesn't use the fixture yet, but this confirms there are no TypeScript errors).

### Exercise 3.2 — Compare with the solution
Open `solutions/tests/pages/TodoPage.ts` and `solutions/tests/fixtures.ts`. Compare with what was generated.

---

## Phase 4 — Flow 1: Create todos
**Goal:** Your first real flow spec using the POM and fixtures.

> **Prompt (copy verbatim):**
> ```
> Generate tests/flows/todo-create.spec.ts using the fixtures from tests/fixtures.ts.
>
> The spec should cover these behaviors inside a describe "Create Todos":
> 1. "adds a todo and it appears in the list"
> 2. "adds multiple todos and the counter updates"
> 3. "does not add an empty todo" (empty input, click Add, list doesn't change)
> 4. "the new todo shows the exact text entered"
>
> Use todoPage from the fixture. Import test and expect from '../fixtures'.
> Each test must be independent (the fixture resets via API automatically).
> ```

**Validation:**
```bash
npx playwright test tests/flows/todo-create.spec.ts --headed
```
All 4 tests should pass. If any fail, copy the error to Copilot and ask it to fix it.

---

## Phase 5 — Flow 2: Complete and delete + Mocks
**Goal:** Complex flow tests + intercepting the network with `page.route()`.

> **Prompt (copy verbatim):**
> ```
> Generate tests/flows/todo-complete.spec.ts using fixtures from tests/fixtures.ts.
>
> Behaviors to test in describe "Complete and Delete":
> 1. "completes a todo and its visual style changes" (line-through or class)
> 2. "deletes a todo and it disappears from the list"
> 3. "completing reduces the active items counter"
>
> Add a second describe "API Mock" with:
> 4. "simulates 500 error on create — the UI should handle the error"
>    (use page.route to intercept POST /api/todos and return 500)
> 5. "simulates pre-loaded response — the list shows fixed data"
>    (use page.route to intercept GET /api/todos and return JSON with 2 items)
>
> Import test and expect from '../fixtures'. Use todoPage from the fixture.
> For mocks, access page via todoPage.page or destructure { page } from the test.
> ```

**Validation:**
```bash
npx playwright test tests/flows/todo-complete.spec.ts --headed
```

### Exercise 5.2 — Understand page.route()

> **Prompt:**
> ```
> Explain the difference between route.fulfill(), route.continue() and route.abort()
> with an example of each applied to the Todo App.
> ```

---

## Phase 6 — Debugging: trace viewer and page.pause()
**Goal:** Diagnose a failing test like a senior QA.

### Exercise 6.1 — Break on purpose
1. In `tests/flows/todo-create.spec.ts`, change a locator so it fails (e.g., `{ name: 'AddXXX' }`)
2. Run it:
```bash
npx playwright test tests/flows/todo-create.spec.ts --trace on
```
3. Open the trace:
```bash
npx playwright show-trace test-results/*/trace.zip
```
4. Observe: the screenshot at the moment of failure, the DOM, the action timeline.

### Exercise 6.2 — page.pause()
Add `await page.pause();` before an assertion in any test. Run with `--headed`. The browser pauses and opens the Playwright Inspector — you can inspect the live DOM.

### Exercise 6.3 — Ask Copilot for a diagnosis

> **Prompt (when a test fails):**
> ```
> This test is failing with the following error:
> [paste the terminal error]
>
> The spec is tests/flows/todo-create.spec.ts.
> Diagnose the root cause and propose the minimal fix.
> ```

---

## Phase 7 — Playwright Agents: planner / generator / healer
**Goal:** Use AI to plan, generate, and repair tests automatically.

### Exercise 7.1 — Planner

> **Switch the model → Claude Sonnet 4.6 or GPT-5.4**
> Agents (planner, generator, healer) use intensive tool calling to navigate the browser and read/write files.
> Gemini 3 Flash may fail silently on long tool sequences.

In Copilot Chat, select the `playwright-test-planner` agent:
> **Prompt:**
> ```
> Generate a test plan for the complete CRUD flow of the Todo app at localhost:8000.
> Include edge cases like empty input, duplicate names, and rapid successive clicks.
> Save the plan to specs/crud-flow.md
> ```

Review the generated plan in `specs/crud-flow.md`.

### Exercise 7.2 — Generator

Select the `playwright-test-generator` agent:
> **Prompt:**
> ```
> Generate tests from specs/crud-flow.md into tests/flows/crud-flow.spec.ts.
> Use the fixtures from tests/fixtures.ts and the TodoPage POM.
> ```

**Validation:**
```bash
npx playwright test tests/flows/crud-flow.spec.ts
```

### Exercise 7.3 — Healer

If any test from the generator fails, select the `playwright-test-healer` agent:
> **Prompt:**
> ```
> Fix the failing test in tests/flows/crud-flow.spec.ts
> ```

---

## Phase 8 — Python: same flows, sync API
**Goal:** Reproduce what you did in TypeScript using pytest-playwright.

> **Prompt (copy verbatim):**
> ```
> Generate the Python equivalent of the workshop:
> 1. tests-python/pages/todo_page.py — POM with the same methods (sync API)
> 2. tests-python/conftest.py — pytest fixtures with yield and API teardown
> 3. tests-python/test_todo_create.py — same 4 tests from Flow 1
> 4. tests-python/test_todo_complete.py — same 5 tests from Flow 2 (including mocks)
>
> Use sync API (page.goto, not await page.goto).
> The fastapi_server fixture should start the server with subprocess.
> ```

**Validation:**
```bash
source .venv/bin/activate && pytest tests-python/ -v
```

---

## Phase 9 — Playwright MCP: Copilot controls the browser
**Goal:** Use the MCP so Copilot navigates, inspects, and generates tests from the real browser.

Verify the MCP is active in `.vscode/mcp.json` (server `playwright`).

> **Prompt 1:**
> ```
> Navigate to http://localhost:8000, add a todo "Test from MCP" and take a screenshot.
> ```

> **Prompt 2:**
> ```
> Inspect the DOM of the add todo form. List all accessible locators
> you find for each interactive element.
> ```

> **Prompt 3:**
> ```
> Based on what you see in the browser, generate a test that validates that the
> input placeholder says the right thing and the Add button is enabled by default.
> ```

---

## Project Structure

```
playwright-workshop/
├── app/                             ← TARGET: the app under test
│   ├── main.py                      ← FastAPI CRUD + reset endpoint
│   └── templates/index.html         ← UI with ARIA attrs documented
├── tests/                           ← YOUR WORK: you generate everything here
│   └── seed.spec.ts                 ← Entry point (empty stub)
├── tests-python/                    ← YOUR WORK: Python equivalent
├── solutions/                       ← REFERENCE: do not modify
│   ├── tests/                       ← Complete TS specs
│   └── tests-python/                ← Complete Python specs
├── specs/                           ← Test plans (generated by planner)
├── .github/
│   ├── agents/                      ← planner, generator, healer
│   └── copilot-instructions.md      ← QA persona (always active)
├── .vscode/mcp.json                 ← Playwright MCP + Context7
├── playwright.config.ts             ← baseURL + webServer FastAPI
├── PROGRESS.md                      ← Your progress tracking
└── PLAYWRIGHT.md                    ← Full theory reference
```

---

## Quick Commands

| Action | Command |
|---|---|
| Start app | `source .venv/bin/activate && uvicorn app.main:app --reload` |
| TS tests (all) | `npx playwright test` |
| TS tests (UI mode) | `npx playwright test --ui` |
| TS tests (headed) | `npx playwright test --headed` |
| TS tests (debug) | `npx playwright test --debug` |
| TS tests (trace) | `npx playwright test --trace on` |
| View trace | `npx playwright show-trace test-results/*/trace.zip` |
| Codegen | `npx playwright codegen http://localhost:8000` |
| View report | `npx playwright show-report` |
| Python tests | `source .venv/bin/activate && pytest tests-python/ -v` |

---

## Tips for Gemini 3 Flash

- It's excellent for generating test code — follows structural instructions well.
- If the response is incomplete, add "Complete the file, don't leave TODOs".
- For conceptual explanations, it works as well as more expensive models.
- If a prompt fails: resend it with the error pasted — Flash self-corrects well.
- For agents (planner/generator/healer), switch to Claude Sonnet 4.6 (requires robust tool calling).
