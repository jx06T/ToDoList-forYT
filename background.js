function InitData() {
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: [GetMyDay(today), today.getDay()] })
	chrome.storage.local.set({ aWeek: [{}] })
	chrome.storage.local.set({
		AllRule: [{ tag: "YT", rule: ["https://www.youtube.com/"], color: "#ff0000" }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], color: "#78afa1", deactivate: true }]
	})
	chrome.storage.local.set({
		Blockade: [{ tag: 'YT', limit: [3, 6], rest: [20, 5], influenced: ["", ""], restricted: true, disabled: [["23:00", "08:00"], ["11:00", "13:00"]] }, { tag: 'ChatGPT', limit: [5, 12], rest: [5, 0], restricted: false, influenced: ["", ""], disabled: [["23:00", "08:00"], ["23:00", "08:00"]] }]
	})
}

async function UpData() {
	let today = new Date();
	const r1 = await chrome.storage.local.get("LastUpDataTime")
	let LastUpDataTime = r1.LastUpDataTime
	if (LastUpDataTime == undefined) {
		InitData()
		return
	}
	if (LastUpDataTime[0] != GetMyDay(today)) {

		const r2 = await chrome.storage.local.get("AllBrowsingTime");
		const LBrowsingTime = r2.AllBrowsingTime;

		const r3 = await chrome.storage.local.get("aWeek");
		let aWeek = r3.aWeek;

		if (parseInt(GetMyDay(today).slice(3, 5)) - parseInt(LastUpDataTime[0].slice(3, 5)) > (6 - LastUpDataTime[1])) {
			if (aWeek.length > 3) {
				aWeek.shift()
			}
			aWeek.push({})
		}
		aWeek[aWeek.length - 1][LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
		aWeek[aWeek.length - 1][today.getDay()] = { Date: GetMyDay(today), BrowsingTime: null }

		chrome.storage.local.set({ aWeek: aWeek })
		chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
		chrome.storage.local.set({ LastUpDataTime: [GetMyDay(today), today.getDay()] })
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
});
chrome.runtime.onInstalled.addListener(() => {
	UpData()
	// chrome.tabs.create({ url: "extension://epoagflebjghjoehflcmddeabilfgaph/options.html#rules" });
})

//------------------------------------------------------------------------------------------------------------------------
let ActivePages = []
let EnterTime = Date.now()
let okId = []
let SomeonePlayVideo = false
let PlayVideo_Tab = undefined

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let A = request.action
	const TabId = sender.tab.id
	switch (A) {
		case "test":
			console.log("!!!!!", sender, request.TestText)
			break
		case "Turned_off":
			if (PlayVideo_Tab == TabId) {
				SomeonePlayVideo = false
				PlayVideo_Tab = undefined
			}
			const WillOffPage = ActivePages.filter((item, index) => {
				if (item.id === TabId) {
					item.index = index;
					return true;
				}
			});
			if (WillOffPage) {
				ActivePages.splice(WillOffPage.index, 1)
			}
			okId.splice(okId.indexOf(TabId), 1)
			break
		case "Alive":
			ActivePages.push({ id: TabId, tag: request.tag, tab: sender.tab })
			if (request.isSomeonePlayVideo) {
				SomeonePlayVideo = true
				PlayVideo_Tab = TabId
			} else if (PlayVideo_Tab == TabId) {
				SomeonePlayVideo = false
				PlayVideo_Tab = undefined
			}
			break
		case "Add_url":
			okId.push(TabId)
			break
		case "Jumping_in_line":
			if (SomeonePlayVideo) {
				break
			}
			let temp = { id: TabId, tag: request.tag, tab: sender.tab }
			if (ActivePages[0] != temp) {
				if (ActivePages.length > 0) {
					AddTime(ActivePages[0].tag, ActivePages[0].tab.title)
				}
				ActivePages.unshift(temp)
			}
			break
	}
	return true;
});

function AddTime(tag, t = undefined) {
	if (t) {
		console.log(t, tag)
	}
	if (tag == null) {
		return
	}
	let BrowsingTime = Date.now() - EnterTime
	chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
		let OldAllBrowsingTime = result.AllBrowsingTime
		if (OldAllBrowsingTime.BrowsingTime[tag] == undefined) {
			OldAllBrowsingTime.BrowsingTime[tag] = BrowsingTime
		} else {
			OldAllBrowsingTime.BrowsingTime[tag] = OldAllBrowsingTime.BrowsingTime[tag] += BrowsingTime
		}
		chrome.storage.local.set({ AllBrowsingTime: OldAllBrowsingTime })
	})
	EnterTime = Date.now()
}

function doTask() {
	if (ActivePages.length > 0) {
		AddTime(ActivePages[0].tag, ActivePages[0].tab.title)
		ActivePages = []
	} else {
		EnterTime = Date.now()
	}
	if (SomeonePlayVideo) {
		chrome.tabs.get(PlayVideo_Tab, (tab) => {
			if (!tab) {
				SomeonePlayVideo = false
				PlayVideo_Tab = undefined
				return
			}
			if (!tab.active) {
				SomeonePlayVideo = false
				PlayVideo_Tab = undefined
			}
		})
	}
	chrome.windows.getAll({ populate: true }, (windows) => {
		windows.forEach((window) => {
			if (window.state !== "minimized") {
				chrome.tabs.query({ active: true, windowId: window.id }, function (tabs) {
					if (tabs.length > 0) {
						let aTab = tabs[0];
						if (okId.indexOf(aTab.id) != -1) {
							chrome.tabs.sendMessage(aTab.id, { action: "CheckYou", isSomeonePlayVideo: SomeonePlayVideo });
						} else {
							ELSE(aTab)
						}
					}
				});
			}
		});
	});
}
function ELSE(aTab) {
	console.log(aTab)
	chrome.storage.local.get("AllRule").then((a) => {
		let Mytag = "ELSE"
		const AllRule = a.AllRule;
		for (let i = 0; i < AllRule.length; i++) {
			const aTag = AllRule[i];
			if (aTag.deactivate) {
				continue
			}
			for (let j = 0; j < aTag.rule.length; j++) {
				const aRule = RegExp(aTag.rule[j])
				const UrlTitle = aTab.url + "\n" + aTab.title
				if (aRule.test(UrlTitle)) {
					Mytag = aTag.tag
					ActivePages.push({ id: aTab.id, tag: Mytag, tab: aTab })
					return
				}
			}
		}
		ActivePages.push({ id: aTab.id, tag: Mytag, tab: aTab })
	})
}
chrome.alarms.create('readLoop', { periodInMinutes: 3 / 60 });

chrome.alarms.onAlarm.addListener(alarm => {
	if (alarm.name === 'readLoop') {
		doTask();
	}
});
//-------------------------------------------------------------------------------------------------------------------------

function DeBugResetData() {
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: ["07/23", 0], BrowsingTime: { T1: 7 * 3600000 } } })
	// chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: ["07/22", 6] })
	// chrome.storage.local.set({ LastUpDataTime: GetMyDay(today) })
	// return
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
				5: { Date: "07/14", BrowsingTime: { T1: 6 * 3600000 } },
				6: { Date: "07/15", BrowsingTime: { T1: 7 * 3600000 } },
			}, {
				0: { Date: "07/23", BrowsingTime: null },
			},
			]
	})
}
