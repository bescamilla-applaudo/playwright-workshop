# ─────────────────────────────────────────────────────────────────────────────
# Page Object Model — TodoPage (Python / pytest-playwright)
# ─────────────────────────────────────────────────────────────────────────────
#
# Page Object Model for the Todo App:
#   - Locators as instance attributes
#   - High-level methods that describe user behavior
#   - playwright-python uses the sync API by default with pytest
# ─────────────────────────────────────────────────────────────────────────────
import re
from playwright.sync_api import Page, Locator


class TodoPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        # ── Accessibility locators (preferred) ───────────────────────
        # get_by_label → finds the input via <label for="todo-input">
        self.new_todo_input: Locator = page.get_by_label("New todo")

        # get_by_role → button with name "Add"
        self.add_button: Locator = page.get_by_role("button", name="Add")

        # get_by_test_id → data-testid="todo-item"
        self.todo_items: Locator = page.get_by_test_id("todo-item")

        # get_by_role "status" → the counter paragraph with aria-live
        self.item_count: Locator = page.get_by_role("status")

    # ── Navigation ───────────────────────────────────────────────────────────

    def goto(self, base_url: str = "http://localhost:8000") -> None:
        self.page.goto(base_url)

    # ── Actions ─────────────────────────────────────────────────────────────

    def add_todo(self, title: str) -> None:
        self.new_todo_input.fill(title)
        self.add_button.click()

    def add_multiple_todos(self, titles: list[str]) -> None:
        for title in titles:
            self.add_todo(title)

    def complete_todo(self, title: str) -> None:
        item = self.todo_items.filter(has_text=title)
        item.get_by_role("button", name=re.compile(f"Complete: {re.escape(title)}")).click()

    def delete_todo(self, title: str) -> None:
        item = self.todo_items.filter(has_text=title)
        item.get_by_role("button", name=re.compile(f"Delete: {re.escape(title)}")).click()

    # ── Queries ────────────────────────────────────────────────────────────

    def get_todo_count(self) -> int:
        return self.todo_items.count()

    def is_todo_completed(self, title: str) -> bool:
        item = self.todo_items.filter(has_text=title)
        css_class = item.locator(".todo-title").get_attribute("class") or ""
        return "completed" in css_class

    # ── Test helpers ────────────────────────────────────────────────────────

    def reset_via_api(self) -> None:
        """Clears all todos via REST API — faster than clicking on each one."""
        self.page.request.delete("http://localhost:8000/api/todos")
