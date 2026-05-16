const tasklist = document.getElementById("task-list");
const addbutton = document.getElementById("add-button");
addbutton.addEventListener("click", function () {

    const row = document.createElement("tr");
    const doneCell = document.createElement("td");
    const titleCell = document.createElement("td");
    const timeCell = document.createElement("td");
    const editCell = document.createElement("td");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
    row.remove();
});
    doneCell.appendChild(checkbox);

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "タスクのタイトルを入力";
    titleInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        titleCell.textContent = titleInput.value;
    }
});
    titleCell.appendChild(titleInput);

    const timeInput = document.createElement("input");//time処理
    timeInput.type = "datetime-local";

    let timerId;
    let deadlineValue = "";

    timeInput.addEventListener("change", function () {
        deadlineValue = timeInput.value;
        const deadline = new Date(timeInput.value);
        clearInterval(timerId);//既存のタイマーをクリア
        timerId = setInterval(function () {
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
        }, 1000);
});
    timeCell.appendChild(timeInput);//終了

    
    const editButton = document.createElement("button");//編集機能
    editButton.addEventListener("click", function () {
    const currentTitle = titleCell.textContent;
    titleCell.textContent = "";
    const newTitleInput = document.createElement("input");
    newTitleInput.type = "text";
    newTitleInput.value = currentTitle;
    clearInterval(timerId);
    timeCell.textContent = "";
    const newTimeInput = document.createElement("input");
    newTimeInput.type = "datetime-local";
    newTimeInput.value = deadlineValue;

    newTimeInput.addEventListener("change", function () {
      
    timerId = setInterval(function () {
        deadlineValue = newTimeInput.value;
        const deadline = new Date(newTimeInput.value);
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
    }, 1000);
});

    newTitleInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            titleCell.textContent = newTitleInput.value;
            timeCell.textContent = newTimeInput.value;
        }
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
