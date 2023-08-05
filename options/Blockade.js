class BlockadeMM {
    constructor() {
        this.Blockade = [{ tag: "YT", rule: ["https://www.youtube.com/", "s"] }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], deactivate: true }, { tag: "1", rule: ["1"] }, { tag: "2", rule: ["2"] }, { tag: "3", rule: ["3"] }]
        this.RuleTable = document.querySelector("#TagBTime")
        this.BlockingSettings = document.getElementById('BlockingSettings');

        this.restrictedB = this.BlockingSettings.querySelector("#restricted")
        this.influenced1I = this.BlockingSettings.querySelector("#influenced1")
        this.influenced2I = this.BlockingSettings.querySelector("#influenced2")
        this.rest1I = this.BlockingSettings.querySelector("#rest1")
        this.rest2I = this.BlockingSettings.querySelector("#rest2")
        this.limit1I = this.BlockingSettings.querySelector("#limit1")
        this.limit2I = this.BlockingSettings.querySelector("#limit2")
        this.disabledsD = this.BlockingSettings.querySelector("#disableds")
        this.deleteB = this.BlockingSettings.querySelector("#BlockingDelete")
        this.OkB = this.BlockingSettings.querySelector("#BlockingOk")

        this.TEMPLATE = {
            tag: '', limit: ["", ""], rest: ["", ""], influenced: ["", ""], restricted: true, disabled: []
        }
        setTimeout(() => {
            this.init()
            this.listen()
        }, 10);
    }
    init = () => {
        chrome.storage.local.get(["Blockade"]).then((result) => {
            this.Blockade = result.Blockade
            this.TagToColor = {}
            ALL_TAG.forEach((item) => {
                this.TagToColor[item.tag] = item.color
            });
            this.InitTable()
        })
    }
    InitTable = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.remove()
        });
        this.Blockade.forEach((aTag, index) => {
            let HTML = this.GetNewRow(aTag)
            this.RuleTable.appendChild(HTML);
        })
        let HTML = this.GetNewRow(this.TEMPLATE)
        HTML.classList.add("new-row")
        this.RuleTable.appendChild(HTML);
    }
    UpData = (Blockade) => {
        chrome.storage.local.set({ Blockade: Blockade })
    }
    GetNewRow = (aTag) => {
        let newRow = document.createElement('tr');
        newRow.dataset.index = this.RuleTable.rows.length;

        if (!aTag.restricted) {
            newRow.classList.add("Deactivate")
        }

        let td1 = document.createElement('td')
        let td1C1 = document.createElement('input')
        td1C1.classList.add("aTag")

        td1C1.type = "text";
        td1C1.title = "tag";
        td1C1.placeholder = "tag";

        td1C1.value = aTag.tag
        td1C1.style.color = this.TagToColor[aTag.tag] ? this.TagToColor[aTag.tag] : "#000"
        td1.appendChild(td1C1)
        newRow.appendChild(td1)

        let td2 = document.createElement('td')
        td2.classList.add("LR")
        let td2C1 = document.createElement('div');
        const TEXT = this.GetText(aTag)
        td2C1.innerText = TEXT[0]
        td2C1.classList.add("aTime");
        td2.appendChild(td2C1)

        let td2C2 = document.createElement('div');
        td2C2.innerText = TEXT[1]
        td2C2.classList.add("aTime");
        td2.appendChild(td2C2)
        newRow.appendChild(td2);
        return newRow
    }
    GetText = (aTag) => {
        let t1 = `restricted：${aTag.restricted}
        influenced：${aTag.influenced}
        rest（min）： ${aTag.rest[0]} ▷ ${aTag.rest[1]}
        limit（hr）：  ${aTag.limit[0]}／ ${aTag.limit[1]} `
        const disabled = aTag.disabled.map(item => {
            return `${item[0].replace(':', '：')}～${item[1].replace(':', '：')}`
        })
        let t2 = 'disabled：\n' + disabled.join("\n")
        return [t1, t2]
    }
    listen = () => {
        this.RuleTable.addEventListener('change', (event) => {
            const target = event.target;
            const parent = target.parentNode.parentNode
            const newTag = target.parentNode.parentNode.querySelector('.aTag')
            if (newTag == null) {
                return
            }
            const newTagV = newTag.value;
            if (parent.classList.contains('new-row')) {
                if (!newTagV) return;
                newTag.style.color = this.TagToColor[newTagV] ? this.TagToColor[newTagV] : "#000"

                parent.classList.remove("new-row")
                parent.dataset.index = this.Blockade.length + 1;

                let HTML = this.GetNewRow(this.TEMPLATE)
                HTML.classList.add("new-row")
                this.RuleTable.appendChild(HTML);

                let NewData = JSON.parse(JSON.stringify(this.TEMPLATE))
                NewData.tag = newTagV
                this.Blockade.push(NewData)
                this.UpData(this.Blockade)
                return
            }
            newTag.style.color = this.TagToColor[newTagV] ? this.TagToColor[newTagV] : "#000"
            this.Blockade[Number(parent.dataset.index) - 1].tag = newTagV
            this.UpData(this.Blockade)
        })
        this.RuleTable.addEventListener('click', (event) => {
            const target = event.target;
            if (!target.matches('div')) {
                return
            }
            if (this.state > 0) {
                this.state = 0
                return
            }
            const parent = target.parentNode.parentNode
            if (parent.classList.contains('new-row')) {
                this.Blockade.push(JSON.parse(JSON.stringify(this.TEMPLATE)))
                parent.classList.remove('new-row')

                let HTML = this.GetNewRow(this.TEMPLATE)
                HTML.classList.add("new-row")
                this.RuleTable.appendChild(HTML);

            }
            const index = Number(parent.dataset.index) - 1
            this.SetBlockingSettings(index)
            this.BlockingSettings.classList.remove('Invisible')
            this.state = 1
        })
        document.addEventListener('click', (e) => {
            if (!this.BlockingSettings.contains(e.target) && this.state >= 0) {
                if (this.state < 2 && this.state != 0) {
                    this.state++
                    return
                }
                this.state = -1
                this.BlockingSettings.classList.add('Invisible')
            }
        })
        this.BlockingSettings.addEventListener("change", (e) => {
            const index = Number(this.BlockingSettings.dataset.index)
            const target = e.target
            const id = target.id
            const aTag = this.Blockade[index]
            switch (id) {
                case "restricted":
                    aTag.restricted = target.checked
                    if (!aTag.restricted) {
                        this.RuleTable.rows[index + 1].classList.add("Deactivate")
                    } else {
                        this.RuleTable.rows[index + 1].classList.remove("Deactivate")
                    }

                    break;
                case "influenced1":
                    aTag.influenced[0] = target.value
                    target.style.color = this.TagToColor[target.value] ? this.TagToColor[target.value] : "#000"
                    break;
                case "influenced2":
                    aTag.influenced[1] = target.value
                    target.style.color = this.TagToColor[target.value] ? this.TagToColor[target.value] : "#000"
                    break
                case "rest1":
                    aTag.rest[0] = target.value
                    break;
                case "rest2":
                    aTag.rest[1] = target.value
                    break;
                case "limit1":
                    aTag.limit[0] = target.value
                    break;
                case "limit2":
                    aTag.limit[1] = target.value
                    break;
                case "":
                    var j = -1
                    this.disabledsD.childNodes.forEach((item, ii) => {
                        if (ii % 2 == 0) {
                            return
                        }
                        j++
                        let disabled = aTag.disabled[j]
                        if (item.childNodes[0].value == "" && item.childNodes[2].value == "") {
                            if (disabled) {
                                aTag.disabled.splice(j, 1)
                            }
                            j--
                            return
                        }
                        if (!disabled) {
                            aTag.disabled.push(["", ""])
                            disabled = aTag.disabled[j]
                        }
                        disabled[0] = item.childNodes[0].value
                        disabled[1] = item.childNodes[2].value
                    })
                    break
            }

            const TEXT = this.GetText(aTag)
            this.RuleTable.rows[index + 1].querySelectorAll(".aTime")[0].innerText = TEXT[0]
            this.RuleTable.rows[index + 1].querySelectorAll(".aTime")[1].innerText = TEXT[1]

            this.UpData(this.Blockade)
        })
        this.deleteB.addEventListener("click", () => {
            const index = Number(this.BlockingSettings.dataset.index)
            this.Blockade.splice(index, 1)
            this.RuleTable.rows[index + 1].remove()
            this.UpData(this.Blockade)
            this.ResetId()
            this.state = -1
            this.BlockingSettings.classList.add('Invisible')
        })
        this.OkB.addEventListener("click", () => {
            if (this.state < 1 && this.state != 0) {
                this.state++
                return
            }
            this.state = -1
            this.BlockingSettings.classList.add('Invisible')
        })
        document.addEventListener('keydown', () => {
            if (event.key === 'Escape') {
                if (this.state < 1 && this.state != 0) {
                    this.state++
                    return
                }
                this.state = -1
                this.BlockingSettings.classList.add('Invisible')
            }
        });
    }
    SetBlockingSettings = (i) => {
        const aTag = this.Blockade[i]
        this.BlockingSettings.dataset.index = i
        this.restrictedB.checked = aTag.restricted
        this.influenced1I.value = aTag.influenced[0]
        this.influenced1I.style.color = this.TagToColor[aTag.influenced[0]]?this.TagToColor[aTag.influenced[0]]:"#000"
        this.influenced2I.value = aTag.influenced[1]
        this.influenced2I.style.color = this.TagToColor[aTag.influenced[1]]?this.TagToColor[aTag.influenced[1]]:"#000"
        this.rest1I.value = aTag.rest[0]
        this.rest2I.value = aTag.rest[1]
        this.limit1I.value = aTag.limit[0]
        this.limit2I.value = aTag.limit[1]
        this.disabledsD.childNodes.forEach((item, ii) => {
            if (ii % 2 == 0) {
                return
            }
            if (!aTag.disabled[Math.floor(ii / 2)]) {
                item.childNodes[0].value = ""
                item.childNodes[2].value = ""
                return

            }
            item.childNodes[0].value = aTag.disabled[Math.floor(ii / 2)][0]
            item.childNodes[2].value = aTag.disabled[Math.floor(ii / 2)][1]
        })
    }
    ResetId = () => {
        const rows = this.RuleTable.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (i === 0) return;
            row.dataset.index = i
        });

    }
}
