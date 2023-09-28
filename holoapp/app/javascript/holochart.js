//= require jquery
//= require jquery_ujs
//= require apexcharts
//= require list


$(function() {
    renderChart();
    sortTable();
    setEvent();
});

function sortTable() {
    const tableOption = {
        valueNames: ['name', 'belong', 'subscriber', 'diff', 'round']
    }
    const latestList = new List('latest-data-table', tableOption);
    latestList.sort('subscriber', {order : 'desc'});
}

function setEvent() {
    $('#latest-data-table tbody tr').on('click', function() {
        const path = $(this).attr('path');
        location.href = `/member/${path}`;
    });
    $('#latest-data-table .table-body-name-area img').on('click', function(e) {
        e.stopPropagation();
        const youtubeid = $(this).attr('youtubeid');
        open(`https://youtube.com/channel/${youtubeid}`);
    });
}

function renderChart() {
    fetch('/tracker')
    .then((response) => response.json())
    .then((alldata) => {
        const dataset = {}
        for (let i=0; i<alldata.length; i++) {
            const data = alldata[i];
            const member_id = data.member_id;
            const member = $(`.member_data[member_id=${member_id}]`);
            // const member = $(`.member_data[member_id=2]`);
            const name = member.attr('name');
            if (!name) {
                continue;
            }
            const debut_dt = new Date(member.attr('debut'));
            const debut_dt_before = new Date(debut_dt.setDate(debut_dt.getDate() - 1));
            const year = debut_dt_before.getFullYear();
            const month = String(debut_dt_before.getMonth() + 1).padStart(2, '0');
            const date = String(debut_dt_before.getDate()).padStart(2, '0');
            const debut_dt_before_str = `${year}-${month}-${date}`;
            const subscriber = data.subscriber;
            const dt = data.dt;
            if (name in dataset) {
                dataset[name].push({x: dt.slice(0,10), y: subscriber});
            } else {
                dataset[name] = [{x: debut_dt_before_str, y: 0}, {x: dt.slice(0,10), y: subscriber}];
            }
        }
        const data_series = [];
        Object.keys(dataset).forEach(name => {
            data_series.push({name: name, data: dataset[name]})
        });
        const options = {
            chart: {
                height: 900,
                width: "100%",
                type: "line",
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
                    updated: () => relocation(),
                    mounted: () => relocation()
                },
            },
            tooltip: {
                enabled: true,
                shared: true,
                x: {
                    format: 'yyyy年M月'
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
                    format: 'yyyy年M月'
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
            }
        }
        const chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
        $('#chart-loading').hide();
    });
}

function getAscii(text) {
    let ascii = 0;
    for (let i=0; i<text.length; i++) {
        ascii += text.charCodeAt(i);
    }
    return ascii;
}

function relocation() {
    const belongs_list = [];
    const belongs = {};
    $('.member_data').each(function(_, elem) {
        const member = $(elem);
        const member_id = member.attr('id');
        const name = member.attr('name');
        const belong = member.attr('belong');
        if (belong in belongs) {
            belongs[belong].push(name);
        } else {
            belongs[belong] = [name];
            belongs_list.push(belong);
        }
    });
    belongs_list.sort();

    // 所属ラベルが少ないときにスペースを埋めるためのダミー要素を作成
    const chartLegendRowNum = Math.floor(($('#chart').width() - 20) / 160);
    damyBelongNum = chartLegendRowNum - (belongs_list.length % chartLegendRowNum);
    if (damyBelongNum != chartLegendRowNum && damyBelongNum > 0) {
        for (let i=0; i<damyBelongNum; i++) {
            belongs_list.push('');
        }
    }
    
    // 所属ラベル作成
    let belongElems = '';
    belongs_list.forEach(belong => {
        if (belong == '') {
            belongElems += `<div class="legend-space"><div class="chart-legend">${belong}</div></div>`;
        } else {
            belongElems += `<div class="legend-space" id="belong_${getAscii(belong)}"><div class="chart-legend">${belong}</div></div>`;
        }
    })
    $('.apexcharts-legend.apexcharts-align-center.apx-legend-position-bottom').prepend(`\
        <div class="legend-area" id="legend_box">\
            ${belongElems}
        </div>\
    `);

    // ApexChart.jsが作成したラベルを所属ごとに移動させる
    belongs_list.forEach(belong => {
        if (belong != '') {
            let belongMembers = '';
            belongs[belong].forEach(member => {
                belongMembers += `.apexcharts-legend-series:contains('${member}'),`;
            })
            $(belongMembers.slice(0, -1)).appendTo(`#belong_${getAscii(belong)}`);
        }
    });

    // 2列のときだけ間隔の取り方を変える
    $('#legend_box').css('justify-content', chartLegendRowNum == 2 ? 'space-around' : 'space-between');
}