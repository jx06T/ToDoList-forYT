// 進入網站的時間戳
let moveCount = 0;
let loop
let Mytag
GetTag() 
let IamKing = false
let IamSKing = false

async function GetTag() {
    const r1 = await chrome.storage.local.get("AllRule");
    const AllRule = r1.AllRule;
    // const Myhostname = location.hostname
    const Myhostname = location.href
    const MyTitle = document.querySelector("title").innerText
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
            if (aRule.test(MyTitle)) {
                Mytag = aTag.tag
                return
            }
        }
    }
    Mytag = "ELSE"
}

async function Onfocus() {
    await chrome.runtime.sendMessage({ action: "isKingReallyKing" })
    let r = await chrome.runtime.sendMessage({ action: "AmIReallyKing" })
    if (r.msg != IamKing) {
        IamKing = r.msg
    }
    // console.log("!!!!!", IamKing, IamSKing)
    if (!IamKing) {
        chrome.runtime.sendMessage({ action: "AmIKing", tag: Mytag }).then((r) => {
            if (r.msg) {
                IamKing = true
            } else {
                moveCount = 0;
                document.addEventListener('wheel', () => { handleMouseMove(10) });
                document.addEventListener('mousemove', () => { handleMouseMove(1) });
                loop = setInterval(() => {
                    // console.log(IamSKing)
                    if (!IamSKing && (moveCount > 80 || isPlayingVideo())) {
                        chrome.runtime.sendMessage({ action: "IAmReallyKing", tag: Mytag }).then((r) => {
                        })
                        IamSKing = true
                    } else if (IamSKing && moveCount < 80) {
                        chrome.runtime.sendMessage({ action: "IAmNotReallyKing", tag: Mytag }).then((r) => {
                        })
                        IamSKing = false
                    }
                    moveCount = 0;
                }, 4000);
            }
        })
    }
}

async function Onblur() {
    const r = await chrome.runtime.sendMessage({ action: "ChecckPlaying" })
    const isActive = r.msg
    // console.log("?????", IamKing, IamSKing)
    if (IamKing) {
        if (!isPlayingVideo() || !isActive) {
            chrome.runtime.sendMessage({ action: "KingDown", tag: Mytag }).then((r) => {
            })
            IamKing = false
        }
    } else {
        if (isPlayingVideo() && isActive) {
            chrome.runtime.sendMessage({ action: "KillKing", tag: Mytag }).then((r) => {
            })
            IamSKing = false
            IamKing = true
        } else {
            chrome.runtime.sendMessage({ action: "SKingDown", tag: Mytag }).then((r) => {
            })
            IamSKing = false
        }
    }
    clearInterval(loop);
    loop = undefined
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('wheel', handleMouseMove);
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


window.addEventListener('blur', () => {
    Onblur()
});

window.addEventListener('beforeunload', () => {
    if (IamKing) {
        chrome.runtime.sendMessage({ action: "KingDown", tag: Mytag }).then((r) => {
        })
        IamKing = false
    } else {
        chrome.runtime.sendMessage({ action: "SKingDown", tag: Mytag }).then((r) => {
        })
        IamSKing = false
    }
});

window.addEventListener('focus', () => {
    Onfocus()
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let A = request.action
    switch (A) {
        case "YouNotAreKing":
            IamKing = false
            IamSKing = false
            break;
    }
})
Onfocus()
setTimeout(() => {
    console.log( Mytag)
}, 1000);