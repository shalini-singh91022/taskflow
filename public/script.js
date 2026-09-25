const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

let tasks = [];


// Get all tasks
async function fetchTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        tasks = await response.json();

        displayTasks();

    } catch (error) {
        console.error(error);
        taskList.innerHTML = "<p>Failed to load tasks.</p>";
    }
}


// Display tasks
function displayTasks() {

    const searchText = searchInput.value.toLowerCase();
    const filter = filterSelect.value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            filter === "all" ||
            (filter === "active" && !task.completed) ||
            (filter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });


    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "<p>No tasks found.</p>";
        return;
    }


    filteredTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        if (task.completed) {
            taskCard.classList.add("completed");
        }


        taskCard.innerHTML = `
            <h3>${task.title}</h3>

            <p>${task.description || "No description"}</p>

            <p>
                <strong>Priority:</strong>
                ${task.priority}
            </p>

            <p>
                <strong>Due:</strong>
                ${
                    task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"
                }
            </p>

           <div class="task-actions">

    ${
        !task.completed
            ? `<button onclick="completeTask('${task._id}')">
                Complete
               </button>`
            : ""
    }

    <button onclick="editTask('${task._id}')">
        Edit
    </button>

    <button onclick="deleteTask('${task._id}')">
        Delete
    </button>

</div>
        `;

        taskList.appendChild(taskCard);
    });
}


// Create task
taskForm.addEventListener("submit", async (event) => {

    event.preventDefault();
    const titleInput = document.getElementById("title");

if (titleInput.value.trim() === "") {
    alert("Task title is required");
    return;
}

    const editingId = taskForm.dataset.editingId;

    const taskData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        dueDate: document.getElementById("dueDate").value || undefined
    };

    try {

        let response;

        if (editingId) {

            response = await fetch(`/api/tasks/${editingId}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(taskData)
            });

        } else {

            response = await fetch("/api/tasks", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(taskData)
            });
        }

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Operation failed");
            return;
        }

        taskForm.reset();

        delete taskForm.dataset.editingId;

        document.getElementById("submitButton").textContent =
            "Add Task";

        fetchTasks();

    } catch (error) {

        console.error(error);

        alert("Something went wrong");
    }
});

// Complete task
async function completeTask(id) {

    try {

        const response = await fetch(
            `/api/tasks/${id}/complete`,
            {
                method: "PATCH"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to complete task");
        }


        fetchTasks();

    } catch (error) {

        console.error(error);

        alert("Failed to complete task");
    }
}
function editTask(id) {

    const task = tasks.find(task => task._id === id);

    if (!task) {
        return;
    }

    document.getElementById("title").value = task.title;
    document.getElementById("description").value =
        task.description || "";

    document.getElementById("priority").value =
        task.priority;

    document.getElementById("dueDate").value =
        task.dueDate
            ? task.dueDate.split("T")[0]
            : "";

    taskForm.dataset.editingId = id;

    document.getElementById("submitButton").textContent =
        "Update Task";
}


// Delete task
async function deleteTask(id) {

    try {

        const response = await fetch(
            `/api/tasks/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete task");
        }


        fetchTasks();

    } catch (error) {

        console.error(error);

        alert("Failed to delete task");
    }
}


// Search
searchInput.addEventListener("input", displayTasks);


// Filter
filterSelect.addEventListener("change", displayTasks);


// Load tasks when page opens
fetchTasks();