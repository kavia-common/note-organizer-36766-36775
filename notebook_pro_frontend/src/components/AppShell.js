import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import "../theme.css";
import { createApiClient } from "../services/api";
import { loadState, saveState, generateId } from "../services/storage";

/**
 * Shapes
 */
const emptyNote = (overrides = {}) => ({
  id: null,
  title: "",
  content: "",
  categoryId: null,
  tags: [],
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const defaultCategories = [
  { id: 1, name: "All Notes" },
  { id: 2, name: "Personal" },
  { id: 3, name: "Work" },
];

/**
 * PUBLIC_INTERFACE
 * AppShell
 * The primary Notebook Pro UI with top bar, sidebar, note list, and editor.
 */
export default function AppShell() {
  const api = useMemo(() => createApiClient(), []);
  const [state, setState] = useState(() => {
    const persisted = loadState();
    if (persisted && persisted.notes && persisted.categories) return { ...persisted };
    return {
      notes: [
        { id: 1, title: "Welcome to Notebook Pro", content: "Start typing your notes here...", categoryId: 1, tags: ["welcome"], updatedAt: new Date().toISOString() },
      ],
      categories: defaultCategories,
      lastNoteId: 1,
      lastCategoryId: 3,
      search: "",
    };
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    saveState(state);
  }, [state.notes, state.categories]);

  // Search handler
  const onSearch = (e) => {
    setState((s) => ({ ...s, search: e.target.value }));
  };

  // Category add
  const addCategory = () => {
    const name = prompt("New category name");
    if (!name) return;
    const id = state.lastCategoryId + 1;
    setState((s) => ({
      ...s,
      categories: [...s.categories, { id, name }],
      lastCategoryId: id,
    }));
  };

  // Category selection
  const selectCategory = (categoryId) => {
    navigate(`/c/${categoryId}`);
  };

  // Create new note
  const createNote = (categoryId = null) => {
    const id = state.lastNoteId + 1;
    const note = emptyNote({ id, title: "Untitled", categoryId: categoryId || 1, updatedAt: new Date().toISOString() });
    setState((s) => ({ ...s, notes: [note, ...s.notes], lastNoteId: id }));
    navigate(`/n/${id}`);
  };

  // Delete note
  const deleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
    navigate(`/`);
  };

  // Update note
  const updateNote = (patch) => {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === patch.id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    }));
  };

  // Derived
  const { categoryId: routeCategoryId } = useParams();
  const { noteId: routeNoteId } = useParams();

  // Filter notes by search and category
  const selectedCategoryId = location.pathname.startsWith("/c/") ? Number((location.pathname.split("/c/")[1] || "").split("/")[0]) : null;
  const selectedNoteId = location.pathname.startsWith("/n/") ? Number((location.pathname.split("/n/")[1] || "").split("/")[0]) : null;

  const notesFiltered = state.notes
    .filter((n) => {
      const matchesCategory = !selectedCategoryId || selectedCategoryId === 1 || n.categoryId === selectedCategoryId;
      const q = (state.search || "").toLowerCase();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const selectedNote = state.notes.find((n) => n.id === selectedNoteId) || null;

  return (
    <div className="app-shell">
      <TopBar search={state.search} onSearch={onSearch} apiEnabled={api.enabled} />
      <Sidebar
        categories={state.categories}
        onAddCategory={addCategory}
        onSelectCategory={selectCategory}
        activeCategoryId={selectedCategoryId || 1}
        onCreateNote={() => createNote(selectedCategoryId || 1)}
      />
      <MainArea
        notes={notesFiltered}
        categories={state.categories}
        selectedNote={selectedNote}
        onSelectNote={(id) => navigate(`/n/${id}`)}
        onDeleteNote={deleteNote}
        onCreateNote={() => createNote(selectedCategoryId || 1)}
        onUpdateNote={updateNote}
      />
    </div>
  );
}

/**
 * Top Bar with brand, search, and account placeholder
 */
function TopBar({ search, onSearch, apiEnabled }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-badge">📘</div>
        Notebook Pro
      </div>
      <div className="topbar-search" aria-label="Global search">
        <span role="img" aria-label="search" style={{ marginRight: 8, color: "var(--color-muted)" }}>🔎</span>
        <input placeholder="Search notes, tags, content..." value={search} onChange={onSearch} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span title={apiEnabled ? "Connected API client scaffold" : "Mock mode (no backend configured)"} style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {apiEnabled ? "API" : "Mock"}
        </span>
        <button className="btn" title="Account (placeholder)">🙂</button>
      </div>
    </div>
  );
}

/**
 * Sidebar with categories and quick actions
 */
function Sidebar({ categories, onAddCategory, onSelectCategory, activeCategoryId, onCreateNote }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">Categories</div>
      <div className="category-list">
        {categories.map((c) => (
          <div
            key={c.id}
            className={`category-item ${activeCategoryId === c.id ? "active" : ""}`}
            onClick={() => onSelectCategory(c.id)}
            role="button"
            tabIndex={0}
          >
            <span>📂</span>
            <span>{c.name}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-actions">
        <button className="btn" onClick={onAddCategory} title="Add category">
          ➕ Category
        </button>
        <button className="btn btn-primary" onClick={onCreateNote} title="Create note">
          📝 New Note
        </button>
      </div>
    </aside>
  );
}

/**
 * MainArea contains the note list and the editor panel
 */
function MainArea({ notes, categories, selectedNote, onSelectNote, onDeleteNote, onCreateNote, onUpdateNote }) {
  return (
    <main className="main">
      <section className="panel note-list">
        {notes.map((n) => (
          <article key={n.id} className={`note-card ${selectedNote && selectedNote.id === n.id ? "active" : ""}`} onClick={() => onSelectNote(n.id)}>
            <h4 className="note-title">{n.title || "Untitled"}</h4>
            <div className="note-meta">
              {new Date(n.updatedAt).toLocaleString()} • {n.tags && n.tags.length ? n.tags.join(", ") : "no tags"}
            </div>
          </article>
        ))}
        {!notes.length && (
          <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 24 }}>
            No notes found. Try clearing search or create a new note.
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={onCreateNote}>➕ Create note</button>
        </div>
      </section>

      <section className="panel editor">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            categories={categories}
            onChange={onUpdateNote}
            onDelete={() => onDeleteNote(selectedNote.id)}
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", color: "var(--color-muted)" }}>
            Select a note to edit
          </div>
        )}
      </section>
    </main>
  );
}

/**
 * NoteEditor allows editing title, content, category, and tags
 */
function NoteEditor({ note, categories, onChange, onDelete }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [categoryId, setCategoryId] = useState(note.categoryId || 1);
  const [tags, setTags] = useState(note.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategoryId(note.categoryId || 1);
    setTags(note.tags || []);
  }, [note.id]);

  const commit = (patch) => {
    onChange({ ...note, ...patch });
  };

  const onAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      commit({ tags: next });
    }
    setTagInput("");
  };

  const onRemoveTag = (t) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    commit({ tags: next });
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          className="input"
          placeholder="Note title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); }}
          onBlur={() => commit({ title })}
        />
        <select
          className="input"
          value={categoryId || 1}
          onChange={(e) => { const val = Number(e.target.value); setCategoryId(val); commit({ categoryId: val }); }}
          title="Category"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn btn-danger" onClick={onDelete} title="Delete note">🗑 Delete</button>
      </div>

      <div className="tag-row">
        {tags.map((t) => (
          <span key={t} className="tag">
            #{t}
            <button className="tag-remove" onClick={() => onRemoveTag(t)} aria-label={`Remove ${t}`}>×</button>
          </span>
        ))}
        <input
          className="tag-input"
          placeholder="Add tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onAddTag(); }}
        />
        <button className="btn" onClick={onAddTag}>Add</button>
      </div>

      <textarea
        className="textarea"
        placeholder="Write your note in plain text or markdown..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => commit({ content })}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
          Updated {new Date(note.updatedAt).toLocaleString()}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => commit({ title, content, categoryId, tags })}>Save</button>
        </div>
      </div>
    </>
  );
}
