class BlockadeMM {
    constructor() {
        this.Blockade = [{ tag: "YT", rule: ["https://www.youtube.com/", "s"] }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], deactivate: true }, { tag: "1", rule: ["1"] }, { tag: "2", rule: ["2"] }, { tag: "3", rule: ["3"] }]
        this.RuleTable = document.querySelector("#TagBTime")
        this.BtncColumn = document.querySelector("#blockade>.btn-column")
        this.DaRowB = this.BtncColumn.querySelector("#DaRow")
        this.DragB = this.BtncColumn.querySelector("#Drag")
        this.DeactivateB = this.BtncColumn.querySelector("#Deactivate")
        this.ColorPicker = this.BtncColumn.querySelector("#colorPicker")
        this.select = document.createElement("select")
        setTimeout(() => {
            this.initSelect()
            this.init()
            this.listen()
        }, 100);
    }
    init = () => {
        chrome.storage.local.get(["Blockade"]).then((result) => {
            this.Blockade = result.Blockade
            this.InitTable()
            console.log(this.Blockade)
        })
    }
    initSelect = () => {
        this.allTag = ALL_TAG.map((item) => {
            let option = document.createElement('option')
            option.value = item.tag
            option.innerText = item.tag
            this.select.appendChild(option)
            return item.tag;
        });

    }
    InitTable = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.remove()
        });
        this.Blockade.forEach((aTag, index) => {
            let HTML = this.GetNewRow(this.allTag.indexOf(aTag.tag), aTag.time, index, aTag.deactivate)
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
    UpData = (Blockade) => {
        chrome.storage.local.set({ Blockade: Blockade })
    }
    ResetId = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.dataset.index = i - 1
        });

    }

    GetNewRow = (T = -1, time = "", i = "", D = false) => {
        let newRow = document.createElement('tr');

        newRow.dataset.index = i;
        if (D) {
            newRow.classList.add("Deactivate")
        }

        let td1 = document.createElement('td')

        let select = this.select.cloneNode(true)
        if (T == -1) {
            let option = document.createElement('option')
            option.innerText = 'tag'
            select.insertBefore(option, select.firstChild)
            T = 0
        }
        select.classList.add("aTagg")
        select.selectedIndex = T
        td1.appendChild(select)
        newRow.appendChild(td1)

        let td2 = document.createElement('td')
        let input = document.createElement('input');
        input.type = "text";
        input.value = time;
        input.classList.add("aTime");
        input.classList.add("aTag");
        input.placeholder = "time";
        input.tabIndex = "0"
        input.title = "tag";
        td2.appendChild(input)
        newRow.appendChild(td2);

        return newRow
    }
    listen = () => {
        this.RuleTable.addEventListener('change', (event) => {
            const target = event.target;

            // const Value = target.value;
            const parent = target.parentNode.parentNode
            const newRowInput = target.parentNode.parentNode.querySelector('.aTime')
            const newRowText = target.parentNode.parentNode.querySelector('.aTagg')
            if (newRowInput == null || newRowText == null) {
                return
            }
            const newRowInputV = newRowInput.value;
            const newRowTextV = newRowText.value;
            console.log(newRowInputV, newRowTextV)
            if (parent.classList.contains('new-row')) {
                if (!newRowInputV || !newRowTextV) return;

                parent.classList.remove("new-row")
                parent.dataset.index = this.Blockade.length;

                let HTML = this.GetNewRow()
                HTML.classList.add("new-row")
                this.RuleTable.appendChild(HTML);

                let NewData = {}
                NewData.tag = newRowTextV
                NewData.time = newRowInputV
                this.Blockade.push(NewData)
                this.UpData(this.Blockade)
                return
            }
            this.Blockade[Number(parent.dataset.index)].tag = newRowInputV
            this.Blockade[Number(parent.dataset.index)].rule = newRowTextV.split('\n')
            this.UpData(this.Blockade)
        })
        this.RuleTable.addEventListener('focusin', (event) => {
            const target = event.target;
            const parent = target.parentNode.parentNode
            const index = parent.dataset.index
            if (parent.classList.contains('new-row')) {
                this.ResetBtnColumn()
                return
            }
            this.BtncColumn.style.marginTop = (this.Blockade.length - index + 1) * -108 + 10 + "px"
            this.BtncColumn.dataset.Did = index
            this.BtncColumn.classList.add("showD")
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
            this.Blockade.splice(index, 1)
            this.RuleTable.rows[index + 1].remove()
            this.ResetId()
            this.ResetBtnColumn()
            this.UpData(this.Blockade)
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
                    const TempData = this.Blockade[A]
                    this.Blockade.splice(A, 1)
                    this.Blockade.splice(B, 0, TempData)
                    this.ResetId()
                    this.UpData(this.Blockade)

                }
                this.BtncColumn.style.marginTop = (this.Blockade.length - B + 1) * -108 + 10 + "px"
                this.BtncColumn.dataset.Did = B
                this.BtncColumn.classList.add("showD")
            }
            let Listener2 = (event) => {
                if (!Yb) {
                    Yb = event.clientY
                }

                if (Math.abs(event.clientY - Yb) > 108) {
                    let vy = ((event.clientY - Yb) > 0 ? 1 : -1)
                    if (index + vy > -1 && index + vy < this.Blockade.length) {
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
                if (event.clientY - Yb > 20 && index == this.Blockade.length - 1) {
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
            let aTag = this.Blockade[index]
            if (aTag.deactivate) {
                aTag.deactivate = false
                this.RuleTable.rows[index + 1].classList.remove("Deactivate")
            } else {
                aTag.deactivate = true
                this.RuleTable.rows[index + 1].classList.add("Deactivate")
            }
            this.UpData(this.Blockade)
        })
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
