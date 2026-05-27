const tasklist = document.getElementById("task-list");
const addbutton = document.getElementById("add-button");

// タスク本体のデータ。画面ではなく、この配列を正として扱う。
let tasks = [];

// setIntervalのIDを保存して、再描画時に古いタイマーを止めるための配列。
let timerIds = [];

// +ボタンを押したら、空のタスクデータを作って保存・再描画する。
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

// tasks配列をlocalStorageに保存する。
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// localStorageから保存済みタスクを読み込んでtasks配列に戻す。
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// tasks配列をもとに、表の中身を作り直す。
function renderTasks() {
    // 再描画前に、前回作ったタイマーをすべて止める。
    timerIds.forEach(function (timerId) {
        clearInterval(timerId);
    });
    timerIds = [];

    // 表示済みの行を一度空にして、tasksから作り直す。
    tasklist.innerHTML = "";

    tasks.forEach(function (task,index) {
        // 1タスク分の行とセルを作る。
        const row = document.createElement("tr");

        const doneCell = document.createElement("td");
        const titleCell = document.createElement("td");
        const timeCell = document.createElement("td");
        const editCell = document.createElement("td");

        // 完了チェック。チェックしたらtasksから削除して保存・再描画する。
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        doneCell.appendChild(checkbox);
        checkbox.addEventListener("change", function () {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
	});

        // タイトルがある場合は文字表示。空なら入力欄を表示する。
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

    // 期限がある場合はカウントダウン表示。空なら日時入力欄を表示する。
	if (task.deadline) {
	    let timerId;

    // 期限までの残り時間を計算してtimeCellに表示する。
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
    // 空白の一瞬をなくすため、まず即時実行してから1秒ごとに更新する。
	    updateCountdown();
	    timerId = setInterval(updateCountdown, 1000);
	    timerIds[index] = timerId;


	} else {
        // 期限未設定なら、日時入力欄を出して選択後に保存・再描画する。
	    const timeInput = document.createElement("input");
	    timeInput.type = "datetime-local";

    timeInput.addEventListener("change", function () {
        task.deadline = timeInput.value;
        saveTasks();
        renderTasks();
    });

	    timeCell.appendChild(timeInput);
	}

        // 編集ボタン。押すとタイトルと期限を入力欄に戻す。
        const editButton = document.createElement("button");
        editButton.addEventListener("click", function () {
            // 編集中にカウントダウンが入力欄を上書きしないよう、この行のタイマーを止める。
            clearInterval(timerIds[index]);

    titleCell.textContent = "";
    timeCell.textContent = "";

    const newTitleInput = document.createElement("input");
    newTitleInput.type = "text";
    newTitleInput.value = task.title;

    const newTimeInput = document.createElement("input");
    newTimeInput.type = "datetime-local";
    newTimeInput.value = task.deadline;

    // 編集後のタイトルを保存する。
    newTitleInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            task.title = newTitleInput.value;
            saveTasks();
            renderTasks();
        }
    });

    // 編集後の期限を保存する。
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
        

        // 作ったセルを行に入れ、行をtbodyに追加する。
        row.appendChild(doneCell);
        row.appendChild(titleCell);
        row.appendChild(timeCell);
        row.appendChild(editCell);

        tasklist.appendChild(row);
    });
}

// ページを開いたときに保存データを読み込み、画面に表示する。
loadTasks();
renderTasks();
