//= require jquery
$(function() {
    makeSideMenu();
    setEvent();
});

function makeSideMenu() {
    const belongs_list = [];
    const belongs = {};
    $('.member_data').each(function(_, elem) {
        const member = $(elem);
        const name = member.attr('name');
        const name_kana = member.attr('name_kana');
        const name_url = member.attr('name_url');
        const belong = member.attr('belong');
        if (belong in belongs) {
            belongs[belong].push({name: name, name_kana: name_kana, name_url: name_url});
        } else {
            belongs[belong] = [{name: name, name_kana: name_kana, name_url: name_url}];
            belongs_list.push(belong);
        }
    });
    belongs_list.sort();
    belongs_list.forEach(belong => {
        let html = '';
        html += `<details>`;
        html += `<summary>${belong}</summary>`;
        belongs[belong].forEach(member => {
            html += `<li title="${member.name}（${member.name_kana}）">`;
            html += `<a href="/member/${member.name_url}">${member.name}</a>`;
            html += `</li>`;
        })
        html += `</details>`;
        $('#sidemenu').append(html);
    })
}

function setEvent() {
    $('#header-left').on('click', function () {
        $('#header-menu-btn').toggleClass('on');
        if ($('#header-menu-btn').hasClass('on')) {
            $('#main-left').show();
            $('#main-right').addClass('withmenu');
        } else {
            $('#main-left').hide();
            $('#main-right').removeClass('withmenu');
        }
    });
    $('#header-center, .section-header.pointer').on('click', function() {
        window.location.href = '/';
    });
    $('#header-right').on('click', function() {
        const languageElem = $('#select-language');
        if (languageElem.is(':visible')) {
            languageElem.hide();
        } else {
            languageElem.show();
        }
    });
    $('.header-right-language-row').on('click', function(e) {
        const langElems = $('.header-right-language-row');
        let path = location.pathname;
        for (let i = 0; i < langElems.length; i++) {
            const rowLang = $(langElems[i]).attr('lang');
            path = path.replace(`/${rowLang}`, '');
        }
        const selectLang = $(e.target).attr('lang');
        location.href = `/${selectLang}${path}`;
    });
    $('#banner_data').on('click', function() {
        location.reload();
    });
    $('details').on('click', function() {
        $(this).siblings('details[open]').removeAttr('open');
    });
    $(document).on('click touchend', function(e) {
        if (!$(e.target).closest('#header-right').length) {
            const languageElem = $('#select-language');
            if (languageElem.is(':visible')) {
                languageElem.hide();
            }
        }
    });
}
