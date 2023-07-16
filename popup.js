let TodayBrowsingTimenew
let aWeekBrowsingTimenew
let TodayTotal = 0
function initChart() {
    chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
        let BrowsingTime = result.AllBrowsingTime.BrowsingTime
        let BTdataForDraw = calculationBT(BrowsingTime)
        TodayBrowsingTimenew = new Chart("myChart", {
            type: "pie",
            data: {
                labels: [
                    'YT',
                    'ELSE',
                ],
                datasets: [{
                    label: "Today's BrowsingTime",
                    data: BTdataForDraw,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Today's BrowsingTime"
                }
            }
        });
    });
    chrome.storage.local.get(["aWeek"]).then((result) => {
        let aWeek = result.aWeek[result.aWeek.length - 1 + WeekCount]
        let aWeekBTdataForDraw = CaWeekBT(aWeek)
        aWeekBrowsingTimenew = new Chart("myChart2", {
            type: 'bar',
            data: {
                labels: ['日', '一', '二', '三', '四', '五', '六'],
                datasets: [
                    {
                        label: "a Week's BrowsingTime",
                        data: aWeekBTdataForDraw[0],
                        borderColor: 'rgb(255,255,255)',
                        backgroundColor: "rgb(255, 159, 180)",
                    }
                ]
            },
            options: {
                title: {
                    position: 'bottom',
                    display: true,
                    text: "a Week's BrowsingTime",
                },
                barPercentage: 0.5,
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            min: 0,
                            max: 12
                        }
                    }]
                },
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        title: (tooltipItem) => {
                            return aWeekBTdataForDraw[1][tooltipItem[0].index]
                        },
                        label: (tooltipItem) => {
                            return tooltipItem.yLabel + "hr";
                        }
                    }
                }
            }
        })
    });
}
function UpDataImg() {
    chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
        let BrowsingTime = result.AllBrowsingTime.BrowsingTime
        let BTdataForDraw = calculationBT(BrowsingTime)
        TodayBrowsingTimenew.data.datasets[0].data = BTdataForDraw;
        TodayBrowsingTimenew.update();
    })
    chrome.storage.local.get(["aWeek"]).then((result) => {
        if (result.aWeek.length - 1 + WeekCount < 0) {
            return
        }
        let aWeek = result.aWeek[result.aWeek.length - 1 + WeekCount]
        let aWeekBTdataForDraw = CaWeekBT(aWeek)
        aWeekBrowsingTimenew.data.datasets[0].data = aWeekBTdataForDraw[0];
        aWeekBrowsingTimenew.options.tooltips.callbacks.title = (tooltipItem) => {
            return aWeekBTdataForDraw[1][tooltipItem[0].index]
        };
        aWeekBrowsingTimenew.update();
    })
}

function calculationBT(BrowsingTime) {
    let YTtime = 0
    let elseTime = 0
    TodayTotal = 0
    for (let key in BrowsingTime) {
        TodayTotal += BrowsingTime[key]
        if (key == "www.youtube.com") {
            YTtime += BrowsingTime[key];
        } else {
            elseTime += BrowsingTime[key];
        }

    }
    YTtime = (YTtime / 60000).toFixed(2)
    elseTime = (elseTime / 60000).toFixed(2)
    return [YTtime, elseTime]
}
function CaWeekBT(data) {
    let totals = []
    let titles = []
    for (let key = 0; key < 7; key++) {
        let total = 0
        if (data[key] == undefined) {
            totals.push(0)
            titles.push("future")
            continue
        }
        aDay = data[key]
        if (aDay.BrowsingTime == null) {
            totals.push((TodayTotal / 60000).toFixed(2))
            titles.push(aDay.Date)
            continue
        }
        for (let key2 in aDay.BrowsingTime) {
            total += aDay.BrowsingTime[key2];
        }
        total = (total / 3600000).toFixed(2)
        totals.push(total)
        titles.push(aDay.Date)
    }
    return [totals, titles]

}

initChart()
setTimeout(() => {
    UpDataImg()
}, 100);
// chrome.storage.local.get(["aWeek"]).then((result) => {
// });
let WeekCount = 0
const NextWeek = document.getElementById("nextWeek")
NextWeek.addEventListener("click", () => {
    if (WeekCount < 0) {
        WeekCount++
        UpDataImg()
    }
})
const LastWeek = document.getElementById("lastWeek")
LastWeek.addEventListener("click", () => {
    if (WeekCount > -4) {
        WeekCount--
        UpDataImg()
    }
})