import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuMEWFCmMVkAV7OjiL_6mHreTit3CrG3g",
    authDomain: "todolist-project-24fb4.firebaseapp.com",
    projectId: "todolist-project-24fb4",
    storageBucket: "todolist-project-24fb4.firebasestorage.app",
    messagingSenderId: "951509501259",
    appId: "1:951509501259:web:857f3e4df32408f0b614ce"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let tasksCollection;

const tasklist = document.getElementById("task-list");
const addbutton = document.getElementById("add-button");
const logoutButton = document.getElementById("logout-button");

// タスク本体のデータ。Firestoreから読み込んだ内容を、この配列に反映する。
let tasks = [];

// setIntervalのIDを保存して、再描画時に古いタイマーを止めるための配列。
let timerIds = [];

// +ボタンを押したら、空のタスクデータをFirestoreに追加する。
addbutton.addEventListener("click", async function () {
    const now = Date.now();

    const newTask = {
        done: false,
        title: "",
        deadline: "",
        createdAt: now
    };

    await addDoc(tasksCollection, newTask);
});

// 1件のタスクをFirestoreへ保存する。
async function saveTask(task) {
    const taskRef = doc(tasksCollection, task.id);

    await updateDoc(taskRef, {
        title: task.title,
        deadline: task.deadline
    });
}

// 1件のタスクをFirestoreから削除する。
async function deleteTask(task) {
    await deleteDoc(doc(tasksCollection, task.id));
}

function saveTitleFromInput(task, titleInput) {
    task.title = titleInput.value;
    saveTask(task);
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

    tasks.forEach(function (task, index) {
        // 1タスク分の行とセルを作る。
        const row = document.createElement("tr");

        const doneCell = document.createElement("td");
        const titleCell = document.createElement("td");
        const timeCell = document.createElement("td");
        const editCell = document.createElement("td");

        // 完了チェック。チェックしたらFirestoreから削除する。
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        doneCell.appendChild(checkbox);
        checkbox.addEventListener("change", function () {
            deleteTask(task);
        });

        // タイトルがある場合は文字表示。空なら入力欄を表示する。
        if (task.title) {
            titleCell.textContent = task.title;
        } else {
            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.value = task.title;
            titleInput.placeholder = "タスクのタイトルを入力";
            titleInput.addEventListener("change", function () {
                saveTitleFromInput(task, titleInput);
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
            // 期限未設定なら、日時入力欄を出して選択後に保存する。
            const timeInput = document.createElement("input");
            timeInput.type = "datetime-local";

            timeInput.addEventListener("change", function () {
                task.deadline = timeInput.value;
                saveTask(task);
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
            newTitleInput.addEventListener("change", function () {
                saveTitleFromInput(task, newTitleInput);
            });

            // 編集後の期限を保存する。
            newTimeInput.addEventListener("change", function () {
                task.deadline = newTimeInput.value;
                saveTask(task);
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

onAuthStateChanged(auth, function (user) {
    if (!user) {
        location.href = "login.html";
        return;
    }

    tasksCollection = collection(db, "users", user.uid, "tasks");

    // ログイン中のユーザー専用のtasksコレクションを監視し、変更があれば画面を更新する。
    onSnapshot(
        query(tasksCollection, orderBy("createdAt")),
        function (snapshot) {
            tasks = snapshot.docs.map(function (documentSnapshot) {
                return {
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                };
            });

            renderTasks();
        }
    );
});

logoutButton.addEventListener("click", async function () {
    await signOut(auth);
});
