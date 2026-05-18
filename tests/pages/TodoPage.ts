import { Locator, Page, expect } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly todoInput: Locator;
  readonly addButton: Locator;
  readonly todoItems: Locator;
  readonly itemsCount: Locator;

  constructor(page: Page) {
    this.page = page;
    // getByRole: Semantic heading identification
    this.heading = page.getByRole('heading', { name: 'Todo App' });
    // getByLabel: Finds input via associated <label> (best for forms)
    this.todoInput = page.getByLabel('New todo');
    // getByRole: Targets the specific functional button
    this.addButton = page.getByRole('button', { name: 'Add' });
    // getByTestId: Reliable selection for repeating list items
    this.todoItems = page.getByTestId('todo-item');
    // getByRole: Targets element with role="status"
    this.itemsCount = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(title: string) {
    await this.todoInput.fill(title);
    await this.addButton.click();
  }

  async completeTodo(title: string) {
    // getByRole with dynamic name based on ARIA label in index.html
    await this.page.getByRole('button', { name: `Complete: ${title}` }).click();
  }

  async deleteTodo(title: string) {
    // getByRole with dynamic name based on ARIA label in index.html
    await this.page.getByRole('button', { name: `Delete: ${title}` }).click();
  }

  /**
   * Cleans up state via API for maximum speed and reliability.
   */
  async resetViaApi() {
    await this.page.request.delete('/api/todos');
  }
}
