// This script runs on clientside

function showmessage(options) {
    var $target = $('.message');
    var settings = $.extend({
        type: 'danger',
        class: 'alertify',
        content: 'There was an error',
        speed: 500,
        delay: 3000,
        complete: function() { // callback function to be called after a the display time
            $target.prev().slideUp(settings.speed, function() {
                $target.prev().remove();
            });
        }
    }, options);
    var $alert = $('<div style="z-index: 100; position:absolute; left:50%" class="alert alert-' + settings.type + ' ' + settings.class + '">' + settings.content + '</div>');
    $alert.hide().insertBefore($target).slideDown(settings.speed, function() {

        setTimeout(function() {
            settings.complete();
        }, settings.delay);

    });
}