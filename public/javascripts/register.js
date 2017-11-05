$().ready(function() {
        $('#valid-refresh').hide();
        $('#one-click').click(function () {
            $('#one-click').attr('disabled', 'disabled');
            var request = $.ajax({
                method: 'GET',
                url: '/api/register?' + $('input').serialize(),
                dataType: 'json'
            });
            $('#valid-refresh').show();
            request.done(function (obj) {
                if (obj.success) {
                    addAlert('Register successfully! Your access code: <strong>' + obj.code + '</strong>. Please remember it!', 'success');
                    $('.register-box').hide();
                } else {
                    addAlert(obj.msg, 'danger');
                }
                $('#valid-refresh').hide();
                $('#one-click').removeAttr('disabled');
            });
        });
	});