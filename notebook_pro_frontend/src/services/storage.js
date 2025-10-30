/**
 * PUBLIC_INTERFACE
 * loadState
 * Loads persisted state from localStorage for the Notebook Pro app.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem("notebook_pro_state_v1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * saveState
 * Persists state to localStorage. Call after user actions.
 */
export function saveState(state) {
  try {
    const minimal = {
      notes: state.notes,
      categories: state.categories,
      lastNoteId: state.lastNoteId || 0,
      lastCategoryId: state.lastCategoryId || 0,
    };
    localStorage.setItem("notebook_pro_state_v1", JSON.stringify(minimal));
  } catch {
    // ignore quota or serialization errors
  }
}

/**
 * PUBLIC_INTERFACE
 * generateId
 * Generates a simple incremental id stored in localStorage.
 */
export function generateId(key = "note") {
  const storageKey = key === "category" ? "np_last_category_id" : "np_last_note_id";
  const current = parseInt(localStorage.getItem(storageKey) || "0", 10) + 1;
  localStorage.setItem(storageKey, String(current));
  return current;
}
