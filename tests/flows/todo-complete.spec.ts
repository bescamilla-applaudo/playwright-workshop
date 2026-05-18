import { test, expect } from '../fixtures';

test.describe('Complete and Delete', () => {
  test('completes a todo and its visual style changes', async ({ todoPage }) => {
    const todoTitle = 'Complete me';
    await todoPage.addTodo(todoTitle);

    // Act: Complete the todo
    await todoPage.completeTodo(todoTitle);

    // Assert: Visual change (check for class "completed" on the span)
    const todoRow = todoPage.todoItems.filter({ hasText: todoTitle });
    const titleSpan = todoRow.locator('span.todo-title');
    await expect(titleSpan).toHaveClass(/completed/);
  });

  test('deletes a todo and it disappears from the list', async ({ todoPage }) => {
    const todoTitle = 'Delete me';
    await todoPage.addTodo(todoTitle);

    // Act: Delete the todo
    await todoPage.deleteTodo(todoTitle);

    // Assert: Item is gone
    await expect(todoPage.todoItems.filter({ hasText: todoTitle })).not.toBeVisible();
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  test('completing reduces the active items counter', async ({ todoPage }) => {
    await todoPage.addTodo('Task 1');
    await todoPage.addTodo('Task 2');
    await expect(todoPage.itemsCount).toHaveText(/2 items? left/);

    // Act: Complete one
    await todoPage.completeTodo('Task 1');

    // Assert: Counter updates
    await expect(todoPage.itemsCount).toHaveText(/1 item left/);
  });
});

test.describe('API Mock', () => {
  test('simulates 500 error on create — the UI should handle the error', async ({ todoPage, page }) => {
    // Intercept POST request and return 500
    await page.route('**/api/todos', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500 });
      } else {
        await route.continue();
      }
    });

    await todoPage.addTodo('Fail me');

    // Assert: Item was not added to the list due to error
    await expect(todoPage.todoItems.filter({ hasText: 'Fail me' })).not.toBeVisible();
  });

  test('simulates pre-loaded response — the list shows fixed data', async ({ page, todoPage }) => {
    const mockedTodos = [
      { id: '1', title: 'Mocked Todo 1', completed: false },
      { id: '2', title: 'Mocked Todo 2', completed: true },
    ];

    // Intercept GET request and return mocked data
    await page.route('**/api/todos', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockedTodos),
      });
    });

    // Reload or navigate to trigger the GET request
    await todoPage.goto();

    // Assert: UI shows the mocked data
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoItems.filter({ hasText: 'Mocked Todo 1' })).toBeVisible();
    await expect(todoPage.todoItems.filter({ hasText: 'Mocked Todo 2' })).toBeVisible();
  });
});
