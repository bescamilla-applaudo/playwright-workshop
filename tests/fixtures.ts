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
    // Ensure UI reflects clean state by reloading or waiting for empty
    await page.reload();
    await expect(todoPage.todoItems).toHaveCount(0);

    await use(todoPage);

    // Teardown: Clean after test to leave environment ready
    await todoPage.resetViaApi();
  },
});

export { expect };
