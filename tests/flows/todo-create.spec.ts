import { test, expect } from '../fixtures';

test.describe('Form initial state', () => {
  test('input placeholder shows the correct hint text', async ({ todoPage }) => {
    await expect(todoPage.todoInput).toHaveAttribute(
      'placeholder',
      'What needs to be done?'
    );
  });

  test('Add button is enabled by default', async ({ todoPage }) => {
    await expect(todoPage.addButton).toBeEnabled();
  });
});

test.describe('Create Todos', () => {
  test('adds a todo and it appears in the list', async ({ todoPage }) => {
    const todoTitle = 'Buy milk';
    
    await todoPage.addTodo(todoTitle);
    
    // Assert the todo item exists in the list
    await expect(todoPage.todoItems.filter({ hasText: todoTitle })).toBeVisible();
  });

  test('adds multiple todos and the counter updates', async ({ todoPage }) => {
    await todoPage.addTodo('First item');
    await todoPage.addTodo('Second item');
    
    // Assert row count
    await expect(todoPage.todoItems).toHaveCount(2);
    // Assert counter text
    await expect(todoPage.itemsCount).toHaveText(/2 items? left/);
  });

  test('does not add an empty todo', async ({ todoPage }) => {
    // Attempt to add empty todo
    await todoPage.addTodo('');
    
    // Assert list remains empty
    await expect(todoPage.todoItems).toHaveCount(0);
    await expect(todoPage.itemsCount).toHaveText('0 items left');
  });

  test('the new todo shows the exact text entered', async ({ todoPage }) => {
    const specialTitle = 'Finish PR #123! — @important';
    
    await todoPage.addTodo(specialTitle);
    
    // Assert exact text match inside the todo row
    await expect(todoPage.todoItems.filter({ hasText: specialTitle })).toContainText(specialTitle);
  });
});
