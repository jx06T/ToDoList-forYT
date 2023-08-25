const notes1 = document.querySelector('#notes1');
const notes2 = document.querySelector('#notes2');
const TodoList = document.querySelector(".todo-list")
const states = { "✖": ["★", "S3", "S1"], "★": ["✔", "S1", "S2"], "✔": ["！", "S2", "S4"], "！": ["✖", "S4", "S3"] }
notes1.addEventListener('input', event => {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
    if (parent.classList.contains('NewNote')) {
        parent.classList.remove('NewNote')
        parent.parentNode.appendChild(GetNewNote())
    }
});
notes1.addEventListener('change', event => {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    if (target.classList.contains("Mytextarea1") && !parent.classList.contains('NewNote')) {
        const timestamp = parent.querySelector(".timestamp")
        timestamp.innerText = GetNowTime()
    }
});
notes1.addEventListener('click', event => {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    if (target.classList.contains("deleteNote") && !parent.classList.contains('NewNote')) {
        parent.remove()
    }
});
notes2.addEventListener('input', event => {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
    if (parent.classList.contains('NewNote')) {
        parent.classList.remove('NewNote')
        parent.parentNode.appendChild(GetNewNote())
    }
});
notes2.addEventListener('click', event => {
    const target = event.target;
    const parent = target.parentNode.parentNode.parentNode
    if (target.classList.contains("deleteNote") && !parent.classList.contains('NewNote')) {
        parent.remove()
    }
});
TodoList.addEventListener("click", () => {
    const target = event.target;
    // console.log(target)
    if (target.classList.contains('todo-state')) {
        console.log(target.innerText)
        const newState = states[target.innerText]
        target.innerText = newState[0]
        target.classList.remove(newState[1])
        target.classList.add(newState[2])
    }
})

TodoList.addEventListener("input", () => {
    const target = event.target;
    const parent = target.parentNode
    console.log(target, parent)
    if (parent.classList.contains('NewTodo')) {
        parent.classList.remove('NewTodo')
        parent.parentNode.appendChild(GetNewTodo())
    }
})
function GetNewNote() {
    let newRow = document.createElement('tr');
    newRow.classList.add("NewNote")
    let td = document.createElement('td');
    let div = document.createElement('div');
    div.classList.add("aNote")
    let textarea = document.createElement('textarea');
    textarea.name = "note";
    textarea.classList.add("Mytextarea1");
    textarea.classList.add("note");
    textarea.rows = '2'
    textarea.cols = '30'
    let div2 = document.createElement('div');
    div2.classList.add('LR')
    div2.classList.add('TimeAndDelete')
    let span1 = document.createElement('span');
    span1.classList.add("deleteNote")
    span1.innerText = "🗑︎ "
    let span2 = document.createElement('span');
    span2.classList.add('timestamp')
    span2.innerHTML = "－－－－－－－－－"
    div2.appendChild(span1)
    div2.appendChild(span2)

    div.appendChild(textarea);
    td.appendChild(div);
    td.appendChild(div2);
    newRow.appendChild(td)
    return newRow
}

function GetNewTodo() {
    let ul = document.createElement('ul');
    ul.classList.add("todo-item")
    ul.classList.add("NewTodo")

    let a1 = document.createElement('a');
    a1.innerText = '★'
    a1.classList.add('todo-state')
    a1.classList.add('S1')
    let input = document.createElement('input');
    input.classList.add("todo-text")
    input.classList.add("Myinput1")
    input.type = "text"
    input.name = "todo"
    input.placeholder = "－－－－－－－"
    let a2 = document.createElement('a');
    a2.classList.add("todo-time")
    a2.innerText = "－－－"

    ul.appendChild(a1);
    ul.appendChild(input);
    ul.appendChild(a2);
    return ul
}
chrome.runtime.sendMessage({ action: "test", TestText: "ddd" })

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
