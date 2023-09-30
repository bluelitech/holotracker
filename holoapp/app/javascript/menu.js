//= require jquery
$(function() {
    setEvent();
});

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
    $('.section-header.pointer').on('click', function() {
        const path = location.pathname;
        if (path.match(/\/en/)) {
            location.href = '/en';
        } else {
            location.href = '/';
        }
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
        if (selectLang == 'ja') {
            location.href = path;
        } else {
            location.href = `/${selectLang}${path}`;
        }
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
