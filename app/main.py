import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="Playwright Workshop - Todo App")
templates = Jinja2Templates(directory="app/templates")

# In-memory store (resets on server restart)
todos: dict[str, dict] = {}


class TodoCreate(BaseModel):
    title: str


# ─── HTML UI ────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request, "index.html")


# ─── REST API ────────────────────────────────────────────────────────────────

@app.get("/api/todos")
async def list_todos():
    return list(todos.values())


@app.post("/api/todos", status_code=201)
async def create_todo(payload: TodoCreate):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")
    todo_id = str(uuid.uuid4())
    todos[todo_id] = {"id": todo_id, "title": title, "completed": False}
    return todos[todo_id]


@app.patch("/api/todos/{todo_id}/complete")
async def complete_todo(todo_id: str):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    todos[todo_id]["completed"] = True
    return todos[todo_id]


@app.delete("/api/todos/{todo_id}", status_code=204)
async def delete_todo(todo_id: str):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos[todo_id]


# ─── Test helper ─────────────────────────────────────────────────────────────

@app.delete("/api/todos", status_code=204)
async def reset_todos():
    """Clear all todos — used by test teardown to ensure test isolation."""
    todos.clear()
