function ResetData() {
  let today = new Date()
  chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } }).then((e) => {
  });
  chrome.storage.local.set({ LastUpDataTime: today.getDate() }).then((e) => {
  });
  // chrome.storage.local.set({ aWeek: {} }).then((e) => {
  // });
}

function DeBugResetData() {
  chrome.storage.local.set({ AllBrowsingTime: { Date: ["07/15", 6], BrowsingTime: { T1: 12330, T2: 12234, T3: 155 } } }).then((e) => {
  });
  chrome.storage.local.set({ LastUpDataTime: "07/15" }).then((e) => {
  });
  chrome.storage.local.set({
    aWeek:
      [{
        0: { Date: "06/02", BrowsingTime: { T1: 7 * 3600000 } },
        1: { Date: "06/03", BrowsingTime: { T1: 2 * 3600000 } },
        2: { Date: "06/04", BrowsingTime: { T1: 4 * 3600000 } },
        3: { Date: "06/05", BrowsingTime: { T1: 1 * 3600000 } },
        4: { Date: "06/06", BrowsingTime: { T1: 9 * 3600000 } },
        5: { Date: "06/07", BrowsingTime: { T1: 3 * 3600000 } },
        6: { Date: "06/08", BrowsingTime: { T1: 5 * 3600000 } },
      },
      {
        0: { Date: "07/02", BrowsingTime: { T1: 7 * 3600000 } },
        1: { Date: "07/03", BrowsingTime: { T1: 6 * 3600000 } },
        2: { Date: "07/04", BrowsingTime: { T1: 5 * 3600000 } },
        3: { Date: "07/05", BrowsingTime: { T1: 4 * 3600000 } },
        4: { Date: "07/06", BrowsingTime: { T1: 3 * 3600000 } },
        5: { Date: "07/07", BrowsingTime: { T1: 2 * 3600000 } },
        6: { Date: "07/08", BrowsingTime: { T1: 1 * 3600000 } },
      }, {
        0: { Date: "07/09", BrowsingTime: { T1: 1 * 3600000 } },
        1: { Date: "07/10", BrowsingTime: { T1: 2 * 3600000 } },
        2: { Date: "07/11", BrowsingTime: { T1: 3 * 3600000 } },
        3: { Date: "07/12", BrowsingTime: { T1: 4 * 3600000 } },
        4: { Date: "07/13", BrowsingTime: { T1: 5 * 3600000 } },
        5: { Date: "07/14", BrowsingTime: null },
      }]
  }).then((e) => {
  });
}

async function UpData() {
  let today = new Date();
  const r1 = await chrome.storage.local.get("LastUpDataTime")
  const LastUpDataTime = r1.LastUpDataTime
  if (LastUpDataTime != GetMyDay(today)) {
    const r2 = await chrome.storage.local.get("AllBrowsingTime");
    const LBrowsingTime = r2.AllBrowsingTime;
    const r3 = await chrome.storage.local.get("aWeek");
    let aWeek = r3.aWeek;
    chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
    if (today.getDay == 0) {
      aWeek.shift()
      aWeek.push({})
    }
    aWeek[aWeek.lenght - 1][LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
    aWeek[today.getDay()] = { Date: null, BrowsingTime: null }
    chrome.storage.local.set({ aWeek: aWeek })
    chrome.storage.local.set({ LastUpDataTime: GetMyDay(today) })

    // console.log(aWeek)
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
    // console.log(KingTag)
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
    // console.log(KingTag)
  }
  return true;
});


