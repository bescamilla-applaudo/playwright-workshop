"""
Flow 2 — Complete and delete todos (Python / pytest-playwright)
"""
from playwright.sync_api import Page, expect

from tests_python.pages.todo_page import TodoPage


def test_completar_todo_tacha_el_texto(todo_page: TodoPage):
    todo_page.add_todo("Hacer ejercicio")
    todo_page.complete_todo("Hacer ejercicio")

    title_el = (
        todo_page.todo_items
        .filter(has_text="Hacer ejercicio")
        .locator(".todo-title")
    )
    expect(title_el).to_have_class(r".*completed.*")


def test_completar_actualiza_contador(todo_page: TodoPage):
    todo_page.add_multiple_todos(["Task 1", "Task 2", "Task 3"])

    expect(todo_page.item_count).to_have_text("3 items left")

    todo_page.complete_todo("Task 1")
    expect(todo_page.item_count).to_have_text("2 items left")

    todo_page.complete_todo("Task 2")
    expect(todo_page.item_count).to_have_text("1 item left")


def test_boton_completar_queda_deshabilitado(todo_page: TodoPage):
    import re
    todo_page.add_todo("Tarea única")

    item = todo_page.todo_items.filter(has_text="Tarea única")
    complete_btn = item.get_by_role("button", name=re.compile("Complete: Tarea única"))

    expect(complete_btn).to_be_enabled()
    complete_btn.click()
    expect(complete_btn).to_be_disabled()


def test_eliminar_todo_lo_remueve(todo_page: TodoPage):
    todo_page.add_multiple_todos(["Borrar esto", "Mantener esto"])

    todo_page.delete_todo("Borrar esto")

    expect(todo_page.todo_items.filter(has_text="Borrar esto")).to_have_count(0)
    expect(todo_page.todo_items.filter(has_text="Mantener esto")).to_be_visible()


def test_eliminar_deja_lista_vacia(todo_page: TodoPage):
    todo_page.add_todo("Solo uno")
    todo_page.delete_todo("Solo uno")

    expect(todo_page.todo_items).to_have_count(0)
    expect(todo_page.item_count).to_have_text("0 items left")


def test_mock_api_respuesta_precargada(page: Page):
    """
    Mock responses with page.route() in Playwright.
    """
    import json

    def handle_route(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": "1", "title": "Todo mockeado 1", "completed": False},
                {"id": "2", "title": "Todo mockeado 2", "completed": True},
            ]),
        )

    page.route("**/api/todos", handle_route)
    page.goto("http://localhost:8000")

    expect(page.get_by_test_id("todo-item")).to_have_count(2)

    second = (
        page.get_by_test_id("todo-item")
        .filter(has_text="Todo mockeado 2")
        .locator(".todo-title")
    )
    expect(second).to_have_class(r".*completed.*")
