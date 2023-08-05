class TagsMM {
    constructor() {
        this.AllRule = [{ tag: "YT", rule: ["https://www.youtube.com/", "s"] }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], deactivate: true }, { tag: "1", rule: ["1"] }, { tag: "2", rule: ["2"] }, { tag: "3", rule: ["3"] }]
        this.RuleTable = document.querySelector("#Rules")
        this.BtncColumn = document.querySelector("#rules>.btn-column")
        this.DaRowB = this.BtncColumn.querySelector("#DaRow")
        this.DragB = this.BtncColumn.querySelector("#Drag")
        this.DeactivateB = this.BtncColumn.querySelector("#Deactivate")
        this.ColorPicker = this.BtncColumn.querySelector("#colorPicker")
        this.init()
        this.listen()
    }
    init = () => {
        chrome.storage.local.get(["AllRule"]).then((result) => {
            this.AllRule = result.AllRule
            ALL_TAG = this.AllRule
            this.InitTable()
        })
    }

    InitTable = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.remove()
        });

        this.AllRule.forEach((aTag, index) => {
            let HTML = this.GetNewRow(aTag.tag, aTag.rule, index, aTag.deactivate, aTag.color)
            this.RuleTable.appendChild(HTML);
        })
        let HTML = this.GetNewRow()
        HTML.classList.add("new-row")
        this.RuleTable.appendChild(HTML);
    }
    GetRandColor = () => {
        const r = Math.floor(Math.random() * 64 + 128);
        const g = Math.floor(Math.random() * 64 + 128);
        const b = Math.floor(Math.random() * 64 + 128);
        let color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
        return color
    }
    UpData = (AllRule) => {
        chrome.storage.local.set({ AllRule: AllRule })
        ALL_TAG = AllRule
    }
    ResetId = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.dataset.index = i - 1
        });

    }

    GetNewRow = (T = "", R = "", i = "", D = false, color = '') => {
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
        tagInput.style.color = color
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
    listen = () => {
        this.RuleTable.addEventListener('change', (event) => {

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
                parent.dataset.index = this.AllRule.length;

                let HTML = this.GetNewRow()
                HTML.classList.add("new-row")
                this.RuleTable.appendChild(HTML);

                let NewData = {}
                NewData.tag = newRowInputV
                NewData.rule = newRowTextV.split('\n')
                NewData.color = this.GetRandColor()
                newRowInput.style.color = NewData.color
                this.AllRule.push(NewData)
                this.UpData(this.AllRule)
                return
            }
            this.AllRule[Number(parent.dataset.index)].tag = newRowInputV
            this.AllRule[Number(parent.dataset.index)].rule = newRowTextV.split('\n')
            this.UpData(this.AllRule)
        })
        this.RuleTable.addEventListener('focusin', (event) => {
            const target = event.target;
            const parent = target.parentNode.parentNode
            const index = parent.dataset.index
            if (parent.classList.contains('new-row')) {
                this.ResetBtnColumn()
                return
            }
            this.BtncColumn.style.marginTop = (this.AllRule.length - index + 1) * -107.7 + 5 + "px"
            this.BtncColumn.dataset.Did = index
            this.BtncColumn.classList.add("showD")
            this.ColorPicker.value = this.AllRule[index].color
        })
        this.RuleTable.addEventListener('focusout', (event) => {
            if (event.relatedTarget && event.relatedTarget.parentNode.classList.contains('showD')) {
                return;
            }
            this.ResetBtnColumn()
        })
        this.DaRowB.addEventListener("click", () => {
            const index = Number(this.BtncColumn.dataset.Did)
            if (index == null) return
            this.AllRule.splice(index, 1)
            this.RuleTable.rows[index + 1].remove()
            this.ResetId()
            this.ResetBtnColumn()
            this.UpData(this.AllRule)
        })
        this.DragB.addEventListener("mousedown", () => {
            let index = Number(this.BtncColumn.dataset.Did)
            if (index == null || index == NaN) return

            const Selected = this.RuleTable.rows[index + 1]
            const A = index
            let B = index
            let Yb = undefined
            Selected.classList.add("beSelected")
            this.ResetBtnColumn()

            let Listener1 = () => {
                document.removeEventListener('mouseup', Listener1);
                document.removeEventListener('mousemove', Listener2);
                Selected.classList.remove("beSelected")
                if (B != A) {
                    const TempData = this.AllRule[A]
                    this.AllRule.splice(A, 1)
                    this.AllRule.splice(B, 0, TempData)
                    this.ResetId()
                    this.UpData(this.AllRule)

                }
                this.BtncColumn.style.marginTop = (this.AllRule.length - B + 1) * -107.7 + 5 + "px"
                this.BtncColumn.dataset.Did = B
                this.BtncColumn.classList.add("showD")
            }
            let Listener2 = (event) => {
                if (!Yb) {
                    Yb = event.clientY
                }

                if (Math.abs(event.clientY - Yb) > 108) {
                    let vy = ((event.clientY - Yb) > 0 ? 1 : -1)
                    if (index + vy > -1 && index + vy < this.AllRule.length) {
                        if (vy < 0) {
                            this.swapRows(index + 1, index + 1 + vy)
                        } else {
                            this.swapRows(index + 1 + vy, index + 1)
                        }
                        index += vy
                        B = index
                    }
                    Yb = event.clientY
                }
                if (event.clientY - Yb > 20 && index == this.AllRule.length - 1) {
                    return
                }
                if (event.clientY - Yb < -20 && index == 0) {
                    return
                }
                Selected.style.top = event.clientY - Yb + 5 + 'px';
            }
            document.addEventListener("mouseup", Listener1, { once: true })
            document.addEventListener('mousemove', Listener2);
        })
        this.DeactivateB.addEventListener("click", () => {
            const index = Number(this.BtncColumn.dataset.Did)
            if (index == null) return
            let aTag = this.AllRule[index]
            if (aTag.deactivate) {
                aTag.deactivate = false
                this.RuleTable.rows[index + 1].classList.remove("Deactivate")
            } else {
                aTag.deactivate = true
                this.RuleTable.rows[index + 1].classList.add("Deactivate")
            }
            this.UpData(this.AllRule)
        })
        this.ColorPicker.addEventListener('change', () => {
            const color = this.ColorPicker.value; // 十六进制颜色码
            const index = Number(this.BtncColumn.dataset.Did)
            if (index == null) return
            this.AllRule[index].color = color
            this.RuleTable.rows[index + 1].querySelector('.aTag').style.color = color
            this.UpData(this.AllRule)
        });

    }
    swapRows = (fromIndex, toIndex) => {
        const row1 = this.RuleTable.rows[fromIndex];
        const row2 = this.RuleTable.rows[toIndex];

        const temp = row1
        this.RuleTable.replaceChild(row2, row1);
        this.RuleTable.insertBefore(temp, row2);

    }
    ResetBtnColumn = () => {
        this.BtncColumn.dataset.Did = null
        this.BtncColumn.classList.remove("showD")
    }
}
