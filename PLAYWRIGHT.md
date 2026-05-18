# Playwright: From Zero to Test Engineer

> **Target app:** FastAPI Todo App at `http://localhost:8000` — independent of any external project.
>
> **Two flavors:** TypeScript (`tests/`) and Python (`tests-python/`) — same concepts, different syntax.
>
> **Your advantage:** Playwright uses native TypeScript, locators query the DOM as if you were a real user, and the API is intuitive. You don't need prior testing experience — just basic HTML knowledge.
>
> **The key insight:** Playwright thinks like a user, not like a developer. `getByRole('button', { name: 'Add' })` is better than `querySelector('#add-btn')` because if you change the ID the test still works, and if you change the visible text the test fails — which IS what you want.
>
> **See [INSTRUCTIONS.md](INSTRUCTIONS.md)** for ready-to-copy-and-paste commands.

---

## The Mental Map: Key Playwright Concepts

```
Playwright Concept               What it does
─────────────────────────────────────────────────────────────────
test()                    → Defines a test case
expect()                  → Verifies something is true
page                      → The real browser (not a simulation)
Locator                   → Smart reference to a DOM element
getByRole()               → Finds by ARIA role (accessibility)
getByTestId()             → Finds by data-testid
fixtures (page, context)  → Automatic setup/teardown with dependency injection
POM (Page Object Model)   → Class that encapsulates interaction with a page
--ui                      → Visual interactive mode to run tests
codegen                   → Records your browser actions and generates code
trace viewer              → Time travel debugging — see every test step
page.route()              → Intercepts network requests (mocking)
Playwright MCP            → Copilot controls the browser from chat
init-agents               → Planner/generator/healer for AI-powered test generation
```

---

## Phase 1 — Setup and Your First Test
**Goal:** Have a real test running against the FastAPI Todo App.

### 1.1 Workshop structure

```
playwright-workshop/
├── app/
│   ├── main.py                  ← FastAPI app (the test target)
│   └── templates/index.html     ← UI with locators documented in comments
├── tests/                       ← TypeScript Playwright
│   ├── fixtures.ts              ← base.extend() with POM + automatic teardown
│   ├── pages/TodoPage.ts        ← POM with educational comments
│   └── flows/
│       ├── todo-create.spec.ts  ← Flow 1: create todos
│       └── todo-complete.spec.ts← Flow 2: complete and delete
├── tests-python/                ← Python pytest-playwright (same flows)
│   ├── conftest.py              ← pytest fixtures with yield
│   ├── pages/todo_page.py       ← Equivalent Python POM
│   ├── test_todo_create.py
│   └── test_todo_complete.py
├── .venv/                       ← Isolated Python (not in git)
└── playwright.config.ts         ← config with webServer FastAPI
```

### 1.2 Running the tests

```bash
# TypeScript — the FastAPI app starts automatically (webServer in playwright.config.ts)
npx playwright test

# With UI mode (your new best friend)
npx playwright test --ui

# A specific file
npx playwright test tests/flows/todo-create.spec.ts

# With visible browser
npx playwright test --headed

# Python (requires active venv and running server)
source .venv/bin/activate
uvicorn app.main:app --port 8000 &
pytest tests-python/ -v
```

### 1.3 UI mode — why it's so powerful

```
--ui opens a visual panel with:
  - Tree of all tests
  - Automatic watch mode on file save
  - Test-by-test execution with click
  - Screenshot on each failed step
  - Integrated trace viewer (time travel)

Tip: always develop with --ui open
```

---

## Phase 2 — Locators: The API You'll Use the Most
**Goal:** Write locators that never break due to CSS changes or internal implementation.

### 2.1 The locator hierarchy (from best to worst)

```typescript
// ✅ BEST — by ARIA role (as a screen reader sees it)
page.getByRole('button', { name: 'Add' })
page.getByRole('textbox', { name: 'New todo' })
page.getByRole('heading', { name: 'Todo App' })
page.getByRole('status')                          // aria-live, counters
page.getByRole('list', { name: 'Todos' })

// ✅ GOOD — by label (form inputs with <label for="...">)
page.getByLabel('New todo')

// ✅ GOOD — for dynamic UI with stable test IDs
page.getByTestId('todo-item')      // requires data-testid in the HTML

// ✅ GOOD — by placeholder
page.getByPlaceholder('What needs to be done?')

// ⚠️ USE WITH CARE — by exact text (can break due to i18n)
page.getByText('Todo App')

// ❌ AVOID — fragile, tied to implementation
page.locator('#todo-input')           // if the ID changes, the test breaks
page.locator('.btn-complete:first-child') // fragile with dynamic lists
page.locator('div > span.todo-title') // fragile with CSS refactors
```

**Python version — same hierarchy, different syntax:**

```python
page.get_by_role("button", name="Add")
page.get_by_label("New todo")
page.get_by_test_id("todo-item")
page.get_by_placeholder("What needs to be done?")
page.locator("#todo-input")   # ❌ avoid just like in TS
```

### 2.2 Filtering and chaining locators
```typescript
// Filter by text inside a container
const projectCard = page
  .getByTestId('project-card')
  .filter({ hasText: 'My Startup' });

// Find within a specific component
const sidebar = page.getByRole('navigation', { name: 'Sidebar' });
const dashboardLink = sidebar.getByRole('link', { name: 'Dashboard' });

// nth() — when there are multiple elements of the same type
const firstCard = page.getByTestId('project-card').first();
const lastCard = page.getByTestId('project-card').last();
const thirdCard = page.getByTestId('project-card').nth(2); // 0-indexed

// and() — intersection (the element meets both conditions)
const checkedBox = page
  .getByRole('checkbox')
  .and(page.getByLabel('Accept terms'));
```

### 2.3 Locator assertions
```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// Text
await expect(locator).toHaveText('Value Proposition');
await expect(locator).toContainText('Proposition');  // substring
await expect(locator).toHaveText(/value/i);          // regex

// Input state
await expect(input).toHaveValue('entered text');
await expect(checkbox).toBeChecked();
await expect(button).toBeDisabled();
await expect(button).toBeEnabled();

// Count
await expect(page.getByTestId('project-card')).toHaveCount(3);

// Attributes
await expect(link).toHaveAttribute('href', '/dashboard');

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/dashboard/);
```

### Practice 2 — Explore the app with codegen

```bash
# codegen = the inspector that writes tests for you
npx playwright codegen http://localhost:8000

# This opens:
# 1. A browser where you interact normally with the Todo App
# 2. A panel that WRITES the TypeScript test as you click
#
# Use it to:
# a) Discover what locators Playwright generates for the elements
# b) Compare generated locators vs POM locators (are they the same?)
# c) Generate a quick draft and then refactor it into the POM
```

---

## Phase 3 — Page Object Model (POM)
**Goal:** Organize tests so that a UI change doesn't break 10 tests.

### 3.1 The problem without POM

```typescript
// ❌ WITHOUT POM — if the "Add" button changes to "Create", you need to edit 5 files
// todo-create.spec.ts
await page.getByRole('button', { name: 'Add' }).click();

// todo-complete.spec.ts
await page.getByRole('button', { name: 'Add' }).click();

// another-spec.spec.ts
await page.getByRole('button', { name: 'Add' }).click();
```

### 3.2 The solution: Page Object

```typescript
// tests/pages/TodoPage.ts — see the actual file with detailed comments
import { type Page, type Locator } from '@playwright/test';

export class TodoPage {
  readonly newTodoInput: Locator;
  readonly addButton: Locator;
  readonly todoItems: Locator;
  readonly itemCount: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByLabel('New todo');          // accessibility
    this.addButton    = page.getByRole('button', { name: 'Add' }); // ARIA role
    this.todoItems    = page.getByTestId('todo-item');        // data-testid
    this.itemCount    = page.getByRole('status');             // aria-live
  }

  async goto() {
    await this.page.goto('/');  // baseURL = http://localhost:8000
  }

  async addTodo(title: string) {
    await this.newTodoInput.fill(title);
    await this.addButton.click();
  }

  async completeTodo(title: string) {
    const item = this.todoItems.filter({ hasText: title });
    await item.getByRole('button', { name: new RegExp(`Complete: ${title}`) }).click();
  }

  async resetViaApi() {
    // Clean state via REST API — faster than clicking on each item
    await this.page.request.delete('/api/todos');
  }
}
```

**Equivalent Python version** — see [tests-python/pages/todo_page.py](tests-python/pages/todo_page.py)

```python
class TodoPage:
    def __init__(self, page: Page) -> None:
        self.new_todo_input = page.get_by_label("New todo")
        self.add_button     = page.get_by_role("button", name="Add")
        self.todo_items     = page.get_by_test_id("todo-item")
        self.item_count     = page.get_by_role("status")

    def add_todo(self, title: str) -> None:
        self.new_todo_input.fill(title)
        self.add_button.click()
```

### 3.3 POM with fixtures (the advanced pattern Playwright recommends)

```typescript
// tests/fixtures.ts — see the actual file
import { test as base, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

type WorkshopFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<WorkshopFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await use(todoPage); // ← the test runs here

    // Automatic teardown — runs even if the test fails
    await todoPage.resetViaApi();
  },
});

export { expect };
```

```typescript
// tests/flows/todo-create.spec.ts
import { test, expect } from '../fixtures';

test.describe('Flow 1 — Create todos', () => {
  test('adding a todo shows it in the list', async ({ todoPage }) => {
    await todoPage.addTodo('Learn Playwright');

    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText('Learn Playwright');
  });

  test('the counter shows active items', async ({ todoPage }) => {
    await todoPage.addMultipleTodos(['Task 1', 'Task 2', 'Task 3']);
    await expect(todoPage.itemCount).toHaveText('3 items left');
  });
});
```

**Python version — conftest.py** — see [tests-python/conftest.py](tests-python/conftest.py)

```python
@pytest.fixture
def todo_page(page: Page):
    todo = TodoPage(page)
    todo.goto()
    yield todo          # ← the test runs here
    todo.reset_via_api()  # automatic teardown
```

---

## Phase 4 — Advanced Debugging
**Goal:** When a test fails, know exactly what happened.

### 4.1 Trace Viewer — Playwright's time travel

```bash
# Always generate traces (playwright.config.ts already has trace: 'on-first-retry')
npx playwright test --trace on

# Open the trace from the last run
npx playwright show-trace test-results/*/trace.zip
```

The trace viewer shows:
- Screenshot for each action (hover, click, fill)
- The DOM state at each moment
- Network requests in the timeline
- Console logs and errors

### 4.2 Step-by-step debugging

```bash
# Debug mode: opens the inspector and pauses before the first step
npx playwright test --debug

# Debug a specific test
npx playwright test tests/flows/todo-create.spec.ts --debug

# Pause at a specific point in the test
test('my test', async ({ page }) => {
  await page.goto('/');
  await page.pause();  // PAUSES HERE — inspect the DOM manually
  await page.getByRole('button', { name: 'Add' }).click();
});
```

### 4.3 Automatic screenshots and videos

```typescript
// playwright.config.ts — already configured this way in the workshop
use: {
  baseURL: 'http://localhost:8000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',  // automatic screenshot on failure
  video: 'retain-on-failure',     // video of the failed test
},
```

---

## Phase 5 — Final Workshop Structure
**Goal:** Have the complete workshop structure consolidated and ready to scale.

### 5.1 The actual project structure

```
playwright-workshop/
├── app/
│   ├── main.py                  ← FastAPI app (the test target)
│   └── templates/index.html     ← UI with locators documented in HTML comments
├── tests/                       ← TypeScript Playwright (built during the workshop)
│   ├── fixtures.ts              ← base.extend() with POM + automatic teardown
│   ├── pages/
│   │   └── TodoPage.ts          ← POM with commented locators
│   └── flows/
│       ├── todo-create.spec.ts  ← Flow 1: create todos
│       └── todo-complete.spec.ts← Flow 2: complete and delete (+ mocks)
├── tests-python/                ← Python pytest-playwright (same flows)
│   ├── conftest.py              ← pytest fixtures with yield + teardown
│   ├── pages/todo_page.py       ← Equivalent Python POM
│   ├── test_todo_create.py
│   └── test_todo_complete.py
├── solutions/                   ← Reference: full implementation
│   ├── tests/
│   └── tests-python/
├── specs/                       ← Test plans generated by the planner agent
├── .github/
│   ├── agents/                  ← planner, generator, healer
│   ├── copilot-instructions.md  ← QA expert persona (always active)
│   └── workflows/copilot-setup-steps.yml
├── .venv/                       ← Isolated Python (not in git)
├── .vscode/mcp.json             ← Playwright MCP + playwright-test MCP + Context7
├── playwright.config.ts         ← baseURL, webServer FastAPI, trace/video
├── pytest.ini
├── PROGRESS.md                  ← your progress tracking
└── INSTRUCTIONS.md              ← AI-first guide, phase by phase
```

### 5.2 playwright.config.ts — what each section does

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,           // all tests in parallel
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:8000',  // never write the URL in your tests
    trace: 'on-first-retry',           // automatic trace on retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // The FastAPI app starts automatically before the tests
  webServer: {
    command: '.venv/bin/uvicorn app.main:app --port 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: true,   // if already running, don't restart it
  },
});
```

---

## Phase 6 — Playwright Agents: planner / generator / healer
**Goal:** Use the three Playwright agents from Copilot Chat to generate, maintain, and repair tests with AI.

### 6.1 The three agents

| Agent | File | What it does |
|---|---|---|
| **planner** | `.github/agents/playwright-test-planner.agent.md` | Navigates the app with the MCP and generates a test plan in `specs/` |
| **generator** | `.github/agents/playwright-test-generator.agent.md` | Converts a `.md` plan from `specs/` into a real `.spec.ts` |
| **healer** | `.github/agents/playwright-test-healer.agent.md` | When a test fails, repairs it automatically |

### 6.2 The complete AI workflow

```
1. You describe a new flow in Copilot Chat
        ↓
2. Planner navigates http://localhost:8000, inspects the DOM
   and writes specs/my-flow.md with the test plan
        ↓
3. Generator reads specs/my-flow.md
   and writes tests/flows/my-flow.spec.ts
        ↓
4. You run: npx playwright test tests/flows/my-flow.spec.ts
        ↓
5. If it fails → Healer reads the error + the trace
   and repairs the test automatically
```

### 6.3 How to invoke each agent from Copilot Chat

```
# Planner — in Copilot Chat, agent mode
"Generate a test plan for the todo creation flow"
"Plan tests for completing and deleting todos"

# Generator — after the planner wrote the plan
"Generate tests from specs/todo-create-plan.md"

# Healer — when a test fails
"Fix the failing test in tests/flows/todo-complete.spec.ts"
"The test 'completes a todo' is failing after the last change, fix it"
```

### 6.4 When to use each agent

```typescript
// Planner: when you're starting a new flow and don't know what to test
// → gives you the plan, you review it before generating code

// Generator: when you have the plan and want the spec
// → generates the .spec.ts using the real locators from the app

// Healer: when a test passes locally but fails in CI,
// or when a UI change breaks a selector
// → reads the trace viewer and proposes the fix
```

---

## Verification Checklist

### Did I complete Phase 1?
- [ ] Ran `npx playwright test` and saw the tests pass
- [ ] Opened UI mode with `npx playwright test --ui` and explored the test tree
- [ ] Used `npx playwright codegen http://localhost:8000` and recorded interactions

### Did I complete Phase 2?
- [ ] I understand why `getByRole()` is preferable to `locator('#todo-input')`
- [ ] Asked Copilot to generate locators for at least 3 app elements
- [ ] Can combine locators with `.filter()`, `.first()`, `.nth()`

### Did I complete Phase 3?
- [ ] Generated `tests/pages/TodoPage.ts` with Copilot
- [ ] Generated `tests/fixtures.ts` with `base.extend()` and teardown via `DELETE /api/todos`
- [ ] Understand why teardown uses the API instead of UI clicks

### Did I complete Phase 4?
- [ ] Generated both flow specs with Copilot and ran them successfully
- [ ] At least one test uses `page.route()` to mock an API response
- [ ] Was able to open a trace of a failed test with `npx playwright show-trace`

### Did I complete Phases 5-6?
- [ ] Generated the same flows in Python (`tests-python/`) with Copilot
- [ ] Used the planner agent to generate a test plan in `specs/`
- [ ] Used the generator agent to convert the plan into a `.spec.ts`
- [ ] Used the Playwright MCP so Copilot navigates the app and takes screenshots

---

## Quick Command Reference

```bash
# Run all TypeScript tests
npx playwright test

# UI mode (recommended for learning)
npx playwright test --ui

# A specific file
npx playwright test tests/flows/todo-create.spec.ts

# A test by name (grep)
npx playwright test -g "add a todo"

# With visible browser
npx playwright test --headed

# Debug (pauses at each step)
npx playwright test --debug

# Generate test from the app (codegen)
npx playwright codegen http://localhost:8000

# View trace from the last run
npx playwright show-trace test-results/*/trace.zip

# View HTML report
npx playwright show-report

# Python tests (requires active venv and running server)
source .venv/bin/activate
uvicorn app.main:app --port 8000 &
pytest tests-python/ -v
pytest tests-python/test_todo_create.py -v  # a single file
```

---

## Locator Reference (for bookmarking)

```typescript
// By ARIA role — the best
page.getByRole('button', { name: 'Add' })
page.getByRole('textbox', { name: 'New todo' })
page.getByRole('heading', { name: 'Todo App' })
page.getByRole('status')                            // aria-live (counters)
page.getByRole('list', { name: 'Todos' })
page.getByRole('dialog')                            // modals
page.getByRole('navigation')                        // <nav>
page.getByRole('alert')                             // error messages

// By label (forms)
page.getByLabel('New todo')

// By placeholder
page.getByPlaceholder('What needs to be done?')

// By data-testid (for elements without clear ARIA semantics)
page.getByTestId('todo-item')

// By visible text
page.getByText('Todo App')
page.getByText(/complete/i)  // case-insensitive with regex

// Combined — filter within a container
page.getByTestId('todo-item').filter({ hasText: 'Learn Playwright' })
page.getByTestId('todo-item').first()
page.getByTestId('todo-item').nth(2)   // 0-indexed
```

---

> **The workshop workflow:** Open the app at `http://localhost:8000`. Open `--ui` mode. Ask Copilot to generate the next test. Watch it run. If it fails, use `--debug` or the trace viewer to understand why. If you want to scale, activate the planner to generate the plan and the generator to write the spec. This is how you automate with AI in 2026.
