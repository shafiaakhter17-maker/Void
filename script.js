/* =========================================================
   VOID — Personal Notes & Journal App
   ========================================================= */

let entries = [];
let todos = [];

let currentType = "";
let editingId = null;
let currentReaderId = null;


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {
  try {
    entries = JSON.parse(localStorage.getItem("voidEntries")) || [];
    todos = JSON.parse(localStorage.getItem("voidTodos")) || [];

    if (!Array.isArray(entries)) entries = [];
    if (!Array.isArray(todos)) todos = [];
  } catch (error) {
    entries = [];
    todos = [];
  }
}

function saveEntries() {
  localStorage.setItem("voidEntries", JSON.stringify(entries));
}

function saveTodos() {
  localStorage.setItem("voidTodos", JSON.stringify(todos));
}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return Date.now().toString() + Math.random().toString(36).slice(2);
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Update sidebar buttons
  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.remove("active");

    if (button.dataset.page === pageId) {
      button.classList.add("active");
    }
  });

  // Update mobile navigation
  document.querySelectorAll("[data-mobile-page]").forEach(button => {
    button.classList.remove("active");

    if (button.dataset.mobilePage === pageId) {
      button.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   ENTRY EDITOR
   ========================================================= */

function openEditor(type, id = null) {
  const modal = document.getElementById("editorModal");
  const titleInput = document.getElementById("entryTitle");
  const contentInput = document.getElementById("entryContent");
  const label = document.getElementById("editorLabel");

  if (!modal || !titleInput || !contentInput) return;

  currentType = type;
  editingId = id;

  if (id) {
    const entry = entries.find(item => item.id === id);

    if (!entry) return;

    titleInput.value = entry.title || "";
    contentInput.value = entry.content || "";

    if (label) {
      label.textContent = "EDIT " + type.toUpperCase();
    }
  } else {
    titleInput.value = "";
    contentInput.value = "";

    if (label) {
      label.textContent = "NEW " + type.toUpperCase();
    }
  }

  modal.classList.add("show");
  document.body.classList.add("modal-open");

  setTimeout(() => {
    titleInput.focus();
  }, 100);
}


function closeEditor() {
  const modal = document.getElementById("editorModal");

  if (modal) {
    modal.classList.remove("show");
  }

  document.body.classList.remove("modal-open");

  editingId = null;
}


/* =========================================================
   SAVE NOTE / JOURNAL / HOBBY / MOOD / BOOK
   ========================================================= */

function saveEntry() {
  const titleInput = document.getElementById("entryTitle");
  const contentInput = document.getElementById("entryContent");

  if (!titleInput || !contentInput) return;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title && !content) {
    alert("Write something first.");
    return;
  }

  const now = new Date().toISOString();

  // EDIT EXISTING ENTRY
  if (editingId) {
    const index = entries.findIndex(entry => entry.id === editingId);

    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        title: title || "Untitled",
        content: content,
        updatedAt: now
      };
    }
  }

  // CREATE NEW ENTRY
  else {
    entries.unshift({
      id: createId(),
      type: currentType,
      title: title || "Untitled",
      content: content,
      createdAt: now,
      updatedAt: now
    });
  }

  saveEntries();

  closeEditor();

  renderAll();

  if (currentType) {
    showPage(currentType);
  }
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {
  renderEntries("journal", "journalList");
  renderEntries("notes", "notesList");
  renderEntries("hobbies", "hobbiesList");
  renderEntries("mood", "moodList");
  renderEntries("bookshelf", "bookshelfList");

  renderTodos();

  updateHomeStats();
}


/* =========================================================
   RENDER ENTRIES
   ========================================================= */

function renderEntries(type, containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const filteredEntries = entries.filter(entry => entry.type === type);

  if (filteredEntries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">✦</div>
        <h3>Nothing here yet</h3>
        <p>Your space is waiting for you to write something.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = filteredEntries
    .map(entry => {
      const preview = getPreview(entry.content);

      return `
        <article
          class="entry-card"
          data-entry-id="${escapeHTML(entry.id)}"
          tabindex="0"
        >
          <div class="entry-card-top">
            <span class="entry-type">
              ${escapeHTML(entry.type)}
            </span>

            <span class="entry-date">
              ${formatDate(entry.updatedAt || entry.createdAt)}
            </span>
          </div>

          <h3>
            ${escapeHTML(entry.title || "Untitled")}
          </h3>

          <p>
            ${escapeHTML(preview)}
          </p>

          <span class="read-more">
            Open →
          </span>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll(".entry-card").forEach(card => {
    card.addEventListener("click", () => {
      openReader(card.dataset.entryId);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openReader(card.dataset.entryId);
      }
    });
  });
}


/* =========================================================
   ENTRY PREVIEW
   ========================================================= */

function getPreview(text) {
  if (!text) {
    return "No words written yet.";
  }

  const cleanText = text.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 150) {
    return cleanText;
  }

  return cleanText.slice(0, 150) + "…";
}


/* =========================================================
   FULL PAGE READER
   ========================================================= */

function openReader(id) {
  const entry = entries.find(item => item.id === id);

  if (!entry) return;

  currentReaderId = id;

  const modal = document.getElementById("readerModal");

  const typeElement = document.getElementById("readerType");
  const titleElement = document.getElementById("readerTitle");
  const dateElement = document.getElementById("readerDate");
  const textElement = document.getElementById("readerText");

  if (!modal) return;

  if (typeElement) {
    typeElement.textContent = entry.type.toUpperCase();
  }

  if (titleElement) {
    titleElement.textContent = entry.title || "Untitled";
  }

  if (dateElement) {
    dateElement.textContent = formatDate(
      entry.updatedAt || entry.createdAt
    );
  }

  if (textElement) {
    textElement.textContent = entry.content || "";
  }

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}


function closeReader() {
  const modal = document.getElementById("readerModal");

  if (modal) {
    modal.classList.remove("show");
  }

  document.body.classList.remove("modal-open");

  currentReaderId = null;
}


/* =========================================================
   EDIT CURRENT ENTRY
   ========================================================= */

function editCurrentEntry() {
  if (!currentReaderId) return;

  const entry = entries.find(item => item.id === currentReaderId);

  if (!entry) return;

  closeReader();

  setTimeout(() => {
    openEditor(entry.type, entry.id);
  }, 100);
}


/* =========================================================
   DELETE CURRENT ENTRY
   ========================================================= */

function deleteCurrentEntry() {
  if (!currentReaderId) return;

  const entry = entries.find(item => item.id === currentReaderId);

  if (!entry) return;

  const confirmed = confirm(
    `Delete "${entry.title || "Untitled"}"?`
  );

  if (!confirmed) return;

  entries = entries.filter(item => item.id !== currentReaderId);

  saveEntries();

  closeReader();

  renderAll();
}


/* =========================================================
   TODO EDITOR
   ========================================================= */

function openTodoEditor() {
  const modal = document.getElementById("todoModal");
  const input = document.getElementById("todoInput");

  if (!modal || !input) return;

  input.value = "";

  modal.classList.add("show");
  document.body.classList.add("modal-open");

  setTimeout(() => {
    input.focus();
  }, 100);
}


function closeTodoEditor() {
  const modal = document.getElementById("todoModal");

  if (modal) {
    modal.classList.remove("show");
  }

  document.body.classList.remove("modal-open");
}


/* =========================================================
   SAVE TODO
   ========================================================= */

function saveTodo() {
  const input = document.getElementById("todoInput");

  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    alert("Write a task first.");
    return;
  }

  todos.unshift({
    id: createId(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTodos();

  closeTodoEditor();

  renderTodos();

  showPage("todo");
}


/* =========================================================
   RENDER TODOS
   ========================================================= */

function renderTodos() {
  const container = document.getElementById("todoList");

  if (!container) return;

  if (todos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">✦</div>
        <h3>No tasks yet</h3>
        <p>Add something you want to get done.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = todos
    .map(todo => {
      return `
        <div
          class="todo-item ${todo.completed ? "completed" : ""}"
          data-todo-id="${escapeHTML(todo.id)}"
        >
          <button
            class="todo-check"
            type="button"
            aria-label="Complete task"
          >
            ${todo.completed ? "✓" : ""}
          </button>

          <span class="todo-text">
            ${escapeHTML(todo.text)}
          </span>

          <button
            class="todo-delete"
            type="button"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".todo-item").forEach(item => {
    const id = item.dataset.todoId;

    const checkButton = item.querySelector(".todo-check");
    const deleteButton = item.querySelector(".todo-delete");

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        toggleTodo(id);
      });
    }

    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        deleteTodo(id);
      });
    }
  });
}


/* =========================================================
   TOGGLE TODO
   ========================================================= */

function toggleTodo(id) {
  const todo = todos.find(item => item.id === id);

  if (!todo) return;

  todo.completed = !todo.completed;

  saveTodos();

  renderTodos();
}


/* =========================================================
   DELETE TODO
   ========================================================= */

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);

  saveTodos();

  renderTodos();
}


/* =========================================================
   HOME STATISTICS
   ========================================================= */

function updateHomeStats() {
  const totalEntries = entries.length;
  const completedTodos = todos.filter(todo => todo.completed).length;

  const entryCount = document.getElementById("entryCount");
  const taskCount = document.getElementById("taskCount");

  if (entryCount) {
    entryCount.textContent = totalEntries;
  }

  if (taskCount) {
    taskCount.textContent = completedTodos;
  }
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


/* =========================================================
   ESCAPE USER TEXT
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme");

  const newTheme =
    currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute(
    "data-theme",
    newTheme
  );

  localStorage.setItem("voidTheme", newTheme);

  updateThemeButton();
}


function loadTheme() {
  const savedTheme =
    localStorage.getItem("voidTheme") || "dark";

  document.documentElement.setAttribute(
    "data-theme",
    savedTheme
  );

  updateThemeButton();
}


function updateThemeButton() {
  const button = document.getElementById("themeToggle");

  if (!button) return;

  const theme =
    document.documentElement.getAttribute("data-theme");

  button.textContent =
    theme === "light"
      ? "☾ Dark Mode"
      : "☀ Light Mode";
}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

function clearAllData() {
  const confirmed = confirm(
    "Delete all your VOID entries and tasks? This cannot be undone."
  );

  if (!confirmed) return;

  entries = [];
  todos = [];

  localStorage.removeItem("voidEntries");
  localStorage.removeItem("voidTodos");

  closeEditor();
  closeReader();
  closeTodoEditor();

  renderAll();

  showPage("home");
}


/* =========================================================
   MODAL CLICK HANDLING
   ========================================================= */

document.addEventListener("click", event => {
  const editorModal = document.getElementById("editorModal");
  const readerModal = document.getElementById("readerModal");
  const todoModal = document.getElementById("todoModal");

  if (
    editorModal &&
    event.target === editorModal
  ) {
    closeEditor();
  }

  if (
    readerModal &&
    event.target === readerModal
  ) {
    closeReader();
  }

  if (
    todoModal &&
    event.target === todoModal
  ) {
    closeTodoEditor();
  }
});


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener("keydown", event => {

  // Escape closes open modal
  if (event.key === "Escape") {
    closeEditor();
    closeReader();
    closeTodoEditor();
  }

  // Ctrl/Cmd + Enter saves entry
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "Enter"
  ) {
    const editorModal =
      document.getElementById("editorModal");

    if (
      editorModal &&
      editorModal.classList.contains("show")
    ) {
      saveEntry();
    }
  }
});


/* =========================================================
   TODO ENTER KEY
   ========================================================= */

document.addEventListener("keydown", event => {
  const todoModal =
    document.getElementById("todoModal");

  const todoInput =
    document.getElementById("todoInput");

  if (
    event.key === "Enter" &&
    todoModal &&
    todoModal.classList.contains("show") &&
    document.activeElement === todoInput
  ) {
    saveTodo();
  }
});


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  document
    .querySelectorAll("[data-mobile-page]")
    .forEach(button => {
      button.addEventListener("click", () => {
        showPage(button.dataset.mobilePage);
      });
    });

  loadData();
  loadTheme();
  renderAll();
  showPage("home");
});
