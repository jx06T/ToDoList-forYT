function ResetData() {
  let today = new Date()
  chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } }).then((e) => {
  });
  chrome.storage.local.set({ LastUpDataTime: today.getDate() }).then((e) => {
  });
  chrome.storage.local.set({ aWeek: {} }).then((e) => {
  });
}

function DeBugResetData() {
  chrome.storage.local.set({ AllBrowsingTime: { Date: ["07/10", 1], BrowsingTime: { T1: 1233, T2: 12234, T3: 155 } } }).then((e) => {
  });
  chrome.storage.local.set({ LastUpDataTime: 3 }).then((e) => {
  });
  // chrome.storage.local.set({ aWeek: {} }).then((e) => {
  // });
}

async function UpData() {
  let today = new Date();
  const r1 = await chrome.storage.local.get("LastUpDataTime")
  const LastUpDataTime = r1.LastUpDataTime
  if (LastUpDataTime != today.getDate()) {
    const r2 = await chrome.storage.local.get("AllBrowsingTime");
    const LBrowsingTime = r2.AllBrowsingTime;
    const r3 = await chrome.storage.local.get("aWeek");
    let aWeek = r3.aWeek;

    chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
    aWeek[LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
    aWeek[today.getDay()] = { Date: null, BrowsingTime: null }
    chrome.storage.local.set({ aWeek: aWeek })
    chrome.storage.local.set({ LastUpDataTime: today.getDate() })

    console.log(aWeek)
  }
}

// DeBugResetData()
// UpData()

function GetMyDay(today) {
  let month = today.getMonth() + 1; // 月份從 0 開始計算
  let day = today.getDate();
  return ("0" + month).slice(-2) + "/" + ("0" + day).slice(-2)
}

chrome.runtime.onStartup.addListener(() => {
  UpData()
  // chrome.tabs.create({ url: "https://news.google.com/home?hl=zh-TW&gl=TW&ceid=TW:zh-Hant" });
});

let KingTag = null
let KingId = null
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "test") {
    console.log("!!!!!", sender, request.TestText)
  }

  if (request.action === "isKing") {
    if (sender.tab.active) {
      KingTag = request.tag
      KingId = sender.tab.id
    }
    console.log(KingTag)
    sendResponse({ isKing: sender.tab.active })
  }

  if (request.action === "GetKingTag") {
    sendResponse({ KingTag: KingTag })
  }

  if (request.action === "NotKing") {
    if (KingId == sender.tab.id) {
      KingTag = null
      KingId = null
    }
    console.log(KingTag)
  }
  return true;
});


