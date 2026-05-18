import { test as base, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

export type WorkshopFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<WorkshopFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    
    // Setup: Navigate and clean before test
    await todoPage.goto();
    await todoPage.resetViaApi();
    await page.reload(); // Ensure UI reflects clean state

    await use(todoPage);

    // Teardown: Clean after test to leave environment ready
    await todoPage.resetViaApi();
  },
});

export { expect };
