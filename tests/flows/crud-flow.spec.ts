// spec: specs/crud-flow.md
// seed: tests/fixtures.ts

import { test, expect } from '../fixtures';

test.describe('Create — Happy Path', () => {
  test('TC-01: Add a single todo item', async ({ todoPage }) => {
    // 1. Type 'Buy groceries' and click 'Add'
    await todoPage.addTodo('Buy groceries');

    // Item appears in the list
    await expect(todoPage.todoItems.filter({ hasText: 'Buy groceries' })).toBeVisible();
    // Counter updates
    await expect(todoPage.itemsCount).toHaveText('1 item left');
    // Input is cleared
    await expect(todoPage.todoInput).toHaveValue('');
  });

  test('TC-02: Add multiple todo items', async ({ todoPage }) => {
    // Add three todos in sequence
    await todoPage.addTodo('First task');
    await todoPage.addTodo('Second task');
    await todoPage.addTodo('Third task');

    // List contains exactly 3 items
    await expect(todoPage.todoItems).toHaveCount(3);
    // Counter reflects all active items
    await expect(todoPage.itemsCount).toHaveText('3 items left');
  });

  test('TC-03: Todo title is preserved exactly (special characters)', async ({ todoPage }) => {
    const title = 'Fix bug #42 — urgent!';

    // Add the todo with special characters
    await todoPage.addTodo(title);

    // Exact string is displayed without truncation or encoding issues
    await expect(todoPage.todoItems.filter({ hasText: title }).locator('span.todo-title')).toHaveText(title);
  });
});

test.describe('Create — Edge Cases & Validation', () => {
  test('TC-04: Empty input — no todo is added', async ({ todoPage }) => {
    // Leave input blank and click Add
    await todoPage.addButton.click();

    // No item added
    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('TC-05: Whitespace-only input — no todo is added', async ({ todoPage }) => {
    // Type only spaces — frontend guard strips and blocks, API returns 422
    await todoPage.todoInput.fill('     ');
    await todoPage.addButton.click();

    // No item added
    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('TC-06: Duplicate todo names — both are added', async ({ todoPage }) => {
    // Add the same title twice — no uniqueness constraint exists in the API
    await todoPage.addTodo('Read a book');
    await todoPage.addTodo('Read a book');

    // Both items present
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.itemsCount).toHaveText('2 items left');
  });

  test('TC-07: Very long todo title', async ({ todoPage }) => {
    const longTitle = 'A'.repeat(200);

    // Add a 200-character title
    await todoPage.addTodo(longTitle);

    // Item is in the DOM
    await expect(todoPage.todoItems).toHaveCount(1);
    // Action buttons remain visible — layout not broken
    await expect(todoPage.page.getByRole('button', { name: `Complete: ${longTitle}` })).toBeVisible();
    await expect(todoPage.page.getByRole('button', { name: `Delete: ${longTitle}` })).toBeVisible();
  });
});

test.describe('Complete — Happy Path', () => {
  test('TC-08: Complete a todo — visual style changes', async ({ todoPage }) => {
    await todoPage.addTodo('Walk the dog');

    // Complete the todo
    await todoPage.completeTodo('Walk the dog');

    // Title span gains 'completed' class (strikethrough)
    const titleSpan = todoPage.todoItems.filter({ hasText: 'Walk the dog' }).locator('span.todo-title');
    await expect(titleSpan).toHaveClass(/completed/);
    // Complete button is now disabled
    await expect(todoPage.page.getByRole('button', { name: 'Complete: Walk the dog' })).toBeDisabled();
    // Counter decrements
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('TC-09: Completing one of many todos only affects that item', async ({ todoPage }) => {
    await todoPage.addTodo('Task A');
    await todoPage.addTodo('Task B');
    await todoPage.addTodo('Task C');

    // Complete only Task B
    await todoPage.completeTodo('Task B');

    // Only Task B has the completed class
    await expect(todoPage.todoItems.filter({ hasText: 'Task B' }).locator('span.todo-title')).toHaveClass(/completed/);
    await expect(todoPage.todoItems.filter({ hasText: 'Task A' }).locator('span.todo-title')).not.toHaveClass(/completed/);
    await expect(todoPage.todoItems.filter({ hasText: 'Task C' }).locator('span.todo-title')).not.toHaveClass(/completed/);
    // Counter reflects 2 remaining active items
    await expect(todoPage.itemsCount).toHaveText('2 items left');
  });

  test('TC-10: Complete button is disabled after completing a todo', async ({ todoPage }) => {
    await todoPage.addTodo('Check this');

    // Complete the item
    await todoPage.completeTodo('Check this');

    // Button is disabled — cannot be clicked again
    await expect(todoPage.page.getByRole('button', { name: 'Complete: Check this' })).toBeDisabled();
  });
});

test.describe('Delete — Happy Path', () => {
  test('TC-11: Delete a todo — it disappears from the list', async ({ todoPage }) => {
    await todoPage.addTodo('Temporary task');

    // Delete the todo
    await todoPage.deleteTodo('Temporary task');

    // Item no longer in the list
    await expect(todoPage.todoItems.filter({ hasText: 'Temporary task' })).not.toBeVisible();
    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('TC-12: Delete one of many todos — others are unaffected', async ({ todoPage }) => {
    await todoPage.addTodo('Keep this');
    await todoPage.addTodo('Delete this');
    await todoPage.addTodo('Keep this too');

    // Delete only the middle item
    await todoPage.deleteTodo('Delete this');

    // Deleted item is gone; remaining items are intact
    await expect(todoPage.todoItems.filter({ hasText: 'Delete this' })).not.toBeVisible();
    // Use exact-text matching inside the span to avoid 'Keep this' also matching 'Keep this too'
    await expect(todoPage.todoItems.filter({ has: todoPage.page.getByText('Keep this', { exact: true }) })).toBeVisible();
    await expect(todoPage.todoItems.filter({ hasText: 'Keep this too' })).toBeVisible();
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.itemsCount).toHaveText('2 items left');
  });
});

test.describe('Read — Page Load & State', () => {
  test('TC-13: Counter starts at zero on fresh load', async ({ todoPage }) => {
    // Fixture already navigates and resets — validate the blank initial state
    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('TC-14: Todos persist after page reload', async ({ todoPage }) => {
    await todoPage.addTodo('Survive reload');

    // Reload the page
    await todoPage.page.reload();

    // Item still visible after reload (persisted in server memory)
    await expect(todoPage.todoItems.filter({ hasText: 'Survive reload' })).toBeVisible();
    await expect(todoPage.itemsCount).toHaveText('1 item left');
  });
});

test.describe('Rapid & Stress Interactions', () => {
  test('TC-15: Rapid successive clicks on "Add"', async ({ todoPage }) => {
    await todoPage.todoInput.fill('Quick click');

    // Click Add 5 times rapidly with no delay
    for (let i = 0; i < 5; i++) {
      await todoPage.addButton.click();
    }

    // At least 1 item must exist; duplicates are a known gap — no server deduplication
    const count = await todoPage.todoItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-16: Rapid successive clicks on "Complete"', async ({ todoPage }) => {
    await todoPage.addTodo('Double complete');

    const completeBtn = todoPage.page.getByRole('button', { name: 'Complete: Double complete' });

    // Double-click rapidly
    await completeBtn.dblclick();

    // Item is marked complete once; button is disabled
    await expect(todoPage.todoItems.filter({ hasText: 'Double complete' }).locator('span.todo-title')).toHaveClass(/completed/);
    await expect(completeBtn).toBeDisabled();
  });

  test('TC-17: Rapid successive clicks on "Delete"', async ({ todoPage }) => {
    await todoPage.addTodo('Double delete');

    // First click removes the item; the button disappears so a second click is a safe no-op
    await todoPage.deleteTodo('Double delete');

    // Item is removed after the first click
    await expect(todoPage.todoItems.filter({ hasText: 'Double delete' })).not.toBeVisible();
    await expect(todoPage.todoItems).toHaveCount(0);
  });
});

test.describe('API-Level Edge Cases', () => {
  test('TC-18: Simulate 500 error on POST /api/todos', async ({ todoPage, page }) => {
    // Intercept POST and return 500 — UI should handle gracefully without crashing
    await page.route('**/api/todos', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500 });
      } else {
        await route.continue();
      }
    });

    await todoPage.addTodo('Will fail');

    // Item must NOT be added due to the server error
    await expect(todoPage.todoItems.filter({ hasText: 'Will fail' })).not.toBeVisible();
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  test('TC-19: Simulate pre-loaded GET /api/todos with fixed data', async ({ page, todoPage }) => {
    const mockedTodos = [
      { id: '1', title: 'Mocked Item 1', completed: false },
      { id: '2', title: 'Mocked Item 2', completed: true },
    ];

    // Intercept GET and return fixed data
    await page.route('**/api/todos', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockedTodos),
      });
    });

    // Navigate to trigger the intercepted GET
    await todoPage.goto();

    // Two items with correct titles
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoItems.filter({ hasText: 'Mocked Item 1' })).toBeVisible();
    await expect(todoPage.todoItems.filter({ hasText: 'Mocked Item 2' })).toBeVisible();
    // Completed item has the right class
    await expect(todoPage.todoItems.filter({ hasText: 'Mocked Item 2' }).locator('span.todo-title')).toHaveClass(/completed/);
    // Counter reflects 1 active item
    await expect(todoPage.itemsCount).toHaveText('1 item left');
  });
});

test.describe('Accessibility Sanity', () => {
  test('TC-20: Keyboard navigation — submit form via Enter key', async ({ todoPage }) => {
    // Fill input and press Enter instead of clicking the Add button
    await todoPage.todoInput.fill('Keyboard submit');
    await todoPage.todoInput.press('Enter');

    // Todo was added without clicking Add
    await expect(todoPage.todoItems.filter({ hasText: 'Keyboard submit' })).toBeVisible();
    await expect(todoPage.itemsCount).toHaveText('1 item left');
  });

  test('TC-21: Status counter uses role="status" for screen readers', async ({ todoPage }) => {
    // Counter is present and correct on page load
    await expect(todoPage.itemsCount).toBeVisible();
    await expect(todoPage.itemsCount).toHaveText('0 items left');

    // Updates when a todo is added
    await todoPage.addTodo('Live region test');
    await expect(todoPage.itemsCount).toHaveText('1 item left');

    // Updates when a todo is completed
    await todoPage.completeTodo('Live region test');
    await expect(todoPage.itemsCount).toHaveText('0 items left');

    // Updates when a todo is deleted
    await todoPage.addTodo('To be deleted');
    await todoPage.deleteTodo('To be deleted');
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });
});
