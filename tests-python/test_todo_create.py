"""
Flow 1 — Create todos (Python / pytest-playwright)

Python equivalent of tests/flows/todo-create.spec.ts.
Uses the sync Playwright API — no async/await.
"""
import re
from playwright.sync_api import expect

from pages.todo_page import TodoPage


def test_adds_a_todo_and_it_appears_in_the_list(todo_page: TodoPage):
    todo_title = "Buy milk"

    todo_page.add_todo(todo_title)

    # Item visible in the list
    expect(todo_page.todo_items.filter(has_text=todo_title)).to_be_visible()


def test_adds_multiple_todos_and_the_counter_updates(todo_page: TodoPage):
    todo_page.add_todo("First item")
    todo_page.add_todo("Second item")

    # Row count
    expect(todo_page.todo_items).to_have_count(2)
    # Counter text — regex handles singular/plural edge case
    expect(todo_page.item_count).to_have_text(re.compile(r"2 items? left"))


def test_does_not_add_an_empty_todo(todo_page: TodoPage):
    # Click Add without typing anything
    todo_page.add_button.click()

    # List remains empty
    expect(todo_page.todo_items).to_have_count(0)
    expect(todo_page.item_count).to_have_text("0 items left")


def test_the_new_todo_shows_the_exact_text_entered(todo_page: TodoPage):
    special_title = "Finish PR #123! — @important"

    todo_page.add_todo(special_title)

    # Exact text match inside the row span
    expect(
        todo_page.todo_items
        .filter(has_text=special_title)
        .locator("span.todo-title")
    ).to_have_text(special_title)
