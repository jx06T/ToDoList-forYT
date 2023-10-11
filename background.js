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
	chrome.storage.local.set({
		AllTodo: [{ _sort_: 0, state: "！", text: "背單字", time: 30240 }, { state: "✔", text: "補習地科", time: 2880 }, { state: "✖", text: "補習數學", time: 4320 }]
	})
	chrome.storage.local.set({
		isBlocking: {}
	})
	chrome.storage.local.set({
		AllNote: [{ text: '單字\napple\norange\nbanana', time: "2023/08/25 20:15" }, { text: '作業\n數學\n生物\n模考', time: "2023/08/26 08:15" }]
	})
}

let ThisBrowsingTime = {}
async function UpData() {
	let today = new Date();
	const r1 = await chrome.storage.local.get("LastUpDataTime")
	let LastUpDataTime = r1.LastUpDataTime
	if (LastUpDataTime == undefined) {
		InitData()
		return
	}
	if (LastUpDataTime[0] != GetMyDay(today)) {

		for (let i = 0; i < Blockade.length; i++) {
			const aB = Blockade[i];
			const tag = aB.tag
			if (Blockings[tag] == undefined) {
				continue
			}
			if (Blockings[tag].isB == true) {
				Blockings[tag].LastTime = Blockings[tag].LastTime - ThisBrowsingTime[tag]._total_
			}
		}

		const r2 = await chrome.storage.local.get("AllBrowsingTime");
		const LBrowsingTime = r2.AllBrowsingTime;

		const r3 = await chrome.storage.local.get("aWeek");
		let aWeek = r3.aWeek;

		aWeek[aWeek.length - 1][LBrowsingTime.Date[1]] = { Date: LBrowsingTime.Date[0], BrowsingTime: LBrowsingTime.BrowsingTime }
		if (calculateDateDifference(GetMyDay(today), LastUpDataTime[0]) > (6 - LastUpDataTime[1])) {
			if (aWeek.length > 3) {
				aWeek.shift()
			}
			aWeek.push({})
		}
		aWeek[aWeek.length - 1][today.getDay()] = { Date: GetMyDay(today), BrowsingTime: null }

		chrome.storage.local.set({ aWeek: aWeek })
		const tempThisBrowsingTime = { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} }
		chrome.storage.local.set({ AllBrowsingTime: tempThisBrowsingTime })
		ThisBrowsingTime = tempThisBrowsingTime
		chrome.storage.local.set({ LastUpDataTime: [GetMyDay(today), today.getDay()] })

		chrome.storage.local.set({ isBlocking: Blockings })
	}
	chrome.storage.local.get("AllTodo").then((a) => {
		AllTodo = a.AllTodo;
		AllTodo.forEach(aTodo => {
			aTodo.time -= (Math.round(Date.now() / 60000) - aTodo.UpdateTime)
			// console.log(aTodo, aTodo.time, Math.round(Date.now() / 60000), aTodo.UpdateTime,)
			aTodo.UpdateTime = Math.round(Date.now() / 60000)
			if (aTodo.time < 0) {
				notify(aTodo.text + " 已過期" + -aTodo.time + "分鐘", "時間：" + aTodo.time + "min（" + aTodo.state + "）")
			} else if (aTodo.time == 3 || aTodo.time == 20 || aTodo.time == 60 || aTodo.time == 180) {
				notify(aTodo.text + " 還有" + aTodo.time + "分鐘到期", "時間：" + aTodo.time + "min（" + aTodo.state + "）")
			}
		});
		chrome.storage.local.set({
			AllTodo: AllTodo
		})
	})
	// console.log(ThisBrowsingTime, Blockings)
}
// DeBugResetData()
// UpData()

function calculateDateDifference(dateStr1, dateStr2) {
	const [month1, day1] = dateStr1.split('/').map(Number);
	const [month2, day2] = dateStr2.split('/').map(Number);
	const currentYear = new Date().getFullYear();
	const date1 = new Date(currentYear, month1 - 1, day1);
	const date2 = new Date(currentYear, month2 - 1, day2);
	const timeDifference = date2 - date1;
	const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
	return daysDifference;
}


function GetMyDay(today) {
	let month = today.getMonth() + 1; // 月份從 0 開始計算
	let day = today.getDate();
	return ("0" + month).slice(-2) + "/" + ("0" + day).slice(-2)
}

chrome.runtime.onStartup.addListener(() => {
	UpData()
	chrome.alarms.create('midnight', { when: getMidnight() });
	// chrome.tabs.create({ url: chrome.runtime.getURL('options\\options.html') });
});
chrome.runtime.onInstalled.addListener(() => {
	UpData()
	// chrome.tabs.create({ url: chrome.runtime.getURL('options\\options.html') });
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
let count = 0

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let A = request.action
	const TabId = sender.tab.id
	const dns = new URL(sender.origin).hostname;
	// console.log(request, sender)
	switch (A) {
		case "delay":
			Blockings[request.tag].delayTime = request.time
			break
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
	console.log(tag)
	let BrowsingTime = (Date.now() - EnterTime) / 1000
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
		ThisBrowsingTime = OldAllBrowsingTime
		// ThisBrowsingTime =  JSON.parse(JSON.stringify(OldAllBrowsingTime))
		// console.log(ThisBrowsingTime)
	})
	EnterTime = Date.now()
}

function doTask(B) {
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
							chrome.tabs.sendMessage(aTab.id, { Blockings: B, action: "CheckYou", isSomeonePlayVideo: SomeonePlayVideo });
						} else {
							setTimeout(() => {
								ELSE(aTab)
							}, 10);
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
		// if (aTab.url.includes("file:")) {
		// 	Mytag = "FILE"
		// }
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
chrome.alarms.create('TodoLoop', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(alarm => {
	if (alarm.name === 'readLoop') {
		// count++
		doTask(doBlock());
	}
	if (alarm.name === 'TodoLoop') {
		doTodoChange()
	}
	if (alarm.name === 'midnight') {
		UpData()
		chrome.alarms.create('midnight', { when: getMidnight() });
	}
});
//-------------------------------------------------------------------------------------------------------------------------
function notify(title, content) {
	let notificationOptions = {
		type: "basic",
		title: title,
		message: content,
		iconUrl: "images\\T1.jpg", // 請替換為您自己的圖示 URL
		priority: 1
	};

	chrome.notifications.create("timeout" + RandNotifyId(), notificationOptions, (notificationId) => {
		console.log("ID：" + notificationId);
	});
}
function RandNotifyId() {
	return Math.random().toString(36).substring(2.9)
}
function doTodoChange() {
	chrome.storage.local.get("AllTodo").then((a) => {
		AllTodo = a.AllTodo;
		if (AllTodo.length == 0) {
			return
		}
		let T = 1
		if ((Math.round(Date.now() / 60000) - AllTodo[1].UpdateTime) > 1 && AllTodo[1].UpdateTime != undefined) {
			T = Math.round(Date.now() / 60000) - AllTodo[1].UpdateTime
		}
		AllTodo.forEach(aTodo => {
			aTodo.time -= T
			// console.log(Math.round(Date.now() / 1000))
			aTodo.UpdateTime = Math.round(Date.now() / 60000)
			if (aTodo.time == 0 || aTodo.time == -1 || aTodo.time == -3 || (aTodo.time < 0 && aTodo.time % 15 == 0)) {
				notify(aTodo.text + " 已過期" + -aTodo.time + "分鐘", "時間：" + aTodo.time + "min（" + aTodo.state + "）")
			} else if (aTodo.time == 3 || aTodo.time == 20 || aTodo.time == 60 || aTodo.time == 180) {
				notify(aTodo.text + " 還有" + aTodo.time + "分鐘到期", "時間：" + aTodo.time + "min（" + aTodo.state + "）")
			}
		});
		chrome.storage.local.set({
			AllTodo: AllTodo
		})
	})
}
chrome.notifications.onClicked.addListener(function (notificationId) {
	if (notificationId.includes("timeout")) {
		let urlToOpen = chrome.runtime.getURL('ToDoList.html');
		chrome.tabs.query({ url: urlToOpen }, function (tabs) {
			if (tabs.length > 0) {
				chrome.tabs.update(tabs[0].id, { active: true });
			} else {
				chrome.tabs.create({ url: urlToOpen });
			}
		});
		// chrome.tabs.create({ url: chrome.runtime.getURL('ToDoList.html') });
	}
});
//-------------------------------------------------------------------------------------------------------------------------
let Blockade = []
let Blockings = {}
chrome.storage.local.get("Blockade").then((a) => {
	Blockade = a.Blockade;
})
chrome.storage.local.get("isBlocking").then((a) => {
	Blockings = a.isBlocking;
	// console.log(Blockings)
})
chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
	ThisBrowsingTime = result.AllBrowsingTime.BrowsingTime;
})
chrome.storage.onChanged.addListener(function (changes, areaName) {
	if (areaName === 'local') {
		if (changes.Blockade) {
			Blockade = changes.Blockade.newValue;
		}
	}
});

function doBlock() {
	let tempAllTag = []
	const TodaysDay = new Date().getDay()
	for (let i = 0; i < Blockade.length; i++) {
		const aB = Blockade[i];
		const tag = aB.tag
		tempAllTag.push(tag)
		// console.log(aB.WorkDay, TodaysDay,!aB.WorkDay.includes(TodaysDay),tag)
		if (tag == "" || ThisBrowsingTime[tag] == undefined || aB.restricted == false) {
			continue
		}
		// console.log(aB)
		if (Blockings[tag] == undefined) {
			Blockings[tag] = {}
			Blockings[tag].LastTime = ThisBrowsingTime[tag]._total_
			Blockings[tag].LLastBT = ThisBrowsingTime[tag]._total_
			Blockings[tag].LLastUT = Date.now() / 1000
			Blockings[tag].isB = false
			Blockings[tag].isL = false
			Blockings[tag].isD = false
		}

		if (aB.WorkDay.includes(TodaysDay) && aB.rest[0] != "" && !Blockings[tag].isB && ThisBrowsingTime[tag]._total_ - Blockings[tag].LastTime > aB.rest[0] * 60) {
			Blockings[tag].LastTime = Date.now() / 1000
			Blockings[tag].isB = true
			Blockings[tag].ID = aB.ID
			Blockings[tag].timeB = aB.rest[1].toFixed(2)
			for (let i = 0; i < aB.impacted.length; i++) {
				const itemTag = aB.impacted[i];
				if (itemTag == "") {
					continue
				}
				if (Blockings[itemTag] == undefined) {
					Blockings[itemTag] = {}
				}
				Blockings[itemTag].isBd = true
				Blockings[itemTag].timeBd = tag
			}
			console.log(1, tag)
		}
		if (Blockings[tag].ID == aB.ID && Blockings[tag].isB && (Date.now() / 1000) - Blockings[tag].LastTime > aB.rest[1] * 60) {
			Blockings[tag].isB = false
			for (let i = 0; i < aB.impacted.length; i++) {
				const itemTag = aB.impacted[i];
				if (itemTag == "") {
					continue
				}
				if (Blockings[itemTag] == undefined) {
					Blockings[itemTag] = {}
				}
				Blockings[itemTag].isBd = false
				Blockings[itemTag].timeBd = tag
			}
			Blockings[tag].LastTime = ThisBrowsingTime[tag]._total_
			console.log(2, tag)
		}

		if (aB.WorkDay.includes(TodaysDay) && aB.limit[0] != "" && !Blockings[tag].isL && ThisBrowsingTime[tag]._total_ - Blockings[tag].LLastBT > aB.limit[0] * 3600) {
			Blockings[tag].isL = true
			Blockings[tag].ID = aB.ID
			Blockings[tag].timeL = aB.limit[0].toFixed(2) + "／" + aB.limit[1].toFixed(2)
			for (let i = 0; i < aB.impacted.length; i++) {
				const itemTag = aB.impacted[i];
				if (itemTag == "") {
					continue
				}
				if (Blockings[itemTag] == undefined) {
					Blockings[itemTag] = {}
				}
				Blockings[itemTag].isBd = true
				Blockings[itemTag].timeBd = tag
			}
			console.log(3, tag)
		}
		if (Blockings[tag].ID == aB.ID && Blockings[tag].isL && (Date.now() / 1000) - Blockings[tag].LLastUT > aB.limit[1] * 3600) {
			Blockings[tag].isL = false
			for (let i = 0; i < aB.impacted.length; i++) {
				const itemTag = aB.impacted[i];
				if (itemTag == "") {
					continue
				}
				if (Blockings[itemTag] == undefined) {
					Blockings[itemTag] = {}
				}
				Blockings[itemTag].isBd = false
				Blockings[itemTag].timeBd = tag
			}
			Blockings[tag].LLastUT = Date.now() / 1000
			Blockings[tag].LLastBT = ThisBrowsingTime[tag]._total_

			console.log(4, tag)
		}

		for (let j = 0; j < aB.disabled.length; j++) {
			const aD = aB.disabled[j];
			let T = isTimeInRange(aD[0], aD[1])
			// console.log(aB, Blockings[tag], T)
			if (T) {
				if (aB.WorkDay.includes(TodaysDay)) {
					Blockings[tag].isD = T
					Blockings[tag].ID = aB.ID
				}
			} else if (Blockings[tag].ID == aB.ID) {
				Blockings[tag].isD = T
			} else {
				break
			}

			Blockings[tag].timeD = [aD[0], aD[1]]
			for (let i = 0; i < aB.impacted.length; i++) {
				const itemTag = aB.impacted[i];
				if (itemTag == "") {
					continue
				}
				if (Blockings[itemTag] == undefined) {
					Blockings[itemTag] = {}
				}
				Blockings[itemTag].isBd = T
				Blockings[itemTag].timeBd = tag
			}
		}
	}
	for (var key in Blockings) {
		if (Blockings[key].isB) {
			Blockings[key].timeB -= 3 / 60
			if (tempAllTag.indexOf(key) == -1) {
				Blockings[key].timeB.deleteCount += 1
				console.log(key)
			} else {
				Blockings[key].timeB.deleteCount = 0
			}
			if (Blockings[key].timeB.deleteCount > 15) {
				Blockings[key] = undefined
			}
		}
		// console.log(key + ": " + Blockings[key]);
	}
	// console.log(Blockings)
	chrome.storage.local.set({
		isBlocking: Blockings
	})
	return Blockings
}
function isTimeInRange(startTime, endTime) {
	const today = new Date()
	const hour = today.getHours()
	const min = today.getMinutes()

	const startHours = Number(startTime.split(':')[0]);
	const startMinutes = Number(startTime.split(':')[1]);
	const endHours = Number(endTime.split(':')[0]);
	const endMinutes = Number(endTime.split(':')[1]);

	const start = startHours * 60 + startMinutes;
	const end = endHours * 60 + endMinutes;
	const check = hour * 60 + min;
	if (end < start) {
		return start <= check || check <= end;
	} else {
		return start <= check && check <= end;
	}

}

//-------------------------------------------------------------------------------------------------------------------------


function DeBugResetData() {
	chrome.storage.local.set({
		AllTodo: [{ text: "背單字", time: 10, state: "★" }, { text: "寫作業", time: 60, state: "！" }]
	})
	chrome.storage.local.set({
		AllNote: [{ text: '單字\napple\norange\nbanana', time: "2023/08/25 20:15" }, { text: '作業\n數學\n生物\n模考\n很多多', time: "2023/08/26 08:15" }]
	})
	let today = new Date()
	chrome.storage.local.set({ AllBrowsingTime: { Date: ["08/26", 6], BrowsingTime: { code: { _total_: 7 * 3600, "github.com": { _total_: 5 * 3600, "jx06T/ToDoList-forYT": 3 * 3600 } } } } })
	// chrome.storage.local.set({ AllBrowsingTime: { Date: [GetMyDay(today), today.getDay()], BrowsingTime: {} } })
	chrome.storage.local.set({ LastUpDataTime: ["08/26", 6] })
	// chrome.storage.local.set({ LastUpDataTime: GetMyDay(today) })
	// return
	chrome.storage.local.set({
		aWeek:
			[{
				0: { Date: "07/23", BrowsingTime: { code: { _total_: 7 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				1: { Date: "07/24", BrowsingTime: { code: { _total_: 6 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				2: { Date: "07/25", BrowsingTime: { code: { _total_: 5 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				3: { Date: "07/26", BrowsingTime: { code: { _total_: 4 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				4: { Date: "07/27", BrowsingTime: { code: { _total_: 3 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				5: { Date: "07/28", BrowsingTime: { code: { _total_: 2 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				6: { Date: "07/29", BrowsingTime: { code: { _total_: 1 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } }
			},
			{
				0: { Date: "07/30", BrowsingTime: { code: { _total_: 7 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				1: { Date: "08/01", BrowsingTime: { code: { _total_: 6 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				2: { Date: "08/02", BrowsingTime: { code: { _total_: 5 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				3: { Date: "08/03", BrowsingTime: { code: { _total_: 4 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				4: { Date: "08/04", BrowsingTime: { code: { _total_: 3 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				5: { Date: "08/05", BrowsingTime: { code: { _total_: 3 * 3600, "https://github.com/": { _total_: 5 * 3600000, "jx06T/ToDoList-forYT": 3 * 3600000 } } } },
				6: { Date: "08/26", BrowsingTime: null },
			}]
	})
}
