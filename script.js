/* =====================================================
   MY LITTLE NOTES
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   1. APP DATA
===================================================== */

let currentSection = "home";

let editingSection = "";

let entries = JSON.parse(
    localStorage.getItem("myLittleNotesEntries")
) || {};

let todos = JSON.parse(
    localStorage.getItem("myLittleNotesTodos")
) || [];

let moods = JSON.parse(
    localStorage.getItem("myLittleNotesMoods")
) || [];


/* =====================================================
   2. SECTION NAMES
===================================================== */

const sectionNames = {

    journal: "Journal",

    notes: "Notes",

    hobbies: "Hobbies",

    bookshelf: "Bookshelf",

    gratitude: "Gratitude",

    ideas: "Ideas",

    planner: "Planner"

};


/* =====================================================
   3. INITIALIZE APP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    showTodayDate();

    loadAllEntries();

    loadTodos();

    loadMoods();

    loadTheme();

});


/* =====================================================
   4. SHOW SECTION
===================================================== */

function showSection(sectionName) {

    currentSection = sectionName;


    /* Hide every page */

    const sections =
        document.querySelectorAll(".page-section");

    sections.forEach(function (section) {

        section.classList.remove("active-section");

    });


    /* Show selected page */

    const selectedSection =
        document.getElementById(sectionName);

    if (selectedSection) {

        selectedSection.classList.add("active-section");

    }


    /* Update sidebar */

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.classList.remove("active");

    });


    navItems.forEach(function (item) {

        const onclickValue =
            item.getAttribute("onclick");

        if (
            onclickValue &&
            onclickValue.includes(
                "'" + sectionName + "'"
            )
        ) {

            item.classList.add("active");

        }

    });


    /* Close mobile sidebar */

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.remove("open");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   5. MOBILE SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.toggle("open");

}


/* =====================================================
   6. TODAY'S DATE
===================================================== */

function showTodayDate() {

    const dateElement =
        document.getElementById("todayDate");

    if (!dateElement) return;


    const today = new Date();


    const options = {

        weekday: "short",

        day: "numeric",

        month: "short",

        year: "numeric"

    };


    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );

}


/* =====================================================
   7. OPEN WRITING EDITOR
===================================================== */

function openEditor(sectionName) {

    editingSection = sectionName;


    const modal =
        document.getElementById("editorModal");

    const sectionTitle =
        document.getElementById(
            "editorSectionName"
        );


    if (sectionTitle) {

        sectionTitle.textContent =
            sectionNames[sectionName] ||
            "New Entry";

    }


    /* IMPORTANT:
       Start with completely empty fields */

    document.getElementById(
        "entryTitle"
    ).value = "";


    document.getElementById(
        "entryContent"
    ).value = "";


    modal.classList.add("show");


    /* Put cursor in title */

    setTimeout(function () {

        document.getElementById(
            "entryTitle"
        ).focus();

    }, 100);

}


/* =====================================================
   8. CLOSE EDITOR
===================================================== */

function closeEditor() {

    const modal =
        document.getElementById("editorModal");

    modal.classList.remove("show");


    document.getElementById(
        "entryTitle"
    ).value = "";


    document.getElementById(
        "entryContent"
    ).value = "";

}


/* =====================================================
   9. SAVE ENTRY
===================================================== */

function saveEntry() {

    const titleInput =
        document.getElementById("entryTitle");

    const contentInput =
        document.getElementById("entryContent");


    const title =
        titleInput.value.trim();

    const content =
        contentInput.value.trim();


    /* Don't save completely empty entries */

    if (!title && !content) {

        alert("Write something first ♡");

        return;

    }


    /* If no title is entered,
       give the entry a simple title */

    let finalTitle = title;

    if (!finalTitle) {

        finalTitle = "Untitled";

    }


    /* Create section if it doesn't exist */

    if (!entries[editingSection]) {

        entries[editingSection] = [];

    }


    const newEntry = {

        id: Date.now(),

        title: finalTitle,

        content: content,

        date: new Date().toISOString()

    };


    /* Add newest entry at the beginning */

    entries[editingSection].unshift(
        newEntry
    );


    /* Save */

    localStorage.setItem(
        "myLittleNotesEntries",
        JSON.stringify(entries)
    );


    closeEditor();


    loadEntries(editingSection);


    /* Open section */

    showSection(editingSection);

}


/* =====================================================
   10. LOAD ALL ENTRIES
===================================================== */

function loadAllEntries() {

    Object.keys(sectionNames).forEach(
        function (sectionName) {

            loadEntries(sectionName);

        }
    );

}


/* =====================================================
   11. LOAD ENTRIES FOR A SECTION
===================================================== */

function loadEntries(sectionName) {

    const container =
        document.getElementById(
            sectionName + "Entries"
        );


    if (!container) return;


    container.innerHTML = "";


    const sectionEntries =
        entries[sectionName] || [];


    /* Empty state */

    if (sectionEntries.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Nothing here yet
                </h3>

                <p>
                    Tap + to create your first entry.
                </p>

            </div>

        `;

        return;

    }


    /* Create cards */

    sectionEntries.forEach(
        function (entry, index) {

            const card =
                document.createElement("div");

            card.className =
                "entry-card";


            const number =
                document.createElement("div");

            number.className =
                "entry-number";

            number.textContent =
                index + 1;


            const info =
                document.createElement("div");

            info.className =
                "entry-info";


            const title =
                document.createElement("h3");

            title.textContent =
                entry.title;


            const date =
                document.createElement("div");

            date.className =
                "entry-date";

            date.textContent =
                formatDate(entry.date);


            const preview =
                document.createElement("div");

            preview.className =
                "entry-preview";

            preview.textContent =
                entry.content ||
                "No text written yet";


            info.appendChild(title);

            info.appendChild(date);

            info.appendChild(preview);


            const openButton =
                document.createElement("button");

            openButton.className =
                "entry-open";

            openButton.innerHTML =
                "→";


            openButton.onclick =
                function () {

                    openEntry(
                        sectionName,
                        entry.id
                    );

                };


            card.appendChild(number);

            card.appendChild(info);

            card.appendChild(openButton);


            /* Clicking the card also opens it */

            card.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target !==
                        openButton
                    ) {

                        openEntry(
                            sectionName,
                            entry.id
                        );

                    }

                }
            );


            container.appendChild(card);

        }
    );

}


/* =====================================================
   12. FORMAT DATE
===================================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    const options = {

        day: "numeric",

        month: "short",

        year: "numeric"

    };


    return date.toLocaleDateString(
        "en-US",
        options
    );

}


/* =====================================================
   13. OPEN SAVED ENTRY
===================================================== */

function openEntry(
    sectionName,
    entryId
) {

    const sectionEntries =
        entries[sectionName] || [];


    const entry =
        sectionEntries.find(
            function (item) {

                return item.id === entryId;

            }
        );


    if (!entry) return;


    document.getElementById(
        "viewTitle"
    ).textContent = entry.title;


    document.getElementById(
        "viewDate"
    ).textContent =
        formatDate(entry.date);


    document.getElementById(
        "viewContent"
    ).textContent =
        entry.content;


    const modal =
        document.getElementById("viewModal");


    modal.classList.add("show");

}


/* =====================================================
   14. CLOSE SAVED ENTRY
===================================================== */

function closeView() {

    const modal =
        document.getElementById("viewModal");

    modal.classList.remove("show");

}


/* =====================================================
   15. CLOSE MODALS WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const editorModal =
            document.getElementById(
                "editorModal"
            );

        const viewModal =
            document.getElementById(
                "viewModal"
            );


        if (
            event.target === editorModal
        ) {

            closeEditor();

        }


        if (
            event.target === viewModal
        ) {

            closeView();

        }

    }
);


/* =====================================================
   16. TODO LIST
===================================================== */

function addTodo() {

    const text =
        prompt("What do you want to do?");


    if (!text || !text.trim()) {

        return;

    }


    const newTodo = {

        id: Date.now(),

        text: text.trim(),

        completed: false

    };


    todos.push(newTodo);


    saveTodos();

    loadTodos();

}


/* =====================================================
   17. SAVE TODOS
===================================================== */

function saveTodos() {

    localStorage.setItem(
        "myLittleNotesTodos",
        JSON.stringify(todos)
    );

}


/* =====================================================
   18. LOAD TODOS
===================================================== */

function loadTodos() {

    const container =
        document.getElementById(
            "todoList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (todos.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    Your list is empty
                </h3>

                <p>
                    Tap + to add your first task.
                </p>

            </div>

        `;

        return;

    }


    todos.forEach(
        function (todo) {

            const item =
                document.createElement("div");

            item.className =
                "todo-item";


            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.className =
                "todo-check";

            checkbox.checked =
                todo.completed;


            const text =
                document.createElement("input");

            text.type =
                "text";

            text.className =
                "todo-text";

            text.value =
                todo.text;


            if (todo.completed) {

                text.classList.add(
                    "completed"
                );

            }


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "todo-delete";

            deleteButton.innerHTML =
                '<i class="fa-regular fa-trash-can"></i>';


            /* Check / uncheck */

            checkbox.addEventListener(
                "change",
                function () {

                    todo.completed =
                        checkbox.checked;


                    text.classList.toggle(
                        "completed",
                        todo.completed
                    );


                    saveTodos();

                }
            );


            /* Edit task */

            text.addEventListener(
                "change",
                function () {

                    todo.text =
                        text.value.trim();

                    saveTodos();

                }
            );


            /* Delete task */

            deleteButton.addEventListener(
                "click",
                function () {

                    todos =
                        todos.filter(
                            function (item) {

                                return (
                                    item.id !==
                                    todo.id
                                );

                            }
                        );


                    saveTodos();

                    loadTodos();

                }
            );


            item.appendChild(checkbox);

            item.appendChild(text);

            item.appendChild(deleteButton);


            container.appendChild(item);

        }
    );

}


/* =====================================================
   19. MOOD
===================================================== */

function saveMood(moodName) {

    const newMood = {

        id: Date.now(),

        mood: moodName,

        date: new Date().toISOString()

    };


    moods.unshift(newMood);


    /* Keep the last 30 moods */

    moods =
        moods.slice(0, 30);


    localStorage.setItem(
        "myLittleNotesMoods",
        JSON.stringify(moods)
    );


    loadMoods();

}


/* =====================================================
   20. LOAD MOODS
===================================================== */

function loadMoods() {

    const container =
        document.getElementById(
            "moodEntries"
        );


    if (!container) return;


    container.innerHTML = "";


    if (moods.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    No moods recorded yet
                </h3>

                <p>
                    Choose a mood above.
                </p>

            </div>

        `;

        return;

    }


    moods.forEach(
        function (mood) {

            const card =
                document.createElement("div");

            card.className =
                "entry-card";


            const icon =
                document.createElement("div");

            icon.className =
                "entry-number";

            icon.textContent =
                "♡";


            const info =
                document.createElement("div");

            info.className =
                "entry-info";


            const title =
                document.createElement("h3");

            title.textContent =
                mood.mood;


            const date =
                document.createElement("div");

            date.className =
                "entry-date";

            date.textContent =
                formatDate(mood.date);


            info.appendChild(title);

            info.appendChild(date);


            card.appendChild(icon);

            card.appendChild(info);


            container.appendChild(card);

        }
    );

}


/* =====================================================
   21. THEME
===================================================== */

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const isLight =
        document.body.classList.contains(
            "light-mode"
        );


    localStorage.setItem(
        "myLittleNotesTheme",
        isLight
            ? "light"
            : "dark"
    );


    updateThemeIcon();

}


/* =====================================================
   22. LOAD THEME
===================================================== */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "myLittleNotesTheme"
        );


    if (savedTheme === "light") {

        document.body.classList.add(
            "light-mode"
        );

    }


    updateThemeIcon();

}


/* =====================================================
   23. UPDATE THEME ICON
===================================================== */

function updateThemeIcon() {

    const buttons =
        document.querySelectorAll(
            ".theme-button"
        );


    buttons.forEach(
        function (button) {

            if (
                document.body.classList.contains(
                    "light-mode"
                )
            ) {

                button.innerHTML =
                    '<i class="fa-regular fa-sun"></i>';

            } else {

                button.innerHTML =
                    '<i class="fa-regular fa-moon"></i>';

            }

        }
    );

}


/* =====================================================
   24. CLEAR ALL DATA
===================================================== */

function clearAllData() {

    const answer =
        confirm(
            "Are you sure you want to delete all your saved notes, journal entries, tasks and moods?"
        );


    if (!answer) return;


    localStorage.removeItem(
        "myLittleNotesEntries"
    );

    loc
