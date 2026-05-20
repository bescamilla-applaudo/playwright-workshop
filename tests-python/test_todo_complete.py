"""
Flow 2 — Complete and delete todos (Python / pytest-playwright)

Python equivalent of tests/flows/todo-complete.spec.ts.
Includes UI interaction tests and route interception (API mocks).
"""
import json
import re
from playwright.sync_api import Page, Route, expect

from pages.todo_page import TodoPage


# ── Complete and Delete ───────────────────────────────────────────────────────

def test_completes_a_todo_and_its_visual_style_changes(todo_page: TodoPage):
    todo_page.add_todo("Complete me")
    todo_page.complete_todo("Complete me")

    title_span = (
        todo_page.todo_items
        .filter(has_text="Complete me")
        .locator("span.todo-title")
    )
    # The span gets class "todo-title completed" when the item is done
    expect(title_span).to_have_class(re.compile(r"completed"))


def test_deletes_a_todo_and_it_disappears_from_the_list(todo_page: TodoPage):
    todo_page.add_todo("Delete me")
    todo_page.delete_todo("Delete me")

    expect(todo_page.todo_items.filter(has_text="Delete me")).not_to_be_visible()
    expect(todo_page.todo_items).to_have_count(0)


def test_completing_reduces_the_active_items_counter(todo_page: TodoPage):
    todo_page.add_todo("Task 1")
    todo_page.add_todo("Task 2")
    expect(todo_page.item_count).to_have_text(re.compile(r"2 items? left"))

    todo_page.complete_todo("Task 1")

    expect(todo_page.item_count).to_have_text("1 item left")


# ── API Mock ──────────────────────────────────────────────────────────────────

def test_simulates_500_error_on_create_ui_handles_the_error(todo_page: TodoPage, page: Page):
    # Intercept POST /api/todos and return a server error; let GET pass through
    def handle_route(route: Route) -> None:
        if route.request.method == "POST":
            route.fulfill(status=500)
        else:
            route.continue_()

    page.route("**/api/todos", handle_route)

    todo_page.add_todo("Fail me")

    # Item must NOT appear — the UI received a 500 and should not render it
    expect(todo_page.todo_items.filter(has_text="Fail me")).not_to_be_visible()


def test_simulates_preloaded_response_the_list_shows_fixed_data(page: Page):
    mocked_todos = [
        {"id": "1", "title": "Mocked Todo 1", "completed": False},
        {"id": "2", "title": "Mocked Todo 2", "completed": True},
    ]

    def handle_route(route: Route) -> None:
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(mocked_todos),
        )

    # Register the intercept BEFORE navigating so the initial GET is captured
    page.route("**/api/todos", handle_route)
    page.goto("http://localhost:8000")

    expect(page.get_by_test_id("todo-item")).to_have_count(2)
    expect(page.get_by_test_id("todo-item").filter(has_text="Mocked Todo 1")).to_be_visible()
    expect(page.get_by_test_id("todo-item").filter(has_text="Mocked Todo 2")).to_be_visible()
