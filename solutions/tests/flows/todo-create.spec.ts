/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Flow 1 — Create Todos
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * What you'll learn reading this file:
 *   - How to use a POM with fixtures (no manual instantiation)
 *   - Assertions with expect() on locators (web-first: auto-wait)
 *   - getByRole, getByLabel, getByTestId in a real context
 *   - Why we DON'T write CSS selectors in tests
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../fixtures';

test.describe('Flow 1 — Create todos', () => {

  test('adding a todo shows it in the list', async ({ todoPage }) => {
    // ACTION — the fixture already navigated to '/', just call the high-level method
    await todoPage.addTodo('Aprender Playwright');

    // ASSERTION — getByTestId looks for data-testid="todo-item"
    // toHaveCount(1) auto-waits until it's fulfilled (auto-wait)
    await expect(todoPage.todoItems).toHaveCount(1);

    // toHaveText verifies the visible content of the item
    await expect(todoPage.todoItems.first()).toContainText('Aprender Playwright');
  });

  test('the counter shows active items', async ({ todoPage }) => {
    await todoPage.addMultipleTodos(['Comprar leche', 'Llamar al médico', 'Leer un libro']);

    // role="status" with the counter text
    await expect(todoPage.itemCount).toHaveText('3 items left');
  });

  test('adding multiple todos shows all of them', async ({ todoPage }) => {
    const titles = ['Todo A', 'Todo B', 'Todo C'];
    await todoPage.addMultipleTodos(titles);

    await expect(todoPage.todoItems).toHaveCount(3);

    // Verify that all titles are present
    for (const title of titles) {
      // filter() chains locators: looks for the todo-item that contains the text
      await expect(todoPage.todoItems.filter({ hasText: title })).toBeVisible();
    }
  });

  test('does not add a todo with empty title', async ({ todoPage, page }) => {
    // Try to submit without text
    await todoPage.addButton.click();

    // The list should remain empty
    await expect(todoPage.todoItems).toHaveCount(0);

    // The input should have no value (it's empty or HTML5 validation blocked it)
    await expect(todoPage.newTodoInput).toHaveValue('');
  });

  test('the input clears after adding', async ({ todoPage }) => {
    await todoPage.addTodo('Tarea de prueba');

    // After submit, the input should be cleared
    await expect(todoPage.newTodoInput).toHaveValue('');
  });

  test('LOCATORS: DOM vs Accessibility comparison', async ({ page }) => {
    await page.goto('/');

    // ── Accessibility locators (preferred) ─────────────────────────────
    // getByLabel finds the input via the <label for="todo-input">
    const inputByLabel = page.getByLabel('New todo');

    // getByRole finds the button by its ARIA role and name
    const submitByRole = page.getByRole('button', { name: 'Add' });

    // getByRole for the main heading
    const heading = page.getByRole('heading', { name: 'Todo App' });

    // ── DOM locators (only to learn the difference) ──────────────────
    // locator('#id') — fragile: if you change the id, it breaks
    const inputById = page.locator('#todo-input');

    // locator('css') — fragile: if you refactor the CSS, it breaks
    const submitByCss = page.locator('#add-form button[type="submit"]');

    // ── Verify both point to the same element ──────────────────────
    await expect(inputByLabel).toBeVisible();
    await expect(inputById).toBeVisible();    // same element, different locator
    await expect(submitByRole).toBeEnabled();
    await expect(submitByCss).toBeEnabled();  // same element, different locator
    await expect(heading).toBeVisible();

    // Interact with the accessible locator
    await inputByLabel.fill('Test desde locator accesible');
    await submitByRole.click();

    await expect(page.getByTestId('todo-item')).toHaveCount(1);
  });
});
