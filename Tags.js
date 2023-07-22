let AllRule = [{ tag: "YT", rule: ["https://www.youtube.com/", "s"] }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], deactivate: true }, { tag: "1", rule: ["1"] }, { tag: "2", rule: ["2"] }, { tag: "3", rule: ["3"] }]
chrome.storage.local.get(["AllRule"]).then((result) => {
    AllRule = result.AllRule
    InitTable()
})
function GetRandColor() {
    const r = Math.floor(Math.random() * 64 + 128);
    const g = Math.floor(Math.random() * 64 + 128); 
    const b = Math.floor(Math.random() * 64 + 128);
    color = '#' + r.toString(16) + g.toString(16) + b.toString(16); 
    return color
}
function UpData(AllRule) {
    chrome.storage.local.set({ AllRule: AllRule })

}
const RuleTable = document.querySelector("#Rules")
const BtncColumn = document.querySelector(".btn-column")
const DaRowB = document.querySelector("#DaRow")
const DragB = document.querySelector("#Drag")
const DeactivateB = document.querySelector("#Deactivate")
const RulesPage = document.querySelector("#rules")
const ColorPicker = document.querySelector("#colorPicker")

function InitTable() {
    const rows = RuleTable.querySelectorAll('tr');
    rows.forEach((row, i) => {
        if (i === 0) return;
        row.remove()
    });

    AllRule.forEach((aTag, index) => {
        let HTML = GetNewRow(aTag.tag, aTag.rule, index, aTag.deactivate)
        RuleTable.appendChild(HTML);
    })
    let HTML = GetNewRow()
    HTML.classList.add("new-row")
    RuleTable.appendChild(HTML);
}
function ResetId() {
    const rows = RuleTable.querySelectorAll('tr');
    rows.forEach((row, i) => {
        if (i === 0) return;
        row.dataset.index = i - 1
    });

}

function GetNewRow(T = "", R = "", i = "", D = false) {
    let newRow = document.createElement('tr');

    // Add index to a data attribute in the first <td> element
    newRow.dataset.index = i;
    if (D) {
        newRow.classList.add("Deactivate")
    }
    // Add the <td> for tag
    let tagCell = document.createElement('td');
    let tagInput = document.createElement('input');
    tagInput.type = "text";
    tagInput.value = T;
    tagInput.classList.add("aTag");
    tagInput.placeholder = "tag";
    tagInput.tabIndex = "0"
    tagInput.title = "tag";
    tagCell.appendChild(tagInput);
    newRow.appendChild(tagCell);

    // Add the <td> for rule
    let ruleCell = document.createElement('td');
    let ruleTextarea = document.createElement('textarea');
    ruleTextarea.rows = "5";
    ruleTextarea.classList.add("aRule");
    ruleTextarea.placeholder = "rule";
    ruleTextarea.title = "rule";
    if (R.length > 1) {
        R = R.join("\n")
    }
    ruleTextarea.textContent = R;
    ruleTextarea.tabIndex = "0"
    ruleCell.appendChild(ruleTextarea);
    newRow.appendChild(ruleCell);

    return newRow
}

RuleTable.addEventListener('change', (event) => {

    const target = event.target;

    // const Value = target.value;
    const parent = target.parentNode.parentNode
    const newRowInput = target.parentNode.parentNode.querySelector('.aTag')
    const newRowText = target.parentNode.parentNode.querySelector('.aRule')
    if (newRowInput == null || newRowText == null) {
        return
    }
    const newRowInputV = newRowInput.value;
    const newRowTextV = newRowText.value;
    if (parent.classList.contains('new-row')) {
        if (!newRowInputV || !newRowTextV) return;

        parent.classList.remove("new-row")
        parent.dataset.index = AllRule.length;

        let HTML = GetNewRow()
        HTML.classList.add("new-row")
        RuleTable.appendChild(HTML);

        NewData = {}
        NewData.tag = newRowInputV
        NewData.rule = newRowTextV.split('\n')
        NewData.color = GetRandColor()
        AllRule.push(NewData)
        UpData(AllRule)
        return
    }
    AllRule[Number(parent.dataset.index)].tag = newRowInputV
    AllRule[Number(parent.dataset.index)].rule = newRowTextV.split('\n')
    UpData(AllRule)
})
RuleTable.addEventListener('focusin', (event) => {
    const target = event.target;
    const parent = target.parentNode.parentNode
    const index = parent.dataset.index
    if (parent.classList.contains('new-row')) {
        ResetBtnColumn()
        return
    }
    BtncColumn.style.marginTop = (AllRule.length - index + 1) * -108 + 10 + "px"
    BtncColumn.dataset.Did = index
    BtncColumn.classList.add("showD")
    ColorPicker.value = AllRule[index].color
})
RuleTable.addEventListener('focusout', (event) => {
    if (event.relatedTarget && event.relatedTarget.parentNode.classList.contains('showD')) {
        return;
    }
    ResetBtnColumn()
})
DaRowB.addEventListener("click", () => {
    const index = Number(BtncColumn.dataset.Did)
    if (index == null) return
    AllRule.splice(index, 1)
    RuleTable.rows[index + 1].remove()
    ResetId()
    ResetBtnColumn()
    UpData(AllRule)
})
DragB.addEventListener("mousedown", () => {
    let index = Number(BtncColumn.dataset.Did)
    if (index == null || index == NaN) return

    const Selected = RuleTable.rows[index + 1]
    const A = index
    let B = index
    let Yb = undefined
    Selected.classList.add("beSelected")
    ResetBtnColumn()

    let Listener1 = () => {
        // RulesPage.removeEventListener('mouseleave', Listener1);
        document.removeEventListener('mouseup', Listener1);
        document.removeEventListener('mousemove', Listener2);
        Selected.classList.remove("beSelected")
        if (B != A) {
            const TempData = AllRule[A]
            AllRule.splice(A, 1)
            AllRule.splice(B, 0, TempData)
            ResetId()
            UpData(AllRule)

        }
        BtncColumn.style.marginTop = (AllRule.length - B + 1) * -108 + 10 + "px"
        BtncColumn.dataset.Did = B
        BtncColumn.classList.add("showD")
    }
    let Listener2 = (event) => {
        if (!Yb) {
            Yb = event.clientY
        }

        if (Math.abs(event.clientY - Yb) > 108) {
            let vy = ((event.clientY - Yb) > 0 ? 1 : -1)
            if (index + vy > -1 && index + vy < AllRule.length) {
                if (vy < 0) {
                    swapRows(index + 1, index + 1 + vy)
                } else {
                    swapRows(index + 1 + vy, index + 1)
                }
                index += vy
                B = index
            }
            Yb = event.clientY
        }
        if (event.clientY - Yb > 20 && index == AllRule.length - 1) {
            return
        }
        if (event.clientY - Yb < -20 && index == 0) {
            return
        }
        Selected.style.top = event.clientY - Yb + 5 + 'px';
    }
    document.addEventListener("mouseup", Listener1, { once: true })
    // RulesPage.addEventListener("mouseleave", Listener1, { once: true })
    document.addEventListener('mousemove', Listener2);
})
function swapRows(fromIndex, toIndex) {
    const row1 = RuleTable.rows[fromIndex];
    const row2 = RuleTable.rows[toIndex];

    const temp = row1
    RuleTable.replaceChild(row2, row1);
    RuleTable.insertBefore(temp, row2);

}
function ResetBtnColumn() {
    BtncColumn.dataset.Did = null
    BtncColumn.classList.remove("showD")
}
DeactivateB.addEventListener("click", () => {
    const index = Number(BtncColumn.dataset.Did)
    if (index == null) return
    let aTag = AllRule[index]
    if (aTag.deactivate) {
        aTag.deactivate = false
        RuleTable.rows[index + 1].classList.remove("Deactivate")
    } else {
        aTag.deactivate = true
        RuleTable.rows[index + 1].classList.add("Deactivate")
    }
    UpData(AllRule)
})
ColorPicker.addEventListener('change', () => {
    const color = ColorPicker.value; // 十六进制颜色码
    const index = Number(BtncColumn.dataset.Did)
    if (index == null) return
    AllRule[index].color = color
    UpData(AllRule)
});