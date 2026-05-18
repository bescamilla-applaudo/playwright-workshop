# ─────────────────────────────────────────────────────────────────────────────
# conftest.py — Global fixtures for pytest-playwright
# ─────────────────────────────────────────────────────────────────────────────
#
# pytest-playwright already provides the `page`, `browser`, `context` fixtures.
# Here we extend with our own high-level fixtures.
#
# @pytest.fixture with yield:
#   - Code BEFORE the yield → setup
#   - Code AFTER the yield → teardown
# ─────────────────────────────────────────────────────────────────────────────
import subprocess
import time
import pytest
from playwright.sync_api import Page

from tests_python.pages.todo_page import TodoPage


# ── App server ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def fastapi_server():
    """
    Starts FastAPI once per test session.
    scope="session" → runs only once for all tests in the run.
    autouse=True    → applies automatically without declaring it in each test.
    """
    proc = subprocess.Popen(
        [".venv/bin/uvicorn", "app.main:app", "--port", "8000", "--log-level", "warning"],
        cwd=".",
    )
    time.sleep(1.5)  # wait for the server to be ready
    yield
    proc.terminate()
    proc.wait()


# ── POM fixture ───────────────────────────────────────────────────────────────

@pytest.fixture
def todo_page(page: Page):
    """
    Creates the POM, navigates to the app, and cleans up after each test.
    """
    todo = TodoPage(page)
    todo.goto()

    yield todo  # ← the test runs here

    # Teardown: isolate the next test
    todo.reset_via_api()
