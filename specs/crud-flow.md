# Test Plan: Todo App — Complete CRUD Flow

**Target URL:** http://localhost:8000  
**Date:** 2026-05-20  
**Scope:** Complete CRUD lifecycle (Create, Read, Complete, Delete) including edge cases, validation, rapid interactions, API mocking, and accessibility sanity.

---

## Application Summary

| Element | Locator |
| :--- | :--- |
| Text input | `getByLabel('New todo')` |
| Submit button | `getByRole('button', { name: 'Add' })` |
| Todo row | `getByTestId('todo-item')` |
| Complete button | `getByRole('button', { name: /Complete: {title}/ })` |
| Delete button | `getByRole('button', { name: /Delete: {title}/ })` |
| Counter | `getByRole('status')` |

**Assumptions:** blank state before each test via `DELETE /api/todos`.

---

## Suite 1: Create — Happy Path

### TC-01: Add a single todo item
**Steps:** Type `Buy groceries` → click "Add".  
**Expected:** Item appears in list. Counter reads `1 item left`. Input is cleared.

### TC-02: Add multiple todo items
**Steps:** Add `First task`, `Second task`, `Third task`.  
**Expected:** 3 items in list. Counter reads `3 items left`.

### TC-03: Todo title is preserved exactly (special characters)
**Steps:** Type `Fix bug #42 — urgent!` → click "Add".  
**Expected:** Exact string displayed without encoding issues.

---

## Suite 2: Create — Edge Cases & Validation

### TC-04: Empty input — no todo is added
**Steps:** Leave input blank → click "Add".  
**Expected:** No item added. Counter remains `0 items left`.

### TC-05: Whitespace-only input — no todo is added
**Steps:** Type 5 spaces → click "Add".  
**Expected:** No item added. Counter remains `0 items left`.  
> Note: API strips whitespace and returns 422; frontend guards with `if (!title) return`.

### TC-06: Duplicate todo names — both are added
**Steps:** Add `Read a book` twice.  
**Expected:** 2 separate items both named `Read a book`. Counter reads `2 items left`.

### TC-07: Very long todo title
**Steps:** Type 200-character string → click "Add".  
**Expected:** Item is added. Layout not broken — action buttons remain visible.

---

## Suite 3: Complete — Happy Path

### TC-08: Complete a todo — visual style changes
**Steps:** Add `Walk the dog` → click ✓ button.  
**Expected:** `<span>` gains class `completed` (strikethrough). ✓ button is disabled. Counter reads `0 items left`.

### TC-09: Completing one of many todos only affects that item
**Steps:** Add `Task A`, `Task B`, `Task C` → click `Complete: Task B`.  
**Expected:** Only `Task B` has `completed` class. Counter reads `2 items left`.

### TC-10: Complete button is disabled after completing a todo
**Steps:** Add `Check this` → click ✓ → attempt second click.  
**Expected:** Button has `disabled` attribute. Second click triggers no change.

---

## Suite 4: Delete — Happy Path

### TC-11: Delete a todo — it disappears from the list
**Steps:** Add `Temporary task` → click ✗ button.  
**Expected:** Item removed from list. Counter reads `0 items left`.

### TC-12: Delete one of many todos — others are unaffected
**Steps:** Add `Keep this`, `Delete this`, `Keep this too` → click `Delete: Delete this`.  
**Expected:** `Delete this` removed. Others remain. Counter reads `2 items left`.

---

## Suite 5: Read — Page Load & State

### TC-13: Counter starts at zero on fresh load
**Steps:** Navigate to app with clean backend.  
**Expected:** Empty list. Counter reads `0 items left`.

### TC-14: Todos persist after page reload
**Steps:** Add `Survive reload` → `page.reload()`.  
**Expected:** Item still visible. Counter reads `1 item left`.

---

## Suite 6: Rapid & Stress Interactions

### TC-15: Rapid successive clicks on "Add"
**Steps:** Type `Quick click` → click "Add" 5 times with no delay.  
**Expected:** Exactly 1 item added **OR** duplicates documented as known gap (no API deduplication guard).

### TC-16: Rapid successive clicks on "Complete"
**Steps:** Add `Double complete` → double-click ✓ rapidly.  
**Expected:** Marked complete once. No console errors. Button disabled after first click.

### TC-17: Rapid successive clicks on "Delete"
**Steps:** Add `Double delete` → click ✗ twice in rapid succession.  
**Expected:** Item removed. Second click is a no-op or app handles 404 gracefully without crashing.

---

## Suite 7: API-Level Edge Cases (Network Mocking)

### TC-18: Simulate 500 error on POST /api/todos
**Setup:** `page.route('**/api/todos')` → `route.fulfill({ status: 500 })` for POST.  
**Steps:** Type `Will fail` → click "Add".  
**Expected:** Item NOT added. UI does not crash.

### TC-19: Simulate pre-loaded GET /api/todos with fixed data
**Setup:** `page.route('**/api/todos')` → `route.fulfill({ body: JSON.stringify([...]) })` for GET.  
**Steps:** Intercept GET to return `Mocked Item 1` (active) + `Mocked Item 2` (completed) → navigate to app.  
**Expected:** 2 items shown. `Mocked Item 2` has `completed` class. Counter reads `1 item left`.

---

## Suite 8: Accessibility Sanity

### TC-20: Keyboard navigation — submit form via Enter key
**Steps:** Focus input → type `Keyboard submit` → press `Enter`.  
**Expected:** Item added without clicking "Add" button.

### TC-21: Status counter uses role="status" for screen readers
**Steps:** Add, complete, and delete a todo.  
**Expected:** `<p role="status">` exists at all times. Text updates dynamically after each action.