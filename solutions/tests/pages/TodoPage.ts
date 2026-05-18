/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Page Object Model — TodoPage
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A POM encapsulates ALL locators and actions for a page in a class.
 * Tests only call high-level methods: "create a todo", "complete it".
 * If the UI changes (e.g. the button text changes from "Add" to "Create"),
 * you only edit this class, not every spec.
 *
 * Locator hierarchy (from most resilient to most fragile):
 *
 *   1. getByRole()     → uses ARIA roles — the most accessible and resilient
 *   2. getByLabel()    → for inputs with <label>
 *   3. getByTestId()   → data-testid: good for elements without ARIA semantics
 *   4. getByText()     → by visible text — beware of i18n
 *   5. locator('css')  → CSS/XPath — avoid, fragile with refactors
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type Page, type Locator } from '@playwright/test';

export class TodoPage {
  // ── Locators declared as readonly properties ────────────────────────────
  // Initialized in the constructor. They are "lazy": they don't query the DOM
  // until used in an action or assertion.

  /** Text input — located by <label for="todo-input">New todo</label> */
  readonly newTodoInput: Locator;

  /** Submit button — located by its ARIA role + visible name */
  readonly addButton: Locator;

  /**
   * Todo list — getByTestId looks for data-testid="todo-item"
   * Returns ALL items, useful for counting or filtering.
   *
   * Equivalent DOM locator: page.locator('[data-testid="todo-item"]')
   * Equivalent ARIA locator: page.getByRole('listitem') — less precise here
   */
  readonly todoItems: Locator;

  /** Active item counter — role="status" with aria-live="polite" */
  readonly itemCount: Locator;

  constructor(private readonly page: Page) {
    // ✅ Accessibility locator: uses the form's <label>
    this.newTodoInput = page.getByLabel('New todo');

    // ✅ ARIA role: button with name "Add" — independent of element type
    this.addButton = page.getByRole('button', { name: 'Add' });

    // ✅ data-testid: for elements without their own semantic ARIA role
    this.todoItems = page.getByTestId('todo-item');

    // ✅ ARIA role "status": the paragraph with aria-live that announces changes
    this.itemCount = page.getByRole('status');
  }

  // ── Navigation ─────────────────────────────────────────────────────────────────

  async goto() {
    // baseURL está en playwright.config.ts → http://localhost:8000
    await this.page.goto('/');
  }

  // ── High-level actions ───────────────────────────────────────────────────────
  // These methods describe user behavior, not technical steps.

  async addTodo(title: string) {
    await this.newTodoInput.fill(title);
    await this.addButton.click();
  }

  async addMultipleTodos(titles: string[]) {
    for (const title of titles) {
      await this.addTodo(title);
    }
  }

  /**
   * Completes a todo by its title.
   * Chains locators: finds the todo-item containing the text,
   * then inside it finds the complete button by aria-label.
   */
  async completeTodo(title: string) {
    const item = this.todoItems.filter({ hasText: title });
    await item.getByRole('button', { name: new RegExp(`Complete: ${title}`) }).click();
  }

  /**
   * Deletes a todo by its title.
   * Same chaining pattern as completeTodo.
   */
  async deleteTodo(title: string) {
    const item = this.todoItems.filter({ hasText: title });
    await item.getByRole('button', { name: new RegExp(`Delete: ${title}`) }).click();
  }

  // ── Queries — return data for assertions in tests ──────────────────────

  async getTodoCount(): Promise<number> {
    return this.todoItems.count();
  }

  async getTodoTitles(): Promise<string[]> {
    return this.todoItems.locator('.todo-title').allTextContents();
  }

  async isTodoCompleted(title: string): Promise<boolean> {
    const item = this.todoItems.filter({ hasText: title });
    const titleEl = item.locator('.todo-title');
    const classes = await titleEl.getAttribute('class') ?? '';
    return classes.includes('completed');
  }

  /**
   * Clears all todos via REST API — faster than clicking on each one.
   * Use in afterEach to isolate tests without depending on the UI.
   */
  async resetViaApi() {
    await this.page.request.delete('/api/todos');
  }
}
