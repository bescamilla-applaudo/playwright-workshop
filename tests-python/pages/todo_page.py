import re
from playwright.sync_api import Page, Locator


class TodoPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        # get_by_label: finds the input via <label for="todo-input"> — best for forms
        self.new_todo_input: Locator = page.get_by_label("New todo")

        # get_by_role: button with accessible name "Add"
        self.add_button: Locator = page.get_by_role("button", name="Add")

        # get_by_test_id: data-testid="todo-item" — reliable for repeated rows
        self.todo_items: Locator = page.get_by_test_id("todo-item")

        # get_by_role "status": the counter paragraph with role="status" and aria-live
        self.item_count: Locator = page.get_by_role("status")

    # ── Navigation ───────────────────────────────────────────────────────────

    def goto(self) -> None:
        self.page.goto("http://localhost:8000")

    # ── Actions ──────────────────────────────────────────────────────────────

    def add_todo(self, title: str) -> None:
        self.new_todo_input.fill(title)
        self.add_button.click()

    def complete_todo(self, title: str) -> None:
        # Scoped to the matching row to avoid ambiguity when titles share substrings
        self.todo_items.filter(has_text=title).get_by_role(
            "button", name=re.compile(f"Complete: {re.escape(title)}")
        ).click()

    def delete_todo(self, title: str) -> None:
        self.todo_items.filter(has_text=title).get_by_role(
            "button", name=re.compile(f"Delete: {re.escape(title)}")
        ).click()

    # ── Test helpers ─────────────────────────────────────────────────────────

    def reset_via_api(self) -> None:
        """Clears all todos via REST API — faster and more reliable than UI clicks."""
        self.page.request.delete("http://localhost:8000/api/todos")
