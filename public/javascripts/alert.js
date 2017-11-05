var addAlert = function (msg, type) {
    var c = '<div class="alert alert-' + type + '"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> ' + msg + '</div>';
    $('#message').prepend(c);
}