
const TitleT = document.querySelector("title")
let Title = TitleT.innerText
let Mytag = "ELSE"
let Mytags = ["ALL"]
let Jumping_in_line_count = 0
// let isBlock = false
let AllRule = []
function InitData() {
    chrome.storage.local.get("AllRule").then((r) => {
        AllRule = r.AllRule
        GetTag()
    })
}
chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === 'local') {
        if (changes.AllRule) {
            AllRule = changes.AllRule.newValue;
            GetTag()
        }
    }
});
InitData()
let isOnFocus = true
let moveCount = 0;
let MovementCount = 0
function GetTag() {
    Mytag = "ELSE"
    Mytags = []
    Mytags.push("ALL")
    Title = TitleT.innerText
    const Myhostname = location.href + "\n" + Title
    for (let i = 0; i < AllRule.length; i++) {
        const aTag = AllRule[i];
        if (aTag.deactivate) {
            continue
        }
        let _opposite = true
        let _stop = false
        if (aTag.rule[0].slice(0, 3) == "!--") {
            _opposite = !aTag.rule[0].includes("--opposite")
            _stop = aTag.rule[0].includes("--stop")
        }
        for (let j = 0; j < aTag.rule.length; j++) {
            if (aTag.rule[j] == "" || aTag.rule[j].slice(0, 3) == "!--") {
                continue
            }
            const aRule = RegExp(aTag.rule[j])
            if (opposite(aRule.test(Myhostname), _opposite)) {
                // console.log(aRule.test(Myhostname), aTag.tag, _opposite, _stop)
                if (Mytag == "ELSE") {
                    Mytag = aTag.tag
                }
                Mytags.push(aTag.tag)
                if (_stop) {
                    return
                }
            }

        }
    }
    if (Mytag == "ELSE") {
        Mytags.push("ELSE")
    }
}
function opposite(a, b = true) {
    return (a && b) || (!a && !b)
}

document.addEventListener('wheel', () => {
    handleMouseMove(10)
});
document.addEventListener('mousemove', () => {
    handleMouseMove(1)
});

window.addEventListener('blur', () => {
    Onblur()
});

window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ action: "Turned_off" })
});

window.addEventListener('focus', () => {
    Onfocus()
    if (Jumping_in_line_count < 3) {
        chrome.runtime.sendMessage({ action: "Jumping_in_line", tag: Mytag })
        Jumping_in_line_count++
    }
});

function Onfocus() {
    isOnFocus = true
}

function Onblur() {
    isOnFocus = false
}

function handleMouseMove(t) {
    moveCount += t;
}

function isPlayingVideo() {
    const videos = document.querySelectorAll("video")
    let isPlay = false
    videos.forEach((video) => {
        isPlay = !video.paused || isPlay
    })
    return isPlay
}

function isMouseMove() {
    let isMouseMovee = false
    if (moveCount > 40 && MovementCount > 60) {
        isOnFocus = true
        MovementCount = 0
    }
    if (moveCount > 90) {
        isMouseMovee = true

    } else {
        isMouseMovee = false
    }
    moveCount = 0
    return isMouseMovee
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let A = request.action
    Jumping_in_line_count = 0
    switch (A) {
        case "CheckYou":
            if (Title != TitleT.innerText) {
                GetTag()
            }
            let isBlock = checkBlock()
            doBlock(request.Blockings, isBlock)
            if (isBlock) {
                return
            }
            let isPlayingVideoo = isPlayingVideo()
            let isMouseMoveo = isMouseMove()
            if (!request.isSomeonePlayVideo) {
                if (isMouseMoveo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                } else if (isPlayingVideoo || isOnFocus) {
                    setTimeout(() => {
                        chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    }, 5);
                    if (!isPlayingVideoo) {
                        MovementCount++
                    }
                }
            } else {
                if (isOnFocus && isMouseMoveo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                } else if (isOnFocus && isPlayingVideoo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                } else if (isPlayingVideoo) {
                    setTimeout(() => {
                        chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    }, 10);
                } else if (isOnFocus) {
                    MovementCount++
                }
            }
            if (MovementCount > 70) {
                isOnFocus = false
                console.log("!!")
            }
    }
})
function checkBlock() {
    if (document.querySelector('#jx06iframe') == null) {
        return false
    } else {
        return true
    }
}
chrome.runtime.sendMessage({ action: "Add_url" })
let iframe = document.createElement('iframe');
iframe.classList.add("NO")
iframe.id = 'jx06iframe';
iframe.allow = 'microphone;camera;';
iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
iframe.setAttribute('allowFullScreen', '');
iframe.src = chrome.runtime.getURL('ToDoList.html') + "#tag-" + Mytag;
function doBlock(B, isBlock) {
    console.log(B, isBlock,Mytag)
    if (B[Mytag] != undefined && isBlock == false) {
        console.log(B[Mytag].text, B[Mytag].time)
        isBlock = true
        iframe.src = chrome.runtime.getURL('ToDoList.html') + "#tag-" + Mytag;
        document.body.appendChild(iframe);
    } else if (B[Mytag] == undefined && isBlock) {
        isBlock = false
        iframe.remove()
    }
}

