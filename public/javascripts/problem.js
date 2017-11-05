var setup_retrieve = function(role) {
    $('.refresh.' + role).hide();
    $('.retrieve.' + role).click(function () {
        $('.retrieve.' + role).attr('disabled', 'disabled');
        var request = $.ajax({
            method: 'GET',
            url: '/api/get?' + 'role=' + role + '&' + $('input.' + role).serialize(),
            dataType: 'json'
        });
        $('.refresh.' + role).show();
        request.done(function (obj) {
            if (obj.success) {
                $('pre.' + role).html(obj.data);
                $('.retrieve.' + role).hide();
            } else {
                addAlert(obj.msg, 'danger');
            }
            $('.refresh.' + role).hide();
            $('.retrieve.' + role).removeAttr('disabled');
        });
    });
}

var setup_submit = function(role) {
    $('.refresh.' + role).hide();
    $('.submit.' + role).click(function () {
        $('.submit.' + role).attr('disabled', 'disabled');
        var request = $.ajax({
            method: 'POST',
            url: '/api/submit?' + 'role=' + role + '&' + $('input.' + role).serialize(),
            data: $('textarea.' + role).serialize(),
            dataType: 'json'
        });
        $('.refresh.' + role).show();
        request.done(function (obj) {
            if (obj.success) {
                addAlert(obj.msg, 'success');
            } else {
                addAlert(obj.msg, 'danger');
            }
            $('.refresh.' + role).hide();
            $('.submit.' + role).removeAttr('disabled');
        });
    });
}

$().ready(function() {
        setup_retrieve('poser');
        setup_retrieve('solver');
        setup_submit('poser');
        setup_submit('solver');
	});