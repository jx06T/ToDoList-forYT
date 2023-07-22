let TodayBrowsingTimenew
let aWeekBrowsingTimenew
let aWeek
let TodayTotal = 0
let AllRule
let tagColors = {}
chrome.storage.local.get(["AllRule"]).then((result) => {
    AllRule = result.AllRule
    AllRule.forEach(item => {
        tagColors[item.tag] = item.color;
    });
    tagColors["ELSE"] = "#c8e0e4"
})


function getColorByTag(tag) {
    return tagColors[tag];
}

function initChart() {
    chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
        let BrowsingTime = result.AllBrowsingTime.BrowsingTime
        const r = calculationBT(BrowsingTime)
        TodayBrowsingTimenew = new Chart("myChart", {
            type: "pie",
            data: {
                labels: r[1],
                datasets: [{
                    label: "Today's BrowsingTime",
                    data: [0],
                    backgroundColor: r[2],
                    hoverOffset: 4
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Today's BrowsingTime"
                },
                tooltips: {
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return data.labels[tooltipItem[0].index];
                        },
                        label: function (tooltipItem, data) {
                            const dataset = data.datasets[tooltipItem.datasetIndex];
                            return dataset.data[tooltipItem.index] + "min";
                        }
                    }
                }
            }
        });
    });
    chrome.storage.local.get(["aWeek"]).then((result) => {
        aWeek = result.aWeek[result.aWeek.length - 1 + WeekCount]
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
                },
                hover: {
                    onHover: (event, chartElement) => {
                        // if (chartElement.length == 0) {
                        //     return
                        // }
                        // const index = chartElement[0]. _index;
                        // console.log(index,chartElement)
                    }
                },
                onClick: (event, chartElement) => {
                    if (chartElement.length == 0) {
                        return
                    }
                    const index = chartElement[0]._index;
                    pastDay(index)
                }
            }
        })
    });
}
function UpDataImg() {
    chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
        let BrowsingTime = result.AllBrowsingTime.BrowsingTime
        const r = calculationBT(BrowsingTime)
        TodayBrowsingTimenew.data.datasets[0].data = r[0];
        TodayBrowsingTimenew.data.labels = r[1];
        TodayBrowsingTimenew.data.datasets[0].backgroundColor = r[2];
        TodayBrowsingTimenew.update();
    })
    chrome.storage.local.get(["aWeek"]).then((result) => {
        if (result.aWeek.length - 1 + WeekCount < 0) {
            return
        }
        aWeek = result.aWeek[result.aWeek.length - 1 + WeekCount]
        let aWeekBTdataForDraw = CaWeekBT(aWeek)
        aWeekBrowsingTimenew.data.datasets[0].data = aWeekBTdataForDraw[0];
        aWeekBrowsingTimenew.options.tooltips.callbacks.title = (tooltipItem) => {
            return aWeekBTdataForDraw[1][tooltipItem[0].index]
        };
        aWeekBrowsingTimenew.update();
    })
}
function pastDay(i) {
    const r = calculationBT(aWeek[i].BrowsingTime)
    TodayBrowsingTimenew.data.datasets[0].data = r[0];
    TodayBrowsingTimenew.data.labels = r[1];
    TodayBrowsingTimenew.data.datasets[0].backgroundColor = r[2];
    TodayBrowsingTimenew.update();
}


function calculationBT(BrowsingTime) {
    let AllTime = []
    let AllLabels = []
    let colors = []
    TodayTotal = 0
    for (let key in BrowsingTime) {
        TodayTotal += BrowsingTime[key]
        AllLabels.push(key)
        colors.push(getColorByTag(key))
        AllTime.push((BrowsingTime[key] / 60000).toFixed(2))
    }

    return [AllTime, AllLabels, colors]
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
            totals.push((TodayTotal / 3600000).toFixed(2))
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
const ToToday = document.querySelector('#today')
ToToday.addEventListener("click",UpDataImg)
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