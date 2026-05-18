const tasklist = document.getElementById("task-list");
const addbutton = document.getElementById("add-button");

let tasks = [];//保存用の配列の宣言
let timerIds = [];

addbutton.addEventListener("click", function () {

    const newTask = {
        done: false,
        title: "",
        deadline: ""
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
});
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}
function renderTasks() {
    timerIds.forEach(function (timerId) {
        clearInterval(timerId);
    });
    timerIds = [];
    tasklist.innerHTML = "";

    tasks.forEach(function (task,index) {
        const row = document.createElement("tr");

        const doneCell = document.createElement("td");
        const titleCell = document.createElement("td");
        const timeCell = document.createElement("td");
        const editCell = document.createElement("td");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        doneCell.appendChild(checkbox);
        checkbox.addEventListener("change", function () {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
});
        if (task.title) {
        titleCell.textContent = task.title;
        } else {
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = task.title;
        titleInput.placeholder = "タスクのタイトルを入力";
        titleInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                task.title = titleInput.value;
                saveTasks();
                renderTasks();
            }
        });
        titleCell.appendChild(titleInput);
}

if (task.deadline) {
    let timerId;

    function updateCountdown() {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            timeCell.textContent = "期限切れ";
            clearInterval(timerId);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const minutes = Math.floor(diff / (1000 * 60)) % 60;
        const seconds = Math.floor(diff / 1000) % 60;

        timeCell.textContent =
            days + "d" + hours + "h" + minutes + "m" + seconds + "s";
    }
    updateCountdown();
    timerId = setInterval(updateCountdown, 1000);
    timerIds[index] = timerId;


} else {
    const timeInput = document.createElement("input");
    timeInput.type = "datetime-local";

    timeInput.addEventListener("change", function () {
        task.deadline = timeInput.value;
        saveTasks();
        renderTasks();
    });

    timeCell.appendChild(timeInput);
}

        const editButton = document.createElement("button");
        editButton.addEventListener("click", function () {
            clearInterval(timerIds[index]);

    titleCell.textContent = "";
    timeCell.textContent = "";

    const newTitleInput = document.createElement("input");
    newTitleInput.type = "text";
    newTitleInput.value = task.title;

    const newTimeInput = document.createElement("input");
    newTimeInput.type = "datetime-local";
    newTimeInput.value = task.deadline;

    newTitleInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            task.title = newTitleInput.value;
            saveTasks();
            renderTasks();
        }
    });

    newTimeInput.addEventListener("change", function () {
        task.deadline = newTimeInput.value;
        saveTasks();
        renderTasks();
    });

    titleCell.appendChild(newTitleInput);
    timeCell.appendChild(newTimeInput);
});
        editButton.innerHTML = "&hellip;";
        editCell.appendChild(editButton);
        

        row.appendChild(doneCell);
        row.appendChild(titleCell);
        row.appendChild(timeCell);
        row.appendChild(editCell);

        tasklist.appendChild(row);
    });
}
loadTasks();
renderTasks();
