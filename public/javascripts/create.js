$().ready(function() {
		$('#datetimepicker1').datetimepicker();
		$('#datetimepicker2').datetimepicker({useCurrent: false});
		$('#datetimepicker3').datetimepicker({useCurrent: false});
        $("#datetimepicker1").on("dp.change", function (e) {
            $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
            $('#datetimepicker3').data("DateTimePicker").minDate(e.date);
        });
        $("#datetimepicker2").on("dp.change", function (e) {
            $('#datetimepicker3').data("DateTimePicker").minDate(e.date);
            $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
        });
        $("#datetimepicker3").on("dp.change", function (e) {
            $('#datetimepicker2').data("DateTimePicker").maxDate(e.date);
            $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
        });

        $('#one-click').click(function () {
            var request = $.ajax({
                method: 'GET',
                url: '/api/create?' + $('input').serialize(),
                dataType: 'json'
            });
            request.done(function (obj) {
                if (obj.success) {
                    addAlert('Contest ' + obj.id + ' created!', 'success');
                    setTimeout(function() {$(location).attr('href', '/');}, 5000);
                } else {
                    addAlert(obj.msg, 'danger');
                }
            });
        });
	});