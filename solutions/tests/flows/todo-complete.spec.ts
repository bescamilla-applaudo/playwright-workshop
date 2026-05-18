/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Flow 2 — Complete and Delete Todos
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * What you'll learn reading this file:
 *   - Chaining locators: .filter({ hasText }) + .getByRole() inside the item
 *   - State assertions: toBeDisabled(), toHaveAttribute(), toHaveClass()
 *   - Intercepting API requests with page.route() for tests without a real server
 *   - When to mock vs when to test real end-to-end
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../fixtures';

test.describe('Flow 2 — Complete and delete todos', () => {

  test('completing a todo strikes through the text', async ({ todoPage }) => {
    await todoPage.addTodo('Hacer ejercicio');

    // Complete the todo using the POM method
    await todoPage.completeTodo('Hacer ejercicio');

    // The span with class .completed has text-decoration: line-through
    const titleEl = todoPage.todoItems
      .filter({ hasText: 'Hacer ejercicio' })
      .locator('.todo-title');

    await expect(titleEl).toHaveClass(/completed/);
  });

  test('completing a todo updates the counter', async ({ todoPage }) => {
    await todoPage.addMultipleTodos(['Task 1', 'Task 2', 'Task 3']);

    await expect(todoPage.itemCount).toHaveText('3 items left');

    await todoPage.completeTodo('Task 1');
    await expect(todoPage.itemCount).toHaveText('2 items left');

    await todoPage.completeTodo('Task 2');
    await expect(todoPage.itemCount).toHaveText('1 item left');
  });

  test('the complete button becomes disabled after use', async ({ todoPage }) => {
    await todoPage.addTodo('Tarea única');

    const item = todoPage.todoItems.filter({ hasText: 'Tarea única' });
    const completeBtn = item.getByRole('button', { name: /Complete: Tarea única/ });

    // Before: enabled
    await expect(completeBtn).toBeEnabled();

    await completeBtn.click();

    // After: disabled (disabled=true in the HTML)
    await expect(completeBtn).toBeDisabled();
  });

  test('deleting a todo removes it from the list', async ({ todoPage }) => {
    await todoPage.addMultipleTodos(['Borrar esto', 'Mantener esto']);

    await todoPage.deleteTodo('Borrar esto');

    // Verify it no longer exists
    await expect(todoPage.todoItems.filter({ hasText: 'Borrar esto' })).toHaveCount(0);

    // Verify the other one is still there
    await expect(todoPage.todoItems.filter({ hasText: 'Mantener esto' })).toBeVisible();
  });

  test('deleting all todos leaves the list empty', async ({ todoPage }) => {
    await todoPage.addTodo('Solo uno');
    await todoPage.deleteTodo('Solo uno');

    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemCount).toHaveText('0 items left');
  });

  test('MOCK API: simulate server error', async ({ todoPage, page }) => {
    /**
     * page.route() intercepts network requests.
     * Useful for:
     *   - Testing error handling without breaking the real server
     *   - Fast and deterministic tests (no latency)
     *   - Simulating edge cases (504, timeout, malformed response)
     */
    await page.route('**/api/todos', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Internal Server Error' }),
        });
      } else {
        route.continue(); // GET passes through normally
      }
    });

    await page.goto('/');
    await todoPage.newTodoInput.fill('Este todo fallará');
    await todoPage.addButton.click();

    // The UI should not add the item because the POST failed
    // (the JavaScript does fetch and doesn't add the item if there's an error)
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  test('MOCK API: pre-loaded response without server', async ({ page }) => {
    /**
     * We intercept the initial GET to return fixed data.
     * The test doesn't need the server running — ideal for
     * pure UI tests where the initial state comes from the backend.
     */
    await page.route('**/api/todos', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', title: 'Todo mockeado 1', completed: false },
          { id: '2', title: 'Todo mockeado 2', completed: true },
        ]),
      });
    });

    await page.goto('/');

    // The 2 mocked todos should appear
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByTestId('todo-item').filter({ hasText: 'Todo mockeado 1' })).toBeVisible();

    // The second has completed:true — should have 'completed' class
    const secondTitle = page
      .getByTestId('todo-item')
      .filter({ hasText: 'Todo mockeado 2' })
      .locator('.todo-title');
    await expect(secondTitle).toHaveClass(/completed/);
  });
});
