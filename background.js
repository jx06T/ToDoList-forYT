function InitData() {
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: [GetMyDay(today), today.getDay()] })
	chrome.storage.local.set({ aWeek: [{}] })
	chrome.storage.local.set({
		AllRule: [{ tag: "YT", rule: ["https://www.youtube.com/"], color: "#ff0000" }, { tag: "ChatGPT", rule: ["https://chat.openai.com/"], color: "#78afa1", deactivate: true }]
	})
	chrome.storage.local.set({
		Blockade: [{ tag: 'YT', advance: 3, limit: [3, 6], rest: [20, 5], impacted: ["claude", "", ""], restricted: true, disabled: [["23:00", "08:00"], ["11:00", "13:00"]] }, { tag: 'ChatGPT', advance: 3, limit: [5, 12], rest: [5, 0], restricted: false, impacted: ["", "", ""], disabled: [["23:00", "08:00"], ["23:00", "08:00"]] }]
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

		aWeek[aWeek.length - 1][LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
		if (parseInt(GetMyDay(today).slice(3, 5)) - parseInt(LastUpDataTime[0].slice(3, 5)) > (6 - LastUpDataTime[1])) {
			if (aWeek.length > 3) {
				aWeek.shift()
			}
			aWeek.push({})
		}
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
	chrome.alarms.create('midnight', { when: getMidnight() });
});
chrome.runtime.onInstalled.addListener(() => {
	UpData()
	// chrome.tabs.create({ url: "extension://epoagflebjghjoehflcmddeabilfgaph/options.html#rules" });
})

function getMidnight() {
	var date = new Date();
	date.setHours(24, 5, 0, 0);
	return date.getTime();
}

//------------------------------------------------------------------------------------------------------------------------
let ActivePages = []
let EnterTime = Date.now()
let okId = []
let SomeonePlayVideo = false
let PlayVideo_Tab = undefined

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let A = request.action
	const TabId = sender.tab.id
	const dns = new URL(sender.origin).hostname;
	// console.log(sender)
	switch (A) {
		case "test":
			// console.log("!!!!!", sender, request.TestText)
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
			ActivePages.push({ id: TabId, tag: request.tag, dns: dns, title: sender.tab.title, tab: sender.tab })
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
			let temp = { id: TabId, tag: request.tag, dns: dns, title: sender.tab.title, tab: sender.tab }
			if (ActivePages[0] != temp) {
				if (ActivePages.length > 0) {
					AddTime(ActivePages[0].tag, ActivePages[0].dns, ActivePages[0].title)
				}
				ActivePages.unshift(temp)
			}
			break
	}
	return true;
});

function AddTime(tag, dns, title) {
	if (tag == null) {
		return
	}
	// console.log(tag, dns, title)
	let BrowsingTime = Date.now() - EnterTime
	chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
		let rBrowsingTime = result.AllBrowsingTime
		let OldAllBrowsingTime = rBrowsingTime.BrowsingTime

		OldAllBrowsingTime[tag] = OldAllBrowsingTime[tag] || { _total_: 0 }
		OldAllBrowsingTime[tag][dns] = OldAllBrowsingTime[tag][dns] || { _total_: 0 }
		OldAllBrowsingTime[tag][dns][title] = OldAllBrowsingTime[tag][dns][title] || 0

		OldAllBrowsingTime[tag]._total_ += BrowsingTime
		OldAllBrowsingTime[tag][dns]._total_ += BrowsingTime
		OldAllBrowsingTime[tag][dns][title] += BrowsingTime

		chrome.storage.local.set({ AllBrowsingTime: rBrowsingTime })
	})
	EnterTime = Date.now()
}

function doTask() {
	if (ActivePages.length > 0) {
		AddTime(ActivePages[0].tag, ActivePages[0].dns, ActivePages[0].title)
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
	// console.log(aTab)
	chrome.storage.local.get("AllRule").then((a) => {
		let Mytag = "ELSE"
		const AllRule = a.AllRule;
		const dns = new URL(aTab.url).hostname;
		for (let i = 0; i < AllRule.length; i++) {
			const aTag = AllRule[i];
			if (aTag.deactivate) {
				continue
			}
			for (let j = 0; j < aTag.rule.length; j++) {
				if (aTag.rule[j] == "") {
					continue
				}
				const aRule = RegExp(aTag.rule[j])
				const UrlTitle = aTab.url + "\n" + aTab.title
				if (aRule.test(UrlTitle)) {
					Mytag = aTag.tag
					ActivePages.push({ id: aTab.id, tag: Mytag, dns: dns, title: aTab.title, tab: aTab })
					return
				}
			}
		}
		ActivePages.push({ id: aTab.id, tag: Mytag, dns: dns, title: aTab.title, tab: aTab })
	})
}
chrome.alarms.create('readLoop', { periodInMinutes: 3 / 60 });

chrome.alarms.onAlarm.addListener(alarm => {
	if (alarm.name === 'readLoop') {
		doTask();
	}
	if (alarm.name === 'midnight') {
		UpData()
		chrome.alarms.create('midnight', { when: getMidnight() });
	}
});
//-------------------------------------------------------------------------------------------------------------------------

function DeBugResetData() {
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: ["08/18", 5], BrowsingTime: { code: { _total_: 7 * 3600000, "github.com": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } } })
	// chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: ["08/18", 5] })
	// chrome.storage.local.set({ LastUpDataTime: GetMyDay(today) })
	// return
	chrome.storage.local.set({
		aWeek:
			[{
				0: { Date: "07/23", BrowsingTime: { code: { _total_: 7 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				1: { Date: "07/24", BrowsingTime: { code: { _total_: 6 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				2: { Date: "07/25", BrowsingTime: { code: { _total_: 5 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				3: { Date: "07/26", BrowsingTime: { code: { _total_: 4 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				4: { Date: "07/27", BrowsingTime: { code: { _total_: 3 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				5: { Date: "07/28", BrowsingTime: { code: { _total_: 2 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				6: { Date: "07/29", BrowsingTime: { code: { _total_: 1 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } }
			},
			{
				0: { Date: "07/30", BrowsingTime: { code: { _total_: 7 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				1: { Date: "08/01", BrowsingTime: { code: { _total_: 6 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				2: { Date: "08/02", BrowsingTime: { code: { _total_: 5 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				3: { Date: "08/03", BrowsingTime: { code: { _total_: 4 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				4: { Date: "08/04", BrowsingTime: { code: { _total_: 3 * 3600000, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				5: { Date: "08/05", BrowsingTime: null },
			}]
	})
}
