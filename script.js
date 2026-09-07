/* =========================================
   VOID — MAIN JAVASCRIPT
========================================= */


/* =========================================
   DATA
========================================= */

let entries = JSON.parse(
  localStorage.getItem("voidEntries")
) || [];

let todos = JSON.parse(
  localStorage.getItem("voidTodos")
) || [];

let currentType = "";
let editingId = null;


/* =========================================
   START APP
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  updateDate();

  renderAll();

  loadTheme();

});


/* =========================================
   DATE
========================================= */

function updateDate() {

  const dateElement =
    document.getElementById("currentDate");

  if (!dateElement) return;

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  dateElement.textContent =
    today.toLocaleDateString(
      "en-US",
      options
    );
}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

  const pages =
    document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active-page");
  });


  const selected =
    document.getElementById(pageId);

  if (selected) {
    selected.classList.add("active-page");
  }


  /* Update sidebar */

  const navItems =
    document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.classList.remove("active");
  });


  navItems.forEach(item => {

    const onclick =
      item.getAttribute("onclick");

    if (
      onclick &&
      onclick.includes("'" + pageId + "'")
    ) {
      item.classList.add("active");
    }

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================
   OPEN EDITOR
========================================= */

function openEditor(type, id = null) {

  currentType = type;

  editingId = id;


  const modal =
    document.getElementById("editorModal");

  const title =
    document.getElementById("editorTitle");

  const input =
    document.getElementById("entryTitle");

  const textarea =
    document.getElementById("entryContent");


  /* Reset */

  input.value = "";
  textarea.value = "";


  /* Different editor names */

  const names = {
    journal: "New Journal",
    notes: "New Note",
    hobbies: "New Hobby",
    mood: "New Mood Entry",
    bookshelf: "Add Book",
    todo: "New Task"
  };


  title.textContent =
    names[type] || "New Entry";


  /* Editing existing entry */

  if (id !== null) {

    const existing =
      entries.find(entry => entry.id === id);

    if (existing) {

      input.value =
        existing.title;

      textarea.value =
        existing.content;

      title.textContent =
        "Edit Entry";

    }

  }


  modal.classList.add("show");

  setTimeout(() => {
    input.focus();
  }, 100);

}


/* =========================================
   CLOSE EDITOR
========================================= */

function closeEditor() {

  const modal =
    document.getElementById("editorModal");

  modal.classList.remove("show");

  document.getElementById("entryTitle").value = "";

  document.getElementById("entryContent").value = "";

  currentType = "";

  editingId = null;
}


/* =========================================
   SAVE ENTRY
========================================= */

function saveEntry() {

  const title =
    document.getElementById("entryTitle")
      .value
      .trim();

  const content =
    document.getElementById("entryContent")
      .value
      .trim();


  /* Don't allow completely empty entries */

  if (!title && !content) {

    alert(
      "Please write something first."
    );

    return;
  }


  /* =====================================
     TODO
  ===================================== */

  if (currentType === "todo") {

    const taskText =
      title || content;

    todos.push({

      id: Date.now(),

      text: taskText,

      completed: false

    });


    saveTodos();

    closeEditor();

    renderTodos();

    showPage("todo");

    return;
  }


  /* =====================================
     NORMAL ENTRY
  ===================================== */

  if (editingId !== null) {

    const index =
      entries.findIndex(
        entry => entry.id === editingId
      );


    if (index !== -1) {

      entries[index].title =
        title || "Untitled";

      entries[index].content =
        content;

      entries[index].updated =
        new Date().toISOString();

    }

  } else {

    entries.unshift({

      id: Date.now(),

      type: currentType,

      title: title || "Untitled",

      content: content,

      created:
        new Date().toISOString(),

      updated:
        new Date().toISOString()

    });

  }


  saveEntries();

  closeEditor();

  renderAll();

}


/* =========================================
   SAVE ENTRIES
========================================= */

function saveEntries() {

  localStorage.setItem(
    "voidEntries",
    JSON.stringify(entries)
  );

}


/* =========================================
   SAVE TODOS
========================================= */

function saveTodos() {

  localStorage.setItem(
    "voidTodos",
    JSON.stringify(todos)
  );

}


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderAll() {

  renderEntries(
    "journal",
    "journalList"
  );

  renderEntries(
    "notes",
    "notesList"
  );

  renderEntries(
    "hobbies",
    "hobbiesList"
  );

  renderEntries(
    "mood",
    "moodList"
  );

  renderEntries(
    "bookshelf",
    "bookshelfList"
  );

  renderTodos();

}


/* =========================================
   RENDER ENTRIES
========================================= */

function renderEntries(type, containerId) {

  const container =
    document.getElementById(containerId);

  if (!container) return;


  const filtered =
    entries.filter(
      entry => entry.type === type
    );


  /* Empty */

  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">♡</div>

        <h3>Nothing here yet</h3>

        <p>
          Tap + to write something
        </p>

      </div>

    `;

    return;
  }


  /* Entries */

  container.innerHTML =
    filtered
      .map((entry, index) => {

        const date =
          formatDate(
            entry.created
          );


        const preview =
          escapeHTML(
            entry.content
          );


        return `

          <article
            class="entry"
            onclick="openEntry(${entry.id})"
          >

            <div class="entry-number">

              ${String(index + 1).padStart(2, "0")}

            </div>


            <div class="entry-info">

              <h3>
                ${escapeHTML(entry.title)}
              </h3>

              <div class="entry-date">
                ${date}
              </div>

              ${
                preview
                  ? `
                    <div class="entry-preview">
                      ${preview}
                    </div>
                  `
                  : ""
              }

            </div>


            <div class="entry-arrow">
              →
            </div>

          </article>

        `;

      })
      .join("");

}


/* =========================================
   OPEN A PARTICULAR ENTRY
========================================= */

function openEntry(id) {

  const entry =
    entries.find(
      item => item.id === id
    );

  if (!entry) return;


  const modal =
    document.getElementById("editorModal");


  const title =
    document.getElementById("editorTitle");

  const input =
    document.getElementById("entryTitle");

  const textarea =
    document.getElementById("entryContent");


  currentType =
    entry.type;

  editingId =
    entry.id;


  title.textContent =
    "Your Entry";

  input.value =
    entry.title;

  textarea.value =
    entry.content;


  modal.classList.add("show");

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

  const date =
    new Date(dateString);


  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================================
   TODO RENDER
========================================= */

function renderTodos() {

  const container =
    document.getElementById("todoList");

  if (!container) return;


  if (todos.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">☑</div>

        <h3>No tasks yet</h3>

        <p>
          Tap + to add your first task
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    todos
      .map(todo => {

        return `

          <div
            class="todo-item
            ${todo.completed ? "completed" : ""}"
          >

            <button
              class="todo-check"
              onclick="toggleTodo(${todo.id})"
            >
              ✓
            </button>


            <div
              class="todo-text"
              onclick="toggleTodo(${todo.id})"
            >
              ${escapeHTML(todo.text)}
            </div>


            <button
              class="todo-delete"
              onclick="deleteTodo(${todo.id})"
            >
              ×
            </button>

          </div>

        `;

      })
      .join("");

}


/* =========================================
   TOGGLE TODO
========================================= */

function toggleTodo(id) {

  const todo =
    todos.find(
      item => item.id === id
    );

  if (!todo) return;


  todo.completed =
    !todo.completed;


  saveTodos();

  renderTodos();

}


/* =========================================
   DELETE TODO
========================================= */

function deleteTodo(id) {

  todos =
    todos.filter(
      todo => todo.id !== id
    );


  saveTodos();

  renderTodos();

}


/* =========================================
   DELETE ENTRY
========================================= */

function deleteEntry(id) {

  entries =
    entries.filter(
      entry => entry.id !== id
    );


  saveEntries();

  renderAll();

  closeEditor();

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

  if (!text) return "";

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================
   THEME
========================================= */

function toggleTheme() {

  document.body.classList.toggle(
    "light"
  );


  const isLight =
    document.body.classList.contains(
      "light"
    );


  localStorage.setItem(
    "voidTheme",
    isLight
      ? "light"
      : "dark"
  );

}


/* =========================================
   LOAD THEME
========================================= */

function loadTheme() {

  const theme =
    localStorage.getItem(
      "voidTheme"
    );


  if (theme === "light") {

    document.body.classList.add(
      "light"
    );

  }

}


/* =========================================
   DELETE EVERYTHING
========================================= */

function clearAllData() {

  const confirmation =
    confirm(
      "Delete all your VOID entries and tasks?"
    );


  if (!confirmation) return;


  entries = [];

  todos = [];


  saveEntries();

  saveTodos();


  renderAll();


  alert(
    "All saved entries have been deleted."
  );

}


/* =========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener(
  "click",
  event => {

    const modal =
      document.getElementById(
        "editorModal"
      );


    if (
      event.target === modal
    ) {

      closeEditor();

    }

  }
);


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeEditor();

    }

  }
);
