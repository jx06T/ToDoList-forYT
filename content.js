
const TitleT = document.querySelector("title")
let Title = TitleT.innerText
let Mytag
let Jumping_in_line_count = 0
GetTag()

let isOnFocus = true
let moveCount = 0;
let MovementCount = 0
async function GetTag() {
    Title = TitleT.innerText
    const Myhostname = location.href + "\n" + Title
    const r = await chrome.storage.local.get("AllRule");
    const AllRule = r.AllRule;
    for (let i = 0; i < AllRule.length; i++) {
        const aTag = AllRule[i];
        if (aTag.deactivate) {
            continue
        }
        for (let j = 0; j < aTag.rule.length; j++) {
            const aRule = RegExp(aTag.rule[j])
            if (aRule.test(Myhostname)) {
                Mytag = aTag.tag
                return
            }
            // if (aRule.test(Title)) {
            //     Mytag = aTag.tag
            //     return
            // }
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
            let isPlayingVideoo = isPlayingVideo()
            let isMouseMoveo = isMouseMove()
            console.log(isPlayingVideoo, isOnFocus, isMouseMoveo)
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
chrome.runtime.sendMessage({ action: "Add_url" })


setTimeout(() => {
    console.log(Mytag)
    if (Mytag == "TEST_J") {
        let iframe = document.createElement('iframe');
        iframe.src = 'TEST.html';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
    }
}, 3000);