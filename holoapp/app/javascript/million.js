//= require jquery
//= require jquery_ujs
//= require list


$(function() {
    sortTable();
});

function sortTable() {
    const tableOption = {
        valueNames: ['name', 'subscriber', 'million', 'forecast']
    }
    const latestList = new List('million-table', tableOption);
    latestList.sort('forecast', {order : 'asc'});
}