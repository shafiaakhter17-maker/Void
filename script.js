/* =========================================
   VOID
   Personal Notes & Journal App
========================================= */


/* =========================================
   DATA
========================================= */

let entries =
  JSON.parse(localStorage.getItem("voidEntries")) || [];

let todos =
  JSON.parse(localStorage.getItem("voidTodos")) || [];

let currentType = "";
let editingId = null;
let currentReaderId = null;



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


  const buttons =
    document.querySelectorAll(".nav-btn");

  buttons.forEach(button => {
    button.classList.remove("active");
  });


  buttons.forEach(button => {

    const text =
      button.textContent
        .trim()
        .toLowerCase();

    if (
      (pageId === "home" && text.includes("home")) ||
      (pageId === "journal" && text.includes("journal")) ||
      (pageId === "notes" && text.includes("notes")) ||
      (pageId === "todo" && text.includes("to do")) ||
      (pageId === "hobbies" && text.includes("hobbies")) ||
      (pageId === "mood" && text.includes("mood")) ||
      (pageId === "bookshelf" && text.includes("bookshelf")) ||
      (pageId === "settings" && text.includes("settings"))
    ) {
      button.classList.add("active");
    }

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}



/* =========================================
   ENTRY EDITOR
========================================= */

function openEditor(type, id = null) {

  currentType = type;
  editingId = id;

  const modal =
    document.getElementById("editorModal");

  const title =
    document.getElementById("editorTitle");

  const label =
    document.getElementById("editorLabel");

  const titleInput =
    document.getElementById("entryTitle");

  const contentInput =
    document.getElementById("entryContent");


  const names = {
    journal: "Journal",
    notes: "Note",
    hobbies: "Hobby",
    mood: "Mood",
    bookshelf: "Book"
  };


  label.textContent =
    id ? "EDIT ENTRY" : "NEW " + names[type].toUpperCase();


  title.textContent =
    id ? "Edit your writing" : names[type];


  titleInput.value = "";
  contentInput.value = "";


  if (id) {

    const entry =
      entries.find(item => item.id === id);

    if (entry) {

      titleInput.value =
        entry.title;

      contentInput.value =
        entry.content;

    }

  }


  modal.classList.add("show");

  setTimeout(() => {
    titleInput.focus();
  }, 100);
}



function closeEditor() {

  document
    .getElementById("editorModal")
    .classList.remove("show");

  editingId = null;

}



/* =========================================
   SAVE ENTRY
========================================= */

function saveEntry() {

  const titleInput =
    document.getElementById("entryTitle");

  const contentInput =
    document.getElementById("entryContent");


  const title =
    titleInput.value.trim();

  const content =
    contentInput.value.trim();


  if (!title && !content) {

    alert("Write something first.");

    return;
  }


  const finalTitle =
    title || "Untitled";


  if (editingId) {

    const index =
      entries.findIndex(
        item => item.id === editingId
      );


    if (index !== -1) {

      entries[index].title =
        finalTitle;

      entries[index].content =
        content;

      entries[index].updated =
        new Date().toISOString();

    }

  } else {

    entries.unshift({

      id:
        Date.now().toString(),

      type:
        currentType,

      title:
        finalTitle,

      content:
        content,

      created:
        new Date().toISOString(),

      updated:
        new Date().toISOString()

    });

  }


  localStorage.setItem(
    "voidEntries",
    JSON.stringify(entries)
  );


  closeEditor();

  renderAll();

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


  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="empty">

        <div class="empty-symbol">+</div>

        <h3>Nothing here yet.</h3>

        <p>
          Create your first entry whenever you're ready.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    filtered.map(entry => {

      const preview =
        escapeHTML(
          entry.content || ""
        );


      const title =
        escapeHTML(entry.title);


      return `

        <article
          class="entry-card"
          onclick="openReader('${entry.id}')"
        >

          <div class="entry-type">
            ${type.toUpperCase()}
          </div>

          <h3>
            ${title}
          </h3>

          <p class="entry-preview">
            ${preview || "No text added."}
          </p>

          <div class="entry-date">
            ${formatDate(entry.created)}
          </div>

        </article>

      `;

    }).join("");

}



/* =========================================
   READER
========================================= */

function openReader(id) {

  const entry =
    entries.find(
      item => item.id === id
    );


  if (!entry) return;


  currentReaderId = id;


  document.getElementById(
    "readerType"
  ).textContent =
    entry.type.toUpperCase();


  document.getElementById(
    "readerTitle"
  ).textContent =
    entry.title;


  document.getElementById(
    "readerDate"
  ).textContent =
    formatDate(entry.created);


  document.getElementById(
    "readerText"
  ).textContent =
    entry.content || "";


  document
    .getElementById("readerModal")
    .classList.add("show");


  document.body.style.overflow =
    "hidden";

}



function closeReader() {

  document
    .getElementById("readerModal")
    .classList.remove("show");


  document.body.style.overflow =
    "";

  currentReaderId = null;

}



/* =========================================
   EDIT FROM READER
========================================= */

function editCurrentEntry() {

  if (!currentReaderId) return;


  const entry =
    entries.find(
      item => item.id === currentReaderId
    );


  if (!entry) return;


  closeReader();

  openEditor(
    entry.type,
    entry.id
  );

}



/* =========================================
   DELETE ENTRY
========================================= */

function deleteCurrentEntry() {

  if (!currentReaderId) return;


  const confirmed =
    confirm(
      "Delete this entry?"
    );


  if (!confirmed) return;


  entries =
    entries.filter(
      item => item.id !== currentReaderId
    );


  localStorage.setItem(
    "voidEntries",
    JSON.stringify(entries)
  );


  closeReader();

  renderAll();

}



/* =========================================
   TODO EDITOR
========================================= */

function openTodoEditor() {

  document
    .getElementById("todoModal")
    .classList.add("show");


  document
    .getElementById("todoInput")
    .value = "";


  setTimeout(() => {

    document
      .getElementById("todoInput")
      .focus();

  }, 100);

}



function closeTodoEditor() {

  document
    .getElementById("todoModal")
    .classList.remove("show");

}



/* =========================================
   SAVE TODO
========================================= */

function saveTodo() {

  const input =
    document.getElementById("todoInput");


  const text =
    input.value.trim();


  if (!text) {

    alert("Write a task first.");

    return;
  }


  todos.unshift({

    id:
      Date.now().toString(),

    text:
      text,

    completed:
      false,

    created:
      new Date().toISOString()

  });


  localStorage.setItem(
    "voidTodos",
    JSON.stringify(todos)
  );


  closeTodoEditor();

  renderTodos();

}



/* =========================================
   RENDER TODO
========================================= */

function renderTodos() {

  const container =
    document.getElementById("todoList");


  if (!container) return;


  if (todos.length === 0) {

    container.innerHTML = `

      <div class="empty">

        <div class="empty-symbol">✓</div>

        <h3>No tasks yet.</h3>

        <p>
          Add something you want to accomplish.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    todos.map(todo => `

      <div
        class="todo-item
        ${todo.completed ? "completed" : ""}"
      >

        <button
          class="todo-check"
          onclick="toggleTodo('${todo.id}')"
        >
          ${todo.completed ? "✓" : ""}
        </button>


        <div class="todo-text">
          ${escapeHTML(todo.text)}
        </div>


        <button
          class="delete-task"
          onclick="deleteTodo('${todo.id}')"
        >
          ×
        </button>

      </div>

    `).join("");

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


  localStorage.setItem(
    "voidTodos",
    JSON.stringify(todos)
  );


  renderTodos();

}



/* =========================================
   DELETE TODO
========================================= */

function deleteTodo(id) {

  todos =
    todos.filter(
      item => item.id !== id
    );


  localStorage.setItem(
    "voidTodos",
    JSON.stringify(todos)
  );


  renderTodos();

}



/* =========================================
   DATE
========================================= */

function formatDate(date) {

  const d =
    new Date(date);


  return d.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}



/* =========================================
   SECURITY
========================================= */

function escapeHTML(text) {

  return String(text)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}



/* =========================================
   THEME
========================================= */

function toggleTheme() {

  document.body.classList.toggle("light");


  const isLight =
    document.body.classList.contains("light");


  localStorage.setItem(
    "voidTheme",
    isLight ? "light" : "dark"
  );

}



function loadTheme() {

  const theme =
    localStorage.getItem("voidTheme");


  if (theme === "light") {

    document.body.classList.add("light");

  }

}



/* =========================================
   CLEAR EVERYTHING
========================================= */

function clearAllData() {

  const confirmed =
    confirm(
      "This will delete all your entries and tasks. Continue?"
    );


  if (!confirmed) return;


  entries = [];
  todos = [];


  localStorage.removeItem(
    "voidEntries"
  );

  localStorage.removeItem(
    "voidTodos"
  );


  renderAll();

}



/* =========================================
   MODAL CLICK OUTSIDE
========================================= */

document.addEventListener(
  "click",
  function(event) {

    const editor =
      document.getElementById(
        "editorModal"
      );

    const todoModal =
      document.getElementById(
        "todoModal"
      );


    if (
      event.target === editor
    ) {
      closeEditor();
    }


    if (
      event.target === todoModal
    ) {
      closeTodoEditor();
    }

  }
);



/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Escape") {

      closeEditor();

      closeTodoEditor();

      closeReader();

    }

  }
);



/* =========================================
   START APP
========================================= */

loadTheme();

renderAll();

showPage("home");
