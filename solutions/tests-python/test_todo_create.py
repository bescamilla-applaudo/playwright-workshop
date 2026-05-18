"""
Flow 1 — Create todos (Python / pytest-playwright)

Todo creation scenarios using the Playwright sync API.
"""
from playwright.sync_api import Page, expect

from tests_python.pages.todo_page import TodoPage


def test_agregar_todo_aparece_en_lista(todo_page: TodoPage):
    todo_page.add_todo("Aprender Playwright Python")

    expect(todo_page.todo_items).to_have_count(1)
    expect(todo_page.todo_items.first()).to_contain_text("Aprender Playwright Python")


def test_contador_muestra_items_activos(todo_page: TodoPage):
    todo_page.add_multiple_todos(["Comprar leche", "Llamar al médico", "Leer un libro"])

    expect(todo_page.item_count).to_have_text("3 items left")


def test_agregar_multiples_todos(todo_page: TodoPage):
    titles = ["Todo A", "Todo B", "Todo C"]
    todo_page.add_multiple_todos(titles)

    expect(todo_page.todo_items).to_have_count(3)

    for title in titles:
        expect(todo_page.todo_items.filter(has_text=title)).to_be_visible()


def test_input_queda_vacio_despues_de_agregar(todo_page: TodoPage):
    todo_page.add_todo("Tarea de prueba")

    expect(todo_page.new_todo_input).to_have_value("")


def test_locators_dom_vs_accessibility(page: Page):
    """
    Demonstrates the difference between DOM and accessibility locators in Python.
    """
    page.goto("http://localhost:8000")

    # Accessibility locators
    input_by_label = page.get_by_label("New todo")
    submit_by_role = page.get_by_role("button", name="Add")
    heading = page.get_by_role("heading", name="Todo App")

    # DOM locators (for comparison)
    input_by_id = page.locator("#todo-input")
    submit_by_css = page.locator('#add-form button[type="submit"]')

    # Both approaches target the same element
    expect(input_by_label).to_be_visible()
    expect(input_by_id).to_be_visible()
    expect(submit_by_role).to_be_enabled()
    expect(submit_by_css).to_be_enabled()
    expect(heading).to_be_visible()

    # Interact with the accessible locator
    input_by_label.fill("Test desde Python")
    submit_by_role.click()

    expect(page.get_by_test_id("todo-item")).to_have_count(1)
