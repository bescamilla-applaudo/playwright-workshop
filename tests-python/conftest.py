import subprocess
import time
import pytest
from playwright.sync_api import Page

from pages.todo_page import TodoPage


# ── App server ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def fastapi_server():
    """
    Starts the FastAPI app once for the whole test session.
    scope="session" → runs only once regardless of test count.
    autouse=True    → applied automatically, no need to declare it in each test.
    """
    proc = subprocess.Popen(
        [".venv/bin/uvicorn", "app.main:app", "--port", "8000", "--log-level", "warning"],
        cwd=".",
    )
    time.sleep(1.5)  # allow the server time to bind the port
    yield
    proc.terminate()
    proc.wait()


# ── POM fixture ───────────────────────────────────────────────────────────────

@pytest.fixture
def todo_page(page: Page) -> TodoPage:
    """
    Creates a TodoPage, navigates to the app, and resets state via API after each test.

    Code BEFORE yield  → setup
    Code AFTER yield   → teardown
    """
    todo = TodoPage(page)
    todo.goto()
    todo.reset_via_api()
    page.reload()  # ensure the UI reflects the clean state

    yield todo  # ← the test body runs here

    # Teardown: clear state so the next test starts blank
    todo.reset_via_api()
