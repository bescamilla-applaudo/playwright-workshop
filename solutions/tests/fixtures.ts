/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixtures — extends the base Playwright test with custom POMs
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * base.extend<T>() is Dependency Injection for tests:
 *   - Each fixture receives { page } (or other fixtures) and calls `use(value)`
 *   - Code AFTER `use()` runs as teardown (afterEach)
 *   - Tests simply declare which fixtures they need in their signature
 *
 * Benefit: tests don't know HOW the POM is built or how it's cleaned up.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

// Explicit typing of all custom fixtures
type WorkshopFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<WorkshopFixtures>({
  /**
   * Fixture `todoPage`:
   *   1. Creates the POM with the browser `page`
   *   2. Navigates to '/' automatically
   *   3. Hands the POM to the test via `use()`
   *   4. Teardown: clears all todos via API to isolate the next test
   */
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();

    await use(todoPage); // ← the test runs here

    // Automatic teardown — runs even if the test fails
    await todoPage.resetViaApi();
  },
});

// Re-export expect so specs only import from here
export { expect };
