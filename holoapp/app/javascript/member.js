//= require jquery
//= require apexcharts
//= require list


$(function() {
    const path = location.pathname;
    const isEnglish = path.match(/^\/en/) ? true : false;
    render24hoursData(path, isEnglish);
    render14daysData(path, isEnglish);
    renderSubscriberChart('#subscriber-all', `${path}/subscriber_all`, isEnglish);
    renderRoundTable('#round-table', `${path}/round`, isEnglish);
});


function render24hoursData(path, isEnglish) {
    fetch(`${path}/subscriber_24hours`)
    .then((response) => response.json())
    .then((alldata) => {
        const subscriberDiffList = [];
        const subscriberList = [];
        let subscriberMin = -1;
        let subscriberMax = 1;
        let subscriberDiffMin = -1;
        let subscriberDiffMax = 1;
        for (let i=0; i<alldata.length-1; i++) {
            const data = alldata[i];
            const subscriber = data.subscriber;
            let subscriberDiff = 0;
            if (i + 1 < alldata.length) {
                const nextData = alldata[i+1];
                subscriberDiff = subscriber - nextData.subscriber;
            }
            if (subscriberMin == -1 || subscriber < subscriberMin) subscriberMin = subscriber - 10000;
            if (subscriberMax == -1 || subscriber > subscriberMax) subscriberMax = subscriber + 10000;
            if (subscriberDiffMin == -1 || subscriber < subscriberDiffMin) subscriberDiffMin = subscriberDiff - 10000;
            if (subscriberDiffMax == -1 || subscriber > subscriberDiffMax) subscriberDiffMax = subscriberDiff + 10000;
            subscriberList.push(subscriber);
            subscriberDiffList.push(subscriberDiff);
        }

        // データが24時間分に満たない場合はダミーデータで埋める
        while (subscriberList.length < 24) {
            subscriberList.unshift(subscriberList.length > 0 ? subscriberList[0] : 0);
            subscriberDiffList.unshift(0);
        }
        
        const existData = alldata.length > 0;
        const dateLabelList = makeDateLabel('hours', 24);
        const subscriberParams = {
            target: "#subscriber-24hours",
            lineDataList: subscriberList,
            columnDataList: subscriberDiffList,
            labelList: dateLabelList,
            labelType: 'hours',
            lineTitle: isEnglish ? 'Subscribers' : 'チャンネル登録者数',
            columnTitle: isEnglish ? 'Diff' : '1時間あたりの増加数',
            lineMin: existData ? subscriberMin : -1000,
            lineMax: existData ? subscriberMax : 1000,
            columnMin: existData ? subscriberDiffMin : -1000,
            columnMax: existData ? subscriberDiffMax : 1000,
        }
        renderMixedChart(subscriberParams, isEnglish);
    });
}

function render14daysData(path, isEnglish) {
    fetch(`${path}/subscriber_14days`)
    .then((response) => response.json())
    .then((alldata) => {
        const viewCountDiffList = [];
        const viewCountList = [];
        const subscriberDiffList = [];
        const subscriberList = [];
        let subscriberMin = -1;
        let subscriberMax = -1;
        let subscriberDiffMin = -1;
        let subscriberDiffMax = -1;
        let viewCountMin = -1;
        let viewCountMax = -1;
        let viewCountDiffMin = -1;
        let viewCountDiffMax = -1;
        for (let i=0; i<alldata.length-1; i++) {
            const data = alldata[i];
            const subscriber = data.subscriber;
            const viewCount = data.video_viewcount;
            let subscriberDiff = 0;
            let viewCountDiff = 0;
            if (i + 1 < alldata.length) {
                const nextData = alldata[i+1];
                subscriberDiff = subscriber - nextData.subscriber;
                viewCountDiff = viewCount - nextData.video_viewcount;
            }
            if (subscriberMin == -1 || subscriber < subscriberMin) subscriberMin = subscriber - 10000;
            if (subscriberMax == -1 || subscriber > subscriberMax) subscriberMax = subscriber + 10000;
            if (subscriberDiffMin == -1 || subscriber < subscriberDiffMin) subscriberDiffMin = subscriberDiff - 10000;
            if (subscriberDiffMax == -1 || subscriber > subscriberDiffMax) subscriberDiffMax = subscriberDiff + 10000;
            if (viewCountMin == -1 || viewCount < viewCountMin) viewCountMin = viewCount - 10000;
            if (viewCountMax == -1 || viewCount > viewCountMax) viewCountMax = viewCount + 10000;
            if (viewCountDiffMin == -1 || viewCount < viewCountDiffMin) viewCountDiffMin = viewCountDiff - 10000;
            if (viewCountDiffMax == -1 || viewCount > viewCountDiffMax) viewCountDiffMax = viewCountDiff + 10000;
            subscriberList.push(subscriber);
            subscriberDiffList.push(subscriberDiff);
            viewCountList.push(viewCount);
            viewCountDiffList.push(viewCountDiff);
        }

        // データが14日分に満たない場合はダミーデータで埋める
        while (viewCountList.length < 14) {
            subscriberList.unshift(subscriberList.length > 0 ? subscriberList[0] : 0);
            subscriberDiffList.unshift(0);
            viewCountList.unshift(viewCountList.length > 0 ? viewCountList[0] : 0);
            viewCountDiffList.unshift(0);
        }
        
        const existData = alldata.length > 0;
        const dateLabelList = makeDateLabel('date', 14);
        const subscriberParams = {
            target: "#subscriber-14days",
            lineDataList: subscriberList,
            columnDataList: subscriberDiffList,
            labelList: dateLabelList,
            labelType: 'days',
            lineTitle: isEnglish ? 'Subscribers' : 'チャンネル登録者数',
            columnTitle: isEnglish ? 'Diff' : '1日あたりの増加数',
            lineMin: existData ? subscriberMin : -1000,
            lineMax: existData ? subscriberMax : 1000,
            columnMin: existData ? subscriberDiffMin : -1000,
            columnMax: existData ? subscriberDiffMax : 1000,
        }
        const viewCountParams = {
            target: '#viewcount',
            lineDataList: viewCountList,
            columnDataList: viewCountDiffList,
            labelList: dateLabelList,
            labelType: 'days',
            lineTitle: isEnglish ? 'Viewcounts' : '総再生数',
            columnTitle: isEnglish ? 'Diff' : '1日あたりの再生数',
            lineMin: existData ? viewCountMin : -1000,
            lineMax: existData ? viewCountMax : 1000,
            columnMin: existData ? viewCountDiffMin : -1000,
            columnMax: existData ? viewCountDiffMax : 1000,
        }
        renderMixedChart(subscriberParams, isEnglish);
        renderMixedChart(viewCountParams, isEnglish);
    });
}


function makeDateLabel(makeType, dateRange) {
    const datetime = new Date();
    const dateLabelList = [];
    for (let i = 0; i < dateRange; i++) {
        const year = datetime.getFullYear();
        const month = String(datetime.getMonth() + 1).padStart(2, '0');
        const date = String(datetime.getDate()).padStart(2, '0');
        const hour = String(datetime.getHours()).padStart(2, '0');
        const dt_label = `${year}-${month}-${date} ${hour}:00`;
        dateLabelList.push(dt_label);
        switch (makeType) {
            case 'hours':
                datetime.setHours(datetime.getHours() - 1);
                break;
            case 'date':
                datetime.setDate(datetime.getDate() - 1);
                break;
            default:
                datetime.setHours(datetime.getHours() - 1);
        }
    }
    return dateLabelList;
}


function renderSubscriberChart(target, path, isEnglish) {
    fetch(path)
    .then((response) => response.json())
    .then((alldata) => {
        const dataset = {}
        for (let i=0; i<alldata.length; i++) {
            const data = alldata[i];
            const name = isEnglish ? data.name_en : data.name;
            const subscriber = data.subscriber;
            const dt = data.datetime;
            if (name in dataset) {
                dataset[name].push({x: dt.slice(0,10), y: subscriber});
            } else {
                dataset[name] = [{x: dt.slice(0,10), y: subscriber}];
            }
        }
        const data_series = [];
        Object.keys(dataset).forEach(name => {
            data_series.push({name: name, data: dataset[name]})
        });
        const options = {
            chart: {
                height: 400,
                width: "100%",
                type: "area",
                zoom: {
                    type: 'x',
                    enabled: true,
                    autoScaleYaxis: false,
                },
                animations: {
                    enabled: false,
                    easing: 'linear',
                    speed: 300,
                    animateGradually: {
                        enabled: true,
                        delay: 10
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 100,
                    }
                },
                events: {
                    beforeZoom: function(chartContext, { xaxis}) {
                        const jstTime = new Date();
                        const minDate = new Date(1513036800000+1000*60*60*9);
                        const maxDate = (new Date(jstTime.getFullYear(), jstTime.getMonth(), jstTime.getDate()).getTime() + 1000*60*60*9);
                        minTimestamp = xaxis['min'] < minDate ? minDate : xaxis['min'];
                        maxTimestamp = xaxis['max'] > maxDate ? maxDate : xaxis['max'];
        
                        return {
                            xaxis: {
                                min: minTimestamp,
                                max: maxTimestamp
                            }
                        }
                    },
                },
                toolbar: {tools: {download: false}},
            },
            tooltip: {
                enabled: true,
                shared: true,
                x: {
                    format: isEnglish ? 'yyyy-MM-dd' : 'yyyy年M月d日'
                },
                y: {
                    formatter: function(value, {series, seriesIndex, dataPointIndex, w}) {
                        return value.toLocaleString();
                    }
                },
            },
            stroke: {
                width: 2,
            },
            series: data_series,
            xaxis: {
                type: "datetime",
                labels: {
                    format: isEnglish ? 'yyyy-MM-dd' : 'yyyy年M月d日'
                }
            },
            yaxis: {
                tooltip: {
                    enabled: false
                },
                labels: {
                    formatter: (value) => { return value.toLocaleString() }
                }
            },
            legend: {
                show: true,
                position: 'bottom',
                height: 300,
                offsetY: 3,
            },
            fill: {
                colors: '#007bff',
                opacity: 0.9
            },
            dataLabels: {
                enabled: true,
                formatter: function(value, {seriesIndex, dataPointIndex, w}) {
                    if (dataPointIndex == 0) round = [];
                    var round_value = Math.floor(value / 100000)*100000;
                    
                    if (!round.includes(round_value) && round_value !== 0) {
                        round.push(round_value);
                        if (dataPointIndex == 0) {
                            return '';
                        }
                        return round_value.toLocaleString();
                    } else {
                        return '';
                    }
                },
                style: {
                    colors: ['#007bff']
                },
                offsetX: -10,
            },
        }
        if (!$(target).text()) {
            const chart = new ApexCharts(document.querySelector(target), options);
            chart.render();
            $(`${target}-loading`).hide();
        }
    });
}


function renderMixedChart(params, isEnglish) {
    const dataSeries = [
        {name: params.lineTitle, type: "line", data: params.lineDataList},
        {name: params.columnTitle, type: "column", data: params.columnDataList},
    ];
    const options = {
        series: dataSeries,
        labels: params.labelList,
        chart: {height: 400, width: "100%", type: "line", zoom: {enabled: false}, toolbar: {tools: {download: false}}},
        stroke: {show: true, curve: "straight", width: [3, 0], colors: ["#007bff", "#282828"]},
        dataLabels: {enabled: true, enabledOnSeries: [1]},
        xaxis: {
            type: "datetime",
            labels: {
                datetimeUTC: false,
                format: params.labelType == 'days'
                    ? (isEnglish ? 'M/d' : 'M月d日')
                    : 'H'
            }
        },
        yaxis: [
            {
                opposite: true,
                title: { text: params.lineTitle },
                labels: {
                    formatter: (value) => {
                        if (value > 1000000) {
                            return `${(Math.floor(Math.floor(value) / 100000) / 10).toLocaleString()}M`;
                        }
                        return `${(Math.floor(Math.floor(value) / 100) / 10).toLocaleString()}k`;
                    }
                },
                tickAmount: 5,
                min: function(_) { return params.lineMin },
                max: function(_) { return params.lineMax }
            },{
                title: { text: params.columnTitle },
                labels: {
                    formatter: (value) => {
                        return `${(Math.floor(Math.floor(value) / 100) / 10).toLocaleString()}k`;
                    }
                },
                tickAmount: 5,
                min: function(_) { return 0 },
                max: function(_) { return params.columnMax }
            },
        ],
        markers: {size: 5, colors: ["#007bff", "#282828"]},
        legend: {show: true, markers: {fillColors: ["#007bff", "#282828"]}},
        tooltip: {
            enabled: true,
            shared: true,
            x: {
                format: params.labelType == 'days'
                    ? (isEnglish ? 'yyyy-MM-dd' : 'yyyy年M月d日')
                    : (isEnglish ? 'yyyy-MM-dd HH:00' : 'yyyy年M月d日 H時')
            },
            y: {
                formatter: function(value, {series, seriesIndex, dataPointIndex, w}) {
                    if (value) return value.toLocaleString();
                    return value;
                }
            },
            marker: false,
        },
        fill: {
            type: ['solid', 'gradient'],
            colors: ["#007bff", "#282828"],
            gradient: {type: 'vertical', opacityFrom: [1, 0.9], opacityTo: [1, 0.9]}
        },
        dataLabels: {
            enabled: false,
            enabledOnSeries: [1,1],
            style: {colors: ["#007bff", "#2d8acd"]},
            formatter: function(value, {seriesIndex, dataPointIndex, w}) {
                return value.toLocaleString();
            },
        },
    };
    if (!$(params.target).text()) {
        const chart = new ApexCharts(document.querySelector(params.target), options);
        chart.render();
        $(`${params.target}-loading`).hide();
    }
}


function renderRoundTable(target, path, isEnglish) {
    fetch(path)
    .then((response) => response.json())
    .then((alldata) => {
        alldata.sort((a, b) => b.subscriber - a.subscriber);
        const roundTableElem = $('#round-table');
        const debut_date = $('#debut_date').text();
        const debut_dt = new Date(debut_date);
        const holo_dt = new Date('2020-08-15 00:00');
        const created_at = new Date($('.member_data').attr('created_at'));
        let tableBodyElem = `<tbody class="table-body">`;
        for (let i=0; i<alldata.length; i++) {
            const round_row = alldata[i];
            const subscriber = round_row["subscriber"];
            let datetime = round_row['datetime'];
            if (subscriber == 0) break;
            const diff = round_row["diff"];
            const round_before = (subscriber - diff) / 10000;
            let diff_dt = -1;
            let diff_debut_dt = -1;
            const dt = new Date(datetime);
            if (i + 1 < alldata.length) {
                const before_dt = new Date(alldata[i+1]['datetime']);
                diff_dt = Math.ceil((dt - before_dt) / 86400000);
            }
            diff_debut_dt = Math.ceil((dt - debut_dt) / 86400000);
            if (dt <= holo_dt || (dt <= created_at && datetime.indexOf('00:00') != -1)) {
                datetime = datetime.slice(0, 10);
            }
            tableBodyElem += `<tr>`;
            tableBodyElem += `<td>${subscriber.toLocaleString()}</td>`;
            tableBodyElem += `<td>`;
            if (diff_debut_dt > 0) {
                if (isEnglish) {
                    tableBodyElem += `${diff_dt.toLocaleString()} days after ${round_before / 100}M (${diff_debut_dt.toLocaleString()} days after debut)`;
                } else {
                    tableBodyElem += `${round_before}万人から${diff_dt.toLocaleString()}日後（デビューから${diff_debut_dt.toLocaleString()}日後）`;
                }
            } else if (diff_debut_dt == 0) {
                if (isEnglish) {
                    tableBodyElem += `${diff_dt.toLocaleString()} days after ${round_before / 100}M (Debut day)`;
                } else {
                    tableBodyElem += `${round_before}万人から${diff_dt.toLocaleString()}日後（デビュー当日）`;
                }
            } else {
                debut_subscriber = subscriber + 1;
                tableBodyElem += `デビュー発表`;
            }
            tableBodyElem += `</td>`;
            tableBodyElem += `</tr>`;
        }
        tableBodyElem += `</tbody>`;
        roundTableElem.append(tableBodyElem);
        $(`${target}-loading`).hide();
    });
}