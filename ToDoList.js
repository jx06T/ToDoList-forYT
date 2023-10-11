const notes1 = document.querySelector('#notes1');
const notes2 = document.querySelector('#notes2');
const sortSB = document.querySelector('#sortS');
const sortTB = document.querySelector('#sortT');
const TodoList = document.querySelector(".todo-list")

const states = { "✖": ["★", "S3", "S1"], "★": ["✔", "S1", "S2"], "✔": ["！", "S2", "S4"], "！": ["✖", "S4", "S3"] }
const SortState = { "1": "↓", "2": "–", "3": "↑" }
const StateSort = ["！", "★", "✖", "✔"]
const timeIntervals = [
    3, 5, 10, 30, 60, 90, 120, 180, 300, 420, 540, 720, 1440, 2160, 2880,
    3600, 4320, 5184, 6048, 10080, 20160, 30240
];
const timeIntervalStrings = timeIntervals.map(GetTextTime);

function findClosestNumber(target) {
    let array = timeIntervals
    let closestNumber = array[0]; // 預設最接近的數字為陣列的第一個數字
    let minDifference = Math.abs(target - closestNumber); // 預設最小差距為目標數字與第一個數字的差距
    let index = 0
    for (let i = 1; i < array.length; i++) {
        const difference = Math.abs(target - array[i]);
        if (difference < minDifference) {
            minDifference = difference;
            closestNumber = array[i];
            index = i
        }
    }
    return index;
}

function GetTextTime(interval) {
    if (interval == "－－－") {
        return "－－－"
    }
    if (interval < 60) {
        return `${interval} min`;
    } else if (interval < 1440) {
        const hours = Math.floor(interval / 60);
        const minutes = interval % 60;
        return `${hours} hr ${minutes} min`;
    } else if (interval < 10080) {
        const days = Math.floor(interval / 1440);
        const hours = Math.floor((interval % 1440) / 60);
        return `${days} day ${hours} hr`;
    } else {
        const weeks = Math.floor(interval / 10080);
        const days = Math.floor((interval % 10080) / 1440);
        return `${weeks} week ${days} day`;
    }
}
// console.log(timeIntervalStrings);
let AllNote = []
let AllTodo = []
let isNeedUpData = false
function InitData() {
    chrome.storage.local.get(["AllTodo"]).then((result) => {
        AllTodo = result.AllTodo
        if (AllTodo.length == 0) {
            sortTB.dataset.s = 2
            sortSB.dataset.s = 2
            return
        }
        const s = AllTodo[0]._sort_
        console.log(s)
        sortTB.dataset.s = s > 0 ? s + 2 : 2
        sortSB.dataset.s = s < 0 ? s + 6 : 2
    })
    chrome.storage.local.get(["AllNote"]).then((result) => {
        AllNote = result.AllNote
        let tempSore = 2
        if (AllTodo.length > 0) {
            tempSore = AllTodo[0]._sort_
        }
        setTimeout(() => {
            InitTable(tempSore)
        }, 10);
    })
}
chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === 'local') {
        if (changes.AllNote) {
            AllNote = changes.AllNote.newValue
            isNeedUpData = true
        }
        if (changes.AllTodo) {
            isNeedUpData = true
            AllTodo = changes.AllTodo.newValue
            if (AllTodo.length == 0) {
                return
            }
            if (!AllTodo[0]._sort_) {
                AllTodo[0]._sort_ = 1
            }

        }

    }
});
window.addEventListener('focus', () => {
    if (isNeedUpData) {
        if (AllTodo.length == 0) {
            return
        }
        InitTable(AllTodo[0]._sort_)
        isNeedUpData = false
    }
});


function InitTable(_sort_, t) {
    if (_sort_ > 0) {
        sortTB.innerText = SortState[_sort_]
        sortTB.classList.remove("second")
        sortSB.classList.add("second")
    } else {
        sortSB.innerText = SortState[_sort_ + 4]
        sortSB.classList.remove("second")
        sortTB.classList.add("second")
    }
    console.log("!", _sort_)
    const half = Math.round(AllNote.length / 2)
    const n1c = notes1.querySelectorAll("tr")
    const n2c = notes2.querySelectorAll("tr")
    for (let i = 1; i < n1c.length; i++) {
        n1c[i].remove()
    }
    for (let i = 1; i < n2c.length; i++) {
        n2c[i].remove()
    }
    for (let i = 0; i < half; i++) {
        const aNote = AllNote[i];
        const newNote = GetNewNote(aNote.text, aNote.time, i)
        notes1.appendChild(newNote)
        const t = newNote.querySelector(".Mytextarea1")
        t.style.height = 'auto';
        t.style.height = t.scrollHeight + 'px';
    }
    for (let i = half; i < AllNote.length; i++) {
        const aNote = AllNote[i];
        const newNote = GetNewNote(aNote.text, aNote.time, i)
        notes2.appendChild(newNote)
        const t = newNote.querySelector(".Mytextarea1")
        t.style.height = 'auto';
        t.style.height = t.scrollHeight + 'px';
    }
    notes1.appendChild(GetNewNote())
    notes2.appendChild(GetNewNote())

    const tc = TodoList.querySelectorAll("li")
    for (let i = 0; i < tc.length; i++) {
        tc[i].remove()
    }
    for (let i = 0; i < AllTodo.length; i++) {
        AllTodo[i].iddd = i;
    }
    let AllTodoo = Array.from(AllTodo)
    if (Math.abs(_sort_) != 2) {
        AllTodoo = AllTodoo.sort((a, b) => {
            if (_sort_ > 0) {
                if (a.time == b.time) {
                    var r = StateSort.indexOf(a.state) < StateSort.indexOf(b.state)
                    r = Math.abs(_sort_) == 1 ? r : !r
                } else {
                    var r = a.time > b.time
                }
            } else {
                if (StateSort.indexOf(a.state) == StateSort.indexOf(b.state)) {
                    var r = a.time < b.time
                    r = Math.abs(_sort_) == 1 ? r : !r
                } else {
                    var r = StateSort.indexOf(a.state) < StateSort.indexOf(b.state)
                }

            }
            return ((r * 2) - 1) * (Math.abs(_sort_) - 2)
        })

    }
    for (let i = 0; i < AllTodoo.length; i++) {
        const aTodo = AllTodoo[i];
        const NewTodo = GetNewTodo(aTodo.text, aTodo.time, aTodo.state, aTodo.iddd)
        if (t) {
            NewTodo.classList.add("sort")
        }
        TodoList.appendChild(NewTodo)
    }

    TodoList.appendChild(GetNewTodo())
}
function NoteI(event) {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
    if (parent.classList.contains('NewNote')) {
        parent.classList.remove('NewNote')
        // console.log(parent.parentNode.id == "notes1" ? UpDataId()[0] : UpDataId()[1])
        AllNote.splice(parent.parentNode.id == "notes1" ? UpDataId()[0] : UpDataId()[1], 0, {
            text: target.value, time: "－－－－－－－－－"
        })
        parent.dataset.index = AllNote.length - 1
        parent.parentNode.appendChild(GetNewNote())
        UpDataId(0)
        UpData()
    }
    NoteCh(event, 1)
}
function NoteCh(event, t) {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    if (target.classList.contains("Mytextarea1") && !parent.classList.contains('NewNote')) {
        const timestamp = parent.querySelector(".timestamp")
        const index = Number(parent.dataset.index)
        if (!t) {
            timestamp.innerText = GetNowTime()
            AllNote[index].time = timestamp.innerText
        }
        AllNote[index].text = target.value
        UpData()
    }
}
function NoteCl(event) {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    if (target.classList.contains("deleteNote") && !parent.classList.contains('NewNote')) {
        const index = Number(parent.dataset.index)
        AllNote.splice(index, 1)
        parent.remove()
        UpData()
        UpDataId(0)
    }
}
notes1.addEventListener('input', NoteI);
notes1.addEventListener('change', NoteCh);
notes1.addEventListener('click', NoteCl);
notes2.addEventListener('input', NoteI);
notes2.addEventListener('change', NoteCh);
notes2.addEventListener('click', NoteCl);
sortTB.addEventListener('click', () => {
    let t = Number(sortTB.dataset.s)
    sortTB.dataset.s = t + 1
    AllTodo[0]._sort_ = (t + 1) % 3 + 1
    chrome.storage.local.set({ AllTodo: AllTodo })
    // console.log(t)
    InitTable(AllTodo[0]._sort_, true)
});
sortSB.addEventListener('click', () => {
    let t = Number(sortSB.dataset.s)
    sortSB.dataset.s = t + 1
    AllTodo[0]._sort_ = (t + 1) % 3 - 3
    chrome.storage.local.set({ AllTodo: AllTodo })
    // console.log(t)
    InitTable(AllTodo[0]._sort_, true)
});
TodoList.addEventListener("click", (event) => {
    const target = event.target;
    const parent = target.parentNode
    // console.log(parent)
    const index = Number(parent.dataset.index)
    if (index != -1 && target.classList.contains('todo-state')) {
        // console.log(target, parent)
        if (target.classList.contains("DD")) {
            if (AllTodo.length > 1 && index == 0) {
                AllTodo[1]._sort_ = AllTodo[0]._sort_
            }
            parent.classList.remove("timeout")
            AllTodo.splice(index, 1)
            parent.remove()
            UpData()
            UpDataId(1)
            return
        }
        const newState = states[target.innerText]
        target.innerText = newState[0]
        target.classList.remove(newState[1])
        target.classList.add(newState[2])
        AllTodo[index].state = target.innerText
        UpData()
    }
    if (target.classList.contains("sliding")) {
        target.querySelector("#TimeSlider").remove()
        target.classList.remove("sliding")
        target.querySelector(".todo-state").classList.remove("DD")
    }
    if (parent.classList.contains("sliding")) {
        parent.querySelector("#TimeSlider").remove()
        parent.classList.remove("sliding")
        parent.querySelector(".todo-state").classList.remove("DD")
    }
    if (target.classList.contains('todo-time')) {
        let s1 = TodoList.querySelector(".sliding")
        if (s1 != null) {
            s1.querySelector("#TimeSlider").remove()
            s1.classList.remove("sliding")
            s1.querySelector(".todo-state").classList.remove("DD")
        }
        const TimeSlider = document.createElement("input")
        TimeSlider.type = "range"
        TimeSlider.min = "0"
        TimeSlider.max = "21"
        TimeSlider.id = "TimeSlider"
        TimeSlider.value = findClosestNumber(target.dataset.time)
        TimeSlider.classList.add("TimeSliders")
        parent.appendChild(TimeSlider)
        parent.classList.add("sliding")
        // parent.querySelector(".todo-state").innerText = "🗑︎"
        parent.querySelector(".todo-state").classList.add("DD")
        let listen1 = (event) => {
            const target = event.target;
            // console.log(target)
            let s = TodoList.querySelector(".sliding")
            if (target != s && s != null && !target.classList.contains("todo-time")) {
                s.querySelector("#TimeSlider").remove()
                s.classList.remove("sliding")
                s.querySelector(".todo-state").classList.remove("DD")
                document.body.removeEventListener('click', listen1);
            }
        }
        TimeSlider.addEventListener("input", () => {
            target.innerText = timeIntervalStrings[Number(TimeSlider.value)]
            target.dataset.time = timeIntervals[Number(TimeSlider.value)]
            // target.innerText = GetTextTime(timeIntervals[Number(TimeSlider.value)])
        })
        document.body.addEventListener("click", listen1)
    }
})
TodoList.addEventListener("input", (event) => {
    const target = event.target;
    const parent = target.parentNode
    // console.log(target, parent)
    if (parent.classList.contains('NewTodo')) {
        parent.classList.remove('NewTodo')
        parent.querySelector(".todo-time").innerText = "1 hr"
        parent.querySelector(".todo-time").dataset.time = 60
        parent.parentNode.appendChild(GetNewTodo())
        AllTodo.push({
            _sort_: 1, text: target.value, time: 60, state: "★"
        })
        parent.dataset.index = AllTodo.length - 1
        UpData()
    }
    TodoUpData(event)
})
TodoList.addEventListener("change", (event) => {
    TodoUpData(event)
})
function TodoUpData(event) {
    const target = event.target;
    const parent = target.parentNode
    // console.log(target)
    const index = Number(parent.dataset.index)
    if (target.classList.contains("todo-text")) {
        AllTodo[index].text = target.value
    } else if (target.classList.contains("TimeSliders")) {
        AllTodo[index].time = timeIntervals[Number(target.value)]
    }
    UpData()
}
function UpData() {
    // console.log(AllNote, AllTodo)
    chrome.storage.local.set({ AllNote: AllNote })
    chrome.storage.local.set({ AllTodo: AllTodo })
}
function GetNewNote(Text = "", Time = "－－－－－－－－－", i = -1) {
    let newRow = document.createElement('tr');
    if (Time == "－－－－－－－－－") {
        newRow.classList.add("NewNote")
    }
    newRow.dataset.index = i
    let td = document.createElement('td');
    let div = document.createElement('div');
    div.classList.add("aNote")
    let textarea = document.createElement('textarea');
    textarea.name = "note";
    textarea.classList.add("Mytextarea1");
    textarea.classList.add("note");
    textarea.rows = '2'
    textarea.cols = '30'
    textarea.value = Text
    let div2 = document.createElement('div');
    div2.classList.add('LR')
    div2.classList.add('TimeAndDelete')
    let span1 = document.createElement('span');
    span1.classList.add("deleteNote")
    span1.innerText = "🗑︎ "
    let span2 = document.createElement('span');
    span2.classList.add('timestamp')
    span2.innerHTML = Time
    div2.appendChild(span1)
    div2.appendChild(span2)

    div.appendChild(textarea);
    td.appendChild(div);
    td.appendChild(div2);
    newRow.appendChild(td)
    return newRow
}

function GetNewTodo(text = "", time = "－－－", state = '★', i = -1) {
    let ul = document.createElement('li');
    ul.dataset.index = i
    ul.classList.add("todo-item")
    if (time == "－－－") {
        ul.classList.add("NewTodo")
    }
    if (time < 0) {
        ul.classList.add("timeout")
    }
    let a1 = document.createElement('a');
    a1.innerText = state
    a1.classList.add('todo-state')
    a1.classList.add(states[state][1])
    let input = document.createElement('input');
    input.classList.add("todo-text")
    input.classList.add("Myinput1")
    input.type = "text"
    input.name = "todo"
    input.value = text
    input.placeholder = "－－－－－－－"
    let a2 = document.createElement('a');
    a2.classList.add("todo-time")
    a2.innerText = GetTextTime(time)
    a2.dataset.time = time

    ul.appendChild(a1);
    ul.appendChild(input);
    ul.appendChild(a2);
    return ul
}
// chrome.runtime.sendMessage({ action: "test", TestText: "ddd" })

function GetNowTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    // const seconds = String(now.getSeconds()).padStart(2, '0');

    // const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}`;
    return formattedDateTime;
}
function UpDataId(t = null) {
    const n1c = notes1.querySelectorAll("tr")
    const n2c = notes2.querySelectorAll("tr")
    if (t == null) {
        return [n1c.length - 2, n1c.length + n2c.length - 4]
    }
    if (t == 0) {

        for (let i = 1; i < n1c.length; i++) {
            n1c[i].dataset.index = i - 1
        }
        for (let i = 1; i < n2c.length; i++) {
            n2c[i].dataset.index = n1c.length + i - 3
        }
    }
    if (t == 1) {
        const tc = TodoList.querySelectorAll("li")
        for (let i = 0; i < tc.length; i++) {
            tc[i].dataset.index = i
        }
    }
}
InitData()
// const BigD = document.querySelector("#BigDiv")
const tagH = document.querySelector("#tag")
const textD = document.querySelector("#text")
const RandTasksD = document.querySelector("#RandomTasks")
const RandTasks = ["吃飯", '跳繩', '鋼琴']
const urgentB = document.querySelector("#urgent")
const delayB = document.querySelector("#delay")
const delayTimerD = document.querySelector("#delayTimer")
const delayTimerI = document.querySelector("#delayTimerr")


urgentB.addEventListener('click', () => {
    window.parent.postMessage("urgent", '*');
})
delayTimerI.addEventListener("change", () => {
    delayB.innerText = "延後"
    delayTimerD.classList.remove("show")
    let delayTime = Number(delayTimerI.value) / 10
    if (delayTime == 0 || Mytag == null) {
        return
    }
    chrome.runtime.sendMessage({ action: "delay", tag: Mytag, time: delayTime })
})
delayTimerI.addEventListener("input", () => {
    delayB.innerText = Number(delayTimerI.value) / 10 + "(min)"
})

delayB.addEventListener('click', () => {
    if (Mytag == null) {
        // return
    }
    delayTimerD.classList.add("show")
    delayTimerI.value = 30
    delayB.innerText = Number(delayTimerI.value) / 10 + "(min)"

})

let text = ""
let = []
let time = ""
let Mytag = null
function init() {
    RandTasksD.innerText = RandTasks[Math.floor(Math.random() * RandTasks.length)]
    const hash = location.hash
    if (hash == "") {
        return
    }
    const tag = hash.split("#")[1].slice(4)
    tagH.innerText = tag
    Mytag = tag

    chrome.storage.local.get("isBlocking").then((a) => {
        isBlocking = a.isBlocking;
        if (!isBlocking[Mytag]) {
            return
        }
        GetTEXT(isBlocking, Mytag, 1)
    })
}
document.addEventListener('DOMContentLoaded', () => {
    init()
});
document.addEventListener("load", () => {
    init()
})
setInterval(() => {
    if (AllTodo.length == 0) {
        return
    }
    InitTable(AllTodo[0]._sort_)
}, 60000);
setInterval(() => {
    let ttime = time
    if (text == "休息時間到（$ min）" || text == "受TEST影響：休息時間到（$ min）") {
        time = time - (5 / 60)
        ttime = Math.abs(parseFloat(time).toFixed(2))
    }
    textD.innerText = text.replace("$", ttime)
}, 5000);
function GetTEXT(TT, t, c) {
    // console.log(TT, t, c)

    const T = TT[t]
    if (isBlocking[Mytag].name) {
        textD.innerText = text.replace("$", time) + "#" + isBlocking[Mytag].name
    } else {
        textD.innerText = text.replace("$", time)
    }
    if (T.isB) {
        text = "休息時間到（$ min）"
        time = T.timeB
    }
    if (T.isL) {
        text = "達到使用極限（$）"
        time = T.timeL
    }
    if (T.isD) {
        text = "禁用時間$"
        time = T.timeD[0] + "～" + T.timeD[1]
    }
    if (text == "休息時間到（$ min）") {
        time = Math.abs(parseFloat(time).toFixed(2))
    }
    if (c == 0) {
        return
    }
    if (T.isBd) {
        GetTEXT(TT, T.timeBd, 0)
        text = "受" + T.timeBd + "影響：" + text
    }
    console.log(text, time)
    textD.innerText = text.replace("$", time)
}

