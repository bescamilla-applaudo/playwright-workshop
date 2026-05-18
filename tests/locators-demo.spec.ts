import { test, expect } from '@playwright/test';

test.describe('Locators Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
    // Clear list to ensure clean state (assuming resetViaApi logic isn't here yet)
    // For a demo spec, we'll just interact with the UI.
  });

  test('getByRole — locate the Add button and the Todo App heading', async ({ page }) => {
    // Heading 1
    const heading = page.getByRole('heading', { name: 'Todo App' });
    await expect(heading).toBeVisible();

    // Submit button
    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeEnabled();
  });

  test('getByLabel — locate the input by its label "New todo"', async ({ page }) => {
    const input = page.getByLabel('New todo');
    await input.fill('Learning Locators');
    await expect(input).toHaveValue('Learning Locators');
  });

  test('getByTestId — locate todo-items after adding one', async ({ page }) => {
    // Add a todo first
    await page.getByLabel('New todo').fill('Test item');
    await page.getByRole('button', { name: 'Add' }).click();

    // Locate by data-testid
    const todoItem = page.getByTestId('todo-item');
    await expect(todoItem).toBeVisible();
    await expect(todoItem).toContainText('Test item');
  });

  test('getByText — locate visible static text', async ({ page }) => {
    const counterText = page.getByText('0 items left');
    await expect(counterText).toBeVisible();
  });

  test('locator() with CSS — same Add button but with a CSS selector', async ({ page }) => {
    // CSS Locators are fragile to style/structure changes and don't reflect user experience
    const addButton = page.locator('#add-form button[type="submit"]');
    
    await expect(addButton).toBeVisible();
    await addButton.click();
  });
});
