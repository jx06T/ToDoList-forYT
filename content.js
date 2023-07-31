
const TitleT = document.querySelector("title")
let Mytag
GetTag()

let isOnFocus = true
let moveCount = 0;
let MovementCount = 0
async function GetTag() {
    const title = TitleT.innerText
    const Myhostname = location.href
    const r = await chrome.storage.local.get("AllRule");
    const AllRule = r.AllRule;
    for (let i = 0; i < AllRule.length; i++) {
        const aTag = AllRule[i];
        if (aTag.deactivate) {
            continue
        }
        for (let j = 0; j < aTag.rule.length; j++) {
            const aRule = RegExp("^" + aTag.rule[j] + "$")
            if (aRule.test(Myhostname)) {
                Mytag = aTag.tag
                return
            }
            if (aRule.test(title)) {
                Mytag = aTag.tag
                return
            }
        }
    }
    Mytag = "ELSE"
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
    if (moveCount > 40 || MovementCount > 30) {
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
    switch (A) {
        case "CheckYou":
            let isPlayingVideoo = isPlayingVideo()
            let isMouseMoveo = isMouseMove()
            if (!request.isSomeonePlayVideo) {
                if (isPlayingVideoo || isOnFocus || isMouseMoveo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    console.log("!")
                    if (!isPlayingVideoo && !isMouseMoveo) {
                        MovementCount++
                    }
                }
            } else {
                if (isOnFocus && isMouseMoveo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    console.log("!")
                } else if (isOnFocus && isPlayingVideoo) {
                    chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    console.log("!")
                } else if (isPlayingVideoo) {
                    setTimeout(() => {
                        chrome.runtime.sendMessage({ action: "Alive", tag: Mytag, isSomeonePlayVideo: isPlayingVideoo })
                    }, 10);
                } else if (isOnFocus && !isPlayingVideoo && !isMouseMoveo) {
                    MovementCount++
                }
            }
            if (MovementCount > 30) {
                isOnFocus = false
            }
    }
})
chrome.runtime.sendMessage({ action: "Add_url" })
