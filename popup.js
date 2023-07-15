
chrome.storage.local.get(["AllBrowsingTime"]).then((result) => {
    BrowsingTime = result.AllBrowsingTime.BrowsingTime
    let YTtime = 0
    let elseTime = 0
    console.log(BrowsingTime)
    for (let key in BrowsingTime) {
        console.log(key, BrowsingTime[key])
        if (key == "www.youtube.com") {
            YTtime += BrowsingTime[key];
        } else {
            elseTime += BrowsingTime[key];
        }

    }
    YTtime = (YTtime / 60000).toFixed(2)
    elseTime = (elseTime / 60000).toFixed(2)
    console.log(YTtime, elseTime)
    const data = {
        labels: [
            'YT',
            'ELSE',
        ],
        datasets: [{
            label: "Today's BrowsingTime",
            data: [YTtime, elseTime],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
            ],
            hoverOffset: 4
        }]
    };
    console.log(data)
    let TodayBrowsingTimenew = new Chart("myChart", {
        type: "pie",
        data: data,
        options: {
            title: {
                display: true,
                text: "Today's BrowsingTime"
            }
        }
    });
});



// chrome.storage.local.get(["aWeek"]).then((result) => {
// });

