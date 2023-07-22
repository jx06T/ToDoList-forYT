function ResetData() {
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: today.getDate() })
	chrome.storage.local.set({ aWeek: [] })
}

async function UpData() {
	let today = new Date();
	const r1 = await chrome.storage.local.get("LastUpDataTime")
	const LastUpDataTime = r1.LastUpDataTime
	if (LastUpDataTime != GetMyDay(today)) {
		console.log("!")
		const r2 = await chrome.storage.local.get("AllBrowsingTime");
		const LBrowsingTime = r2.AllBrowsingTime;
		const r3 = await chrome.storage.local.get("aWeek");
		let aWeek = r3.aWeek;
		if (aWeek == undefined) {
			ResetData()
			aWeek = []
		}
		chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
		if (today.getDay() == 0) {
			if (aWeek.length > 3) {
				aWeek.shift()
			}
			aWeek.push({})
		}
		aWeek[aWeek.length - 1][LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
		aWeek[aWeek.length - 1][today.getDay()] = { Date: GetMyDay(today), BrowsingTime: null }
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
chrome.runtime.onInstalled.addListener(() => {
	UpData()
})

//------------------------------------------------------------------------------------------------------------------------
let FirstKing = { id: null, tag: null }//當前計算的
let SecondKing = { id: null, tag: null }//有可能搶的
let EnterTime = Date.now()
let SFK = true
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let A = request.action
	// console.log(A)
	switch (A) {
		case "test":
			// console.log("!!!!!", sender, request.TestText)
			break
		case "AmIKing":
			if (FirstKing.id == null) {
				sendResponse({ msg: true })
				FirstKing.tag = request.tag
				FirstKing.id = sender.tab.id
				EnterTime = Date.now()
			} else {
				sendResponse({ msg: false })
				SecondKing.tag = request.tag
				SecondKing.id = sender.tab.id
			}
			break
		case "IAmReallyKing":
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			SFK = false
			break
		case "IAmNotReallyKing":
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			SFK = true
			break
		case "KingDown":
			if (sender.tab.id != FirstKing.id) {
				break
			}
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			FirstKing.tag = null
			FirstKing.id = null
			break
		case "SKingDown":
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			SecondKing.tag = null
			SecondKing.id = null
			SFK = true
			break
		case "KillKing":
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			if (FirstKing.id != null) {
				chrome.tabs.sendMessage(FirstKing.id, { action: "YouNotAreKing" });
			}
			SecondKing.tag = null
			SecondKing.id = null
			FirstKing.tag = request.tag
			FirstKing.id = sender.tab.id
			SFK = true
			break
		case "ChecckPlaying":
			AddTime(SFK ? FirstKing.tag : SecondKing.tag)
			let active = sender.tab.active
			sendResponse({ msg: active })
			break
		case "isKingReallyKing":
			if (FirstKing.id == null) {
				sendResponse({ msg: "ok" })
				break
			}
			chrome.tabs.get(FirstKing.id, (tab) => {
				if (!tab.active) {
					if (FirstKing.id != null) {
						chrome.tabs.sendMessage(FirstKing.id, { action: "YouNotAreKing" });
					}
					FirstKing.tag = null
					FirstKing.id = null
				}
				sendResponse({ msg: "ok" })
			})
			break
		case "AmIReallyKing":
			sendResponse({ msg: sender.tab.id == FirstKing.id })
			break
	}
	// console.log(sender.tab, SFK, FirstKing, SecondKing)
	return true;
});

function AddTime(tag) {
	if (tag == null) {
		return
	}
	// console.log(SFK, FirstKing, SecondKing)
	let BrowsingTime = Date.now() - EnterTime
	chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
		let OldAllBrowsingTime = result.AllBrowsingTime
		OldAllBrowsingTime.BrowsingTime[tag] = OldAllBrowsingTime.BrowsingTime[tag] ? OldAllBrowsingTime.BrowsingTime[tag] += BrowsingTime : BrowsingTime
		// console.log(tag, BrowsingTime, OldAllBrowsingTime)
		chrome.storage.local.set({ AllBrowsingTime: OldAllBrowsingTime })
	})
	EnterTime = Date.now()
}

//-------------------------------------------------------------------------------------------------------------------------

function DeBugResetData() {
	let today = new Date()
	// chrome.storage.local.set({ AllBrowsingTime: { Date: ["07/16", 6], BrowsingTime: { T1: 12 * 3600000 } } })
	// chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: "07/16" })
	// chrome.storage.local.set({ LastUpDataTime: GetMyDay(today) })
	return
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
				5: { Date: "07/14", BrowsingTime: { T1: 1000000 } },
				6: { Date: "07/15", BrowsingTime: { T1: 12 * 3600000 } },
			},
			{
				0: { Date: "07/16", BrowsingTime: { T1: 12 * 3600000 } },
			}]
	})
}
