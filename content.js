// 進入網站的時間戳
let enterTime = 0;
let moveCount = 0;
let loop
let tag = GetTag()
let InotKing = false
let IamKing = false
let first = true
function GetTag() {
    const Myhostname = location.hostname
    return Myhostname
}

function Onfocus() {
    if (IamKing) {
        IamKing = false
        chrome.runtime.sendMessage({ action: "NotKing" })
    } else {
        chrome.runtime.sendMessage({ action: "Onfocus" })
    }

    enterTime = performance.now(); // 記錄進入網站的時間戳
    document.addEventListener('wheel', () => { handleMouseMove(10) });
    document.addEventListener('mousemove', () => { handleMouseMove(1) });
    moveCount = 0;
    if (loop) {
        Onblur()
    }
    loop = setInterval(() => {
        console.log(InotKing, moveCount)
        chrome.runtime.sendMessage({ action: "GetKingTag" }).then((r) => {
            if (first || r.KingTag != null) {
                if (moveCount < 150) {
                    if (first) {
                        if (!isPlayingVideo()) {
                            first = false
                            Onblur()
                            return
                        }
                    }
                    if (!InotKing) {
                        UpData(tag)
                        InotKing = true
                    }
                } else {
                    if (InotKing) {
                        UpData(r.KingTag)
                        InotKing = false
                    }
                }
            }
        })
        moveCount = 0;
    }, 5000);
}

function Onblur() {
    if (InotKing) {
        chrome.runtime.sendMessage({ action: "GetKingTag" }).then((r) => {
            if (r.KingTag != null) {
                UpData(r.KingTag)
            } else {
                UpData(tag)
            }
        })
        InotKing = false
    } else {
        UpData(tag)
    }
    clearInterval(loop);
    loop = undefined
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('wheel', handleMouseMove);

}

function UpData(tag) {
    const browsingTime = performance.now() - enterTime; // 計算瀏覽時間
    console.log(tag)
    chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
        let OldAllBrowsingTime = result.AllBrowsingTime
        OldAllBrowsingTime.BrowsingTime[tag] = OldAllBrowsingTime.BrowsingTime[tag] ? OldAllBrowsingTime.BrowsingTime[tag] += browsingTime : browsingTime
        console.log(OldAllBrowsingTime)
        chrome.storage.local.set({ AllBrowsingTime: OldAllBrowsingTime })
    });
    enterTime = performance.now();
}

function handleMouseMove(t) {
    moveCount += t;
}

const videos = document.querySelectorAll("video")
function isPlayingVideo() {
    let isPlay = false
    videos.forEach((video) => {
        isPlay = !video.paused || isPlay
    })
    return isPlay
}


window.addEventListener('blur', () => {
    Onblur()
    if (isPlayingVideo()) {
        chrome.runtime.sendMessage({ action: "isKing", tag: tag }).then((r) => {
            IamKing = r.isKing
        })
    }
});

window.addEventListener('beforeunload', () => {
    Onblur()
    if (IamKing) {
        IamKing = false
        chrome.runtime.sendMessage({ action: "NotKing" })
    }
});

window.addEventListener('focus', () => {
    Onfocus()
});

Onfocus()
